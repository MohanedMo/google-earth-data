import React from "react";

interface AnalysisResultProps {
  success: boolean;
  estimatedConstructionYear: number | null;
  estimatedLastChangeYear: number | null;
  message?: string;
}

export default function AnalysisResult({
  success,
  estimatedConstructionYear,
  estimatedLastChangeYear,
  message,
}: AnalysisResultProps) {
  if (!success) return null;

  const noBuildingDetected = estimatedConstructionYear === null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 p-6 md:p-8 rounded-3xl bg-white border border-neutral-200 shadow-md animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200/60 pb-6">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">تحليل المبنى</h2>
          <p className="text-xs text-neutral-500 mt-1">
            تقرير تقديري قائم على صور الأقمار الصناعية
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold self-start md:self-auto">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          اكتمل التحليل
        </div>
      </div>

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
