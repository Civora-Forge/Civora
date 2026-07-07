// Frontend domain models and states

export type ReportCategory = 'roads' | 'schools' | 'health' | 'sanitation' | 'livelihood' | 'public_safety' | 'other';

export interface LocationData {
  latitude: number;
  longitude: number;
  localityName?: string;
}

export interface DraftReport {
  text: string;
  language: string;
  audioBlob?: Blob;
  photoBlob?: Blob;
  photoUrl?: string;
  audioUrl?: string; // If we use object URLs or external URLs
  location?: LocationData;
  categoryHint?: ReportCategory;
  createdAt?: string; // ISO String
}

export interface AppConfig {
  language: string;
}

export interface AIInterpretation {
  title: string;
  summary: string;
  category: ReportCategory;
  locationName: string;
  transcript?: string;
}

export interface PendingSubmission {
  id: string; // Internal uuid
  payload: DraftReport;
  status: 'pending' | 'syncing' | 'failed';
  error?: string;
}
