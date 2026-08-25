import { NextRequest, NextResponse } from 'next/server';
import { validateCoordinates } from '@/lib/validation';
import { initEarthEngine, runEarthEngineAnalysis } from '@/lib/earth-engine';
import { interpretNdbiTimeline } from '@/lib/building-analysis';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { coordinates } = body;

    // 1. Validate coordinates structure
    let validatedCoords: [number, number][];
    try {
      validatedCoords = validateCoordinates(coordinates);
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err.message }, { status: 400 });
    }

    // 2. Initialize Earth Engine
    try {
      await initEarthEngine();
    } catch (err: any) {
      console.error("Earth Engine initialization error:", err);
      return NextResponse.json({
        success: false,
        error: "Google Earth Engine service is currently unavailable. Please verify API key configuration."
      }, { status: 500 });
    }

    // 3. Run analysis
    try {
      const { area, timeline } = await runEarthEngineAnalysis(validatedCoords);

      // Validate area bounds (10 to 200,000 sq meters)
      if (area <= 0 || area > 200000) {
        return NextResponse.json({
          success: false,
          error: `The building polygon area (${area.toFixed(1)} m²) is out of bounds. It must be between 10 and 200,000 square meters.`
        }, { status: 400 });
      }

      // 4. Interpret results
      const interpretation = interpretNdbiTimeline(timeline);
      return NextResponse.json(interpretation);
    } catch (err: any) {
      console.error("Earth Engine processing error:", err);
      return NextResponse.json({
        success: false,
        error: "Failed to process satellite imagery for the selected area."
      }, { status: 500 });
    }
  } catch (err: any) {
    console.error("Unexpected error in API Route:", err);
    return NextResponse.json({ success: false, error: "An internal server error occurred." }, { status: 500 });
  }
}
