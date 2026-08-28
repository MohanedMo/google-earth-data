"use client";

import React, { useState } from "react";
import CoordinateForm from "../components/CoordinateForm";
import AnalysisResult from "../components/AnalysisResult";
import Timeline from "../components/Timeline";
import { analyzeBuilding, AnalysisResponse } from "../lib/api";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [analyzedCoordinates, setAnalyzedCoordinates] = useState<[number, number][] | null>(null);

  const handleAnalyze = async (coordinates: [number, number][]) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setAnalyzedCoordinates(coordinates);

    try {
      const response = await analyzeBuilding(coordinates);
      if (response.success) {
        setResult(response);
      } else {
        setError(response.error || "فشل في تحليل تاريخ المبنى.");
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-800 flex flex-col items-center justify-start p-6 md:p-12 relative overflow-hidden select-none print:p-0 print:bg-white print:select-text">
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-radial from-amber-500/10 via-transparent to-transparent opacity-60 pointer-events-none z-0 no-print" />

      <div className="w-full max-w-4xl mx-auto z-10 flex flex-col gap-8 pb-16 print:pb-0 print:gap-4">
        {/* Header */}
        <header className="text-center space-y-3 mt-8 print:mt-2 print:text-right print:border-b print:border-neutral-200 print:pb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-neutral-200 text-[11px] font-semibold tracking-wider text-amber-600 uppercase shadow-sm no-print">
            🛰️ الاستشعار عن بعد عبر الأقمار الصناعية
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-neutral-900 print:text-2xl">
            محلل تاريخ المباني
          </h1>
          <p className="text-sm md:text-base text-neutral-600 max-w-xl mx-auto leading-relaxed print:text-xs print:mx-0">
            تقرير تحليلي لتقدير تاريخ البناء ورصد التغييرات عبر صور الأقمار الصناعية
          </p>
        </header>

        {/* Input Form Section (Hidden in PDF print) */}
        <section className="bg-neutral-100/30 rounded-3xl p-2 border border-neutral-200/50 no-print">
          <CoordinateForm onAnalyze={handleAnalyze} isLoading={isLoading} />
        </section>

        {/* Loading State */}
        {isLoading && (
          <div className="w-full max-w-4xl mx-auto mt-8 p-8 rounded-3xl bg-white border border-neutral-200 shadow-md flex flex-col items-center justify-center text-center space-y-4 animate-pulse no-print">
            <div className="relative flex h-10 w-10">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-20"></span>
              <span className="relative inline-flex rounded-full h-10 w-10 bg-amber-100 border border-amber-300 items-center justify-center text-amber-600 text-lg">
                🛰️
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-neutral-800">
                جاري تحليل تاريخ المبنى...
              </h3>
              <p className="text-xs text-neutral-500">
                قد يستغرق ذلك بضع ثوانٍ حيث نقوم بمعالجة صور الأقمار الصناعية
                للموقع.
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="w-full max-w-4xl mx-auto mt-8 p-6 rounded-2xl bg-red-50 border border-red-200 shadow-sm flex items-start gap-4 no-print">
            <span className="text-xl mt-0.5 select-none">❌</span>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-red-600">فشل التحليل</h4>
              <p className="text-xs text-red-700 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <>
            <section id="results">
              <AnalysisResult
                success={result.success}
                estimatedConstructionYear={result.estimated_construction_year}
                estimatedLastChangeYear={result.estimated_last_change_year}
                message={result.message}
                coordinates={analyzedCoordinates}
              />
            </section>

            {/* Timeline Details Section (Hidden in PDF print) */}
            <section id="timeline" className="no-print">
              <Timeline
                timeline={result.timeline}
                estimatedConstructionYear={result.estimated_construction_year}
              />
            </section>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-[11px] text-neutral-400 border-t border-neutral-200 pt-6 mt-auto print:mt-6 print:pt-4 print:text-[10px]">
        &copy; {new Date().getFullYear()} محلل تاريخ المباني &bull; تم إنشاء التقرير عبر صور الأقمار الصناعية
      </footer>
    </main>
  );
}
