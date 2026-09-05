import variableData from '@/data/data.json';

export interface VariablePoint {
  id: number | string;
  lat: number;
  lng: number;
  date?: string;
}

export const VARIABLE_POINTS: VariablePoint[] = variableData as VariablePoint[];

/**
 * Orders polygon vertices in a proper convex perimeter ring around the centroid.
 * This guarantees correct geometry even if points are entered in zigzag or reversed order.
 */
export function sortPolygonConvex(polygon: [number, number][]): [number, number][] {
  if (!polygon || polygon.length < 3) return polygon;
  const cx = polygon.reduce((sum, p) => sum + p[0], 0) / polygon.length;
  const cy = polygon.reduce((sum, p) => sum + p[1], 0) / polygon.length;
  return [...polygon].sort(
    (a, b) => Math.atan2(a[1] - cy, a[0] - cx) - Math.atan2(b[1] - cy, b[0] - cx)
  );
}

/**
 * Checks if a point lies on a line segment between point A and point B.
 */
function isPointOnSegment(
  p: { lng: number; lat: number },
  a: { lng: number; lat: number },
  b: { lng: number; lat: number },
  epsilon = 1e-7
): boolean {
  const crossProduct = (p.lat - a.lat) * (b.lng - a.lng) - (p.lng - a.lng) * (b.lat - a.lat);
  if (Math.abs(crossProduct) > epsilon) return false;

  const dotProduct = (p.lng - a.lng) * (b.lng - a.lng) + (p.lat - a.lat) * (b.lat - a.lat);
  if (dotProduct < 0) return false;

  const squaredLength = (b.lng - a.lng) * (b.lng - a.lng) + (b.lat - a.lat) * (b.lat - a.lat);
  if (dotProduct > squaredLength) return false;

  return true;
}

/**
 * Determines whether a given coordinate point is located inside a polygon using ray casting.
 * @param point Object with { lat, lng }
 * @param polygon Array of coordinates in [lng, lat] format (GeoJSON standard)
 */
export function isPointInPolygon(
  point: { lat: number; lng: number },
  polygon: [number, number][]
): boolean {
  if (!polygon || polygon.length < 3) return false;

  const x = point.lng;
  const y = point.lat;
  let inside = false;
  const n = polygon.length;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect =
      ((yi > y) !== (yj > y)) &&
      (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Computes Euclidean distance in meters from a point to a line segment (scaled for Egypt lat ~30°).
 */
function pointToSegmentDistanceMeters(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const mx = (lng: number) => lng * 96000;
  const my = (lat: number) => lat * 111000;

  const pX = mx(px);
  const pY = my(py);
  const aX = mx(x1);
  const aY = my(y1);
  const bX = mx(x2);
  const bY = my(y2);

  const dx = bX - aX;
  const dy = bY - aY;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    return Math.sqrt((pX - aX) ** 2 + (pY - aY) ** 2);
  }

  const t = Math.max(0, Math.min(1, ((pX - aX) * dx + (pY - aY) * dy) / lenSq));
  const projX = aX + t * dx;
  const projY = aY + t * dy;

  return Math.sqrt((pX - projX) ** 2 + (pY - projY) ** 2);
}

/**
 * Calculates the minimum distance in meters from a point to any segment of the polygon perimeter.
 */
export function minDistanceToPolygonMeters(
  point: { lat: number; lng: number },
  polygon: [number, number][]
): number {
  let minDist = Infinity;
  const n = polygon.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const d = pointToSegmentDistanceMeters(
      point.lng,
      point.lat,
      polygon[j][0],
      polygon[j][1],
      polygon[i][0],
      polygon[i][1]
    );
    if (d < minDist) minDist = d;
  }
  return minDist;
}

/**
 * Finds all predefined variable points that fall inside or right adjacent (within 10m tolerance) to the given polygon.
 * @param polygon Array of coordinate points in [lng, lat] order
 * @param dataset Optional array of variable points to search from (defaults to data/data.json)
 */
export function findVariablePointsInsidePolygon(
  polygon: [number, number][],
  dataset: VariablePoint[] = VARIABLE_POINTS
): VariablePoint[] {
  if (!polygon || polygon.length < 3) return [];

  // 1. Sort polygon vertices in convex perimeter order to handle any input sequence
  const sortedPoly = sortPolygonConvex(polygon);

  // 2. Tolerance buffer: 10 meters (~0.00010 deg)
  const TOLERANCE_METERS = 10;
  const TOLERANCE_DEG = 0.00012;
  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  for (const [lng, lat] of sortedPoly) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }

  // Pre-filter candidate points
  const candidates = dataset.filter((pt) => {
    return (
      pt.lng >= minLng - TOLERANCE_DEG &&
      pt.lng <= maxLng + TOLERANCE_DEG &&
      pt.lat >= minLat - TOLERANCE_DEG &&
      pt.lat <= maxLat + TOLERANCE_DEG
    );
  });

  if (candidates.length === 0) return [];

  // Check 1: Strictly inside the sorted polygon
  const strictInside = candidates.filter((pt) => isPointInPolygon(pt, sortedPoly));
  if (strictInside.length > 0) {
    return strictInside;
  }

  // Check 2: Within 10 meters buffer of the polygon boundary
  const nearCandidates = candidates
    .map((pt) => ({ pt, dist: minDistanceToPolygonMeters(pt, sortedPoly) }))
    .filter((item) => item.dist <= TOLERANCE_METERS)
    .sort((a, b) => a.dist - b.dist)
    .map((item) => item.pt);

  return nearCandidates;
}
