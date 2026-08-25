export interface Coordinate {
  lat: number;
  lng: number;
}

export interface TimelineItem {
  year: number;
  ndbi: number | null;
  thumbnail_url?: string | null;
}

export interface AnalysisResponse {
  success: boolean;
  estimated_construction_year: number | null;
  estimated_last_change_year: number | null;
  message?: string;
  timeline: TimelineItem[];
  error?: string;
}
