/**
 * Jisr API client: the ONLY place the web app talks HTTP.
 *
 * Every type below mirrors `api/openapi.yaml` (components.schemas) as amended
 * by `docs/03-engineering/MVP_API_ADDENDUM.md` (the addendum wins). If the
 * backend and the contract disagree, fix it here and nowhere else.
 */
import { clearSession, getToken } from "./session";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");

/* ------------------------------------------------------------------ */
/* Enums                                                               */
/* ------------------------------------------------------------------ */
export type Language = "ar" | "en" | "ur";
export type Step = "L0" | "L1" | "L2" | "L3" | "L4" | "RED";
export const STEPS: readonly Step[] = ["L0", "L1", "L2", "L3", "L4", "RED"];
export type Modality = "in_person" | "video" | "phone";
export type Instrument = "PHQ2" | "GAD2" | "PHQ9" | "GAD7" | "CSSRS_SCREEN";
export type EpisodeState =
  | "SCREENED_POSITIVE"
  | "EXPLAINED"
  | "STEP_RECOMMENDED"
  | "STEP_CONFIRMED"
  | "REFERRED"
  | "ACCEPTED"
  | "BOOKED"
  | "ATTENDED"
  | "MONITORING"
  | "STEP_CHANGED"
  | "CLOSED"
  | "RED_CRISIS"
  | "ESCALATED"
  | "DECLINED_BY_PROVIDER"
  | "DECLINED_BY_PERSON"
  | "LOST_TO_FOLLOW_UP";
export type ConsentScope =
  | "share_with_receiving_provider"
  | "share_physical_context"
  | "ai_drafted_summaries"
  | "store_free_text"
  | "notify_sms"
  | "notify_whatsapp";
export const CONSENT_SCOPES: readonly ConsentScope[] = [
  "share_with_receiving_provider",
  "share_physical_context",
  "ai_drafted_summaries",
  "store_free_text",
  "notify_sms",
  "notify_whatsapp",
];
export type Role = "person" | "clinician" | "coordinator" | "programme" | "judge";
export type Persona = "judge" | "mariam" | "imran" | "dr_salma" | "khalid" | "programme_lead";

/* ------------------------------------------------------------------ */
/* Schemas                                                             */
/* ------------------------------------------------------------------ */
export interface Problem {
  type: string;
  title: string;
  status: number;
  code: string;
  detail?: string;
  instance?: string;
  trace_id?: string;
  required_consent?: string;
  errors?: { loc?: (string | number)[]; msg?: string }[];
}

export interface CrisisLine {
  name: string;
  number: string;
  tel: string;
}

export interface ScreeningItem {
  link_id: string;
  instrument: Instrument;
  text: string;
  options: (number | boolean)[];
  /** Addendum: English option labels, the instrument stem, and the crisis-item flag. */
  option_labels?: string[];
  stem?: string;
  crisis_item?: boolean;
}

export interface ScreeningSession {
  id: string;
  status: "in_progress" | "completed" | "abandoned";
  stage: "prescreen" | "full" | "recheck";
  language: Language;
  items: ScreeningItem[];
  rule_set_version: string;
}

export interface AnswersSubmit {
  answers: Record<string, number | boolean>;
  free_text?: string | null;
}

export interface AnswersResult {
  id: string;
  stage?: string;
  next_items?: ScreeningItem[];
  crisis: boolean;
  crisis_lines?: CrisisLine[];
  episode_id?: string | null;
}

export interface Score {
  instrument: Instrument;
  total: number;
  band: string;
  item9?: number | null;
  scored_at?: string;
}

export interface EpisodeRef {
  id: string;
  state: EpisodeState;
  proposed_step?: Step;
}

export type Urgency = "emergency" | "same_day_check" | null;

export interface ScreeningCompleteResult {
  session_id: string;
  crisis: boolean;
  positive?: boolean;
  scores?: Score[];
  episode?: EpisodeRef | null;
  crisis_lines?: CrisisLine[];
  next_contact?: string;
  llm_locked?: boolean;
  urgency?: Urgency;
  can_request_support?: boolean;
  recheck_reminder_offer_days?: number;
  explanation_available?: boolean;
  self_help?: string[];
}

export interface CrisisCheckRequest {
  text: string;
  source?: "free_text" | "help_button" | "clinician_note";
  language_hint?: Language;
  episode_id?: string | null;
}

export type RedSeverity = "imminent" | "high" | "same_day_check" | "review";

export interface CrisisCheckResult {
  crisis: boolean;
  matched_rule_ids: string[];
  crisis_lines?: CrisisLine[];
  episode_state?: EpisodeState;
  latency_ms: number;
  severity?: RedSeverity | null;
  urgency?: Urgency;
  categories?: string[];
  episode_id?: string | null;
}

export interface TimelineEvent {
  seq: number;
  type: string;
  from_state?: EpisodeState;
  to_state?: EpisodeState;
  actor_type: "person" | "staff" | "system" | "llm";
  occurred_at: string;
  /** Not in the contract; tolerated if the backend adds it (see findReferralId). */
  referral_id?: string;
  data?: Record<string, unknown>;
}

export interface PhysicalContext {
  hba1c_pct?: number | null;
  bmi?: number | null;
  bp_systolic?: number | null;
  bp_diastolic?: number | null;
  observed_at?: string;
}

export interface Deadline {
  kind: "crisis_ack" | "referral_accept" | "first_appt" | "recheck";
  due_at: string;
  overdue?: boolean;
}

export interface Episode {
  id: string;
  state: EpisodeState;
  current_step?: Step | null;
  is_red: boolean;
  owner?: { team?: string; staff_id?: string | null };
  next_deadline?: Deadline | null;
  scores?: Score[];
  physical_context?: PhysicalContext | null;
  timeline: TimelineEvent[];
  last_event_seq: number;
  /* ---- Addendum fields ---- */
  person_label?: string;
  opened_at?: string;
  language?: Language;
  active_referral_id?: string | null;
  referrals?: { id: string; status?: string; provider_id?: string; provider_name?: string; sla_due_at?: string }[];
  recommendation_id?: string | null;
  fired_rules?: string[];
  red_severity?: RedSeverity | null;
  score_history?: { instrument: Instrument; total: number; at: string }[];
  consents?: Partial<Record<ConsentScope, "granted" | "revoked">>;
}

export interface MyEpisodes {
  items: { id: string; state: EpisodeState; current_step?: Step | null; is_red: boolean; opened_at?: string }[];
}

export type RciClass = "reliable_improvement" | "reliable_deterioration" | "no_reliable_change" | (string & {});

export interface Trajectory {
  points: { at: string; phq9?: number | null; gad7?: number | null; label?: string }[];
  rci_thresholds: { PHQ9?: number; GAD7?: number };
  caseness: { PHQ9?: number; GAD7?: number };
  classification?: { PHQ9?: RciClass; GAD7?: RciClass };
}

export type ContentType = "ai_drafted" | "template";
export type LlmProviderName = "gemini" | "azure_openai" | "local" | "none";
export interface ValidatorResult {
  result: "pass" | "fail" | "skipped";
  findings?: string[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CompanionRequest {
  messages: ChatMessage[];
  language: Language;
  episode_id?: string | null;
}

export interface CompanionGate {
  crisis: boolean;
  severity?: RedSeverity | null;
  matched_rule_ids: string[];
  categories?: string[];
  latency_ms: number;
}

export interface CompanionReply {
  reply: string;
  content_type: ContentType;
  provider: LlmProviderName;
  gate: CompanionGate;
  validator?: ValidatorResult;
  suggestions?: string[];
  crisis_lines?: CrisisLine[];
  episode_id?: string | null;
  llm_locked: boolean;
}

export interface HandoffFact {
  id: string;
  label: string;
  value: string;
  kind: "observed" | "calculated";
}

export interface HandoffSentence {
  text: string;
  sources: string[];
  status: "verified" | "removed";
  /** Not in the addendum: tolerated if the backend explains a removal. */
  reason?: string;
}

export interface HandoffSummary {
  facts: HandoffFact[];
  sentences: HandoffSentence[];
  removed_count: number;
  validator: ValidatorResult;
  content_type: ContentType;
  provider: LlmProviderName;
  generated_at: string;
}

export type CopilotIntent = "fairness" | "trend" | "funnel" | "sla" | "geo" | "unknown";

export interface CopilotChart {
  type: "bar" | "line";
  title: string;
  x: string[];
  series: { name: string; values: (number | null)[] }[];
  unit?: string;
}

export interface CopilotAnswer {
  answer: string;
  content_type: ContentType;
  provider: LlmProviderName;
  intent: CopilotIntent;
  chart: CopilotChart | null;
  suppressed_note?: string | null;
  data_label: string;
}

export interface Timeseries {
  weeks: string[];
  series: {
    screens: number[];
    positive: number[];
    referred: number[];
    attended: number[];
    conversion_pct: (number | null)[];
    median_days_to_care: (number | null)[];
    red_ack_p50_min: (number | null)[];
    red_ack_p90_min: (number | null)[];
  };
  data_label: string;
}

export type RegionId = "abu_dhabi_city" | "al_ain" | "al_dhafra";
export interface GeoRegion {
  id: RegionId;
  name: string;
  screens: number;
  positive: number;
  conversion_pct: number | null;
  median_days_to_care: number | null;
  suppressed: boolean;
}
export interface Geo {
  regions: GeoRegion[];
  data_label: string;
}

export interface SlaItem {
  kind: "crisis_ack" | "referral_accept" | "first_appt" | "recheck";
  target: string;
  met_pct: number | null;
  breaches: number;
  p50: string;
  p90: string;
}

export interface EvalCase {
  id: string;
  lang: string;
  text: string;
}

export interface CrisisEval {
  ran_at: string;
  n: number;
  positives: number;
  negatives: number;
  recall: number;
  precision: number;
  false_negatives: EvalCase[];
  false_positives: EvalCase[];
  latency_p95_ms: number;
  by_language: { lang: string; n: number; recall: number | null; precision: number | null }[];
  rules_version: string;
  by_category?: { category: string; n: number; correct?: number; recall?: number | null }[];
  recall_wilson95_lower?: number;
  confusion?: { tp?: number; fp?: number; tn?: number; fn?: number };
}

export type FactorName =
  | "severity"
  | "functional_impairment"
  | "comorbidity"
  | "preference"
  | "language"
  | "clinician_gender"
  | "modality"
  | "insurance_network"
  | "capacity"
  | "rci"
  | "crisis";

export interface Factor {
  factor: FactorName;
  value: string;
  effect: string;
  rule_id: string;
}

export interface Provider {
  id: string;
  display_name: string;
  kind: "community" | "family_physician" | "psychologist" | "tele_mh" | "psychiatry";
  steps_served?: Step[];
  languages: Language[];
  clinician_gender?: "female" | "male";
  modalities: Modality[];
  networks: string[];
  city?: string;
  current_wait_days?: number;
  next_slot?: string | null;
  accepting: boolean;
  is_synthetic: boolean;
}

export interface StepRecommendation {
  id: string;
  status: "proposed" | "confirmed" | "overridden" | "superseded";
  recommended_step: Step;
  source?: "initial" | "rci" | "decline_rematch" | "clinician";
  factors: Factor[];
  candidates: Provider[];
  rule_set_version: string;
  needs_clinician_confirmation: true;
}

export type Priority = "routine" | "urgent" | "asap" | "stat";

export interface ReferralCreate {
  provider_id: string;
  priority: Priority;
  requested_slot?: string | null;
  consent_scopes: ConsentScope[];
  note_to_provider?: string | null;
}

export interface Referral {
  id: string;
  status: "requested" | "accepted" | "declined" | "cancelled" | "completed" | "expired";
  episode_state: EpisodeState;
  sla_due_at: string;
  packet_preview?: Record<string, unknown>;
  fhir?: { service_request_id?: string; task_id?: string };
}

export interface ReferralDecision {
  decision: "accept" | "decline";
  reason?: "no_capacity" | "out_of_scope" | "network" | "other" | null;
  comment?: string | null;
  on_behalf_of_provider?: boolean;
}

export interface ReferralDecisionResult {
  id: string;
  status: "accepted" | "declined";
  episode_state: EpisodeState;
  first_appointment_due_by?: string;
  rematch?: { recommendation_id?: string; excluded_provider_ids?: string[] };
}

export interface AppointmentAction {
  action: "book" | "record";
  start_at?: string;
  modality?: Modality;
  appointment_id?: string;
  status?: "attended" | "no_show" | "cancelled";
}

export interface AppointmentResult {
  appointment_id: string;
  status: "booked" | "attended" | "no_show" | "cancelled";
  episode_state: EpisodeState;
  notification?: { channel?: "in_app" | "sms_mock" | "whatsapp_mock"; text?: string };
}

export interface QueueItem {
  episode_id: string;
  person_label: string;
  state: EpisodeState;
  is_red: boolean;
  step?: Step | null;
  reason: string;
  deadline?: Deadline | null;
  language?: Language;
  /* ---- backend extras (addendum-compatible) ---- */
  red_open?: boolean;
  red_severity?: RedSeverity | null;
  to_confirm?: boolean;
  opened_at?: string;
}

export interface QueuePage {
  items: QueueItem[];
  counts: { red?: number; overdue?: number; to_confirm?: number };
  next_cursor: string | null;
}

export type QueueView = "red" | "overdue" | "to_confirm" | "mine" | "all";

export type CrisisResolution = "contacted_safe" | "emergency_services" | "referred_l4" | "unreachable_escalated";

export interface ConfirmStep {
  recommendation_id: string;
  step: Step;
  reason?: string | null;
  resolve_crisis?: boolean;
  crisis_resolution?: CrisisResolution | null;
}

export interface ConfirmStepResult {
  episode_state: EpisodeState;
  current_step: Step;
  recommendation_status: "confirmed" | "overridden";
  last_event_seq: number;
}

export interface CloseEpisode {
  basis: "evidence" | "clinician_decision";
  evidence?: { appointment_id?: string; recheck_score_ids?: string[] };
  reason?: string | null;
}

export interface CloseEpisodeResult {
  episode_state: EpisodeState;
  closed_at: string;
  close_reason: "evidence_attended_recheck" | "clinician_decision" | "declined_by_person" | "ltfu";
}

export interface Consent {
  scope: ConsentScope;
  status: "granted" | "revoked";
  version?: number;
  recorded_at?: string;
}

export interface ConsentSet {
  notice_version: string;
  consents: Consent[];
  effects?: string[];
}

export interface ConsentUpdate {
  notice_version: string;
  consents: { scope: ConsentScope; status: "granted" | "revoked" }[];
}

export interface ProgrammeMetrics {
  period: { from?: string; to?: string };
  funnel: Record<string, number>;
  kpis: Record<string, number | null>;
  drop_off_reasons?: { reason?: string; n?: number | null }[];
  suppressed_cells?: number;
  data_label: string;
  baseline?: { conversion_pct?: number; median_days_to_care?: number };
}

export type FairnessMetric = "conversion" | "time_to_care" | "reliable_improvement";
export type FairnessBy = "sex" | "age_band" | "nationality_group" | "language" | "insurance_plan";

export interface FairnessRow {
  group: string;
  n?: string;
  suppression?: "primary" | "complementary" | null;
  value?: number | null;
  ci95?: number[] | null;
  suppressed: boolean;
}

export interface FairnessTable {
  metric: string;
  by: string;
  k: number;
  rows: FairnessRow[];
  total_n?: string;
  max_gap_pp?: number | null;
  note?: string;
}

export interface ExplainRequest {
  episode_id: string;
  kind: "result" | "step" | "message";
  language: Language;
}

export interface Explanation {
  explanation_id: string;
  language: Language;
  sections: { what_this_means: string; what_it_does_not_mean: string; next_step: string };
  content_type: "ai_drafted" | "template";
  provider: "gemini" | "azure_openai" | "local" | "none";
  validator: { result: "pass" | "fail" | "skipped"; findings?: string[] };
  fallback_used: boolean;
}

export interface SimRequest {
  cohort_size: number;
  seed: number;
  scenario?: { baseline_conversion?: number; capacity_multiplier?: number; sla_hours?: number };
}

export interface SimArm {
  conversion_pct: number;
  median_days_to_care: number;
}

export interface SimResult {
  run_id: string;
  baseline: SimArm;
  jisr: SimArm;
  assumptions: string[];
  data_label: string;
  curve?: { days: number[]; baseline_cum_pct: number[]; jisr_cum_pct: number[] };
  waiting_list?: { baseline: number; jisr: number };
  people_reached_extra?: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  role: Role;
  persona?: string;
  scopes: string[];
  judge?: boolean;
}

export type RedAckCategory = "calling_now" | "crisis_line_transfer" | "emergency_services_called" | "other";

export interface RedAckResult {
  episode_id: string;
  state: EpisodeState;
  acknowledged_by?: { staff_id?: string; role?: "coordinator" | "clinician" };
  acknowledged_at: string;
  ack_latency_seconds?: number;
  within_sla: boolean;
  event_seq?: number;
}

export type ContactChannel = "phone" | "video" | "sms" | "whatsapp" | "in_person" | "crisis_line_transfer";
export type ContactOutcome =
  | "reached_safe"
  | "reached_needs_emergency"
  | "no_answer"
  | "wrong_number"
  | "declined_contact"
  | "voicemail_neutral";

export interface ContactAttempt {
  channel: ContactChannel;
  outcome: ContactOutcome;
  note?: string | null;
  next_attempt_at?: string | null;
}

export interface ContactAttemptResult {
  event_seq: number;
  type: "CONTACT_ATTEMPT";
  attempt_number: number;
  episode_state: EpisodeState;
  escalation?: { level?: number; to?: string } | null;
}

export interface DemoResetResult {
  reset_at: string;
  personas: string[];
  episodes_seeded?: number;
  simulated_cohort?: number;
  rules_version: string;
}

/* ------------------------------------------------------------------ */
/* Transport                                                           */
/* ------------------------------------------------------------------ */
export class ApiError extends Error {
  readonly status: number;
  readonly problem: Problem | null;
  constructor(status: number, problem: Problem | null, message?: string) {
    super(message ?? problem?.title ?? `HTTP ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.problem = problem;
  }
  get code(): string | undefined {
    return this.problem?.code;
  }
}

export function newIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  // RFC4122-ish fallback for very old browsers.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  idempotent?: boolean;
  headers?: Record<string, string>;
  auth?: boolean;
  token?: string;
  timeoutMs?: number;
}

export interface ApiResponse<T> {
  data: T;
  headers: Headers;
}

export function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(API_URL + path);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

export async function requestRaw<T>(path: string, opts: RequestOptions = {}): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = { Accept: "application/json", ...(opts.headers ?? {}) };
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (opts.idempotent) headers["Idempotency-Key"] = newIdempotencyKey();
  if (opts.auth !== false) {
    const token = opts.token ?? getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 15000);
  let res: Response;
  try {
    res = await fetch(buildUrl(path, opts.query), {
      method: opts.method ?? "GET",
      headers,
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
      cache: "no-store",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    let problem: Problem | null = null;
    try {
      problem = (await res.json()) as Problem;
    } catch {
      problem = null;
    }
    if (res.status === 401 && opts.auth !== false) clearSession({ keepPasscode: true });
    throw new ApiError(res.status, problem);
  }
  if (res.status === 204) return { data: undefined as T, headers: res.headers };
  const text = await res.text();
  return { data: (text ? JSON.parse(text) : undefined) as T, headers: res.headers };
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  return (await requestRaw<T>(path, opts)).data;
}

/* ------------------------------------------------------------------ */
/* Endpoints (API-xx ids from PROJECT_BRIEF §8)                        */
/* ------------------------------------------------------------------ */
export const api = {
  /** API-22 */
  demoLogin: (persona: Persona, passcode: string) =>
    request<TokenResponse>("/v1/auth/demo-login", { method: "POST", body: { persona, passcode }, auth: false }),

  /** API-28 (judge token required) */
  demoReset: (token: string) =>
    request<DemoResetResult>("/v1/demo/reset", {
      method: "POST",
      body: { seed: 42, scenario: "judge_tour" },
      token,
    }),

  /** API-01 */
  createScreening: (language: Language) =>
    request<ScreeningSession>("/v1/screenings", {
      method: "POST",
      body: { language, stage: "prescreen", source: "jisr_app" },
      idempotent: true,
    }),

  /** API-02 */
  submitAnswers: (sessionId: string, body: AnswersSubmit) =>
    request<AnswersResult>(`/v1/screenings/${sessionId}/answers`, { method: "POST", body, idempotent: true }),

  /** API-03 */
  completeScreening: (sessionId: string, requestSupport = false) =>
    request<ScreeningCompleteResult>(`/v1/screenings/${sessionId}/complete`, {
      method: "POST",
      body: { request_support: requestSupport },
      idempotent: true,
    }),

  /** API-04 (short timeout: the gate must answer in < 1 s; on failure the UI fails closed) */
  crisisCheck: (body: CrisisCheckRequest) =>
    request<CrisisCheckResult>("/v1/crisis/check", { method: "POST", body, timeoutMs: 8000 }),

  /** API-05: also returns the ETag for If-Match */
  getEpisode: async (id: string): Promise<{ episode: Episode; etag: string }> => {
    const { data, headers } = await requestRaw<Episode>(`/v1/episodes/${id}`);
    // CORS may hide ETag; fall back to the quoted last_event_seq (the contract's ETag definition).
    const etag = headers.get("ETag") ?? `"${data.last_event_seq}"`;
    return { episode: data, etag };
  },

  /** API-06 */
  getRecommendation: (episodeId: string) => request<StepRecommendation>(`/v1/episodes/${episodeId}/recommendation`),

  /** API-07 */
  createReferral: (episodeId: string, body: ReferralCreate) =>
    request<Referral>(`/v1/episodes/${episodeId}/referrals`, { method: "POST", body, idempotent: true }),

  /** API-08 */
  decideReferral: (referralId: string, body: ReferralDecision) =>
    request<ReferralDecisionResult>(`/v1/referrals/${referralId}/decision`, { method: "POST", body, idempotent: true }),

  /** API-09 */
  referralAppointment: (referralId: string, body: AppointmentAction) =>
    request<AppointmentResult>(`/v1/referrals/${referralId}/appointment`, { method: "POST", body, idempotent: true }),

  /** API-11 */
  getQueue: (view: QueueView = "all") => request<QueuePage>("/v1/staff/queue", { query: { view, limit: 100 } }),

  /** API-12 */
  confirmStep: (episodeId: string, etag: string, body: ConfirmStep) =>
    request<ConfirmStepResult>(`/v1/episodes/${episodeId}/confirm-step`, {
      method: "POST",
      body,
      idempotent: true,
      headers: { "If-Match": etag },
    }),

  /** API-13 */
  closeEpisode: (episodeId: string, body: CloseEpisode) =>
    request<CloseEpisodeResult>(`/v1/episodes/${episodeId}/close`, { method: "POST", body, idempotent: true }),

  /** API-14 */
  getConsents: () => request<ConsentSet>("/v1/consents"),
  putConsents: (body: ConsentUpdate) => request<ConsentSet>("/v1/consents", { method: "PUT", body }),

  /** API-16 */
  getMetrics: (token?: string) => request<ProgrammeMetrics>("/v1/programme/metrics", { query: { cohort: "all" }, token }),

  /** API-17 */
  getFairness: (metric: FairnessMetric, by: FairnessBy, token?: string) =>
    request<FairnessTable>("/v1/programme/fairness", { query: { metric, by }, token }),

  /** API-18 */
  explain: (body: ExplainRequest) => request<Explanation>("/v1/explain", { method: "POST", body, timeoutMs: 10000 }),

  /** API-21 */
  runSimulation: (body: SimRequest, token?: string) =>
    request<SimResult>("/v1/sim/run", { method: "POST", body, timeoutMs: 30000, token }),

  /** API-24 */
  ackRed: (episodeId: string, note_category: RedAckCategory) =>
    request<RedAckResult>(`/v1/episodes/${episodeId}/red/ack`, {
      method: "POST",
      body: { note_category },
      idempotent: true,
    }),

  /** Addendum: GET /v1/me/episodes (newest first) */
  myEpisodes: () => request<MyEpisodes>("/v1/me/episodes"),

  /** Addendum: symptom trajectory with RCI + caseness lines */
  getTrajectory: (episodeId: string) => request<Trajectory>(`/v1/episodes/${episodeId}/trajectory`),

  /** Addendum: Jisr Companion. The Crisis Gate runs server-side on the latest user message before any LLM call. */
  companionChat: (body: CompanionRequest) =>
    request<CompanionReply>("/v1/companion/chat", { method: "POST", body, idempotent: true, timeoutMs: 20000 }),

  /** Addendum: AI hand-off summary with per-sentence provenance */
  handoffSummary: (episodeId: string) =>
    request<HandoffSummary>(`/v1/episodes/${episodeId}/handoff-summary`, { method: "POST", body: {}, idempotent: true, timeoutMs: 25000 }),

  /** Addendum: Programme Copilot */
  programmeAsk: (question: string, token?: string) =>
    request<CopilotAnswer>("/v1/programme/ask", { method: "POST", body: { question }, token, timeoutMs: 25000 }),

  getTimeseries: (token?: string) => request<Timeseries>("/v1/programme/timeseries", { token }),
  getGeo: (token?: string) => request<Geo>("/v1/programme/geo", { token }),
  getSla: (token?: string) => request<{ items: SlaItem[] }>("/v1/programme/sla", { token }),

  /** Addendum: crisis benchmark (latest) and a live run against the deterministic gate */
  getCrisisEval: (token?: string) => request<CrisisEval>("/v1/evals/crisis", { token }),
  runCrisisEval: (token?: string) =>
    request<CrisisEval>("/v1/evals/crisis/run", { method: "POST", body: {}, token, timeoutMs: 60000 }),

  /** API-25 */
  logContactAttempt: (episodeId: string, body: ContactAttempt) =>
    request<ContactAttemptResult>(`/v1/episodes/${episodeId}/contact-attempts`, {
      method: "POST",
      body,
      idempotent: true,
    }),
};

/* ------------------------------------------------------------------ */
/* Contract-gap helpers                                                */
/* ------------------------------------------------------------------ */

/**
 * Staff need the referral id for API-08/09. The addendum adds
 * `active_referral_id`; older shapes are still accepted, then the id the
 * person's browser tab stored after API-07.
 */
export function findReferralId(episode: Episode, fallback: string | null): string | null {
  if (episode.active_referral_id) return episode.active_referral_id;
  if (episode.referrals && episode.referrals.length > 0) return episode.referrals[episode.referrals.length - 1].id;
  for (let i = episode.timeline.length - 1; i >= 0; i--) {
    const ev = episode.timeline[i];
    if (ev.referral_id) return ev.referral_id;
    const d = ev.data;
    if (d && typeof d.referral_id === "string") return d.referral_id;
  }
  return fallback;
}

export function problemMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const p = err.problem;
    return [p?.code, p?.detail ?? p?.title ?? err.message].filter(Boolean).join(" · ");
  }
  if (err instanceof Error) return err.message;
  return String(err);
}
