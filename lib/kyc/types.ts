export interface OcrIdCardConfidence {
  id_number?: number;
  th_name?: number;
  th_fname?: number;
  th_lname?: number;
  en_name?: number;
  en_fname?: number;
  en_lname?: number;
  th_dob?: number;
  en_dob?: number;
  th_issue?: number;
  en_issue?: number;
  th_expire?: number;
  en_expire?: number;
  address?: number;
  gender?: number;
  religion?: number;
}

export interface OcrIdCardFrontResult {
  id_number: string;
  id_number_status: number;
  th_init: string;
  th_fname: string;
  th_lname: string;
  th_name?: string;
  en_init: string;
  en_fname: string;
  en_lname: string;
  en_name?: string;
  gender: string;
  th_dob?: string;
  en_dob: string;
  th_issue?: string;
  en_issue: string;
  th_expire?: string;
  en_expire: string;
  religion?: string;
  address: string;
  home_address?: string;
  house_no?: string;
  village?: string;
  village_no?: string;
  alley?: string;
  lane?: string;
  road?: string;
  sub_district?: string;
  district: string;
  province: string;
  postal_code: string;
  face: string;
  detection_score: number;
  process_time: number;
  error_message?: string;
  request_id?: string | null;
  confidence?: OcrIdCardConfidence;
}

export interface OcrIdCardBackResult {
  back_number: string;
  detection_score: number;
  process_time: number;
}

export interface OcrBookBankResult {
  status?: string;
  message?: string;
  confidence?: string | number;
  processing_time?: number;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  bank_branch?: string;
  signature_detected?: boolean;
  bank_book_results?: {
    bank_name?: string;
    accountType?: string;
    bank_branch?: string;
    account_name?: string;
    account_number?: string;
    file_name_bookbank?: string;
  };
  error_message?: string;
  request_id?: string | null;
}

export interface PassiveLivenessResult {
  filename: string;
  predict: "REAL" | "SPOOF";
  score: number;
  darkness: number;
  data: {
    REAL: number;
    SPOOF: number;
  };
  normalized: {
    REAL: number;
    SPOOF: number;
  };
  status_code: number;
  duration: number;
  message: string;
}

export interface FaceVerificationResult {
  matched: boolean;
  score: number;
  threshold: number;
  duration: number;
  message: string;
}

export interface IappCallResult<T> {
  data: T;
  ic: number;
  ms: number;
}

// General Thai Document OCR — plain-text endpoint.
// Returns an array of strings (one per page; newlines preserved within).
// Endpoint: POST /v3/store/ocr/document/ocr (1 IC per page).
export interface OcrDocumentResult {
  text: string[];
  time?: number;
  error_message?: string;
}

// Layout-aware OCR — returns per-component text with bounding boxes.
// Endpoint: POST /v3/store/ocr/document/layout (1 IC per page).
// Used for PII redaction: components for sensitive values (e.g. DGA
// username) come back with isolated bboxes we can blur before storing.
export interface OcrDocumentLayoutComponent {
  text: string;
  type: string;
  bb_left: number;
  bb_top: number;
  bb_right: number;
  bb_bottom: number;
}

export interface OcrDocumentLayoutPage {
  page: number;
  components: OcrDocumentLayoutComponent[];
}

export interface OcrDocumentLayoutResult {
  pages: OcrDocumentLayoutPage[];
  time?: number;
}
