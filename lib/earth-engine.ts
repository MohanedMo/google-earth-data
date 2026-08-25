import ee from '@google/earthengine';
import { TimelineItem } from '@/types/building';

let isEeInitialized = false;

export function initEarthEngine(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isEeInitialized) {
      return resolve();
    }

    const clientEmail = process.env.EARTH_ENGINE_CLIENT_EMAIL;
    const privateKey = process.env.EARTH_ENGINE_PRIVATE_KEY;
    const projectId = process.env.EARTH_ENGINE_PROJECT_ID;

    if (!clientEmail || !privateKey || !projectId) {
      return reject(new Error("Missing Earth Engine environment variables: EARTH_ENGINE_CLIENT_EMAIL, EARTH_ENGINE_PRIVATE_KEY, or EARTH_ENGINE_PROJECT_ID."));
    }

    // Clean and format private key
    let cleanedPrivateKey = privateKey.trim();
    if (cleanedPrivateKey.startsWith('"') && cleanedPrivateKey.endsWith('"')) {
      cleanedPrivateKey = cleanedPrivateKey.slice(1, -1);
    } else if (cleanedPrivateKey.startsWith("'") && cleanedPrivateKey.endsWith("'")) {
      cleanedPrivateKey = cleanedPrivateKey.slice(1, -1);
    }
    const formattedPrivateKey = cleanedPrivateKey.replace(/\\n/g, '\n');

    const credentials = {
      type: "service_account",
      project_id: projectId,
      client_email: clientEmail,
      private_key: formattedPrivateKey,
    };

    ee.data.authenticateViaPrivateKey(
      credentials,
      () => {
        ee.initialize(
          null,
          null,
          () => {
            isEeInitialized = true;
            resolve();
          },
          (err: any) => {
            reject(new Error(`Earth Engine initialization failed: ${err}`));
          },
          null,
          projectId
        );
      },
      (err: any) => {
        reject(new Error(`Earth Engine authentication failed: ${err}`));
      }
    );
  });
}

function evaluatePromise<T>(eeObject: any): Promise<T> {
  return new Promise((resolve, reject) => {
    eeObject.evaluate((result: T, err: any) => {
      if (err) {
        reject(new Error(err));
      } else {
        resolve(result);
      }
    });
  });
}

interface EeTimelineResult {
  year: number;
  available: boolean;
  ndbi: number | null;
}

interface EeAnalysisResult {
  area: number;
  timeline: EeTimelineResult[];
}

export async function runEarthEngineAnalysis(
  coordinates: [number, number][]
): Promise<{ area: number; timeline: TimelineItem[] }> {
  // Ensure the polygon is closed
  const closedCoords = [...coordinates];
  if (
    closedCoords[0][0] !== closedCoords[closedCoords.length - 1][0] ||
    closedCoords[0][1] !== closedCoords[closedCoords.length - 1][1]
  ) {
    closedCoords.push(closedCoords[0]);
  }

  const polygon = ee.Geometry.Polygon([closedCoords]);
  const years = ee.List.sequence(2008, 2026);
  const dummyImage = ee.Image.constant([-30]).rename(['NDBI']);

  const calculateYearStats = (year: any) => {
    const yearNum = ee.Number(year);
    const startDate = ee.Date.fromYMD(yearNum, 1, 1);
    const endDate = ee.Date.fromYMD(yearNum, 12, 31);

    const collection = ee.ImageCollection('COPERNICUS/S1_GRD')
      .filterBounds(polygon)
      .filterDate(startDate, endDate)
      .filter(ee.Filter.eq('instrumentMode', 'IW'))
      .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
      .select('VV');

    const size = collection.size();

    const imageToProcess = ee.Image(ee.Algorithms.If(
      size.gt(0),
      collection.median(),
      dummyImage
    ));

    const ndbiImage = imageToProcess.select(['VV']).rename(['NDBI']);

    const stats = ndbiImage.reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: polygon,
      scale: 10,
      maxPixels: 1e9
    });

    const ndbiVal = stats.get('NDBI');

    return ee.Dictionary({
      year: yearNum,
      available: size.gt(0),
      ndbi: ee.Algorithms.If(size.gt(0), ndbiVal, null)
    });
  };

  const timelineEe = years.map(calculateYearStats);
  const analysisDict = ee.Dictionary({
    area: polygon.area(),
    timeline: timelineEe
  });

  // Evaluate the entire workflow server-side in a single call
  const results = await evaluatePromise<EeAnalysisResult>(analysisDict);

  const area = results.area;
  const thumbnailRegion = polygon.buffer(80).bounds();

  const timeline: TimelineItem[] = await Promise.all(
    results.timeline.map(async (item) => {
      const year = Number(item.year);
      let thumbnail_url: string | null = null;

      if (item.available) {
        try {
          const startDate = ee.Date.fromYMD(year, 1, 1);
          const endDate = ee.Date.fromYMD(year, 12, 31);
          
          const collection = ee.ImageCollection('COPERNICUS/S1_GRD')
            .filterBounds(polygon)
            .filterDate(startDate, endDate)
            .filter(ee.Filter.eq('instrumentMode', 'IW'))
            .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
            .select('VV');
            
          const img = collection.median();
          // Map -20 to 0 dB to 0 to 255 grayscale
          const rgbImage = img.add(20).divide(20).multiply(255).clamp(0, 255).toByte();
          
          const visualParams = {
            region: thumbnailRegion,
            format: 'png',
            dimensions: 128
          };

          thumbnail_url = await new Promise<string | null>((resolve) => {
            rgbImage.getThumbURL(visualParams, (url: string, err: any) => {
              if (err) resolve(null);
              else resolve(url);
            });
          });
        } catch (e) {
          console.error(`Failed to generate thumbnail URL for year ${year}:`, e);
        }
      }

      return {
        year,
        ndbi: item.available ? item.ndbi : null,
        thumbnail_url
      };
    })
  );

  return { area, timeline };
}
