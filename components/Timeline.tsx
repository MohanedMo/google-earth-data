/* eslint-disable @next/next/no-img-element */
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

  // Filter timeline details to start from 2014 (Sentinel-1 satellite era)
  const displayTimeline = timeline.filter((item) => item.year >= 2014);
  if (displayTimeline.length === 0) return null;

  // Threshold used in backend analysis is -10.2 dB
  const THRESHOLD = -10.2;

  // Find min/max NDBI values to scale the progress bars beautifully
  const validValues = displayTimeline
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
    <div className="w-full max-w-4xl mx-auto mt-6 p-6 md:p-8 rounded-3xl bg-white border border-neutral-200 shadow-md animate-fade-in space-y-6 print:shadow-none print:border-2 print:border-black print:p-6 print:m-0 print:rounded-2xl print-avoid-break">
      <div className="print:border-b-2 print:border-black print:pb-3">
        <h2 className="text-xl font-bold text-neutral-900 print:text-xl print:font-black print:text-black">
          الجدول الزمني للتحليل السنوي للموقع (من عام 2014 حتى الآن)
        </h2>
        <p className="text-xs text-neutral-500 mt-1 print:text-xs print:font-bold print:text-neutral-900">
          القيم السنوية المتوسطة لمؤشر التشييد وبناء المنطقة من بيانات صور الأقمار الصناعية
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-start border-collapse print:border print:border-black print:text-xs">
          <thead>
            <tr className="border-b border-neutral-200 text-neutral-500 text-xs font-semibold uppercase tracking-wider print:bg-neutral-100 print:text-black print:font-black print:border-b-2 print:border-black">
              <th className="py-3 px-4 print:py-2.5 print:px-3 print:border-r print:border-neutral-300">صورة القمر الصناعي</th>
              <th className="py-3 px-4 print:py-2.5 print:px-3 print:border-r print:border-neutral-300">السنة</th>
              <th className="py-3 px-4 print:py-2.5 print:px-3 print:border-r print:border-neutral-300">مؤشر البناء</th>
              <th className="py-3 px-4 print:py-2.5 print:px-3 print:border-r print:border-neutral-300">مقياس شدة الارتداد</th>
              <th className="py-3 px-4 text-end print:py-2.5 print:px-3">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200/60 text-sm print:divide-neutral-300">
            {displayTimeline.map((item) => {
              const isBelowThreshold =
                item.ndbi === null || item.ndbi < THRESHOLD;
              const isConstYear = estimatedConstructionYear === item.year;

              return (
                <tr
                  key={item.year}
                  className={`hover:bg-neutral-50 transition-all duration-200 print-avoid-break ${
                    isConstYear
                      ? "bg-amber-500/5 font-semibold text-amber-900 print:bg-amber-100/70 print:font-black print:text-black"
                      : "text-neutral-700 print:text-black"
                  }`}
                >
                  <td className="py-3 px-4 print:py-2 print:px-3 print:border-r print:border-neutral-300">
                    {item.thumbnail_url ? (
                      <a
                        href={item.thumbnail_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="انقر لفتح الصورة بالحجم الكامل"
                        className="w-12 h-12 print:w-11 print:h-11 rounded-lg overflow-hidden border border-neutral-200 print:border-neutral-400 shadow-sm bg-neutral-100 flex items-center justify-center relative group cursor-pointer"
                      >
                        <img
                          src={item.thumbnail_url}
                          alt={`سنة ${item.year}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-125 print:w-full print:h-full"
                        />
                        {/* Hover zoom tooltip */}
                        <div className="hidden group-hover:block absolute bottom-14 left-1/2 -translate-x-1/2 z-50 p-1 bg-white border border-neutral-200 rounded-xl shadow-xl no-print">
                          <img
                            src={item.thumbnail_url}
                            alt={`سنة ${item.year} تكبير`}
                            className="w-32 h-32 rounded-lg object-cover"
                          />
                        </div>
                      </a>
                    ) : (
                      <div className="w-12 h-12 print:w-11 print:h-11 rounded-lg bg-neutral-100 border border-neutral-200/50 flex items-center justify-center text-[10px] text-neutral-400 print:text-[9px]">
                        غير متوفر
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono font-medium print:py-2 print:px-3 print:font-black print:border-r print:border-neutral-300 print:text-black print:text-sm">
                    {item.year}
                  </td>
                  <td className="py-3 px-4 font-mono print:py-2 print:px-3 print:font-bold print:border-r print:border-neutral-300 print:text-black print:text-sm">
                    {item.ndbi !== null ? (
                      item.ndbi.toFixed(4)
                    ) : (
                      <span className="text-neutral-400 print:text-neutral-600 text-xs print:text-[10px]">
                        لا توجد بيانات
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 min-w-[200px] print:min-w-[140px] print:py-2 print:px-3 print:border-r print:border-neutral-300">
                    {item.ndbi !== null ? (
                      <div className="flex items-center gap-3 print:gap-2">
                        <div className="w-full h-2 print:h-2.5 rounded-full bg-neutral-100 print:bg-neutral-200 overflow-hidden border border-neutral-200 print:border-neutral-400">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isBelowThreshold
                                ? "bg-neutral-300 print:bg-neutral-400"
                                : isConstYear
                                  ? "bg-gradient-to-r from-amber-600 to-amber-450 print:bg-amber-600"
                                  : "bg-amber-500/70 print:bg-amber-500"
                            }`}
                            style={{ width: `${getPercentage(item.ndbi)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-neutral-500 print:text-black print:font-black print:text-xs w-8 print:w-9 select-none font-mono text-end">
                          {Math.round(getPercentage(item.ndbi))}%
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs print:text-[10px] text-neutral-400 italic">
                        تغطية القمر الصناعي غير متوفرة
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-end print:py-2 print:px-3">
                    {item.ndbi === null ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-neutral-100 text-neutral-500 border border-neutral-200/60 print:border print:border-neutral-400 print:text-black print:text-[10px] print:px-2 print:py-0.5">
                        غير متوفر
                      </span>
                    ) : isConstYear ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-100 text-amber-700 border border-amber-200/60 animate-pulse print:bg-amber-200 print:border print:border-black print:text-black print:font-black print:text-[10px] print:px-2 print:py-0.5">
                        ⭐ سنة البناء
                      </span>
                    ) : item.ndbi >= THRESHOLD ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 text-amber-600 border border-amber-200/50 print:border print:border-amber-400 print:text-black print:text-[10px] print:px-2 print:py-0.5">
                        منطقة مبنية
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-neutral-50 text-neutral-500 border border-neutral-200/60 print:border print:border-neutral-300 print:text-black print:text-[10px] print:px-2 print:py-0.5">
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
