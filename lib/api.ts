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

/**
 * Sends a POST request to analyze the building history based on 4 points.
 * Coordinates must be formatted in [longitude, latitude] order.
 */
export async function analyzeBuilding(coordinates: [number, number][]): Promise<AnalysisResponse> {
  const response = await fetch('/api/analyze-building', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ coordinates }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to analyze building history.');
  }

  return data;
}
