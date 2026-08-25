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

  const handleAnalyze = async (coordinates: [number, number][]) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

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
    <main className="min-h-screen bg-neutral-50 text-neutral-800 flex flex-col items-center justify-start p-6 md:p-12 relative overflow-hidden select-none">
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-radial from-amber-500/10 via-transparent to-transparent opacity-60 pointer-events-none z-0" />

      <div className="w-full max-w-4xl mx-auto z-10 flex flex-col gap-8 pb-16">
        {/* Header */}
        <header className="text-center space-y-3 mt-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-neutral-200 text-[11px] font-semibold tracking-wider text-amber-600 uppercase shadow-sm">
            🛰️ الاستشعار عن بعد عبر الأقمار الصناعية
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-neutral-900">
            محلل تاريخ المباني
          </h1>
          <p className="text-sm md:text-base text-neutral-600 max-w-xl mx-auto leading-relaxed">
            أدخل الإحداثيات الأربعة المحيطة بالمبنى لتقدير فترة بنائه وآخر تغيير
            تم رصده
          </p>
        </header>

        {/* Input Form Section */}
        <section className="bg-neutral-100/30 rounded-3xl p-2 border border-neutral-200/50">
          <CoordinateForm onAnalyze={handleAnalyze} isLoading={isLoading} />
        </section>

        {/* Loading State */}
        {isLoading && (
          <div className="w-full max-w-4xl mx-auto mt-8 p-8 rounded-3xl bg-white border border-neutral-200 shadow-md flex flex-col items-center justify-center text-center space-y-4 animate-pulse">
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
          <div className="w-full max-w-4xl mx-auto mt-8 p-6 rounded-2xl bg-red-50 border border-red-200 shadow-sm flex items-start gap-4">
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
              />
            </section>

            <section id="timeline">
              <Timeline
                timeline={result.timeline}
                estimatedConstructionYear={result.estimated_construction_year}
              />
            </section>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full text-center text-[11px] text-neutral-400 border-t border-neutral-200 pt-6 mt-auto">
        &copy; {new Date().getFullYear()} محلل تاريخ المباني &bull; نسخة تجريبية
        لـ Google Earth Engine Node.js Serverless
      </footer>
    </main>
  );
}
