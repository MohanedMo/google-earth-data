"use client";

import React from "react";

interface AnalysisResultProps {
  success: boolean;
  estimatedConstructionYear: number | null;
  estimatedLastChangeYear: number | null;
  message?: string;
  coordinates?: [number, number][] | null;
}

export default function AnalysisResult({
  success,
  estimatedConstructionYear,
  estimatedLastChangeYear,
  message,
  coordinates,
}: AnalysisResultProps) {
  if (!success) return null;

  const noBuildingDetected = estimatedConstructionYear === null;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 p-6 md:p-8 rounded-3xl bg-white border border-neutral-200 shadow-md animate-fade-in space-y-6 print:shadow-none print:border-none print:p-0 print:m-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200/60 pb-6">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">تحليل المبنى</h2>
          <p className="text-xs text-neutral-500 mt-1">
            تقرير تقديري قائم على صور الأقمار الصناعية
          </p>
        </div>
        <div className="flex items-center flex-wrap gap-2.5 self-start md:self-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            اكتمل التحليل
          </div>

          <button
            type="button"
            onClick={handlePrint}
            title="حفظ أو طباعة التقرير بصيغة PDF"
            className="no-print inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 active:bg-black text-white text-xs font-medium shadow-sm transition-all duration-200 cursor-pointer"
          >
            <svg
              className="w-4 h-4 text-amber-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>حفظ التقرير كـ PDF</span>
          </button>
        </div>
      </div>

      {coordinates && coordinates.length > 0 && (
        <div className="p-4 md:p-5 rounded-2xl bg-neutral-50/70 border border-neutral-200/80">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm">📍</span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
              إحداثيات نقاط الموقع المحلل
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {coordinates.map((coord, index) => (
              <div
                key={index}
                className="p-3 rounded-xl bg-white border border-neutral-200 shadow-xs text-xs space-y-1.5"
              >
                <div className="font-semibold text-neutral-800 flex items-center justify-between">
                  <span>النقطة {index + 1}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100/80 text-amber-800 font-mono font-medium">
                    P{index + 1}
                  </span>
                </div>
                <div className="font-mono text-[11px] text-neutral-600 space-y-0.5">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400 text-[10px]">العرض:</span>
                    <span className="font-semibold text-neutral-900">{coord[1]}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400 text-[10px]">الطول:</span>
                    <span className="font-semibold text-neutral-900">{coord[0]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {noBuildingDetected ? (
        <div className="py-6 text-center text-neutral-500">
          <p className="text-base font-medium">
            {message || "لم يتم رصد نشاط بناء واضح في المنطقة المحددة."}
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            جرّب تحديد منطقة أخرى أو ضبط الإحداثيات لتكون أقرب إلى هيكل المبنى.
          </p>
        </div>
      ) : (
        <>
          {message && (
            <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 text-sm text-neutral-600 leading-relaxed flex items-start gap-3">
              <span className="text-lg select-none mt-0.5">📢</span>
              <div>
                <strong className="text-neutral-900 block mb-1">
                  ملخص التحليل:
                </strong>
                {message}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-2">
            {/* Construction Card */}
            <div className="p-6 rounded-2xl bg-neutral-50/50 border border-neutral-200/60 flex flex-col justify-between hover:border-neutral-300 transition-all duration-300">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                تاريخ البناء التقديري
              </span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl md:text-5xl font-black text-amber-600 tracking-tight">
                  {estimatedConstructionYear}
                </span>
                <span className="text-xs text-neutral-500 font-medium">
                  عام
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-3 leading-relaxed">
                السنة الأولى التي يظهر فيها مؤشر التشييد انتقالاً واضحاً
                ومستقراً إلى بنية خرسانية أو مشيدة.
              </p>
            </div>

            {/* Last Detected Change Card */}
            <div className="p-6 rounded-2xl bg-neutral-50/50 border border-neutral-200/60 flex flex-col justify-between hover:border-neutral-300 transition-all duration-300">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                آخر تغيير تم رصده تقديرياً
              </span>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl md:text-5xl font-black text-neutral-800 tracking-tight">
                  {estimatedLastChangeYear || "لا يوجد تغيير"}
                </span>
                {estimatedLastChangeYear && (
                  <span className="text-xs text-neutral-500 font-medium">
                    عام
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 mt-3 leading-relaxed">
                أحدث سنة بعد البناء تظهر قفزة ملحوظة في مؤشر التشييد، مما يشير
                إلى تعديل كبير أو توسعة هيكلية.
              </p>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
