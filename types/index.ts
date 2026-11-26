export type Department =
  | "Brand Partnerships"
  | "Brand Solutions"
  | "Influencer Relations"
  | "Creative Team"
  | "Production"
  | "Post-Production"
  | "Human Resources"
  | "Finance"
  | "Talent Management";

export type ApplicationStage =
  | "New"
  | "Shortlisted"
  | "Interview"
  | "Offer"
  | "Hired"
  | "Rejected";

export interface Role {
  id: string;
  title: string;
  dept: string;
  type: string;
  location?: string;
  exp: [number, number];
  pay: string;
  status: "Open" | "Closed";
  problem: string;
  resp: string[];
  must: string[];
  nice?: string[];
  metrics: string;
  keys: string[];
  langs?: string[];
}

export interface ApplicantNote {
  text: string;
  by: string;
  at: string;
}

export interface ApplicantAI {
  summary?: string;
  rationale?: string;
}

export interface Applicant {
  id: string;
  ref?: string;
  name: string;
  email: string;
  phone: string;
  age?: number;
  gender?: string;
  city: string;
  mumbai: "Yes" | "No";
  role: string;
  roleTitle?: string;
  dept?: string;
  stage: ApplicationStage;
  daysAgo: number;
  applied?: string;
  appliedAt?: string;
  hiredAt?: string | null;
  hiredAfter?: number;
  rejAt?: number;
  total: number;
  rel: number;
  ctc: number;
  ectc: number;
  negotiable?: "Yes" | "No";
  joining?: string;
  notice: string;
  buyout?: "Yes" | "No";
  lastco?: string;
  lastdes?: string;
  langs?: string[];
  portfolio?: string;
  linkedin?: string;
  instagram?: string;
  resume?: string;
  resumeName?: string;
  resumeUrl?: string;
  why: string;
  admire?: string;
  problem: string;
  source?: string;
  referral?: string;
  notes?: ApplicantNote[];
  score?: Record<string, number>;
  ai?: ApplicantAI;
  custom?: Record<string, string | number | boolean>;
  fit?: number | null;
}

export type FieldType =
  | "text"
  | "email"
  | "tel"
  | "number"
  | "select"
  | "dropdown"
  | "yesno"
  | "dept"
  | "role"
  | "date"
  | "langs"
  | "file"
  | "consent"
  | "long"
  | "url"
  | "link"
  | "short";

export interface FormField {
  step: string;
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  on: boolean;
  locked?: boolean;
  options?: string[];
  hint?: string;
  min?: number;
  max?: number;
  custom?: boolean;
}

export interface FormStep {
  id: string;
  label: string;
}

export interface ValueBehaviour {
  title: string;
  description: string;
  onTuesday: string;
}

export interface ValueGroup {
  name: string;
  line: string;
  behaviours: [string, string, string][];
}

export interface WhyLadder {
  tab: string;
  steps: string[];
}

export interface SecondOrderOption {
  label: string;
  good: boolean;
  steps: string[];
}

export interface SecondOrderChain {
  tab: string;
  q: string;
  opts: SecondOrderOption[];
}

export type QuizPair = [string, string];

export type HiringStepItem = [string, string, string];

export interface DashboardSession {
  email: string;
  role: "admin" | "recruiter" | "hm";
  name?: string;
  picture?: string;
}

export interface DashboardRolePermission {
  label: string;
  tabs: ("overview" | "applicants" | "pipeline" | "roles" | "form" | "exports")[];
  scope?: string;
  hidePay?: boolean;
}

export interface GalleryItem {
  src: string;
  srcset?: string;
  alt: string;
}

export interface BrandItem {
  name: string;
  logo: string;
}

