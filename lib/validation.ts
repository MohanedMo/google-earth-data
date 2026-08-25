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
    const [lng, lat] = pt;
    if (typeof lng !== 'number' || typeof lat !== 'number') {
      throw new Error(`Coordinates at point ${i + 1} must be numeric values.`);
    }
    if (lng < -180 || lng > 180) {
      throw new Error(`Longitude at point ${i + 1} is out of bounds (-180 to 180).`);
    }
    if (lat < -90 || lat > 90) {
      throw new Error(`Latitude at point ${i + 1} is out of bounds (-90 to 90).`);
    }
    validatedCoords.push([lng, lat]);
  }
  return validatedCoords;
}
