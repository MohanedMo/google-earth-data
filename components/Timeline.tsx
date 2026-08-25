import React from "react";
import { TimelineItem } from "../lib/api";

interface TimelineProps {
  timeline: TimelineItem[];
  estimatedConstructionYear: number | null;
}

export default function Timeline({
  timeline,
  estimatedConstructionYear,
}: TimelineProps) {
  if (!timeline || timeline.length === 0) return null;

  // Threshold used in backend analysis is -10.2 dB
  const THRESHOLD = -10.2;

  // Find min/max NDBI values to scale the progress bars beautifully
  const validValues = timeline
    .map((t) => t.ndbi)
    .filter((val): val is number => val !== null);
  const minNdbi = validValues.length > 0 ? Math.min(...validValues) : 0;
  const maxNdbi = validValues.length > 0 ? Math.max(...validValues) : 1;
  const range = maxNdbi - minNdbi || 1;

  // Convert NDBI value to percentage for visual bar representation
  const getPercentage = (value: number | null) => {
    if (value === null) return 0;
    // Scale value relative to min/max, clamping between 0 and 100
    const pct = ((value - minNdbi) / range) * 100;
    return Math.max(0, Math.min(100, pct));
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 p-6 md:p-8 rounded-3xl bg-white border border-neutral-200 shadow-md animate-fade-in space-y-6">
      <div>
        <h2 className="text-xl font-bold text-neutral-900">
          الجدول الزمني للتحليل السنوي للموقع
        </h2>
        <p className="text-xs text-neutral-500 mt-1">
          القيم السنوية المتوسطة لمؤشر التشييد وبناء المنطقة
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-start border-collapse">
          <thead>
            <tr className="border-b border-neutral-200 text-neutral-500 text-xs font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">صورة القمر الصناعي</th>
              <th className="py-3 px-4">السنة</th>
              <th className="py-3 px-4">مؤشر البناء</th>
              <th className="py-3 px-4">مقياس شدة الارتداد</th>
              <th className="py-3 px-4 text-end">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200/60 text-sm">
            {timeline.map((item) => {
              const isBelowThreshold =
                item.ndbi === null || item.ndbi < THRESHOLD;
              const isConstYear = estimatedConstructionYear === item.year;

              return (
                <tr
                  key={item.year}
                  className={`hover:bg-neutral-50 transition-all duration-200 ${
                    isConstYear
                      ? "bg-amber-500/5 font-semibold text-amber-900"
                      : "text-neutral-700"
                  }`}
                >
                  <td className="py-3 px-4">
                    {item.thumbnail_url ? (
                      <a
                        href={item.thumbnail_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="انقر لفتح الصورة بالحجم الكامل"
                        className="w-12 h-12 rounded-lg overflow-hidden border border-neutral-200 shadow-sm bg-neutral-100 flex items-center justify-center relative group cursor-pointer"
                      >
                        <img
                          src={item.thumbnail_url}
                          alt={`سنة ${item.year}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-125"
                        />
                        {/* Hover zoom tooltip */}
                        <div className="hidden group-hover:block absolute bottom-14 left-1/2 -translate-x-1/2 z-50 p-1 bg-white border border-neutral-200 rounded-xl shadow-xl">
                          <img
                            src={item.thumbnail_url}
                            alt={`سنة ${item.year} تكبير`}
                            className="w-32 h-32 rounded-lg object-cover"
                          />
                        </div>
                      </a>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-neutral-100 border border-neutral-200/50 flex items-center justify-center text-[10px] text-neutral-400">
                        غير متوفر
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono font-medium">
                    {item.year}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    {item.ndbi !== null ? (
                      item.ndbi.toFixed(4)
                    ) : (
                      <span className="text-neutral-400 text-xs">
                        لا توجد بيانات
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 min-w-[200px]">
                    {item.ndbi !== null ? (
                      <div className="flex items-center gap-3">
                        <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden border border-neutral-200">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isBelowThreshold
                                ? "bg-neutral-300"
                                : isConstYear
                                  ? "bg-gradient-to-r from-amber-600 to-amber-450"
                                  : "bg-amber-500/70"
                            }`}
                            style={{ width: `${getPercentage(item.ndbi)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-neutral-500 w-8 select-none font-mono">
                          {Math.round(getPercentage(item.ndbi))}%
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-neutral-400 italic">
                        تغطية القمر الصناعي غير متوفرة
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-end">
                    {item.ndbi === null ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-neutral-100 text-neutral-500 border border-neutral-200/60">
                        غير متوفر
                      </span>
                    ) : isConstYear ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-100 text-amber-700 border border-amber-200/60 animate-pulse">
                        ⭐ بناء
                      </span>
                    ) : item.ndbi >= THRESHOLD ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 text-amber-600 border border-amber-200/50">
                        منطقة مبنية
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-neutral-50 text-neutral-500 border border-neutral-200/60">
                        أرض طبيعية
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
