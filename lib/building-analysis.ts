import { TimelineItem } from '@/types/building';

// Satellite Backscatter thresholds (in dB)
export const NDBI_THRESHOLD = -10.2;
export const STABILITY_MARGIN = 1.0;
export const CHANGE_THRESHOLD = 1.2;

export function interpretNdbiTimeline(timeline: TimelineItem[]): {
  success: boolean;
  estimated_construction_year: number | null;
  estimated_last_change_year: number | null;
  message?: string;
  timeline: TimelineItem[];
} {
  // Sort timeline by year
  const sortedTimeline = [...timeline].sort((a, b) => a.year - b.year);

  let estimated_construction_year: number | null = null;
  let estimated_last_change_year: number | null = null;

  const n = sortedTimeline.length;

  // 1. First Appearance Detection
  for (let i = 0; i < n - 1; i++) {
    const curr = sortedTimeline[i];
    const next = sortedTimeline[i + 1];

    const ndbiCurr = curr.ndbi;
    const ndbiNext = next.ndbi;

    if (ndbiCurr !== null && ndbiNext !== null) {
      if (ndbiCurr >= NDBI_THRESHOLD && ndbiNext >= (NDBI_THRESHOLD - STABILITY_MARGIN)) {
        estimated_construction_year = curr.year;
        break;
      }
    }
  }

  // Fallback: If no construction year detected by threshold, determine it from the year with 100% backscatter intensity scale (max NDBI)
  if (estimated_construction_year === null) {
    const validItems = sortedTimeline.filter(item => item.ndbi !== null);
    if (validItems.length > 0) {
      const maxNdbi = Math.max(...validItems.map(item => item.ndbi!));
      const peakItem = validItems.find(item => item.ndbi === maxNdbi);
      if (peakItem) {
        estimated_construction_year = peakItem.year;
      }
    }
  }

  // 2. Last Change Detection
  if (estimated_construction_year !== null) {
    let constIdx = -1;
    for (let i = 0; i < n; i++) {
      if (sortedTimeline[i].year === estimated_construction_year) {
        constIdx = i;
        break;
      }
    }

    // Compare each year from the construction year onwards with its previous year
    for (let i = constIdx + 1; i < n; i++) {
      const prev = sortedTimeline[i - 1];
      const curr = sortedTimeline[i];

      const ndbiPrev = prev.ndbi;
      const ndbiCurr = curr.ndbi;

      if (ndbiPrev !== null && ndbiCurr !== null) {
        if (ndbiCurr - ndbiPrev >= CHANGE_THRESHOLD) {
          estimated_last_change_year = curr.year;
        }
      }
    }
  }

  const formattedTimeline = sortedTimeline.map(item => ({
    year: item.year,
    ndbi: item.ndbi !== null ? parseFloat(item.ndbi.toFixed(4)) : null,
    thumbnail_url: item.thumbnail_url
  }));

  if (estimated_construction_year === null) {
    return {
      success: true,
      estimated_construction_year: null,
      estimated_last_change_year: null,
      message: "لم يتم رصد نشاط بناء واضح في المنطقة المحددة.",
      timeline: formattedTimeline
    };
  }

  let message = `تم رصد أول نشاط بناء مستقر في هذه المنطقة في عام ${estimated_construction_year}.`;
  if (estimated_last_change_year) {
    message += ` كما تم رصد تعديل هيكلي أو توسعة كبيرة لاحقة في عام ${estimated_last_change_year}.`;
  } else {
    message += ` ولم يتم رصد أي تعديلات هيكلية رئيسية بعد ذلك.`;
  }

  return {
    success: true,
    estimated_construction_year,
    estimated_last_change_year,
    message,
    timeline: formattedTimeline
  };
}
