// Domain type aliases for the Tadribe CRM.
//
// The canonical `Database` type is generated from Supabase into
// `src/types/supabase.ts`. This file re-exports it together with thin
// aliases on top of `Tables<'xxx'>` so consumers can keep importing
// human-readable names like `Company` / `Session` / `Enrollment`.
//
// For insert / update payloads, prefer importing
// `TablesInsert<'xxx'>` / `TablesUpdate<'xxx'>` directly from
// `@/types/supabase` (these are already re-exported below).

import type { Tables, Enums } from '@/types/supabase'

export type { Database, Tables, TablesInsert, TablesUpdate, Enums, Json } from '@/types/supabase'

// ---- Enum string unions ----

export type UserRole = Enums<'user_role'>
export type PipelineStage = Enums<'pipeline_stage'>
export type SessionStatus = Enums<'session_status'>
export type InscriptionStatus = Enums<'inscription_status'>
export type FundingType = Enums<'funding_type'>
export type FundingStatus = Enums<'funding_status'>
export type InvoiceStatus = Enums<'invoice_status'>
export type ActionCategory = Enums<'action_category'>
export type EvalType = Enums<'eval_type'>

// ---- Table row aliases ----

export type Organization = Tables<'organizations'>
export type Profile = Tables<'profiles'>
export type Company = Tables<'companies'>
export type Contact = Tables<'contacts'>
export type Opportunity = Tables<'opportunities'>
export type Interaction = Tables<'interactions'>
export type Formation = Tables<'formations'>
export type Certification = Tables<'certifications'>
export type Session = Tables<'sessions'>
export type SessionSlot = Tables<'session_slots'>
export type Location = Tables<'locations'>
export type Trainer = Tables<'trainers'>
export type TrainerCompetency = Tables<'trainer_competencies'>
export type Beneficiary = Tables<'beneficiaries'>
export type Enrollment = Tables<'enrollments'>
export type Attendance = Tables<'attendances'>
export type IndividualAdaptation = Tables<'individual_adaptations'>
export type FundingDossier = Tables<'funding_dossiers'>
export type Evaluation = Tables<'evaluations'>
export type EvaluationResponse = Tables<'evaluation_responses'>
export type Certificate = Tables<'certificates'>
export type Document = Tables<'documents'>
export type Invoice = Tables<'invoices'>
export type InvoiceLine = Tables<'invoice_lines'>
