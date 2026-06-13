export type CrmStatus =
  | "nuevo"
  | "contactado"
  | "pendiente_documentacion"
  | "pendiente_cita"
  | "en_tratamiento"
  | "alta"
  | "perdido"
  | "en_llamada";

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

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
  call_id?: string | null;
  eps?: string | null;
  document_type?: string | null;
  document_number?: string | null;
  customer_id?: string | null;
  appointment_id?: string | null;
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

export type PatientDocument = {
  id: string;
  business_id: string;
  customer_id: string;
  title: string;
  document_type: "consentimiento" | "informe" | "pdf" | "imagen" | "adjunto" | string;
  file_name: string | null;
  file_path: string;
  file_url: string | null;
  notes: string | null;
  created_at: string;
};

export type WhatsappMessage = {
  id: string;
  business_id: string;
  customer_id: string | null;
  phone: string;
  template_key: string | null;
  message: string;
  status: string | null;
  direction?: "inbound" | "outbound" | string | null;
  provider_message_id?: string | null;
  contact_name?: string | null;
  created_at: string;
};
