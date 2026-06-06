export type VoiceCall = {
  id: string;
  business_id: string;

  caller_name: string | null;
  caller_phone: string;

  reason: string | null;
  transcript: string | null;

  intent: string | null;
  status: string | null;
  priority: string | null;

  source: string | null;

  created_at: string;
};

export type PatientProfile = {
  id: string;
  business_id: string;
  customer_id: string;

  child_full_name: string | null;
  birth_date: string | null;
  document_id: string | null;

  gender: string | null;

  guardian_name: string | null;
  guardian_phone: string | null;
  guardian_email: string | null;
  guardian_relationship: string | null;

  initial_diagnosis: string | null;
  therapeutic_process: string | null;
  observations: string | null;

  next_review_date: string | null;
};
