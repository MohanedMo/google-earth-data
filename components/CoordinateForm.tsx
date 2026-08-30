import React, { useState } from 'react';
import { countDecimalPlaces } from '@/lib/validation';

interface Point {
  lat: string;
  lng: string;
}

interface CoordinateFormProps {
  onAnalyze: (coordinates: [number, number][]) => void;
  isLoading: boolean;
}

const DEFAULT_POINTS: Point[] = [
  { lat: '30.45365', lng: '31.55186' },
  { lat: '30.45374', lng: '31.55193' },
  { lat: '30.45377', lng: '31.551802' },
  { lat: '30.45369', lng: '31.55175' },
];

const STORAGE_KEY = 'building_coordinates_points';

export default function CoordinateForm({ onAnalyze, isLoading }: CoordinateFormProps) {
  const [points, setPoints] = useState<Point[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length === 4) {
            return parsed;
          }
        }
      } catch (e) {
        console.error('Failed to load points from sessionStorage', e);
      }
    }
    return DEFAULT_POINTS;
  });

  const [validationError, setValidationError] = useState<string>('');

  const savePoints = (newPoints: Point[]) => {
    setPoints(newPoints);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newPoints));
      } catch (e) {
        console.error('Failed to save points to sessionStorage', e);
      }
    }
  };

  const handleChange = (index: number, field: keyof Point, value: string) => {
    const newPoints = [...points];
    newPoints[index] = {
      ...newPoints[index],
      [field]: value
    };
    savePoints(newPoints);
    setValidationError('');
  };

  const handleReset = () => {
    savePoints(DEFAULT_POINTS);
    setValidationError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const formattedCoords: [number, number][] = [];

    for (let i = 0; i < points.length; i++) {
      const { lat, lng } = points[i];

      if (!lat.trim() || !lng.trim()) {
        setValidationError(`يجب ملء جميع الإحداثيات. الحقول مفقودة في النقطة ${i + 1}.`);
        return;
      }

      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);

      if (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90) {
        setValidationError(`النقطة ${i + 1} تحتوي على خط عرض غير صالح. يجب أن يكون بين -90 و90.`);
        return;
      }

      if (isNaN(parsedLng) || parsedLng < -180 || parsedLng > 180) {
        setValidationError(`النقطة ${i + 1} تحتوي على خط طول غير صالح. يجب أن يكون بين -180 و180.`);
        return;
      }

      if (countDecimalPlaces(lat) < 5) {
        setValidationError(`خط العرض في النقطة ${i + 1} يجب أن يحتوي على 5 أرقام عشرية على الأقل بعد الفاصلة (مثل: 30.708155).`);
        return;
      }

      if (countDecimalPlaces(lng) < 5) {
        setValidationError(`خط الطول في النقطة ${i + 1} يجب أن يحتوي على 5 أرقام عشرية على الأقل بعد الفاصلة (مثل: 31.563255).`);
        return;
      }

      // GeoJSON: [longitude, latitude]
      formattedCoords.push([parsedLng, parsedLat]);
    }

    if (formattedCoords.length !== 4) {
      setValidationError('مطلوب 4 نقاط بالضبط لتحديد منطقة المبنى.');
      return;
    }

    onAnalyze(formattedCoords);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {points.map((point, index) => (
          <div
            key={index}
            className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm transition-all duration-300 hover:border-neutral-300"
          >
            <h3 className="text-sm font-semibold text-neutral-600 mb-3 flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-500">
                {index + 1}
              </span>
              النقطة {index + 1}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor={`lat-${index}`}
                  className="block text-xs font-medium text-neutral-500 mb-1"
                >
                  خط العرض
                </label>
                <input
                  id={`lat-${index}`}
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  value={point.lat}
                  onChange={(e) => handleChange(index, 'lat', e.target.value)}
                  disabled={isLoading}
                  placeholder="30.708155"
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-450 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-inner"
                />
              </div>
              <div>
                <label
                  htmlFor={`lng-${index}`}
                  className="block text-xs font-medium text-neutral-500 mb-1"
                >
                  خط الطول
                </label>
                <input
                  id={`lng-${index}`}
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  value={point.lng}
                  onChange={(e) => handleChange(index, 'lng', e.target.value)}
                  disabled={isLoading}
                  placeholder="31.563255"
                  required
                  className="w-full px-3 py-2 text-sm rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-450 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-inner"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {validationError && (
        <div className="p-3 text-sm text-red-650 bg-red-50 border border-red-200 rounded-xl animate-fade-in text-center">
          ⚠️ {validationError}
        </div>
      )}

      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="relative inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-amber-600 to-amber-500 rounded-xl shadow-md shadow-amber-500/15 hover:from-amber-500 hover:to-amber-400 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed disabled:from-amber-600 disabled:to-amber-500 cursor-pointer"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>جاري تحليل صور الأقمار الصناعية...</span>
            </div>
          ) : (
            'تحليل المبنى'
          )}
        </button>

        <button
          type="button"
          onClick={handleReset}
          disabled={isLoading}
          title="استعادة الإحداثيات الافتراضية"
          className="px-4 py-3.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200 hover:border-neutral-300 rounded-xl shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50"
        >
          🔄 إعادة تعيين
        </button>
      </div>
    </form>
  );
}
