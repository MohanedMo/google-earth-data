import { TimelineItem } from '@/types/building';

/**
 * NOTE:
 * رغم أن الحقل اسمه `ndbi` في المشروع، القيم المستخدمة هنا
 * تبدو Sentinel-1 Backscatter بالديسيبل (dB)، وليست NDBI الحقيقي.
 *
 * نُبقي اسم ndbi مؤقتًا لتجنب كسر الـAPI الحالي.
 */

/* =========================================================
   CONFIG
========================================================= */

/**
 * Minimum elevation above historical baseline
 * required to consider a construction candidate.
 *
 * Lowered from 1.8 to 1.5 because median baseline
 * produces tighter estimates, and real buildings
 * often show jumps in the 1.5-1.8 dB range.
 */
export const BASELINE_JUMP_THRESHOLD = 1.5;

/**
 * Lower threshold used for persistence checking.
 */
export const PERSISTENCE_THRESHOLD = 1.2;

/**
 * Minimum year-to-year increase to flag a radar change.
 */
export const CHANGE_THRESHOLD = 1.8;

/**
 * Very small changes are treated as normal radar variation.
 */
export const NOISE_THRESHOLD = 0.8;

/**
 * Absolute backscatter threshold.
 *
 * IMPORTANT:
 * This is only an additional signal.
 * It is NOT a universal building threshold.
 */
export const NDBI_THRESHOLD = -10.5;

/**
 * Margin around the absolute threshold.
 */
export const STABILITY_MARGIN = 1.0;

/**
 * Number of earliest years used to estimate
 * the historical baseline.
 */
export const BASELINE_WINDOW_SIZE = 4;

/**
 * Number of observations used after a candidate
 * to verify persistence.
 */
export const STABILITY_WINDOW = 3;

/**
 * Minimum elevated observations required
 * inside the stability window.
 */
export const MIN_PERSISTENT_OBSERVATIONS = 2;

/**
 * Strong construction signal.
 */
export const HIGH_CONFIDENCE_JUMP = 2.5;

/**
 * Medium construction signal.
 */
export const MEDIUM_CONFIDENCE_JUMP = 2.0;

/**
 * Maximum per-year rate of change (dB/year) that
 * is considered gradual drift rather than a
 * construction step-change.
 *
 * If the approach to a candidate year is purely
 * linear with no single year jump > this value,
 * reject it as gradual development.
 */
export const GRADUAL_RATE_MAX = 0.5;

/**
 * Minimum jump above baseline required
 * even when absolute threshold is met.
 *
 * Prevents pre-existing buildings from
 * being falsely detected.
 */
export const MIN_ABSOLUTE_JUMP = 1.0;


/* =========================================================
   TYPES
========================================================= */

export type ChangeConfidence =
  | 'high'
  | 'medium'
  | 'low'
  | 'none';

export interface BuildingChangeAnalysis {
  baseline_mean: number | null;

  construction_jump: number | null;

  construction_score: number;

  construction_confidence: ChangeConfidence;

  change_start_year: number | null;

  change_window_start: number | null;

  change_window_end: number | null;

  /**
   * Last year where a radar anomaly was detected.
   * This does NOT necessarily mean a physical building change.
   */
  last_radar_change_year: number | null;

  /**
   * Last change with enough evidence to call it
   * a possible structural modification.
   */
  estimated_last_change_year: number | null;

  last_change_confidence: ChangeConfidence;
}


/* =========================================================
   HELPERS
========================================================= */

function round(value: number, decimals = 4): number {
  const multiplier = Math.pow(10, decimals);

  return Math.round(value * multiplier) / multiplier;
}


/**
 * Median is preferred for radar baseline because it is
 * less sensitive to one abnormal observation.
 */
function median(values: number[]): number {
  if (!values.length) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);

  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (
      (sorted[middle - 1] + sorted[middle]) / 2
    );
  }

  return sorted[middle];
}


function clamp(
  value: number,
  min: number,
  max: number
): number {
  return Math.max(min, Math.min(max, value));
}


/**
 * Calculate construction confidence.
 *
 * IMPORTANT:
 * This is NOT real-world accuracy percentage.
 */
function getConstructionConfidence(
  jump: number,
  persistentCount: number,
  absoluteSignal: boolean
): ChangeConfidence {

  if (
    jump >= HIGH_CONFIDENCE_JUMP &&
    persistentCount >= 2
  ) {
    return 'high';
  }

  if (
    jump >= MEDIUM_CONFIDENCE_JUMP &&
    persistentCount >= 2
  ) {
    return 'medium';
  }

  if (
    absoluteSignal &&
    persistentCount >= 2
  ) {
    return 'medium';
  }

  if (
    jump >= BASELINE_JUMP_THRESHOLD
  ) {
    return 'low';
  }

  return 'none';
}


/**
 * Generate a relative evidence score from 0-100.
 *
 * This is an algorithmic evidence score,
 * NOT "accuracy = X%".
 */
function calculateConstructionScore(
  jump: number,
  persistentCount: number,
  windowSize: number,
  absoluteSignal: boolean
): number {

  /**
   * Jump score.
   *
   * 1.8 dB = candidate
   * 2.5+ dB = strong
   */
  const jumpScore = clamp(
    50 +
      ((jump - BASELINE_JUMP_THRESHOLD) / 1.2) *
        40,
    0,
    90
  );

  const persistenceRatio =
    windowSize > 0
      ? persistentCount / windowSize
      : 0;

  const persistenceScore =
    persistenceRatio * 30;

  const absoluteBonus =
    absoluteSignal ? 10 : 0;

  return Math.round(
    clamp(
      jumpScore * 0.6 +
        persistenceScore +
        absoluteBonus,
      0,
      100
    )
  );
}


/* =========================================================
   MAIN FUNCTION
========================================================= */

export function interpretNdbiTimeline(
  timeline: TimelineItem[]
): {
  success: boolean;

  estimated_construction_year: number | null;

  estimated_last_change_year: number | null;

  message?: string;

  timeline: TimelineItem[];

  analysis?: BuildingChangeAnalysis;
} {

  /* =======================================================
     1. SORT TIMELINE
  ======================================================= */

  const sortedTimeline = [...timeline].sort(
    (a, b) => a.year - b.year
  );


  /* =======================================================
     2. REMOVE INVALID VALUES
  ======================================================= */

  const validItems = sortedTimeline.filter(
    item =>
      item.ndbi !== null &&
      Number.isFinite(Number(item.ndbi))
  );


  const n = validItems.length;


  /* =======================================================
     3. FORMAT TIMELINE
  ======================================================= */

  const formattedTimeline = sortedTimeline.map(item => ({
    year: item.year,

    ndbi:
      item.ndbi !== null
        ? round(Number(item.ndbi), 4)
        : null,

    thumbnail_url: item.thumbnail_url
  }));


  /* =======================================================
     4. NOT ENOUGH DATA
  ======================================================= */

  if (n < 5) {

    return {
      success: true,

      estimated_construction_year: null,

      estimated_last_change_year: null,

      message:
        'عدد السنوات المتاحة غير كافٍ لتحليل التغيير بشكل موثوق. يفضل توفير 5 سنوات أو أكثر.',

      timeline: formattedTimeline,

      analysis: {
        baseline_mean: null,

        construction_jump: null,

        construction_score: 0,

        construction_confidence: 'none',

        change_start_year: null,

        change_window_start: null,

        change_window_end: null,

        last_radar_change_year: null,

        estimated_last_change_year: null,

        last_change_confidence: 'none'
      }
    };
  }


  /* =======================================================
     5. HISTORICAL BASELINE
  ======================================================= */

  const baselineSize = Math.min(
    BASELINE_WINDOW_SIZE,
    n - 1
  );


  const baselineItems =
    validItems.slice(0, baselineSize);


  const baselineValues =
    baselineItems.map(
      item => Number(item.ndbi)
    );


  /**
   * Median instead of mean.
   */
  let baselineMean =
    median(baselineValues);


  /* =======================================================
     6. CONSTRUCTION DETECTION
  ======================================================= */

  let estimatedConstructionYear:
    number | null = null;

  let constructionJump:
    number | null = null;

  let constructionScore = 0;

  let constructionConfidence:
    ChangeConfidence = 'none';

  let changeStartYear:
    number | null = null;

  let changeWindowStart:
    number | null = null;

  let changeWindowEnd:
    number | null = null;

  let isPreExisting = false;

  /**
   * Pre-existing building check:
   *
   * If the baseline itself is already at or above building-level backscatter
   * (baselineMean >= NDBI_THRESHOLD) AND the first valid observation is also
   * elevated, the building was already standing at the start of the satellite
   * monitoring record (e.g. 2014 for Sentinel-1).
   *
   * In this case, we do NOT scan for a "step-change" because the parcel was
   * never empty land during our observation window.
   */
  const firstObservation = Number(validItems[0].ndbi);

  if (
    baselineMean >= NDBI_THRESHOLD &&
    firstObservation >= NDBI_THRESHOLD
  ) {
    isPreExisting = true;
    estimatedConstructionYear = validItems[0].year;
    constructionJump = null;
    constructionScore = 90;
    constructionConfidence = 'high';
    changeStartYear = validItems[0].year;
    changeWindowStart = validItems[0].year;
    changeWindowEnd = validItems[0].year;
  }

  /**
   * Only scan for initial construction if the parcel was not
   * already a building at the start of monitoring.
   */
  if (!isPreExisting) {
    const scanStart = Math.min(1, n - 1);

    for (
      let i = scanStart;
      i < n;
      i++
    ) {

      const current =
        Number(validItems[i].ndbi);

      const currentYear =
        validItems[i].year;


      /* -----------------------------------------------------
         Dynamic pre-candidate baseline
         Uses observations strictly prior to candidate index i
         (capped at BASELINE_WINDOW_SIZE) to prevent early
         construction (e.g. 2015, 2016) from contaminating
         its own baseline.
      ----------------------------------------------------- */

      const priorItems = validItems.slice(
        0,
        Math.min(i, BASELINE_WINDOW_SIZE)
      );

      const priorValues = priorItems.map(
        item => Number(item.ndbi)
      );

      const effectiveBaseline =
        median(priorValues);

      const diffFromBaseline =
        current - effectiveBaseline;


      /* -----------------------------------------------------
         Year-to-year acceleration signal
      ----------------------------------------------------- */

      const previous =
        Number(validItems[i - 1].ndbi);

      const yearToYearJump =
        current - previous;


      /* -----------------------------------------------------
         Physical building backscatter floor
         No building structure produces annual Sentinel-1 VV
         backscatter below -13.8 dB. Values below this are
         soil, water, or agricultural vegetation.
      ----------------------------------------------------- */

      if (current < -13.8) {
        continue;
      }


      /* -----------------------------------------------------
         Early year guard (index 1)
         When only 1 baseline observation exists (i = 1),
         require strong jump (>= 2.5 dB) and clear building level
         (>= -12.5 dB) to prevent single-year soil variations
         from falsely triggering.
      ----------------------------------------------------- */

      if (i === 1) {
        if (
          current < -12.5 ||
          diffFromBaseline < 2.5
        ) {
          continue;
        }
      }


      /* -----------------------------------------------------
         Candidate tests
      ----------------------------------------------------- */

      const meetsBaselineJump =
        diffFromBaseline >=
        BASELINE_JUMP_THRESHOLD;


      const meetsAbsoluteThreshold =
        current >= NDBI_THRESHOLD &&
        diffFromBaseline >= BASELINE_JUMP_THRESHOLD;


      /**
       * If neither condition is met,
       * this year is not a candidate.
       */
      if (
        !meetsBaselineJump &&
        !meetsAbsoluteThreshold
      ) {
        continue;
      }


    /* -----------------------------------------------------
       Gradual development guard

       If the signal has been rising slowly and
       linearly (< GRADUAL_RATE_MAX per year)
       with no single sharp jump, reject it.
    ----------------------------------------------------- */

    const lookbackStart = Math.max(0, i - 3);
    let maxSingleJump = 0;

    for (let k = lookbackStart + 1; k <= i; k++) {
      const jumpK =
        Number(validItems[k].ndbi) -
        Number(validItems[k - 1].ndbi);

      if (jumpK > maxSingleJump) {
        maxSingleJump = jumpK;
      }
    }

    const isGradual =
      maxSingleJump < GRADUAL_RATE_MAX &&
      !meetsAbsoluteThreshold;

    if (isGradual) {
      continue;
    }


    /* -----------------------------------------------------
       Stability window
    ----------------------------------------------------- */

    const subsequentItems =
      validItems.slice(
        i,
        i + STABILITY_WINDOW
      );


    const persistentItems =
      subsequentItems.filter(item => {

        const value =
          Number(item.ndbi);

        return (
          value - effectiveBaseline >=
          PERSISTENCE_THRESHOLD
        );
      });


    const persistentCount =
      persistentItems.length;


    /**
     * At least 2 observations must remain elevated.
     */
    const hasPersistence =
      persistentCount >=
      MIN_PERSISTENT_OBSERVATIONS;


    /* -----------------------------------------------------
       Absolute threshold stability
    ----------------------------------------------------- */

    const absoluteStable =
      subsequentItems.length >= 2 &&
      subsequentItems.every(item => {

        return (
          Number(item.ndbi) >=
          NDBI_THRESHOLD -
            STABILITY_MARGIN
        );
      });


    /* -----------------------------------------------------
       Final confirmation
    ----------------------------------------------------- */

    const confirmed =
      (
        meetsBaselineJump &&
        hasPersistence
      ) ||
      (
        meetsAbsoluteThreshold &&
        absoluteStable
      );


    if (!confirmed) {
      continue;
    }


    /* -----------------------------------------------------
       Construction detected
    ----------------------------------------------------- */

    estimatedConstructionYear =
      currentYear;

    baselineMean =
      effectiveBaseline;

    constructionJump =
      diffFromBaseline;


    changeStartYear =
      currentYear;


    changeWindowStart =
      currentYear;


    const persistentYears =
      persistentItems.map(
        item => item.year
      );


    changeWindowEnd =
      persistentYears.length
        ? Math.max(...persistentYears)
        : currentYear;


    constructionConfidence =
      getConstructionConfidence(
        diffFromBaseline,
        persistentCount,
        meetsAbsoluteThreshold
      );


    constructionScore =
      calculateConstructionScore(
        diffFromBaseline,
        persistentCount,
        subsequentItems.length,
        meetsAbsoluteThreshold
      );


    if (
      constructionConfidence === 'none' ||
      constructionScore < 50
    ) {
      continue;
    }

    /**
     * IMPORTANT:
     *
     * Stop at FIRST confirmed construction event.
     */
    break;
  }
}


  /* =======================================================
     7. LAST RADAR CHANGE
  ======================================================= */

  let lastRadarChangeYear:
    number | null = null;


  let estimatedLastChangeYear:
    number | null = null;


  let lastChangeConfidence:
    ChangeConfidence = 'none';


  if (
    estimatedConstructionYear !== null
  ) {

    const constructionIndex =
      validItems.findIndex(
        item =>
          item.year ===
          estimatedConstructionYear
      );


    /* -----------------------------------------------------
       Scan years after construction
    ----------------------------------------------------- */

    for (
      let i = constructionIndex + 1;
      i < n;
      i++
    ) {

      const previous =
        Number(validItems[i - 1].ndbi);

      const current =
        Number(validItems[i].ndbi);


      const diff =
        current - previous;


      /* ---------------------------------------------------
         Radar anomaly
      --------------------------------------------------- */

      if (
        diff >= NOISE_THRESHOLD
      ) {

        lastRadarChangeYear =
          validItems[i].year;
      }


      /* ---------------------------------------------------
         Not strong enough
      --------------------------------------------------- */

      if (
        diff < CHANGE_THRESHOLD
      ) {
        continue;
      }


      /* ---------------------------------------------------
         IMPORTANT:
         Last available year cannot be confirmed.
      --------------------------------------------------- */

      const hasNextYear =
        i + 1 < n;


      if (!hasNextYear) {

        /**
         * This is a radar anomaly only.
         *
         * We DO NOT call it a structural change.
         */
        continue;
      }


      /* ---------------------------------------------------
         Check following observation
      --------------------------------------------------- */

      const next =
        Number(validItems[i + 1].ndbi);


      const nextDiff =
        next - current;


      /**
       * The signal should not immediately collapse.
       */
      const stableAfterChange =
        nextDiff >= -1.0;


      if (!stableAfterChange) {
        continue;
      }


      /* ---------------------------------------------------
         Confirm structural-change candidate
      --------------------------------------------------- */

      estimatedLastChangeYear =
        validItems[i].year;


      if (
        diff >= HIGH_CONFIDENCE_JUMP
      ) {

        lastChangeConfidence =
          'high';

      } else if (
        diff >= MEDIUM_CONFIDENCE_JUMP
      ) {

        lastChangeConfidence =
          'medium';

      } else {

        lastChangeConfidence =
          'low';
      }
    }
  }


  /* =======================================================
     8. ANALYSIS OBJECT
  ======================================================= */

  const analysis: BuildingChangeAnalysis = {

    baseline_mean:
      round(baselineMean),

    construction_jump:
      constructionJump !== null
        ? round(constructionJump)
        : null,

    construction_score:
      constructionScore,

    construction_confidence:
      constructionConfidence,

    change_start_year:
      changeStartYear,

    change_window_start:
      changeWindowStart,

    change_window_end:
      changeWindowEnd,

    last_radar_change_year:
      lastRadarChangeYear,

    estimated_last_change_year:
      estimatedLastChangeYear,

    last_change_confidence:
      lastChangeConfidence
  };


  /* =======================================================
     9. NO CONSTRUCTION
  ======================================================= */

  if (
    estimatedConstructionYear === null
  ) {

    return {

      success: true,

      estimated_construction_year: null,

      estimated_last_change_year: null,

      message:
        'لم يتم رصد نشاط بناء مستقر وواضح في المنطقة المحددة.',

      timeline: formattedTimeline,

      analysis
    };
  }


  /* =======================================================
     10. MESSAGE
  ======================================================= */

  let message = '';

  if (isPreExisting) {
    message =
      `المبنى قائم ومستقر منذ بداية رصد القمر الصناعي في عام ${estimatedConstructionYear}.`;
  } else {
    message =
      `تم رصد بداية نشاط بناء محتملة في عام ${estimatedConstructionYear}.`;

    const confidenceLabels: Record<ChangeConfidence, string> = {
      high: 'مرتفع',
      medium: 'متوسط',
      low: 'منخفض',
      none: 'غير مؤكد'
    };

    const confidenceArabic =
      confidenceLabels[constructionConfidence] || constructionConfidence;

    message +=
      ` قوة الأدلة الرادارية ${constructionScore}/100، ` +
      `ومستوى الثقة ${confidenceArabic}.`;

    if (
      changeWindowStart !== null &&
      changeWindowEnd !== null &&
      changeWindowEnd !== changeWindowStart
    ) {
      message +=
        ` نافذة التغيير التقريبية بين ` +
        `${changeWindowStart} و${changeWindowEnd}.`;
    }
  }


  /* =======================================================
     11. CONFIRMED LATER CHANGE
  ======================================================= */

  if (
    estimatedLastChangeYear !== null
  ) {

    message +=
      ` تم رصد تغير راداري مستقر قد يشير إلى ` +
      `تعديل أو توسعة في عام ${estimatedLastChangeYear}.`;
  }


  /* =======================================================
     12. RADAR CHANGE WITHOUT CONFIRMATION
  ======================================================= */

  else if (
    lastRadarChangeYear !== null
  ) {

    message +=
      ` تم رصد تغير راداري محتمل في عام ` +
      `${lastRadarChangeYear}، ` +
      `لكن لا توجد أدلة زمنية كافية لتأكيد أنه تعديل إنشائي.`;
  }


  /* =======================================================
     13. FINAL RESULT
  ======================================================= */

  return {

    success: true,

    estimated_construction_year:
      estimatedConstructionYear,

    estimated_last_change_year:
      estimatedLastChangeYear,

    message,

    timeline:
      formattedTimeline,

    analysis
  };
}