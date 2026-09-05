import { interpretNdbiTimeline } from '../lib/building-analysis';

// ============================================================
// COMPREHENSIVE TEST SUITE: 100 TEST CASES FOR building-analysis.ts
// ============================================================

export interface TestCase {
  id: number;
  category: string;
  categoryAr: string;
  name: string;
  nameAr: string;
  timeline: { year: number; ndbi: number | null; thumbnail_url: null }[];
  expectedConstructionYear: number | null;
  expectedLastChangeYear: number | null;
  toleranceYears?: number;
}

// Helper to create a timeline quickly
function makeTimeline(startYear: number, values: (number | null)[]): { year: number; ndbi: number | null; thumbnail_url: null }[] {
  return values.map((val, idx) => ({
    year: startYear + idx,
    ndbi: val,
    thumbnail_url: null
  }));
}

export const cases: TestCase[] = [
  // =========================================================================
  // الفئة 1: حالات المستخدم الحقيقية والمباني القائمة مسبقاً (Cases 1 - 10)
  // =========================================================================
  {
    id: 1,
    category: 'Category 1: Real User Cases & Pre-existing Buildings',
    categoryAr: 'الفئة 1: حالات المستخدم والمباني القائمة مسبقاً',
    name: 'Case 1: User building 1 (actual build 2020)',
    nameAr: 'مبنى المستخدم 1 - بناء فعلي 2020',
    timeline: makeTimeline(2014, [-16.0512, -14.4283, -15.2759, -14.3107, -13.7352, -13.3884, -13.1276, -12.1391, -12.9569, -12.7332, -12.6312, -12.4098, -10.9602]),
    expectedConstructionYear: 2020,
    expectedLastChangeYear: null,
    toleranceYears: 1
  },
  {
    id: 2,
    category: 'Category 1: Real User Cases & Pre-existing Buildings',
    categoryAr: 'الفئة 1: حالات المستخدم والمباني القائمة مسبقاً',
    name: 'Case 2: User building 2 (actual build 2014, expansion 2022)',
    nameAr: 'مبنى المستخدم 2 - بناء فعلي 2014 وتوسعة 2022',
    timeline: [
      { year: 2008, ndbi: null, thumbnail_url: null },
      { year: 2009, ndbi: null, thumbnail_url: null },
      { year: 2010, ndbi: null, thumbnail_url: null },
      { year: 2011, ndbi: null, thumbnail_url: null },
      { year: 2012, ndbi: null, thumbnail_url: null },
      { year: 2013, ndbi: null, thumbnail_url: null },
      { year: 2014, ndbi: -9.3899, thumbnail_url: null },
      { year: 2015, ndbi: -8.6197, thumbnail_url: null },
      { year: 2016, ndbi: -8.2746, thumbnail_url: null },
      { year: 2017, ndbi: -8.9211, thumbnail_url: null },
      { year: 2018, ndbi: -7.9997, thumbnail_url: null },
      { year: 2019, ndbi: -8.0551, thumbnail_url: null },
      { year: 2020, ndbi: -7.6282, thumbnail_url: null },
      { year: 2021, ndbi: -7.5833, thumbnail_url: null },
      { year: 2022, ndbi: -5.7636, thumbnail_url: null },
      { year: 2023, ndbi: -6.4357, thumbnail_url: null },
      { year: 2024, ndbi: -7.4059, thumbnail_url: null },
      { year: 2025, ndbi: -8.3074, thumbnail_url: null },
      { year: 2026, ndbi: -9.2265, thumbnail_url: null }
    ],
    expectedConstructionYear: 2014,
    expectedLastChangeYear: 2022
  },
  {
    id: 3,
    category: 'Category 1: Real User Cases & Pre-existing Buildings',
    categoryAr: 'الفئة 1: حالات المستخدم والمباني القائمة مسبقاً',
    name: 'Case 3: Pre-existing building starting 2014 (flat elevated, no change)',
    nameAr: 'مبنى قائم منذ 2014 مستقر تماماً دون أي توسعة',
    timeline: makeTimeline(2014, [-9.2, -9.1, -9.3, -9.2, -9.0, -9.2, -9.1, -9.3, -9.2, -9.1, -9.2, -9.3, -9.1]),
    expectedConstructionYear: 2014,
    expectedLastChangeYear: null
  },
  {
    id: 4,
    category: 'Category 1: Real User Cases & Pre-existing Buildings',
    categoryAr: 'الفئة 1: حالات المستخدم والمباني القائمة مسبقاً',
    name: 'Case 4: Pre-existing building starting 2008 archive',
    nameAr: 'مبنى قائم في أرشيف المراقبة منذ 2008',
    timeline: makeTimeline(2008, [-9.5, -9.3, -9.6, -9.4, -9.2, -9.5, -9.3, -9.4, -9.2, -9.5, -9.3]),
    expectedConstructionYear: 2008,
    expectedLastChangeYear: null
  },
  {
    id: 5,
    category: 'Category 1: Real User Cases & Pre-existing Buildings',
    categoryAr: 'الفئة 1: حالات المستخدم والمباني القائمة مسبقاً',
    name: 'Case 5: Pre-existing building 2014 with vertical expansion in 2018',
    nameAr: 'مبنى قائم 2014 مع تعلية طابق في 2018',
    timeline: makeTimeline(2014, [-9.5, -9.4, -9.6, -9.3, -7.1, -7.0, -7.2, -7.1, -7.3, -7.0, -7.2]),
    expectedConstructionYear: 2014,
    expectedLastChangeYear: 2018
  },
  {
    id: 6,
    category: 'Category 1: Real User Cases & Pre-existing Buildings',
    categoryAr: 'الفئة 1: حالات المستخدم والمباني القائمة مسبقاً',
    name: 'Case 6: Pre-existing building 2014 with horizontal expansion in 2020',
    nameAr: 'مبنى قائم 2014 مع توسعة أفقية في 2020',
    timeline: makeTimeline(2014, [-9.2, -9.0, -9.3, -9.1, -9.2, -9.1, -6.8, -6.7, -6.9, -6.8, -7.0]),
    expectedConstructionYear: 2014,
    expectedLastChangeYear: 2020
  },
  {
    id: 7,
    category: 'Category 1: Real User Cases & Pre-existing Buildings',
    categoryAr: 'الفئة 1: حالات المستخدم والمباني القائمة مسبقاً',
    name: 'Case 7: Pre-existing building 2014 with expansion in 2023',
    nameAr: 'مبنى قائم 2014 مع توسعة في 2023',
    timeline: makeTimeline(2014, [-9.4, -9.3, -9.5, -9.2, -9.4, -9.3, -9.2, -9.4, -9.3, -7.2, -7.1, -7.3]),
    expectedConstructionYear: 2014,
    expectedLastChangeYear: 2023
  },
  {
    id: 8,
    category: 'Category 1: Real User Cases & Pre-existing Buildings',
    categoryAr: 'الفئة 1: حالات المستخدم والمباني القائمة مسبقاً',
    name: 'Case 8: Pre-existing building 2014 with partial demolition in 2021',
    nameAr: 'مبنى قائم 2014 مع هدم جزئي في 2021',
    timeline: makeTimeline(2014, [-8.5, -8.3, -8.6, -8.4, -8.5, -8.3, -8.4, -10.5, -10.6, -10.4, -10.5]),
    expectedConstructionYear: 2014,
    expectedLastChangeYear: null
  },
  {
    id: 9,
    category: 'Category 1: Real User Cases & Pre-existing Buildings',
    categoryAr: 'الفئة 1: حالات المستخدم والمباني القائمة مسبقاً',
    name: 'Case 9: Pre-existing metallic commercial shed (-7.5 dB)',
    nameAr: 'جمالون معدني تجاري قائم ومستقر منذ 2014 (-7.5 dB)',
    timeline: makeTimeline(2014, [-7.5, -7.4, -7.6, -7.3, -7.5, -7.4, -7.6, -7.3, -7.5, -7.4, -7.6]),
    expectedConstructionYear: 2014,
    expectedLastChangeYear: null
  },
  {
    id: 10,
    category: 'Category 1: Real User Cases & Pre-existing Buildings',
    categoryAr: 'الفئة 1: حالات المستخدم والمباني القائمة مسبقاً',
    name: 'Case 10: Pre-existing dense urban flat roof (-8.8 dB)',
    nameAr: 'مبنى خرساني في كتلة سكنية قائمة منذ 2014',
    timeline: makeTimeline(2014, [-8.8, -8.7, -8.9, -8.6, -8.8, -8.7, -8.9, -8.6, -8.8, -8.7, -8.8]),
    expectedConstructionYear: 2014,
    expectedLastChangeYear: null
  },

  // =========================================================================
  // الفئة 2: الأراضي الفضاء والزراعية والطبيعية - بدون بناء (Cases 11 - 30)
  // =========================================================================
  {
    id: 11,
    category: 'Category 2: Vacant Land, Agriculture & Natural Terrain',
    categoryAr: 'الفئة 2: الأراضي الفضاء والزراعية دون بناء',
    name: 'Case 11: Nile Delta clay agricultural field (-16.0 dB)',
    nameAr: 'حقل زراعي طيني في دلتا النيل (-16.0 dB)',
    timeline: makeTimeline(2014, [-16.2, -15.8, -16.0, -15.5, -15.9, -15.7, -16.1, -15.4, -15.6, -15.8, -15.3, -15.5, -15.1]),
    expectedConstructionYear: null,
    expectedLastChangeYear: null
  },
  {
    id: 12,
    category: 'Category 2: Vacant Land, Agriculture & Natural Terrain',
    categoryAr: 'الفئة 2: الأراضي الفضاء والزراعية دون بناء',
    name: 'Case 12: Low-signal flat desert sand (-20.5 dB)',
    nameAr: 'أرض صحراوية منبسطة منخفضة الإشارة (-20.5 dB)',
    timeline: makeTimeline(2014, [-20.5, -20.2, -20.7, -20.3, -20.6, -20.4, -20.5, -20.3, -20.6, -20.4, -20.5]),
    expectedConstructionYear: null,
    expectedLastChangeYear: null
  },
  {
    id: 13,
    category: 'Category 2: Vacant Land, Agriculture & Natural Terrain',
    categoryAr: 'الفئة 2: الأراضي الفضاء والزراعية دون بناء',
    name: 'Case 13: Water basin / aquaculture fish farm (-22 dB)',
    nameAr: 'حوض مزرعة سمكية ومسطح مائي (-22 dB)',
    timeline: makeTimeline(2014, [-22.5, -22.1, -21.9, -22.3, -22.0, -22.4, -21.8, -22.2, -22.0, -22.5]),
    expectedConstructionYear: null,
    expectedLastChangeYear: null
  },
  {
    id: 14,
    category: 'Category 2: Vacant Land, Agriculture & Natural Terrain',
    categoryAr: 'الفئة 2: الأراضي الفضاء والزراعية دون بناء',
    name: 'Case 14: Agricultural crop rotation (Wheat/Corn oscillation)',
    nameAr: 'دورة زراعية دورية (قمح / ذرة) تذبذب بين -16 و -14.8',
    timeline: makeTimeline(2014, [-16.2, -15.1, -16.4, -15.2, -16.3, -15.0, -16.2, -15.1, -16.5, -15.3, -16.1]),
    expectedConstructionYear: null,
    expectedLastChangeYear: null
  },
  {
    id: 15,
    category: 'Category 2: Vacant Land, Agriculture & Natural Terrain',
    categoryAr: 'الفئة 2: الأراضي الفضاء والزراعية دون بناء',
    name: 'Case 15: Rice paddy fields with annual flooding cycles',
    nameAr: 'حقول أرز مع فترات غمر مائي دورية',
    timeline: makeTimeline(2014, [-17.5, -15.8, -17.8, -15.6, -17.4, -15.7, -17.6, -15.5, -17.3, -15.8]),
    expectedConstructionYear: null,
    expectedLastChangeYear: null
  },
  {
    id: 16,
    category: 'Category 2: Vacant Land, Agriculture & Natural Terrain',
    categoryAr: 'الفئة 2: الأراضي الفضاء والزراعية دون بناء',
    name: 'Case 16: Citrus orchard with slow foliage growth',
    nameAr: 'بستان موالح ونمو خضري بطيء جداً',
    timeline: makeTimeline(2014, [-15.8, -15.6, -15.5, -15.3, -15.2, -15.0, -14.9, -14.8, -14.7, -14.6]),
    expectedConstructionYear: null,
    expectedLastChangeYear: null
  },
  {
    id: 17,
    category: 'Category 2: Vacant Land, Agriculture & Natural Terrain',
    categoryAr: 'الفئة 2: الأراضي الفضاء والزراعية دون بناء',
    name: 'Case 17: Reed / Papyrus marshes along irrigation canal',
    nameAr: 'نباتات مائية وحلفا على أطراف الترع (-16.5 dB)',
    timeline: makeTimeline(2014, [-16.5, -16.2, -16.8, -16.3, -16.6, -16.4, -16.5, -16.2, -16.7, -16.3]),
    expectedConstructionYear: null,
    expectedLastChangeYear: null
  },
  {
    id: 18,
    category: 'Category 2: Vacant Land, Agriculture & Natural Terrain',
    categoryAr: 'الفئة 2: الأراضي الفضاء والزراعية دون بناء',
    name: 'Case 18: Unpaved village dirt road / path (-14.5 dB)',
    nameAr: 'طريق ترابي قروي مدكوك (-14.5 dB)',
    timeline: makeTimeline(2014, [-14.6, -14.4, -14.7, -14.5, -14.6, -14.3, -14.5, -14.4, -14.6, -14.5]),
    expectedConstructionYear: null,
    expectedLastChangeYear: null
  },
  {
    id: 19,
    category: 'Category 2: Vacant Land, Agriculture & Natural Terrain',
    categoryAr: 'الفئة 2: الأراضي الفضاء والزراعية دون بناء',
    name: 'Case 19: Temporary seasonal plastic greenhouses',
    nameAr: 'أنفاق بلاستيكية زراعية مؤقتة في الشتاء فقط',
    timeline: makeTimeline(2014, [-16.0, -14.8, -16.2, -14.9, -16.1, -14.7, -16.3, -15.0, -16.2, -14.8]),
    expectedConstructionYear: null,
    expectedLastChangeYear: null
  },
  {
    id: 20,
    category: 'Category 2: Vacant Land, Agriculture & Natural Terrain',
    categoryAr: 'الفئة 2: الأراضي الفضاء والزراعية دون بناء',
    name: 'Case 20: Coastal salt flat / Sabkha (-21 dB)',
    nameAr: 'سبخة ساحلية وملاحات رطبة (-21 dB)',
    timeline: makeTimeline(2014, [-21.2, -20.8, -21.4, -20.9, -21.3, -21.0, -21.2, -20.8, -21.5, -21.1]),
    expectedConstructionYear: null,
    expectedLastChangeYear: null
  },
  {
    id: 21,
    category: 'Category 2: Vacant Land, Agriculture & Natural Terrain',
    categoryAr: 'الفئة 2: الأراضي الفضاء والزراعية دون بناء',
    name: 'Case 21: Fallow agricultural plot (idle soil)',
    nameAr: 'أرض زراعية بور غير مستغلة (-15.8 dB)',
    timeline: makeTimeline(2014, [-15.9, -15.7, -16.0, -15.8, -15.9, -15.6, -15.8, -15.7, -16.0, -15.8]),
    expectedConstructionYear: null,
    expectedLastChangeYear: null
  },
  {
    id: 22,
    category: 'Category 2: Vacant Land, Agriculture & Natural Terrain',
    categoryAr: 'الفئة 2: الأراضي الفضاء والزراعية دون بناء',
    name: 'Case 22: Desert gravel plain / Reg terrain',
    nameAr: 'سطح صحراوي حصوي (حمادة) منبسط (-18.5 dB)',
    timeline: makeTimeline(2014, [-18.6, -18.3, -18.7, -18.4, -18.6, -18.5, -18.3, -18.7, -18.4, -18.6]),
    expectedConstructionYear: null,
    expectedLastChangeYear: null
  },
  {
    id: 23,
    category: 'Category 2: Vacant Land, Agriculture & Natural Terrain',
    categoryAr: 'الفئة 2: الأراضي الفضاء والزراعية دون بناء',
    name: 'Case 23: Palm grove with stable canopy',
    nameAr: 'غابة نخيل ذات غطاء نباتي مستقر (-14.8 dB)',
    timeline: makeTimeline(2014, [-14.9, -14.7, -15.0, -14.8, -14.9, -14.6, -14.8, -14.7, -14.9, -14.8]),
    expectedConstructionYear: null,
    expectedLastChangeYear: null
  },
  {
    id: 24,
    category: 'Category 2: Vacant Land, Agriculture & Natural Terrain',
    categoryAr: 'الفئة 2: الأراضي الفضاء والزراعية دون بناء',
    name: 'Case 24: Canal bank dredging / soil clearing',
    nameAr: 'تطهير ترع وتراكم الطمي على الجسر (-15.5 dB)',
    timeline: makeTimeline(2014, [-15.8, -15.5, -15.2, -15.7, -15.6, -15.4, -15.8, -15.5, -15.6, -15.4]),
    expectedConstructionYear: null,
    expectedLastChangeYear: null
  },
  {
    id: 25,
    category: 'Category 2: Vacant Land, Agriculture & Natural Terrain',
    categoryAr: 'الفئة 2: الأراضي الفضاء والزراعية دون بناء',
    name: 'Case 25: Seasonal agricultural plowing',
    nameAr: 'حرث وتسوية دورية للأرض الزراعية (-16.3 dB)',
    timeline: makeTimeline(2014, [-16.5, -16.1, -16.6, -16.2, -16.4, -16.0, -16.5, -16.2, -16.4, -16.1]),
    expectedConstructionYear: null,
    expectedLastChangeYear: null
  },
  {
    id: 26,
    category: 'Category 2: Vacant Land, Agriculture & Natural Terrain',
    categoryAr: 'الفئة 2: الأراضي الفضاء والزراعية دون بناء',
    name: 'Case 26: Desert shifting sand dune movement',
    nameAr: 'كثبان رملية صحراوية متحركة (-19.5 dB)',
    timeline: makeTimeline(2014, [-19.7, -19.4, -19.8, -19.3, -19.6, -19.5, -19.2, -19.7, -19.4, -19.6]),
    expectedConstructionYear: null,
    expectedLastChangeYear: null
  },
  {
    id: 27,
    category: 'Category 2: Vacant Land, Agriculture & Natural Terrain',
    categoryAr: 'الفئة 2: الأراضي الفضاء والزراعية دون بناء',
    name: 'Case 27: Rural open-air animal corral (fenced dirt)',
    nameAr: 'زريبة مواشي مكشوفة دون سقف خرساني (-14.9 dB)',
    timeline: makeTimeline(2014, [-15.0, -14.8, -15.1, -14.9, -15.0, -14.7, -14.9, -14.8, -15.0, -14.9]),
    expectedConstructionYear: null,
    expectedLastChangeYear: null
  },
  {
    id: 28,
    category: 'Category 2: Vacant Land, Agriculture & Natural Terrain',
    categoryAr: 'الفئة 2: الأراضي الفضاء والزراعية دون بناء',
    name: 'Case 28: Semi-arid shrub steppe terrain',
    nameAr: 'أرض شبه قاحلة بها شجيرات برية متفرقة (-17.2 dB)',
    timeline: makeTimeline(2014, [-17.4, -17.1, -17.5, -17.2, -17.4, -17.0, -17.3, -17.2, -17.5, -17.1]),
    expectedConstructionYear: null,
    expectedLastChangeYear: null
  },
  {
    id: 29,
    category: 'Category 2: Vacant Land, Agriculture & Natural Terrain',
    categoryAr: 'الفئة 2: الأراضي الفضاء والزراعية دون بناء',
    name: 'Case 29: Open rural drainage ditch edge',
    nameAr: 'حافة مصرف زراعي مكشوف (-16.8 dB)',
    timeline: makeTimeline(2014, [-17.0, -16.6, -17.1, -16.7, -16.9, -16.5, -16.8, -16.7, -17.0, -16.6]),
    expectedConstructionYear: null,
    expectedLastChangeYear: null
  },
  {
    id: 30,
    category: 'Category 2: Vacant Land, Agriculture & Natural Terrain',
    categoryAr: 'الفئة 2: الأراضي الفضاء والزراعية دون بناء',
    name: 'Case 30: Natural dry wadi bed in desert fringe',
    nameAr: 'مجرى سيل جاف على أطراف الصحراء (-19.0 dB)',
    timeline: makeTimeline(2014, [-19.2, -18.9, -19.3, -18.8, -19.1, -19.0, -18.7, -19.2, -18.9, -19.1]),
    expectedConstructionYear: null,
    expectedLastChangeYear: null
  },

  // =========================================================================
  // الفئة 3: تشييد بناء جديد عبر سنوات مختلفة من 2015 حتى 2025 (Cases 31 - 55)
  // =========================================================================
  {
    id: 31,
    category: 'Category 3: Single Year New Construction (2015-2025)',
    categoryAr: 'الفئة 3: تشييد بناء جديد في سنوات مختلفة',
    name: 'Case 31: Build in 2015 (early Sentinel-1 mission)',
    nameAr: 'بناء في عام 2015 (أولى سنوات القمر الصناعي)',
    timeline: makeTimeline(2014, [-16.0, -11.5, -11.2, -11.4, -11.1, -11.3, -11.2, -11.4, -11.1, -11.3]),
    expectedConstructionYear: 2015,
    expectedLastChangeYear: null
  },
  {
    id: 32,
    category: 'Category 3: Single Year New Construction (2015-2025)',
    categoryAr: 'الفئة 3: تشييد بناء جديد في سنوات مختلفة',
    name: 'Case 32: Build in 2016 on agricultural land',
    nameAr: 'بناء في عام 2016 على أرض زراعية',
    timeline: makeTimeline(2014, [-15.9, -15.7, -12.6, -12.4, -12.5, -12.3, -12.2, -12.5, -12.4, -12.3]),
    expectedConstructionYear: 2016,
    expectedLastChangeYear: null
  },
  {
    id: 33,
    category: 'Category 3: Single Year New Construction (2015-2025)',
    categoryAr: 'الفئة 3: تشييد بناء جديد في سنوات مختلفة',
    name: 'Case 33: Large urban building in 2017 (+5.45 dB jump)',
    nameAr: 'مبنى حضري ضخم في 2017 (قفزة +5.45 dB)',
    timeline: makeTimeline(2014, [-15.0, -14.8, -14.5, -9.2, -8.9, -9.0, -8.8, -8.9, -8.7, -8.9]),
    expectedConstructionYear: 2017,
    expectedLastChangeYear: null
  },
  {
    id: 34,
    category: 'Category 3: Single Year New Construction (2015-2025)',
    categoryAr: 'الفئة 3: تشييد بناء جديد في سنوات مختلفة',
    name: 'Case 34: Rural house in 2017 (+3.8 dB jump)',
    nameAr: 'منزل ريفي في 2017 (قفزة +3.8 dB)',
    timeline: makeTimeline(2014, [-16.2, -15.9, -16.1, -12.3, -12.1, -12.4, -12.2, -12.0, -12.3, -12.1]),
    expectedConstructionYear: 2017,
    expectedLastChangeYear: null
  },
  {
    id: 35,
    category: 'Category 3: Single Year New Construction (2015-2025)',
    categoryAr: 'الفئة 3: تشييد بناء جديد في سنوات مختلفة',
    name: 'Case 35: Build in 2018 (Historical reconciliation milestone)',
    nameAr: 'بناء في عام 2018 (تاريخ قانون التصالح الأول)',
    timeline: makeTimeline(2014, [-16.0, -15.8, -15.5, -15.7, -12.5, -12.2, -12.4, -12.3, -12.1, -12.4]),
    expectedConstructionYear: 2018,
    expectedLastChangeYear: null
  },
  {
    id: 36,
    category: 'Category 3: Single Year New Construction (2015-2025)',
    categoryAr: 'الفئة 3: تشييد بناء جديد في سنوات مختلفة',
    name: 'Case 36: Steel hangar warehouse in 2018 (-8.2 dB)',
    nameAr: 'مستودع جمالون معدني في 2018 (-8.2 dB)',
    timeline: makeTimeline(2014, [-15.8, -15.6, -15.9, -15.7, -8.2, -8.0, -8.3, -8.1, -8.4, -8.2]),
    expectedConstructionYear: 2018,
    expectedLastChangeYear: null
  },
  {
    id: 37,
    category: 'Category 3: Single Year New Construction (2015-2025)',
    categoryAr: 'الفئة 3: تشييد بناء جديد في سنوات مختلفة',
    name: 'Case 37: Reinforced concrete building in 2019',
    nameAr: 'مبنى خرسانة مسلحة وطوب أحمر في 2019',
    timeline: makeTimeline(2014, [-16.1, -15.9, -15.8, -16.0, -15.7, -11.2, -11.0, -11.3, -11.1, -11.2]),
    expectedConstructionYear: 2019,
    expectedLastChangeYear: null
  },
  {
    id: 38,
    category: 'Category 3: Single Year New Construction (2015-2025)',
    categoryAr: 'الفئة 3: تشييد بناء جديد في سنوات مختلفة',
    name: 'Case 38: Commercial showroom in 2019',
    nameAr: 'معرض تجاري على طريق رئيسي في 2019',
    timeline: makeTimeline(2014, [-15.5, -15.3, -15.6, -15.4, -15.2, -9.5, -9.3, -9.4, -9.2, -9.5]),
    expectedConstructionYear: 2019,
    expectedLastChangeYear: null
  },
  {
    id: 39,
    category: 'Category 3: Single Year New Construction (2015-2025)',
    categoryAr: 'الفئة 3: تشييد بناء جديد في سنوات مختلفة',
    name: 'Case 39: Residential villa in 2020 (Delta field)',
    nameAr: 'فيلا سكنية في 2020 على أرض زراعية',
    timeline: makeTimeline(2014, [-16.0, -15.8, -16.1, -15.9, -15.7, -16.0, -12.4, -12.1, -12.3, -12.2]),
    expectedConstructionYear: 2020,
    expectedLastChangeYear: null
  },
  {
    id: 40,
    category: 'Category 3: Single Year New Construction (2015-2025)',
    categoryAr: 'الفئة 3: تشييد بناء جديد في سنوات مختلفة',
    name: 'Case 40: Desert facility built in 2020 (-20 dB to -13 dB)',
    nameAr: 'منشأة صحراوية شُيدت في 2020 (قفزة من -20 إلى -13 dB)',
    timeline: makeTimeline(2014, [-20.3, -20.0, -20.4, -20.1, -20.2, -20.5, -13.5, -13.2, -13.4, -13.3]),
    expectedConstructionYear: 2020,
    expectedLastChangeYear: null
  },
  {
    id: 41,
    category: 'Category 3: Single Year New Construction (2015-2025)',
    categoryAr: 'الفئة 3: تشييد بناء جديد في سنوات مختلفة',
    name: 'Case 41: Village home built in 2021',
    nameAr: 'منزل قروي شُيد في 2021',
    timeline: makeTimeline(2014, [-15.8, -15.6, -15.9, -15.7, -15.5, -15.8, -15.6, -12.8, -12.5, -12.7, -12.6]),
    expectedConstructionYear: 2021,
    expectedLastChangeYear: null
  },
  {
    id: 42,
    category: 'Category 3: Single Year New Construction (2015-2025)',
    categoryAr: 'الفئة 3: تشييد بناء جديد في سنوات مختلفة',
    name: 'Case 42: Farm storage shed built in 2021',
    nameAr: 'مخزن زراعي ملحق بحقل في 2021',
    timeline: makeTimeline(2014, [-16.2, -16.0, -16.3, -15.9, -16.1, -16.4, -16.0, -13.1, -12.8, -13.0, -12.9]),
    expectedConstructionYear: 2021,
    expectedLastChangeYear: null
  },
  {
    id: 43,
    category: 'Category 3: Single Year New Construction (2015-2025)',
    categoryAr: 'الفئة 3: تشييد بناء جديد في سنوات مختلفة',
    name: 'Case 43: Two-story building in 2022',
    nameAr: 'مبنى سكني من طابقين في 2022',
    timeline: makeTimeline(2014, [-15.9, -15.7, -16.0, -15.8, -15.6, -15.9, -15.7, -15.5, -11.8, -11.5, -11.7]),
    expectedConstructionYear: 2022,
    expectedLastChangeYear: null
  },
  {
    id: 44,
    category: 'Category 3: Single Year New Construction (2015-2025)',
    categoryAr: 'الفئة 3: تشييد بناء جديد في سنوات مختلفة',
    name: 'Case 44: Distribution center built in 2022',
    nameAr: 'مركز توزيع ولوجستيات شُيد في 2022',
    timeline: makeTimeline(2014, [-15.7, -15.5, -15.8, -15.6, -15.4, -15.7, -15.5, -15.3, -8.5, -8.2, -8.4]),
    expectedConstructionYear: 2022,
    expectedLastChangeYear: null
  },
  {
    id: 45,
    category: 'Category 3: Single Year New Construction (2015-2025)',
    categoryAr: 'الفئة 3: تشييد بناء جديد في سنوات مختلفة',
    name: 'Case 45: Build in 2023 (New reconciliation cutoff law)',
    nameAr: 'بناء في عام 2023 (تاريخ العمل بقانون التصالح الجديد)',
    timeline: makeTimeline(2014, [-16.1, -15.8, -16.2, -15.9, -15.7, -16.0, -15.8, -15.6, -15.9, -12.2, -12.0, -12.1]),
    expectedConstructionYear: 2023,
    expectedLastChangeYear: null
  },
  {
    id: 46,
    category: 'Category 3: Single Year New Construction (2015-2025)',
    categoryAr: 'الفئة 3: تشييد بناء جديد في سنوات مختلفة',
    name: 'Case 46: Highway rest stop facility in 2023',
    nameAr: 'استراحة وخدمات سيارات على طريق إقليمي في 2023',
    timeline: makeTimeline(2014, [-15.6, -15.4, -15.7, -15.5, -15.3, -15.6, -15.4, -15.2, -15.5, -9.8, -9.6, -9.7]),
    expectedConstructionYear: 2023,
    expectedLastChangeYear: null
  },
  {
    id: 47,
    category: 'Category 3: Single Year New Construction (2015-2025)',
    categoryAr: 'الفئة 3: تشييد بناء جديد في سنوات مختلفة',
    name: 'Case 47: Residential house in 2024',
    nameAr: 'منزل سكني شُيد في 2024',
    timeline: makeTimeline(2014, [-16.0, -15.8, -16.1, -15.7, -15.9, -16.2, -15.8, -15.6, -16.0, -15.7, -12.5, -12.3]),
    expectedConstructionYear: 2024,
    expectedLastChangeYear: null
  },
  {
    id: 48,
    category: 'Category 3: Single Year New Construction (2015-2025)',
    categoryAr: 'الفئة 3: تشييد بناء جديد في سنوات مختلفة',
    name: 'Case 48: Agricultural packing plant in 2024',
    nameAr: 'محطة فرز وتعبئة حاصلات زراعية في 2024',
    timeline: makeTimeline(2014, [-15.8, -15.5, -15.9, -15.6, -15.4, -15.7, -15.5, -15.3, -15.6, -15.4, -9.2, -9.0]),
    expectedConstructionYear: 2024,
    expectedLastChangeYear: null
  },
  {
    id: 49,
    category: 'Category 3: Single Year New Construction (2015-2025)',
    categoryAr: 'الفئة 3: تشييد بناء جديد في سنوات مختلفة',
    name: 'Case 49: Penultimate year build (2025) confirmed by 2026',
    nameAr: 'بناء في 2025 مؤكد باستمرار الارتفاع في 2026',
    timeline: makeTimeline(2014, [-16.1, -15.9, -16.0, -15.8, -16.2, -16.0, -15.9, -16.1, -16.0, -15.8, -16.1, -12.2, -12.0]),
    expectedConstructionYear: 2025,
    expectedLastChangeYear: null
  },
  {
    id: 50,
    category: 'Category 3: Single Year New Construction (2015-2025)',
    categoryAr: 'الفئة 3: تشييد بناء جديد في سنوات مختلفة',
    name: 'Case 50: Rapid build with scaffolding removal (2019: -10.5 dB -> -11.8 dB)',
    nameAr: 'بناء سريع مع فك الشدات الخشبية في 2019',
    timeline: makeTimeline(2014, [-15.8, -15.5, -15.7, -15.6, -15.8, -10.5, -11.8, -11.7, -11.9, -11.6, -11.8]),
    expectedConstructionYear: 2019,
    expectedLastChangeYear: null
  },
  {
    id: 51,
    category: 'Category 3: Single Year New Construction (2015-2025)',
    categoryAr: 'الفئة 3: تشييد بناء جديد في سنوات مختلفة',
    name: 'Case 51: Low-signal desert terrain facility in 2021 (-20.2 dB to -13.2 dB)',
    nameAr: 'منشأة صحراوية منخفضة الإشارة في 2021',
    timeline: makeTimeline(2014, [-20.2, -20.0, -19.8, -20.1, -20.3, -19.9, -20.1, -13.2, -13.0, -13.3, -13.1, -13.2]),
    expectedConstructionYear: 2021,
    expectedLastChangeYear: null
  },
  {
    id: 52,
    category: 'Category 3: Single Year New Construction (2015-2025)',
    categoryAr: 'الفئة 3: تشييد بناء جديد في سنوات مختلفة',
    name: 'Case 52: Brick workshop in 2016',
    nameAr: 'ورشة طوب ومعمل حرفي في 2016',
    timeline: makeTimeline(2014, [-15.7, -15.5, -12.9, -12.6, -12.8, -12.5, -12.7, -12.6, -12.8]),
    expectedConstructionYear: 2016,
    expectedLastChangeYear: null
  },
  {
    id: 53,
    category: 'Category 3: Single Year New Construction (2015-2025)',
    categoryAr: 'الفئة 3: تشييد بناء جديد في سنوات مختلفة',
    name: 'Case 53: Suburban building in 2018',
    nameAr: 'مبنى سكني على أطراف الحيز العمراني في 2018',
    timeline: makeTimeline(2014, [-15.9, -15.7, -15.8, -15.6, -12.3, -12.0, -12.2, -12.1, -12.4]),
    expectedConstructionYear: 2018,
    expectedLastChangeYear: null
  },
  {
    id: 54,
    category: 'Category 3: Single Year New Construction (2015-2025)',
    categoryAr: 'الفئة 3: تشييد بناء جديد في سنوات مختلفة',
    name: 'Case 54: Commercial retail store in 2020',
    nameAr: 'محل تجاري وسوبرماركت شُيد في 2020',
    timeline: makeTimeline(2014, [-15.6, -15.4, -15.7, -15.5, -15.3, -15.6, -11.9, -11.6, -11.8, -11.7]),
    expectedConstructionYear: 2020,
    expectedLastChangeYear: null
  },
  {
    id: 55,
    category: 'Category 3: Single Year New Construction (2015-2025)',
    categoryAr: 'الفئة 3: تشييد بناء جديد في سنوات مختلفة',
    name: 'Case 55: Veterinary clinic / stable in 2022',
    nameAr: 'عيادة بيطرية وإسطبل خيول مغطى في 2022',
    timeline: makeTimeline(2014, [-16.0, -15.8, -16.1, -15.9, -15.7, -16.0, -15.8, -15.5, -12.4, -12.1, -12.3]),
    expectedConstructionYear: 2022,
    expectedLastChangeYear: null
  },

  // =========================================================================
  // الفئة 4: البناء مع توسعات وتعديلات هيكلية لاحقة (Cases 56 - 70)
  // =========================================================================
  {
    id: 56,
    category: 'Category 4: Construction with Subsequent Expansions',
    categoryAr: 'الفئة 4: البناء مع توسعات وتعديلات هيكلية لاحقة',
    name: 'Case 56: Build 2016, expansion in 2020 (+2.3 dB)',
    nameAr: 'بناء في 2016 وتوسعة في 2020 (+2.3 dB)',
    timeline: makeTimeline(2014, [-16.0, -15.8, -13.2, -13.0, -13.1, -13.3, -11.0, -10.8, -11.1, -10.9]),
    expectedConstructionYear: 2016,
    expectedLastChangeYear: 2020
  },
  {
    id: 57,
    category: 'Category 4: Construction with Subsequent Expansions',
    categoryAr: 'الفئة 4: البناء مع توسعات وتعديلات هيكلية لاحقة',
    name: 'Case 57: Build 2016, expansion in 2022 (+2.5 dB)',
    nameAr: 'بناء في 2016 وتوسعة في 2022 (+2.5 dB)',
    timeline: makeTimeline(2014, [-15.9, -15.7, -13.0, -12.8, -12.9, -12.7, -13.0, -12.8, -10.3, -10.1, -10.4]),
    expectedConstructionYear: 2016,
    expectedLastChangeYear: 2022
  },
  {
    id: 58,
    category: 'Category 4: Construction with Subsequent Expansions',
    categoryAr: 'الفئة 4: البناء مع توسعات وتعديلات هيكلية لاحقة',
    name: 'Case 58: Build 2017, expansion in 2021 (+2.4 dB)',
    nameAr: 'بناء في 2017 وتوسعة في 2021 (+2.4 dB)',
    timeline: makeTimeline(2014, [-16.1, -15.9, -15.8, -13.1, -12.9, -13.2, -13.0, -10.6, -10.4, -10.7, -10.5]),
    expectedConstructionYear: 2017,
    expectedLastChangeYear: 2021
  },
  {
    id: 59,
    category: 'Category 4: Construction with Subsequent Expansions',
    categoryAr: 'الفئة 4: البناء مع توسعات وتعديلات هيكلية لاحقة',
    name: 'Case 59: Build 2017, expansion in 2023 (+2.2 dB)',
    nameAr: 'بناء في 2017 وتوسعة في 2023 (+2.2 dB)',
    timeline: makeTimeline(2014, [-16.0, -15.8, -15.7, -12.8, -12.6, -12.7, -12.5, -12.6, -12.4, -10.2, -10.0, -10.3]),
    expectedConstructionYear: 2017,
    expectedLastChangeYear: 2023
  },
  {
    id: 60,
    category: 'Category 4: Construction with Subsequent Expansions',
    categoryAr: 'الفئة 4: البناء مع توسعات وتعديلات هيكلية لاحقة',
    name: 'Case 60: Build 2018, expansion in 2021 (+2.1 dB)',
    nameAr: 'بناء في 2018 وتوسعة في 2021 (+2.1 dB)',
    timeline: makeTimeline(2014, [-15.8, -15.6, -15.9, -15.7, -13.0, -12.8, -12.9, -10.8, -10.6, -10.9, -10.7]),
    expectedConstructionYear: 2018,
    expectedLastChangeYear: 2021
  },
  {
    id: 61,
    category: 'Category 4: Construction with Subsequent Expansions',
    categoryAr: 'الفئة 4: البناء مع توسعات وتعديلات هيكلية لاحقة',
    name: 'Case 61: Build 2018, expansion in 2022 (Case 7 standard)',
    nameAr: 'بناء في 2018 وتوسعة في 2022 (مطابقة الحالة القياسية 7)',
    timeline: makeTimeline(2014, [-16.0, -15.8, -15.5, -15.9, -13.2, -13.0, -13.1, -13.3, -10.8, -10.5, -10.7]),
    expectedConstructionYear: 2018,
    expectedLastChangeYear: 2022
  },
  {
    id: 62,
    category: 'Category 4: Construction with Subsequent Expansions',
    categoryAr: 'الفئة 4: البناء مع توسعات وتعديلات هيكلية لاحقة',
    name: 'Case 62: Build 2018, expansion in 2024 (+2.5 dB)',
    nameAr: 'بناء في 2018 وتوسعة في 2024 (+2.5 dB)',
    timeline: makeTimeline(2014, [-15.9, -15.7, -15.8, -15.6, -12.9, -12.7, -12.8, -12.6, -12.9, -12.7, -10.2, -10.0]),
    expectedConstructionYear: 2018,
    expectedLastChangeYear: 2024
  },
  {
    id: 63,
    category: 'Category 4: Construction with Subsequent Expansions',
    categoryAr: 'الفئة 4: البناء مع توسعات وتعديلات هيكلية لاحقة',
    name: 'Case 63: Build 2019, expansion in 2022 (+2.3 dB)',
    nameAr: 'بناء في 2019 وتوسعة في 2022 (+2.3 dB)',
    timeline: makeTimeline(2014, [-16.2, -16.0, -15.9, -16.1, -15.8, -13.1, -12.9, -13.0, -10.7, -10.5, -10.8]),
    expectedConstructionYear: 2019,
    expectedLastChangeYear: 2022
  },
  {
    id: 64,
    category: 'Category 4: Construction with Subsequent Expansions',
    categoryAr: 'الفئة 4: البناء مع توسعات وتعديلات هيكلية لاحقة',
    name: 'Case 64: Build 2019, expansion in 2023 (+2.4 dB)',
    nameAr: 'بناء في 2019 وتوسعة في 2023 (+2.4 dB)',
    timeline: makeTimeline(2014, [-16.1, -15.9, -16.0, -15.8, -15.7, -12.8, -12.6, -12.7, -12.5, -10.1, -9.9, -10.2]),
    expectedConstructionYear: 2019,
    expectedLastChangeYear: 2023
  },
  {
    id: 65,
    category: 'Category 4: Construction with Subsequent Expansions',
    categoryAr: 'الفئة 4: البناء مع توسعات وتعديلات هيكلية لاحقة',
    name: 'Case 65: Build 2020, expansion in 2023 (+2.2 dB)',
    nameAr: 'بناء في 2020 وتوسعة في 2023 (+2.2 dB)',
    timeline: makeTimeline(2014, [-15.8, -15.6, -15.9, -15.7, -15.5, -15.8, -13.0, -12.8, -12.9, -10.7, -10.5, -10.8]),
    expectedConstructionYear: 2020,
    expectedLastChangeYear: 2023
  },
  {
    id: 66,
    category: 'Category 4: Construction with Subsequent Expansions',
    categoryAr: 'الفئة 4: البناء مع توسعات وتعديلات هيكلية لاحقة',
    name: 'Case 66: Build 2020, expansion in 2024 (+2.5 dB)',
    nameAr: 'بناء في 2020 وتوسعة في 2024 (+2.5 dB)',
    timeline: makeTimeline(2014, [-16.0, -15.8, -16.1, -15.9, -15.7, -16.0, -12.9, -12.7, -12.8, -12.6, -10.1, -9.9]),
    expectedConstructionYear: 2020,
    expectedLastChangeYear: 2024
  },
  {
    id: 67,
    category: 'Category 4: Construction with Subsequent Expansions',
    categoryAr: 'الفئة 4: البناء مع توسعات وتعديلات هيكلية لاحقة',
    name: 'Case 67: Build 2021, expansion in 2024 (+2.3 dB)',
    nameAr: 'بناء في 2021 وتوسعة في 2024 (+2.3 dB)',
    timeline: makeTimeline(2014, [-15.7, -15.5, -15.8, -15.6, -15.4, -15.7, -15.5, -12.8, -12.6, -12.7, -10.4, -10.2]),
    expectedConstructionYear: 2021,
    expectedLastChangeYear: 2024
  },
  {
    id: 68,
    category: 'Category 4: Construction with Subsequent Expansions',
    categoryAr: 'الفئة 4: البناء مع توسعات وتعديلات هيكلية لاحقة',
    name: 'Case 68: Build 2018 with temporary unconfirmed spike in 2023',
    nameAr: 'بناء 2018 مع قفزة مؤقتة غير مؤكدة في 2023 (عادت لمستواها)',
    timeline: makeTimeline(2014, [-15.7, -15.5, -15.8, -15.6, -12.8, -12.6, -12.7, -12.5, -12.6, -10.2, -12.6, -12.7]),
    expectedConstructionYear: 2018,
    expectedLastChangeYear: null
  },
  {
    id: 69,
    category: 'Category 4: Construction with Subsequent Expansions',
    categoryAr: 'الفئة 4: البناء مع توسعات وتعديلات هيكلية لاحقة',
    name: 'Case 69: Build 2017 with small minor jitter (no expansion)',
    nameAr: 'بناء في 2017 مع تذبذب طفيف لا يرقى لتوسعة (+0.6 dB)',
    timeline: makeTimeline(2014, [-15.8, -15.6, -15.7, -12.4, -12.2, -12.5, -12.3, -11.7, -12.2, -12.4]),
    expectedConstructionYear: 2017,
    expectedLastChangeYear: null
  },
  {
    id: 70,
    category: 'Category 4: Construction with Subsequent Expansions',
    categoryAr: 'الفئة 4: البناء مع توسعات وتعديلات هيكلية لاحقة',
    name: 'Case 70: Build in 2015, major industrial expansion in 2019',
    nameAr: 'بناء في 2015 وتوسعة صناعية كبرى في 2019',
    timeline: makeTimeline(2014, [-16.0, -12.2, -12.0, -12.3, -12.1, -9.6, -9.4, -9.5, -9.3, -9.6]),
    expectedConstructionYear: 2015,
    expectedLastChangeYear: 2019
  },

  // =========================================================================
  // الفئة 5: الهدم والإزالة والانهيارات (Cases 71 - 80)
  // =========================================================================
  {
    id: 71,
    category: 'Category 5: Demolition, Clearance & Structural Collapses',
    categoryAr: 'الفئة 5: الهدم والإزالة والانهيارات الهيكلية',
    name: 'Case 71: Building built (2017) then demolished (2022)',
    nameAr: 'مبنى شُيد في 2017 ثم هُدم في 2022 عودة للأرض الفضاء',
    timeline: makeTimeline(2014, [-16.0, -15.8, -15.9, -12.0, -11.8, -12.1, -12.0, -12.2, -15.5, -15.8, -15.6]),
    expectedConstructionYear: 2017,
    expectedLastChangeYear: null
  },
  {
    id: 72,
    category: 'Category 5: Demolition, Clearance & Structural Collapses',
    categoryAr: 'الفئة 5: الهدم والإزالة والانهيارات الهيكلية',
    name: 'Case 72: Building built in 2018 then demolished in 2023',
    nameAr: 'مبنى شُيد في 2018 ثم أزيل بموجب إزالة تعديات في 2023',
    timeline: makeTimeline(2014, [-15.9, -15.7, -16.0, -15.8, -12.4, -12.2, -12.3, -12.1, -12.4, -16.2, -16.0]),
    expectedConstructionYear: 2018,
    expectedLastChangeYear: null
  },
  {
    id: 73,
    category: 'Category 5: Demolition, Clearance & Structural Collapses',
    categoryAr: 'الفئة 5: الهدم والإزالة والانهيارات الهيكلية',
    name: 'Case 73: Pre-existing building 2014 demolished in 2020',
    nameAr: 'مبنى قائم منذ 2014 تم هدمه في 2020 لإعادة البناء لاحقاً',
    timeline: makeTimeline(2014, [-8.9, -8.7, -8.9, -8.6, -8.8, -8.7, -15.8, -15.6, -15.9, -15.7, -15.8]),
    expectedConstructionYear: 2014,
    expectedLastChangeYear: null
  },
  {
    id: 74,
    category: 'Category 5: Demolition, Clearance & Structural Collapses',
    categoryAr: 'الفئة 5: الهدم والإزالة والانهيارات الهيكلية',
    name: 'Case 74: Pre-existing building 2014 demolished in 2023',
    nameAr: 'مبنى قائم منذ 2014 هُدم في 2023 لمرور محور مروري',
    timeline: makeTimeline(2014, [-9.2, -9.0, -9.3, -9.1, -9.2, -9.0, -9.2, -9.1, -9.3, -16.0, -15.8]),
    expectedConstructionYear: 2014,
    expectedLastChangeYear: null
  },
  {
    id: 75,
    category: 'Category 5: Demolition, Clearance & Structural Collapses',
    categoryAr: 'الفئة 5: الهدم والإزالة والانهيارات الهيكلية',
    name: 'Case 75: Temporary construction camp built 2016, removed 2019',
    nameAr: 'معسكر ومكاتب شركة مقاولات 2016 أزيل في 2019 بعد المشروع',
    timeline: makeTimeline(2014, [-16.2, -16.0, -11.5, -11.3, -11.4, -16.1, -15.9, -16.2, -16.0, -16.1]),
    expectedConstructionYear: 2016,
    expectedLastChangeYear: null
  },
  {
    id: 76,
    category: 'Category 5: Demolition, Clearance & Structural Collapses',
    categoryAr: 'الفئة 5: الهدم والإزالة والانهيارات الهيكلية',
    name: 'Case 76: Industrial hangar collapsed / removed in 2021',
    nameAr: 'مخزن صاج شُيد في 2018 وأزيل في 2021',
    timeline: makeTimeline(2014, [-15.8, -15.6, -15.9, -15.7, -9.8, -9.6, -9.7, -15.5, -15.7, -15.6]),
    expectedConstructionYear: 2018,
    expectedLastChangeYear: null
  },
  {
    id: 77,
    category: 'Category 5: Demolition, Clearance & Structural Collapses',
    categoryAr: 'الفئة 5: الهدم والإزالة والانهيارات الهيكلية',
    name: 'Case 77: Partial demolition of 2019 building in 2022',
    nameAr: 'إزالة أدوار مخالفة عليا في 2022 لمبنى أنشئ في 2019',
    timeline: makeTimeline(2014, [-16.0, -15.8, -16.1, -15.9, -15.7, -8.2, -8.0, -8.3, -11.5, -11.3, -11.6]),
    expectedConstructionYear: 2019,
    expectedLastChangeYear: null
  },
  {
    id: 78,
    category: 'Category 5: Demolition, Clearance & Structural Collapses',
    categoryAr: 'الفئة 5: الهدم والإزالة والانهيارات الهيكلية',
    name: 'Case 78: Partial clearance of annex on 2017 build in 2021',
    nameAr: 'هدم ملحق خارجي في 2021 لمبنى أقيم في 2017',
    timeline: makeTimeline(2014, [-15.8, -15.6, -15.7, -10.5, -10.3, -10.4, -10.2, -12.4, -12.2, -12.5]),
    expectedConstructionYear: 2017,
    expectedLastChangeYear: null
  },
  {
    id: 79,
    category: 'Category 5: Demolition, Clearance & Structural Collapses',
    categoryAr: 'الفئة 5: الهدم والإزالة والانهيارات الهيكلية',
    name: 'Case 79: Brick wall enclosure erected 2018, knocked down 2020',
    nameAr: 'سور مباني أقيم في 2018 وتمت إزالته في 2020',
    timeline: makeTimeline(2014, [-16.2, -16.0, -16.1, -15.9, -13.0, -12.8, -16.1, -15.9, -16.2, -16.0]),
    expectedConstructionYear: 2018,
    expectedLastChangeYear: null
  },
  {
    id: 80,
    category: 'Category 5: Demolition, Clearance & Structural Collapses',
    categoryAr: 'الفئة 5: الهدم والإزالة والانهيارات الهيكلية',
    name: 'Case 80: Poultry farm built 2016, closed and dismantled 2022',
    nameAr: 'مزرعة دواجن أنشئت في 2016 وتم تفكيك الهيكل في 2022',
    timeline: makeTimeline(2014, [-15.9, -15.7, -11.8, -11.5, -11.7, -11.6, -11.8, -11.5, -15.8, -15.6]),
    expectedConstructionYear: 2016,
    expectedLastChangeYear: null
  },

  // =========================================================================
  // الفئة 6: الحالات الشاذة والقفزات المؤقتة والتدرج البطيء (Cases 81 - 90)
  // =========================================================================
  {
    id: 81,
    category: 'Category 6: Noise, Temporary Spikes & Gradual Drift',
    categoryAr: 'الفئة 6: الضوضاء والقفزات المؤقتة والتدرج البطيء',
    name: 'Case 81: Only latest year (2026) has spike (Must NOT detect as build)',
    nameAr: 'قفزة في آخر سنة فقط (2026) - حماية ضد اعتبار آخر سنة بناء',
    timeline: makeTimeline(2014, [-15.5, -15.3, -15.6, -15.4, -15.2, -15.5, -15.3, -15.1, -15.4, -15.2, -15.5, -15.3, -11.0]),
    expectedConstructionYear: null,
    expectedLastChangeYear: null
  },
  {
    id: 82,
    category: 'Category 6: Noise, Temporary Spikes & Gradual Drift',
    categoryAr: 'الفئة 6: الضوضاء والقفزات المؤقتة والتدرج البطيء',
    name: 'Case 82: Unconfirmed spike in 2025 (drops back in 2026)',
    nameAr: 'قفزة منفردة في 2025 لم تستمر في 2026 (لا تمثل بناء)',
    timeline: makeTimeline(2014, [-15.8, -15.6, -15.9, -15.7, -15.5, -15.8, -15.6, -15.4, -15.7, -15.5, -15.8, -11.5, -15.6]),
    expectedConstructionYear: null,
    expectedLastChangeYear: null
  },
  {
    id: 83,
    category: 'Category 6: Noise, Temporary Spikes & Gradual Drift',
    categoryAr: 'الفئة 6: الضوضاء والقفزات المؤقتة والتدرج البطيء',
    name: 'Case 83: Temporary spike (2016) then real build (2022)',
    nameAr: 'قفزة مؤقتة في 2016 ثم بناء حقيقي مستدام في 2022',
    timeline: makeTimeline(2014, [-16.0, -15.9, -13.5, -16.1, -15.8, -16.0, -15.9, -15.7, -12.5, -12.2, -12.3]),
    expectedConstructionYear: 2022,
    expectedLastChangeYear: null
  },
  {
    id: 84,
    category: 'Category 6: Noise, Temporary Spikes & Gradual Drift',
    categoryAr: 'الفئة 6: الضوضاء والقفزات المؤقتة والتدرج البطيء',
    name: 'Case 84: Two non-consecutive temporary spikes (2016, 2019)',
    nameAr: 'قفزتان مؤقتتان متفرقتان (2016 و2019) دون استدامة',
    timeline: makeTimeline(2014, [-15.8, -15.6, -13.5, -15.9, -15.7, -13.2, -15.8, -15.6, -15.7, -15.9]),
    expectedConstructionYear: null,
    expectedLastChangeYear: null
  },
  {
    id: 85,
    category: 'Category 6: Noise, Temporary Spikes & Gradual Drift',
    categoryAr: 'الفئة 6: الضوضاء والقفزات المؤقتة والتدرج البطيء',
    name: 'Case 85: Three single-year spikes (equipment/weather)',
    nameAr: '3 قفزات موسمية شاذة غير متتالية في 2015 و2018 و2022',
    timeline: makeTimeline(2014, [-15.9, -13.8, -16.0, -15.8, -13.6, -15.9, -15.7, -16.1, -13.4, -15.8, -16.0]),
    expectedConstructionYear: null,
    expectedLastChangeYear: null
  },
  {
    id: 86,
    category: 'Category 6: Noise, Temporary Spikes & Gradual Drift',
    categoryAr: 'الفئة 6: الضوضاء والقفزات المؤقتة والتدرج البطيء',
    name: 'Case 86: Very slow gradual development (0.2 dB/year)',
    nameAr: 'تغير بيئي تدريجي بطيء جداً (0.2 dB سنوياً)',
    timeline: makeTimeline(2014, [-16.0, -15.8, -15.6, -15.4, -15.2, -15.0, -14.8, -14.6, -14.4, -14.2, -14.0]),
    expectedConstructionYear: null,
    expectedLastChangeYear: null
  },
  {
    id: 87,
    category: 'Category 6: Noise, Temporary Spikes & Gradual Drift',
    categoryAr: 'الفئة 6: الضوضاء والقفزات المؤقتة والتدرج البطيء',
    name: 'Case 87: Gradual development over many years (0.3 dB/year, Case 6 standard)',
    nameAr: 'تطوير تدريجي بطيء (0.3 dB سنوياً - الحالة القياسية 6)',
    timeline: makeTimeline(2014, [-16.0, -15.7, -15.4, -15.1, -14.8, -14.5, -14.2, -13.9, -13.6, -13.3, -13.0]),
    expectedConstructionYear: null,
    expectedLastChangeYear: null
  },
  {
    id: 88,
    category: 'Category 6: Noise, Temporary Spikes & Gradual Drift',
    categoryAr: 'الفئة 6: الضوضاء والقفزات المؤقتة والتدرج البطيء',
    name: 'Case 88: Moderate linear drift (0.4 dB/year) without single jump',
    nameAr: 'تغير تدريجي 0.4 dB سنوياً دون قفزة منفردة تتجاوز 0.5',
    timeline: makeTimeline(2014, [-16.5, -16.1, -15.7, -15.3, -14.9, -14.5, -14.1, -13.7, -13.3, -12.9]),
    expectedConstructionYear: null,
    expectedLastChangeYear: null
  },
  {
    id: 89,
    category: 'Category 6: Noise, Temporary Spikes & Gradual Drift',
    categoryAr: 'الفئة 6: الضوضاء والقفزات المؤقتة والتدرج البطيء',
    name: 'Case 89: Minor noise fluctuations on vacant agricultural land (±0.4 dB)',
    nameAr: 'تذبذبات طبيعية خفيفة على أرض زراعية فارغة (±0.4 dB)',
    timeline: makeTimeline(2014, [-15.8, -15.4, -15.9, -15.5, -15.8, -15.4, -15.7, -15.5, -15.8, -15.4]),
    expectedConstructionYear: null,
    expectedLastChangeYear: null
  },
  {
    id: 90,
    category: 'Category 6: Noise, Temporary Spikes & Gradual Drift',
    categoryAr: 'الفئة 6: الضوضاء والقفزات المؤقتة والتدرج البطيء',
    name: 'Case 90: Minor radar jitter on pre-existing building (-8.8 dB ±0.5 dB)',
    nameAr: 'تشويش طبيعي طفيف على مبنى خرساني قائم (-8.8 dB ±0.5 dB)',
    timeline: makeTimeline(2014, [-8.8, -8.3, -8.9, -8.4, -8.7, -8.2, -8.8, -8.4, -8.9, -8.5]),
    expectedConstructionYear: 2014,
    expectedLastChangeYear: null
  },

  // =========================================================================
  // الفئة 7: فجوات البيانات، السنوات المفقودة، والبيانات الشحيحة (Cases 91 - 100)
  // =========================================================================
  {
    id: 91,
    category: 'Category 7: Missing Data, Sensor Gaps & Sparse Timelines',
    categoryAr: 'الفئة 7: فجوات البيانات والسنوات المفقودة',
    name: 'Case 91: One missing year during baseline (2016 Null), build 2019',
    nameAr: 'سنة مفقودة في خط الأساس (2016 Null) ثم بناء في 2019',
    timeline: [
      { year: 2014, ndbi: -16.0, thumbnail_url: null },
      { year: 2015, ndbi: -15.8, thumbnail_url: null },
      { year: 2016, ndbi: null, thumbnail_url: null }, // Null
      { year: 2017, ndbi: -15.7, thumbnail_url: null },
      { year: 2018, ndbi: -15.9, thumbnail_url: null },
      { year: 2019, ndbi: -12.2, thumbnail_url: null }, // Built
      { year: 2020, ndbi: -12.0, thumbnail_url: null },
      { year: 2021, ndbi: -12.3, thumbnail_url: null }
    ],
    expectedConstructionYear: 2019,
    expectedLastChangeYear: null
  },
  {
    id: 92,
    category: 'Category 7: Missing Data, Sensor Gaps & Sparse Timelines',
    categoryAr: 'الفئة 7: فجوات البيانات والسنوات المفقودة',
    name: 'Case 92: Two missing years before construction (2017-2018 Null), build 2019',
    nameAr: 'سنتان مفقودتان (2017 و2018 Null) ثم بناء في 2019',
    timeline: [
      { year: 2014, ndbi: -16.0, thumbnail_url: null },
      { year: 2015, ndbi: -15.8, thumbnail_url: null },
      { year: 2016, ndbi: -16.1, thumbnail_url: null },
      { year: 2017, ndbi: null, thumbnail_url: null },
      { year: 2018, ndbi: null, thumbnail_url: null },
      { year: 2019, ndbi: -12.4, thumbnail_url: null },
      { year: 2020, ndbi: -12.2, thumbnail_url: null },
      { year: 2021, ndbi: -12.5, thumbnail_url: null }
    ],
    expectedConstructionYear: 2019,
    expectedLastChangeYear: null
  },
  {
    id: 93,
    category: 'Category 7: Missing Data, Sensor Gaps & Sparse Timelines',
    categoryAr: 'الفئة 7: فجوات البيانات والسنوات المفقودة',
    name: 'Case 93: Long gap (3 consecutive null years 2017-2019), build 2020',
    nameAr: 'انقطاع 3 سنوات متتالية (2017-2019 Null) ثم بناء في 2020',
    timeline: [
      { year: 2014, ndbi: -16.2, thumbnail_url: null },
      { year: 2015, ndbi: -15.9, thumbnail_url: null },
      { year: 2016, ndbi: -16.0, thumbnail_url: null },
      { year: 2017, ndbi: null, thumbnail_url: null },
      { year: 2018, ndbi: null, thumbnail_url: null },
      { year: 2019, ndbi: null, thumbnail_url: null },
      { year: 2020, ndbi: -12.5, thumbnail_url: null },
      { year: 2021, ndbi: -12.3, thumbnail_url: null },
      { year: 2022, ndbi: -12.4, thumbnail_url: null }
    ],
    expectedConstructionYear: 2020,
    expectedLastChangeYear: null
  },
  {
    id: 94,
    category: 'Category 7: Missing Data, Sensor Gaps & Sparse Timelines',
    categoryAr: 'الفئة 7: فجوات البيانات والسنوات المفقودة',
    name: 'Case 94: Missing year right after construction (2018 built, 2019 Null, 2020 high)',
    nameAr: 'سنة مفقودة مباشرة بعد البناء (بناء 2018، 2019 Null، 2020 مرتفع)',
    timeline: [
      { year: 2014, ndbi: -15.8, thumbnail_url: null },
      { year: 2015, ndbi: -15.6, thumbnail_url: null },
      { year: 2016, ndbi: -15.7, thumbnail_url: null },
      { year: 2017, ndbi: -15.5, thumbnail_url: null },
      { year: 2018, ndbi: -12.0, thumbnail_url: null }, // build
      { year: 2019, ndbi: null, thumbnail_url: null },  // gap
      { year: 2020, ndbi: -11.8, thumbnail_url: null }, // sustained
      { year: 2021, ndbi: -12.1, thumbnail_url: null }
    ],
    expectedConstructionYear: 2018,
    expectedLastChangeYear: null
  },
  {
    id: 95,
    category: 'Category 7: Missing Data, Sensor Gaps & Sparse Timelines',
    categoryAr: 'الفئة 7: فجوات البيانات والسنوات المفقودة',
    name: 'Case 95: Intermittent biennial data (every other year Null), build 2020',
    nameAr: 'بيانات متقطعة سنة بسنة وسنة Null مع بناء في 2020',
    timeline: [
      { year: 2014, ndbi: -16.0, thumbnail_url: null },
      { year: 2015, ndbi: null, thumbnail_url: null },
      { year: 2016, ndbi: -15.8, thumbnail_url: null },
      { year: 2017, ndbi: null, thumbnail_url: null },
      { year: 2018, ndbi: -15.9, thumbnail_url: null },
      { year: 2019, ndbi: null, thumbnail_url: null },
      { year: 2020, ndbi: -12.2, thumbnail_url: null }, // built
      { year: 2021, ndbi: -12.0, thumbnail_url: null },
      { year: 2022, ndbi: -12.3, thumbnail_url: null }
    ],
    expectedConstructionYear: 2020,
    expectedLastChangeYear: null
  },
  {
    id: 96,
    category: 'Category 7: Missing Data, Sensor Gaps & Sparse Timelines',
    categoryAr: 'الفئة 7: فجوات البيانات والسنوات المفقودة',
    name: 'Case 96: Full archive 2008-2013 leading nulls, Sentinel-1 build in 2018',
    nameAr: 'أرشيف كامل مع سنوات 2008-2013 فارغة وبناء في 2018',
    timeline: [
      { year: 2008, ndbi: null, thumbnail_url: null },
      { year: 2009, ndbi: null, thumbnail_url: null },
      { year: 2010, ndbi: null, thumbnail_url: null },
      { year: 2011, ndbi: null, thumbnail_url: null },
      { year: 2012, ndbi: null, thumbnail_url: null },
      { year: 2013, ndbi: null, thumbnail_url: null },
      { year: 2014, ndbi: -16.0, thumbnail_url: null },
      { year: 2015, ndbi: -15.8, thumbnail_url: null },
      { year: 2016, ndbi: -15.5, thumbnail_url: null },
      { year: 2017, ndbi: -15.7, thumbnail_url: null },
      { year: 2018, ndbi: -12.5, thumbnail_url: null }, // built
      { year: 2019, ndbi: -12.2, thumbnail_url: null },
      { year: 2020, ndbi: -12.4, thumbnail_url: null }
    ],
    expectedConstructionYear: 2018,
    expectedLastChangeYear: null
  },
  {
    id: 97,
    category: 'Category 7: Missing Data, Sensor Gaps & Sparse Timelines',
    categoryAr: 'الفئة 7: فجوات البيانات والسنوات المفقودة',
    name: 'Case 97: Full archive leading nulls, pre-existing building 2014',
    nameAr: 'أرشيف كامل مع سنوات فارغة ومبنى قائم منذ 2014 (-9.1 dB)',
    timeline: [
      { year: 2008, ndbi: null, thumbnail_url: null },
      { year: 2009, ndbi: null, thumbnail_url: null },
      { year: 2010, ndbi: null, thumbnail_url: null },
      { year: 2011, ndbi: null, thumbnail_url: null },
      { year: 2012, ndbi: null, thumbnail_url: null },
      { year: 2013, ndbi: null, thumbnail_url: null },
      { year: 2014, ndbi: -9.1, thumbnail_url: null },
      { year: 2015, ndbi: -9.0, thumbnail_url: null },
      { year: 2016, ndbi: -9.2, thumbnail_url: null },
      { year: 2017, ndbi: -8.9, thumbnail_url: null },
      { year: 2018, ndbi: -9.1, thumbnail_url: null }
    ],
    expectedConstructionYear: 2014,
    expectedLastChangeYear: null
  },
  {
    id: 98,
    category: 'Category 7: Missing Data, Sensor Gaps & Sparse Timelines',
    categoryAr: 'الفئة 7: فجوات البيانات والسنوات المفقودة',
    name: 'Case 98: Insufficient data (Only 3 valid years)',
    nameAr: 'بيانات غير كافية (3 سنوات صالحة فقط)',
    timeline: [
      { year: 2022, ndbi: -15.0, thumbnail_url: null },
      { year: 2023, ndbi: -12.0, thumbnail_url: null },
      { year: 2024, ndbi: -11.5, thumbnail_url: null }
    ],
    expectedConstructionYear: null,
    expectedLastChangeYear: null
  },
  {
    id: 99,
    category: 'Category 7: Missing Data, Sensor Gaps & Sparse Timelines',
    categoryAr: 'الفئة 7: فجوات البيانات والسنوات المفقودة',
    name: 'Case 99: Insufficient data (Only 4 valid years, below minimum 5)',
    nameAr: 'بيانات غير كافية (4 سنوات فقط، أقل من الحد الأدنى 5 سنوات)',
    timeline: [
      { year: 2020, ndbi: -15.5, thumbnail_url: null },
      { year: 2021, ndbi: -15.3, thumbnail_url: null },
      { year: 2022, ndbi: -12.0, thumbnail_url: null },
      { year: 2023, ndbi: -11.8, thumbnail_url: null }
    ],
    expectedConstructionYear: null,
    expectedLastChangeYear: null
  },
  {
    id: 100,
    category: 'Category 7: Missing Data, Sensor Gaps & Sparse Timelines',
    categoryAr: 'الفئة 7: فجوات البيانات والسنوات المفقودة',
    name: 'Case 100: Completely empty timeline (All values null)',
    nameAr: 'سلسلة زمنية فارغة بالكامل (جميع القيم Null)',
    timeline: makeTimeline(2014, [null, null, null, null, null, null, null, null, null, null]),
    expectedConstructionYear: null,
    expectedLastChangeYear: null
  }
];

// ============================================================
// TEST RUNNER
// ============================================================

let passed = 0;
let failed = 0;
const categoryStats: Record<string, { total: number; passed: number; failed: number }> = {};

console.log('━'.repeat(78));
console.log('  BUILDING ANALYSIS ALGORITHM — INDUSTRIAL-GRADE 100 TEST SUITE');
console.log('━'.repeat(78));
console.log('');

for (const tc of cases) {
  if (!categoryStats[tc.categoryAr]) {
    categoryStats[tc.categoryAr] = { total: 0, passed: 0, failed: 0 };
  }
  categoryStats[tc.categoryAr].total++;

  const result = interpretNdbiTimeline(tc.timeline);
  const tolerance = tc.toleranceYears ?? 0;

  const constructionMatch =
    tc.expectedConstructionYear === null
      ? result.estimated_construction_year === null
      : result.estimated_construction_year !== null &&
        Math.abs(result.estimated_construction_year - tc.expectedConstructionYear) <= tolerance;

  const lastChangeMatch =
    tc.expectedLastChangeYear === null
      ? result.estimated_last_change_year === null
      : result.estimated_last_change_year !== null &&
        Math.abs(result.estimated_last_change_year - tc.expectedLastChangeYear) <= tolerance;

  const pass = constructionMatch && lastChangeMatch;

  if (pass) {
    passed++;
    categoryStats[tc.categoryAr].passed++;
    console.log(`✅ [Case ${String(tc.id).padStart(3, '0')}] ${tc.name}`);
  } else {
    failed++;
    categoryStats[tc.categoryAr].failed++;
    console.log(`❌ [Case ${String(tc.id).padStart(3, '0')}] ${tc.name}`);
    console.log(`   Expected: Build=${tc.expectedConstructionYear}, Change=${tc.expectedLastChangeYear}`);
    console.log(`   Got:      Build=${result.estimated_construction_year}, Change=${result.estimated_last_change_year}`);
    if (result.analysis) {
      console.log(`   Baseline: ${result.analysis.baseline_mean} dB | Jump: ${result.analysis.construction_jump} dB | Score: ${result.analysis.construction_score}`);
    }
  }
}

console.log('');
console.log('━'.repeat(78));
console.log('  CATEGORY BREAKDOWN:');
console.log('━'.repeat(78));
for (const [cat, stat] of Object.entries(categoryStats)) {
  const pct = ((stat.passed / stat.total) * 100).toFixed(1);
  console.log(`  ${stat.failed === 0 ? '✓' : '✗'} ${cat}: ${stat.passed}/${stat.total} (${pct}%)`);
}

console.log('━'.repeat(78));
console.log(`  TOTAL: ${passed} passed, ${failed} failed out of ${cases.length} tests`);
console.log('━'.repeat(78));

if (failed > 0) {
  process.exit(1);
}
