export type VisitStatus = "draft" | "published" | "archived";
export type ItemType =
  | "measurement"
  | "observation"
  | "checklist"
  | "photo"
  | "gps"
  | "species_list";
export type RepeatScope = "visit" | "site";
export type SubmissionStatus = "in_progress" | "complete";

export interface FieldVisit {
  id: string;
  title: string;
  description: string | null;
  objectives: string | null;
  location_name: string | null;
  visit_date: string | null;
  status: VisitStatus;
}

export interface FieldVisitSection {
  id: string;
  field_visit_id: string;
  title: string;
  instructions: string | null;
  order_index: number;
}

export interface MeasurementConfig {
  unit: string;
  min?: number;
  max?: number;
  decimals?: number;
}

export interface ObservationConfig {
  input: "text" | "textarea" | "select";
  options?: string[];
  allow_other_text?: boolean;
}

export interface PhotoConfig {
  min_count?: number;
  max_count?: number;
}

export interface GpsConfig {
  require_accuracy_under_m?: number;
}

export interface SpeciesListConfig {
  density_unit?: string;
  fields: string[];
}

export type ChecklistConfig = Record<string, never>;

export type ItemConfig =
  | { item_type: "measurement"; config: MeasurementConfig }
  | { item_type: "observation"; config: ObservationConfig }
  | { item_type: "photo"; config: PhotoConfig }
  | { item_type: "gps"; config: GpsConfig }
  | { item_type: "species_list"; config: SpeciesListConfig }
  | { item_type: "checklist"; config: ChecklistConfig };

export interface FieldVisitItem {
  id: string;
  section_id: string;
  item_type: ItemType;
  repeat_scope: RepeatScope;
  label: string;
  help_text: string | null;
  order_index: number;
  is_required: boolean;
  config: Record<string, unknown>;
}

export interface FieldVisitSubmission {
  id: string;
  field_visit_id: string;
  student_id: string;
  status: SubmissionStatus;
  client_submission_id: string;
  started_at: string;
  submitted_at: string | null;
  updated_at: string;
}

export interface SubmissionSite {
  id: string;
  submission_id: string;
  label: string;
  order_index: number;
  gps_lat: number | null;
  gps_lng: number | null;
}

export interface SpeciesListRow {
  taxon_name: string;
  density?: number;
  notes?: string;
}

export interface SubmissionAnswer {
  id: string;
  submission_id: string;
  item_id: string;
  site_id: string | null;
  value: Record<string, unknown> | SpeciesListRow[];
  gps_lat: number | null;
  gps_lng: number | null;
  gps_accuracy_m: number | null;
  gps_captured_at: string | null;
  client_updated_at: string;
  synced_at: string | null;
}

export interface SubmissionPhoto {
  id: string;
  submission_id: string;
  item_id: string | null;
  site_id: string | null;
  storage_path: string;
  caption: string | null;
  taken_at: string | null;
  gps_lat: number | null;
  gps_lng: number | null;
  client_local_id: string;
  synced_at: string | null;
}

export interface FieldVisitFull extends FieldVisit {
  sections: (FieldVisitSection & { items: FieldVisitItem[] })[];
}
