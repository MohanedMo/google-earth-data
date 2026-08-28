export function countDecimalPlaces(val: number | string): number {
  const str = typeof val === 'number' ? val.toString() : (val ? val.toString().trim() : '');
  if (!str) return 0;
  
  // Handle scientific notation e.g. 1.23e-5
  if (str.includes('e-') || str.includes('E-')) {
    const parts = str.toLowerCase().split('e-');
    const decimals = (parts[0].split('.')[1] || '').length;
    return decimals + parseInt(parts[1], 10);
  }
  
  const parts = str.split('.');
  return parts.length > 1 ? parts[1].length : 0;
}

export function validateCoordinates(coordinates: any): [number, number][] {
  if (!Array.isArray(coordinates)) {
    throw new Error("Coordinates must be a list.");
  }
  if (coordinates.length !== 4) {
    throw new Error("Exactly 4 coordinate points are required.");
  }
  const validatedCoords: [number, number][] = [];
  for (let i = 0; i < coordinates.length; i++) {
    const pt = coordinates[i];
    if (!Array.isArray(pt) || pt.length !== 2) {
      throw new Error(`Point ${i + 1} must be a list of [longitude, latitude].`);
    }
    const [rawLng, rawLat] = pt;

    if (
      (typeof rawLng !== 'number' && typeof rawLng !== 'string') ||
      (typeof rawLat !== 'number' && typeof rawLat !== 'string')
    ) {
      throw new Error(`Coordinates at point ${i + 1} must be numeric values.`);
    }

    const lngStr = rawLng.toString().trim();
    const latStr = rawLat.toString().trim();

    if (!lngStr || !latStr) {
      throw new Error(`Coordinates at point ${i + 1} cannot be empty.`);
    }

    const lng = typeof rawLng === 'number' ? rawLng : parseFloat(lngStr);
    const lat = typeof rawLat === 'number' ? rawLat : parseFloat(latStr);

    if (isNaN(lng) || isNaN(lat)) {
      throw new Error(`Coordinates at point ${i + 1} must be valid numeric values.`);
    }

    if (lng < -180 || lng > 180) {
      throw new Error(`Longitude at point ${i + 1} is out of bounds (-180 to 180).`);
    }
    if (lat < -90 || lat > 90) {
      throw new Error(`Latitude at point ${i + 1} is out of bounds (-90 to 90).`);
    }

    if (countDecimalPlaces(rawLng) < 5) {
      throw new Error(`Longitude at point ${i + 1} (${rawLng}) must have at least 5 decimal places (e.g. 30.708155).`);
    }
    if (countDecimalPlaces(rawLat) < 5) {
      throw new Error(`Latitude at point ${i + 1} (${rawLat}) must have at least 5 decimal places (e.g. 30.708155).`);
    }

    validatedCoords.push([lng, lat]);
  }
  return validatedCoords;
}

