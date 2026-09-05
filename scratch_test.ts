import { isPointInPolygon, findVariablePointsInsidePolygon, VARIABLE_POINTS } from './lib/spatial-variables';

console.log('Loaded variable points total count:', VARIABLE_POINTS.length);

// Test 1: Polygon enclosing point 1101466 (lat: 30.357099, lng: 31.595568, date: "25-10-2023")
const polygonAround1101466: [number, number][] = [
  [31.59500, 30.35600],
  [31.59600, 30.35600],
  [31.59600, 30.35800],
  [31.59500, 30.35800]
];

const matched1 = findVariablePointsInsidePolygon(polygonAround1101466);
console.log('Test 1 (enclosing 1101466):', matched1);
if (matched1.length >= 1 && matched1.some(p => p.id === 1101466 && p.date === '25-10-2023')) {
  console.log('✅ Test 1 PASSED');
} else {
  console.error('❌ Test 1 FAILED');
  process.exit(1);
}

// Test 2: Polygon far away
const polygonFarAway: [number, number][] = [
  [10.00000, 10.00000],
  [10.01000, 10.00000],
  [10.01000, 10.01000],
  [10.00000, 10.01000]
];

const matched2 = findVariablePointsInsidePolygon(polygonFarAway);
console.log('Test 2 (far away):', matched2);
if (matched2.length === 0) {
  console.log('✅ Test 2 PASSED');
} else {
  console.error('❌ Test 2 FAILED');
  process.exit(1);
}

console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!');
