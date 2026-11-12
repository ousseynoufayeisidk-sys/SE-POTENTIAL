export type Role = 'candidat' | 'evaluateur' | 'jury' | 'admin';
export type Dimension = 'PEOPLE' | 'EXECUTION' | 'BUSINESS' | 'IMPACT';
export type Stage = 'REPERAGE' | 'QUALIFICATION' | 'ENTRETIEN' | 'IMMERSION' | 'DECISION';
export type Decision =
  | 'SELECTION_PRIORITAIRE'
  | 'ACCOMPAGNEMENT_CIBLE'
  | 'PRE_INCUBATION'
  | 'NON_RETENU_A_CE_STADE'
  | 'COMPLEMENT_REQUIS';

export interface Profile {
  id: string;
  org_id?: string;
  role: Role;
  full_name?: string;
  phone?: string;
  locale: string;
  created_at: string;
}

export interface Candidate {
  id: string;
  user_id: string;
  region?: string;
  sector?: string;
  gender?: string;
  business_stage?: string;
  formalization?: 'INFORMEL_PUR' | 'SEMI_FORMEL' | 'FORMALISE' | 'STRUCTURE';
  persona?: 'A' | 'B' | 'C' | 'D' | 'E';
  created_at: string;
}

export interface Application {
  id: string;
  candidate_id: string;
  program_id: string;
  stage: Stage;
  submitted_at?: string;
  created_at: string;
}

export interface PrequalQuestion {
  id: number;
  position: number;
  text: string;
  help?: string;
  proof_hint?: string;
}

export interface PrequalAnswer {
  application_id: string;
  question_id: number;
  answer?: string;
  proof_path?: string;
  no_proof_reason?: string;
  updated_at: string;
}

export interface Criterion {
  id: string;
  model_id: string;
  code: string;
  dimension: Dimension;
  label: string;
  weight: number;
  position: number;
}

export interface Evaluation {
  id: string;
  application_id: string;
  evaluator_id: string;
  kind: 'PREQUAL' | 'INTERVIEW' | 'ASSESSMENT' | 'CHALLENGE';
  status: 'draft' | 'submitted';
  submitted_at?: string;
  created_at: string;
}

export interface EvaluationScore {
  evaluation_id: string;
  criterion_id: string;
  note?: number;
  evidences: string[];
  strong_proof: boolean;
  to_verify: boolean;
  comment?: string;
}

export interface Alert {
  id: string;
  application_id: string;
  type: string;
  facts: string;
  source: string;
  raised_by?: string;
  status: string;
  created_at: string;
}

export interface JuryDecision {
  application_id: string;
  decision: Decision;
  final_score?: number;
  model_id?: string;
  two_proofs?: string[];
  two_risks?: string[];
  strengths?: string[];
  to_develop?: string[];
  justification: string;
  conditions?: string;
  plan_90d?: string;
  decided_by?: string;
  decided_at: string;
}
