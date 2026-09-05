export interface Coordinate {
  lat: number;
  lng: number;
}

export interface TimelineItem {
  year: number;
  ndbi: number | null;
  thumbnail_url?: string | null;
}

export interface VariablePoint {
  id: number | string;
  lat: number;
  lng: number;
  date?: string;
}

export interface AnalysisResponse {
  success: boolean;
  estimated_construction_year: number | null;
  estimated_last_change_year: number | null;
  message?: string;
  variable_id?: number | string | null;
  matched_variables?: VariablePoint[];
  timeline: TimelineItem[];
  error?: string;
}
