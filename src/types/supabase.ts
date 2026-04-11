export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      apprentice_visits: {
        Row: {
          apprentice_present: boolean | null
          created_at: string | null
          document_url: string | null
          enrollment_id: string
          id: string
          next_actions: string | null
          objectives_review: Json | null
          organization_id: string
          summary: string | null
          trainer_id: string | null
          tutor_present: boolean | null
          visit_date: string
          visit_type: string | null
        }
        Insert: {
          apprentice_present?: boolean | null
          created_at?: string | null
          document_url?: string | null
          enrollment_id: string
          id?: string
          next_actions?: string | null
          objectives_review?: Json | null
          organization_id: string
          summary?: string | null
          trainer_id?: string | null
          tutor_present?: boolean | null
          visit_date: string
          visit_type?: string | null
        }
        Update: {
          apprentice_present?: boolean | null
          created_at?: string | null
          document_url?: string | null
          enrollment_id?: string
          id?: string
          next_actions?: string | null
          objectives_review?: Json | null
          organization_id?: string
          summary?: string | null
          trainer_id?: string | null
          tutor_present?: boolean | null
          visit_date?: string
          visit_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "apprentice_visits_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apprentice_visits_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apprentice_visits_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      attendances: {
        Row: {
          absence_justified: boolean | null
          absence_reason: string | null
          created_at: string | null
          enrollment_id: string
          id: string
          is_present: boolean | null
          session_slot_id: string
          signaled_to_funder: boolean | null
          signature_data: string | null
          signed_at: string | null
        }
        Insert: {
          absence_justified?: boolean | null
          absence_reason?: string | null
          created_at?: string | null
          enrollment_id: string
          id?: string
          is_present?: boolean | null
          session_slot_id: string
          signaled_to_funder?: boolean | null
          signature_data?: string | null
          signed_at?: string | null
        }
        Update: {
          absence_justified?: boolean | null
          absence_reason?: string | null
          created_at?: string | null
          enrollment_id?: string
          id?: string
          is_present?: boolean | null
          session_slot_id?: string
          signaled_to_funder?: boolean | null
          signature_data?: string | null
          signed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendances_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendances_session_slot_id_fkey"
            columns: ["session_slot_id"]
            isOneToOne: false
            referencedRelation: "session_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      beneficiaries: {
        Row: {
          address: Json | null
          apprentice_contract_end: string | null
          apprentice_contract_start: string | null
          birth_date: string | null
          company_id: string | null
          cpf_holder: boolean | null
          created_at: string | null
          disability_consent: boolean | null
          disability_details: string | null
          email: string | null
          first_name: string
          france_travail_id: string | null
          has_disability: boolean | null
          id: string
          is_apprentice: boolean | null
          job_title: string | null
          last_name: string
          notes: string | null
          organization_id: string
          phone: string | null
          profile_id: string | null
          qualification_level: string | null
          status: string | null
          tutor_contact_id: string | null
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          apprentice_contract_end?: string | null
          apprentice_contract_start?: string | null
          birth_date?: string | null
          company_id?: string | null
          cpf_holder?: boolean | null
          created_at?: string | null
          disability_consent?: boolean | null
          disability_details?: string | null
          email?: string | null
          first_name: string
          france_travail_id?: string | null
          has_disability?: boolean | null
          id?: string
          is_apprentice?: boolean | null
          job_title?: string | null
          last_name: string
          notes?: string | null
          organization_id: string
          phone?: string | null
          profile_id?: string | null
          qualification_level?: string | null
          status?: string | null
          tutor_contact_id?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          apprentice_contract_end?: string | null
          apprentice_contract_start?: string | null
          birth_date?: string | null
          company_id?: string | null
          cpf_holder?: boolean | null
          created_at?: string | null
          disability_consent?: boolean | null
          disability_details?: string | null
          email?: string | null
          first_name?: string
          france_travail_id?: string | null
          has_disability?: boolean | null
          id?: string
          is_apprentice?: boolean | null
          job_title?: string | null
          last_name?: string
          notes?: string | null
          organization_id?: string
          phone?: string | null
          profile_id?: string | null
          qualification_level?: string | null
          status?: string | null
          tutor_contact_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beneficiaries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiaries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiaries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiaries_tutor_contact_id_fkey"
            columns: ["tutor_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          blocks_obtained: Json | null
          certificate_type: string
          certification_id: string | null
          certification_obtained: boolean | null
          created_at: string | null
          created_by: string | null
          duration_hours: number | null
          end_date: string | null
          enrollment_id: string
          id: string
          issued_date: string
          objectives_achieved: string[] | null
          organization_id: string
          pdf_url: string | null
          sent_to_beneficiary: boolean | null
          sent_to_funder: boolean | null
          start_date: string | null
          title: string
        }
        Insert: {
          blocks_obtained?: Json | null
          certificate_type: string
          certification_id?: string | null
          certification_obtained?: boolean | null
          created_at?: string | null
          created_by?: string | null
          duration_hours?: number | null
          end_date?: string | null
          enrollment_id: string
          id?: string
          issued_date: string
          objectives_achieved?: string[] | null
          organization_id: string
          pdf_url?: string | null
          sent_to_beneficiary?: boolean | null
          sent_to_funder?: boolean | null
          start_date?: string | null
          title: string
        }
        Update: {
          blocks_obtained?: Json | null
          certificate_type?: string
          certification_id?: string | null
          certification_obtained?: boolean | null
          created_at?: string | null
          created_by?: string | null
          duration_hours?: number | null
          end_date?: string | null
          enrollment_id?: string
          id?: string
          issued_date?: string
          objectives_achieved?: string[] | null
          organization_id?: string
          pdf_url?: string | null
          sent_to_beneficiary?: boolean | null
          sent_to_funder?: boolean | null
          start_date?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "certifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      certifications: {
        Row: {
          blocks: Json | null
          certifier: string | null
          code: string
          created_at: string | null
          equivalences: string | null
          france_competences_url: string | null
          id: string
          level: number | null
          outcomes: string | null
          pathways: string | null
          registry: string
          title: string
          updated_at: string | null
          valid_until: string | null
        }
        Insert: {
          blocks?: Json | null
          certifier?: string | null
          code: string
          created_at?: string | null
          equivalences?: string | null
          france_competences_url?: string | null
          id?: string
          level?: number | null
          outcomes?: string | null
          pathways?: string | null
          registry: string
          title: string
          updated_at?: string | null
          valid_until?: string | null
        }
        Update: {
          blocks?: Json | null
          certifier?: string | null
          code?: string
          created_at?: string | null
          equivalences?: string | null
          france_competences_url?: string | null
          id?: string
          level?: number | null
          outcomes?: string | null
          pathways?: string | null
          registry?: string
          title?: string
          updated_at?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          address: Json | null
          created_at: string | null
          email: string | null
          id: string
          idcc: string | null
          is_client: boolean | null
          is_prospect: boolean | null
          naf_code: string | null
          name: string
          notes: string | null
          opco_id: string | null
          organization_id: string
          phone: string | null
          siren: string | null
          siret: string | null
          updated_at: string | null
          website: string | null
          workforce_size: number | null
        }
        Insert: {
          address?: Json | null
          created_at?: string | null
          email?: string | null
          id?: string
          idcc?: string | null
          is_client?: boolean | null
          is_prospect?: boolean | null
          naf_code?: string | null
          name: string
          notes?: string | null
          opco_id?: string | null
          organization_id: string
          phone?: string | null
          siren?: string | null
          siret?: string | null
          updated_at?: string | null
          website?: string | null
          workforce_size?: number | null
        }
        Update: {
          address?: Json | null
          created_at?: string | null
          email?: string | null
          id?: string
          idcc?: string | null
          is_client?: boolean | null
          is_prospect?: boolean | null
          naf_code?: string | null
          name?: string
          notes?: string | null
          opco_id?: string | null
          organization_id?: string
          phone?: string | null
          siren?: string | null
          siret?: string | null
          updated_at?: string | null
          website?: string | null
          workforce_size?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_opco_id_fkey"
            columns: ["opco_id"]
            isOneToOne: false
            referencedRelation: "opcos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          acknowledged_at: string | null
          assigned_to: string | null
          beneficiary_id: string | null
          category: string | null
          closed_at: string | null
          company_id: string | null
          complainant_name: string | null
          complainant_type: string | null
          created_at: string | null
          description: string
          id: string
          improvement_action_id: string | null
          organization_id: string
          reference: string
          resolution: string | null
          resolved_at: string | null
          root_cause: string | null
          session_id: string | null
          severity: Database["public"]["Enums"]["complaint_severity"] | null
          status: Database["public"]["Enums"]["complaint_status"] | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          assigned_to?: string | null
          beneficiary_id?: string | null
          category?: string | null
          closed_at?: string | null
          company_id?: string | null
          complainant_name?: string | null
          complainant_type?: string | null
          created_at?: string | null
          description: string
          id?: string
          improvement_action_id?: string | null
          organization_id: string
          reference: string
          resolution?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          session_id?: string | null
          severity?: Database["public"]["Enums"]["complaint_severity"] | null
          status?: Database["public"]["Enums"]["complaint_status"] | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          assigned_to?: string | null
          beneficiary_id?: string | null
          category?: string | null
          closed_at?: string | null
          company_id?: string | null
          complainant_name?: string | null
          complainant_type?: string | null
          created_at?: string | null
          description?: string
          id?: string
          improvement_action_id?: string | null
          organization_id?: string
          reference?: string
          resolution?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          session_id?: string | null
          severity?: Database["public"]["Enums"]["complaint_severity"] | null
          status?: Database["public"]["Enums"]["complaint_status"] | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "complaints_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_complaints_improvement"
            columns: ["improvement_action_id"]
            isOneToOne: false
            referencedRelation: "improvement_actions"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          company_id: string | null
          contact_type: string | null
          created_at: string | null
          email: string | null
          first_name: string
          id: string
          is_active: boolean | null
          job_title: string | null
          last_name: string
          notes: string | null
          organization_id: string
          phone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          contact_type?: string | null
          created_at?: string | null
          email?: string | null
          first_name: string
          id?: string
          is_active?: boolean | null
          job_title?: string | null
          last_name: string
          notes?: string | null
          organization_id: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          contact_type?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string
          id?: string
          is_active?: boolean | null
          job_title?: string | null
          last_name?: string
          notes?: string | null
          organization_id?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          beneficiary_id: string | null
          company_id: string | null
          created_at: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          enrollment_id: string | null
          file_size: number | null
          file_url: string
          funding_dossier_id: string | null
          id: string
          invoice_id: string | null
          is_signed: boolean | null
          mime_type: string | null
          notes: string | null
          organization_id: string
          session_id: string | null
          signed_at: string | null
          title: string
          trainer_id: string | null
          uploaded_by: string | null
          version: number | null
        }
        Insert: {
          beneficiary_id?: string | null
          company_id?: string | null
          created_at?: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          enrollment_id?: string | null
          file_size?: number | null
          file_url: string
          funding_dossier_id?: string | null
          id?: string
          invoice_id?: string | null
          is_signed?: boolean | null
          mime_type?: string | null
          notes?: string | null
          organization_id: string
          session_id?: string | null
          signed_at?: string | null
          title: string
          trainer_id?: string | null
          uploaded_by?: string | null
          version?: number | null
        }
        Update: {
          beneficiary_id?: string | null
          company_id?: string | null
          created_at?: string | null
          document_type?: Database["public"]["Enums"]["document_type"]
          enrollment_id?: string | null
          file_size?: number | null
          file_url?: string
          funding_dossier_id?: string | null
          id?: string
          invoice_id?: string | null
          is_signed?: boolean | null
          mime_type?: string | null
          notes?: string | null
          organization_id?: string
          session_id?: string | null
          signed_at?: string | null
          title?: string
          trainer_id?: string | null
          uploaded_by?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_funding_dossier_id_fkey"
            columns: ["funding_dossier_id"]
            isOneToOne: false
            referencedRelation: "funding_dossiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          beneficiary_id: string
          company_id: string | null
          completion_date: string | null
          contract_type: string | null
          convention_date: string | null
          convention_signed: boolean | null
          convocation_date: string | null
          convocation_sent: boolean | null
          created_at: string | null
          dropout_date: string | null
          dropout_reason: string | null
          enrollment_date: string | null
          id: string
          notes: string | null
          organization_id: string
          positioning_date: string | null
          positioning_done: boolean | null
          positioning_notes: string | null
          positioning_result: Json | null
          retraction_deadline: string | null
          rules_acknowledged: boolean | null
          session_id: string
          status: Database["public"]["Enums"]["inscription_status"] | null
          updated_at: string | null
          welcome_booklet_sent: boolean | null
        }
        Insert: {
          beneficiary_id: string
          company_id?: string | null
          completion_date?: string | null
          contract_type?: string | null
          convention_date?: string | null
          convention_signed?: boolean | null
          convocation_date?: string | null
          convocation_sent?: boolean | null
          created_at?: string | null
          dropout_date?: string | null
          dropout_reason?: string | null
          enrollment_date?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          positioning_date?: string | null
          positioning_done?: boolean | null
          positioning_notes?: string | null
          positioning_result?: Json | null
          retraction_deadline?: string | null
          rules_acknowledged?: boolean | null
          session_id: string
          status?: Database["public"]["Enums"]["inscription_status"] | null
          updated_at?: string | null
          welcome_booklet_sent?: boolean | null
        }
        Update: {
          beneficiary_id?: string
          company_id?: string | null
          completion_date?: string | null
          contract_type?: string | null
          convention_date?: string | null
          convention_signed?: boolean | null
          convocation_date?: string | null
          convocation_sent?: boolean | null
          created_at?: string | null
          dropout_date?: string | null
          dropout_reason?: string | null
          enrollment_date?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          positioning_date?: string | null
          positioning_done?: boolean | null
          positioning_notes?: string | null
          positioning_result?: Json | null
          retraction_deadline?: string | null
          rules_acknowledged?: boolean | null
          session_id?: string
          status?: Database["public"]["Enums"]["inscription_status"] | null
          updated_at?: string | null
          welcome_booklet_sent?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluation_responses: {
        Row: {
          answers: Json
          beneficiary_id: string | null
          created_at: string | null
          enrollment_id: string | null
          evaluation_id: string
          id: string
          is_anonymous: boolean | null
          respondent_name: string | null
          respondent_type: string | null
          score: number | null
          submitted_at: string | null
        }
        Insert: {
          answers?: Json
          beneficiary_id?: string | null
          created_at?: string | null
          enrollment_id?: string | null
          evaluation_id: string
          id?: string
          is_anonymous?: boolean | null
          respondent_name?: string | null
          respondent_type?: string | null
          score?: number | null
          submitted_at?: string | null
        }
        Update: {
          answers?: Json
          beneficiary_id?: string | null
          created_at?: string | null
          enrollment_id?: string | null
          evaluation_id?: string
          id?: string
          is_anonymous?: boolean | null
          respondent_name?: string | null
          respondent_type?: string | null
          score?: number | null
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_responses_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluation_responses_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluation_responses_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "evaluations"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          created_at: string | null
          created_by: string | null
          deadline_date: string | null
          description: string | null
          eval_type: Database["public"]["Enums"]["eval_type"]
          formation_id: string | null
          id: string
          is_active: boolean | null
          organization_id: string
          questions: Json
          scheduled_date: string | null
          session_id: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deadline_date?: string | null
          description?: string | null
          eval_type: Database["public"]["Enums"]["eval_type"]
          formation_id?: string | null
          id?: string
          is_active?: boolean | null
          organization_id: string
          questions?: Json
          scheduled_date?: string | null
          session_id?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deadline_date?: string | null
          description?: string | null
          eval_type?: Database["public"]["Enums"]["eval_type"]
          formation_id?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string
          questions?: Json
          scheduled_date?: string | null
          session_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_formation_id_fkey"
            columns: ["formation_id"]
            isOneToOne: false
            referencedRelation: "formations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      formation_versions: {
        Row: {
          change_reason: string | null
          created_at: string | null
          created_by: string | null
          formation_id: string
          id: string
          objectives: string[] | null
          program_content: Json
          version_number: number
        }
        Insert: {
          change_reason?: string | null
          created_at?: string | null
          created_by?: string | null
          formation_id: string
          id?: string
          objectives?: string[] | null
          program_content: Json
          version_number: number
        }
        Update: {
          change_reason?: string | null
          created_at?: string | null
          created_by?: string | null
          formation_id?: string
          id?: string
          objectives?: string[] | null
          program_content?: Json
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "formation_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formation_versions_formation_id_fkey"
            columns: ["formation_id"]
            isOneToOne: false
            referencedRelation: "formations"
            referencedColumns: ["id"]
          },
        ]
      }
      formations: {
        Row: {
          access_delay: string | null
          accessibility: string | null
          assessment_methods: string | null
          category: Database["public"]["Enums"]["action_category"]
          certification_id: string | null
          certification_mapping: Json | null
          code: string | null
          completion_rate: number | null
          created_at: string | null
          duration_days: number | null
          duration_hours: number | null
          id: string
          insertion_rate: number | null
          is_active: boolean | null
          is_cpf_eligible: boolean | null
          mcf_id: string | null
          modality: string | null
          objectives: string[] | null
          organization_id: string
          pedagogical_scenario: string | null
          prerequisites: string | null
          price_ht: number | null
          price_per_hour: number | null
          price_ttc: number | null
          program_content: Json | null
          published_at: string | null
          results_updated_at: string | null
          satisfaction_rate: number | null
          success_rate: number | null
          target_audience: string | null
          teaching_methods: string | null
          title: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          access_delay?: string | null
          accessibility?: string | null
          assessment_methods?: string | null
          category?: Database["public"]["Enums"]["action_category"]
          certification_id?: string | null
          certification_mapping?: Json | null
          code?: string | null
          completion_rate?: number | null
          created_at?: string | null
          duration_days?: number | null
          duration_hours?: number | null
          id?: string
          insertion_rate?: number | null
          is_active?: boolean | null
          is_cpf_eligible?: boolean | null
          mcf_id?: string | null
          modality?: string | null
          objectives?: string[] | null
          organization_id: string
          pedagogical_scenario?: string | null
          prerequisites?: string | null
          price_ht?: number | null
          price_per_hour?: number | null
          price_ttc?: number | null
          program_content?: Json | null
          published_at?: string | null
          results_updated_at?: string | null
          satisfaction_rate?: number | null
          success_rate?: number | null
          target_audience?: string | null
          teaching_methods?: string | null
          title: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          access_delay?: string | null
          accessibility?: string | null
          assessment_methods?: string | null
          category?: Database["public"]["Enums"]["action_category"]
          certification_id?: string | null
          certification_mapping?: Json | null
          code?: string | null
          completion_rate?: number | null
          created_at?: string | null
          duration_days?: number | null
          duration_hours?: number | null
          id?: string
          insertion_rate?: number | null
          is_active?: boolean | null
          is_cpf_eligible?: boolean | null
          mcf_id?: string | null
          modality?: string | null
          objectives?: string[] | null
          organization_id?: string
          pedagogical_scenario?: string | null
          prerequisites?: string | null
          price_ht?: number | null
          price_per_hour?: number | null
          price_ttc?: number | null
          program_content?: Json | null
          published_at?: string | null
          results_updated_at?: string | null
          satisfaction_rate?: number | null
          success_rate?: number | null
          target_audience?: string | null
          teaching_methods?: string | null
          title?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "formations_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "certifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "formations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      funding_dossiers: {
        Row: {
          amount_granted: number | null
          amount_paid: number | null
          amount_requested: number | null
          beneficiary_id: string | null
          company_id: string | null
          cpf_dossier_id: string | null
          cpf_reste_charge: number | null
          created_at: string | null
          deadline_date: string | null
          decision_date: string | null
          enrollment_id: string | null
          funder_name: string | null
          funder_reference: string | null
          funding_type: Database["public"]["Enums"]["funding_type"]
          id: string
          is_subrogation: boolean | null
          notes: string | null
          opco_id: string | null
          organization_id: string
          payment_date: string | null
          remainder_beneficiary: number | null
          remainder_company: number | null
          session_id: string | null
          status: Database["public"]["Enums"]["funding_status"] | null
          submitted_at: string | null
          updated_at: string | null
        }
        Insert: {
          amount_granted?: number | null
          amount_paid?: number | null
          amount_requested?: number | null
          beneficiary_id?: string | null
          company_id?: string | null
          cpf_dossier_id?: string | null
          cpf_reste_charge?: number | null
          created_at?: string | null
          deadline_date?: string | null
          decision_date?: string | null
          enrollment_id?: string | null
          funder_name?: string | null
          funder_reference?: string | null
          funding_type: Database["public"]["Enums"]["funding_type"]
          id?: string
          is_subrogation?: boolean | null
          notes?: string | null
          opco_id?: string | null
          organization_id: string
          payment_date?: string | null
          remainder_beneficiary?: number | null
          remainder_company?: number | null
          session_id?: string | null
          status?: Database["public"]["Enums"]["funding_status"] | null
          submitted_at?: string | null
          updated_at?: string | null
        }
        Update: {
          amount_granted?: number | null
          amount_paid?: number | null
          amount_requested?: number | null
          beneficiary_id?: string | null
          company_id?: string | null
          cpf_dossier_id?: string | null
          cpf_reste_charge?: number | null
          created_at?: string | null
          deadline_date?: string | null
          decision_date?: string | null
          enrollment_id?: string | null
          funder_name?: string | null
          funder_reference?: string | null
          funding_type?: Database["public"]["Enums"]["funding_type"]
          id?: string
          is_subrogation?: boolean | null
          notes?: string | null
          opco_id?: string | null
          organization_id?: string
          payment_date?: string | null
          remainder_beneficiary?: number | null
          remainder_company?: number | null
          session_id?: string | null
          status?: Database["public"]["Enums"]["funding_status"] | null
          submitted_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funding_dossiers_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funding_dossiers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funding_dossiers_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funding_dossiers_opco_id_fkey"
            columns: ["opco_id"]
            isOneToOne: false
            referencedRelation: "opcos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funding_dossiers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "funding_dossiers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      improvement_actions: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          indicator_after: string | null
          indicator_before: string | null
          notes: string | null
          organization_id: string
          priority: string | null
          qualiopi_indicators: number[] | null
          reference: string
          source_id: string | null
          source_type: string | null
          status: Database["public"]["Enums"]["improvement_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          indicator_after?: string | null
          indicator_before?: string | null
          notes?: string | null
          organization_id: string
          priority?: string | null
          qualiopi_indicators?: number[] | null
          reference: string
          source_id?: string | null
          source_type?: string | null
          status?: Database["public"]["Enums"]["improvement_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          indicator_after?: string | null
          indicator_before?: string | null
          notes?: string | null
          organization_id?: string
          priority?: string | null
          qualiopi_indicators?: number[] | null
          reference?: string
          source_id?: string | null
          source_type?: string | null
          status?: Database["public"]["Enums"]["improvement_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "improvement_actions_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "improvement_actions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      individual_adaptations: {
        Row: {
          adaptation_type: string
          created_at: string | null
          description: string
          enrollment_id: string
          id: string
          implemented_at: string | null
          implemented_by: string | null
          notes: string | null
        }
        Insert: {
          adaptation_type: string
          created_at?: string | null
          description: string
          enrollment_id: string
          id?: string
          implemented_at?: string | null
          implemented_by?: string | null
          notes?: string | null
        }
        Update: {
          adaptation_type?: string
          created_at?: string | null
          description?: string
          enrollment_id?: string
          id?: string
          implemented_at?: string | null
          implemented_by?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "individual_adaptations_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "individual_adaptations_implemented_by_fkey"
            columns: ["implemented_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      interactions: {
        Row: {
          company_id: string | null
          contact_id: string | null
          content: string | null
          created_at: string | null
          id: string
          interaction_date: string | null
          interaction_type: string
          opportunity_id: string | null
          organization_id: string
          performed_by: string | null
          subject: string | null
        }
        Insert: {
          company_id?: string | null
          contact_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          interaction_date?: string | null
          interaction_type: string
          opportunity_id?: string | null
          organization_id: string
          performed_by?: string | null
          subject?: string | null
        }
        Update: {
          company_id?: string | null
          contact_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          interaction_date?: string | null
          interaction_type?: string
          opportunity_id?: string | null
          organization_id?: string
          performed_by?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interactions_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_lines: {
        Row: {
          created_at: string | null
          description: string
          formation_id: string | null
          id: string
          invoice_id: string
          line_order: number | null
          quantity: number
          total_ht: number
          unit_price_ht: number
        }
        Insert: {
          created_at?: string | null
          description: string
          formation_id?: string | null
          id?: string
          invoice_id: string
          line_order?: number | null
          quantity?: number
          total_ht: number
          unit_price_ht: number
        }
        Update: {
          created_at?: string | null
          description?: string
          formation_id?: string | null
          id?: string
          invoice_id?: string
          line_order?: number | null
          quantity?: number
          total_ht?: number
          unit_price_ht?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_lines_formation_id_fkey"
            columns: ["formation_id"]
            isOneToOne: false
            referencedRelation: "formations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_lines_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid: number | null
          beneficiary_id: string | null
          company_id: string | null
          created_at: string | null
          due_date: string
          funding_dossier_id: string | null
          id: string
          invoice_number: string
          invoice_type: string | null
          issue_date: string
          nda_mention: string | null
          notes: string | null
          organization_id: string
          payment_date: string | null
          payment_schedule: Json | null
          pdf_url: string | null
          recipient_address: Json | null
          recipient_name: string
          session_id: string | null
          status: Database["public"]["Enums"]["invoice_status"] | null
          total_ht: number
          total_ttc: number
          tva_amount: number | null
          tva_mention: string | null
          tva_rate: number | null
          updated_at: string | null
        }
        Insert: {
          amount_paid?: number | null
          beneficiary_id?: string | null
          company_id?: string | null
          created_at?: string | null
          due_date: string
          funding_dossier_id?: string | null
          id?: string
          invoice_number: string
          invoice_type?: string | null
          issue_date: string
          nda_mention?: string | null
          notes?: string | null
          organization_id: string
          payment_date?: string | null
          payment_schedule?: Json | null
          pdf_url?: string | null
          recipient_address?: Json | null
          recipient_name: string
          session_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          total_ht: number
          total_ttc: number
          tva_amount?: number | null
          tva_mention?: string | null
          tva_rate?: number | null
          updated_at?: string | null
        }
        Update: {
          amount_paid?: number | null
          beneficiary_id?: string | null
          company_id?: string | null
          created_at?: string | null
          due_date?: string
          funding_dossier_id?: string | null
          id?: string
          invoice_number?: string
          invoice_type?: string | null
          issue_date?: string
          nda_mention?: string | null
          notes?: string | null
          organization_id?: string
          payment_date?: string | null
          payment_schedule?: Json | null
          pdf_url?: string | null
          recipient_address?: Json | null
          recipient_name?: string
          session_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          total_ht?: number
          total_ttc?: number
          tva_amount?: number | null
          tva_mention?: string | null
          tva_rate?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_funding_dossier_id_fkey"
            columns: ["funding_dossier_id"]
            isOneToOne: false
            referencedRelation: "funding_dossiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: Json | null
          capacity: number | null
          created_at: string | null
          equipment: string[] | null
          id: string
          is_accessible: boolean | null
          is_active: boolean | null
          is_erp: boolean | null
          name: string
          notes: string | null
          organization_id: string
        }
        Insert: {
          address?: Json | null
          capacity?: number | null
          created_at?: string | null
          equipment?: string[] | null
          id?: string
          is_accessible?: boolean | null
          is_active?: boolean | null
          is_erp?: boolean | null
          name: string
          notes?: string | null
          organization_id: string
        }
        Update: {
          address?: Json | null
          capacity?: number | null
          created_at?: string | null
          equipment?: string[] | null
          id?: string
          is_accessible?: boolean | null
          is_active?: boolean | null
          is_erp?: boolean | null
          name?: string
          notes?: string | null
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      opcos: {
        Row: {
          code: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          name: string
          notes: string | null
          portal_url: string | null
          website: string | null
        }
        Insert: {
          code: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          portal_url?: string | null
          website?: string | null
        }
        Update: {
          code?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          portal_url?: string | null
          website?: string | null
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          amount: number | null
          assigned_to: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string | null
          description: string | null
          expected_close: string | null
          id: string
          lost_reason: string | null
          organization_id: string
          probability: number | null
          source: string | null
          stage: Database["public"]["Enums"]["pipeline_stage"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          assigned_to?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          description?: string | null
          expected_close?: string | null
          id?: string
          lost_reason?: string | null
          organization_id: string
          probability?: number | null
          source?: string | null
          stage?: Database["public"]["Enums"]["pipeline_stage"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          assigned_to?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          description?: string | null
          expected_close?: string | null
          id?: string
          lost_reason?: string | null
          organization_id?: string
          probability?: number | null
          source?: string | null
          stage?: Database["public"]["Enums"]["pipeline_stage"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: Json | null
          created_at: string | null
          email: string | null
          id: string
          legal_form: string | null
          logo_url: string | null
          name: string
          nda: string | null
          nda_valid_until: string | null
          phone: string | null
          qualiopi: boolean | null
          qualiopi_categories:
            | Database["public"]["Enums"]["action_category"][]
            | null
          qualiopi_valid_until: string | null
          settings: Json | null
          siret: string
          tva_exempt: boolean | null
          tva_number: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: Json | null
          created_at?: string | null
          email?: string | null
          id?: string
          legal_form?: string | null
          logo_url?: string | null
          name: string
          nda?: string | null
          nda_valid_until?: string | null
          phone?: string | null
          qualiopi?: boolean | null
          qualiopi_categories?:
            | Database["public"]["Enums"]["action_category"][]
            | null
          qualiopi_valid_until?: string | null
          settings?: Json | null
          siret: string
          tva_exempt?: boolean | null
          tva_number?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: Json | null
          created_at?: string | null
          email?: string | null
          id?: string
          legal_form?: string | null
          logo_url?: string | null
          name?: string
          nda?: string | null
          nda_valid_until?: string | null
          phone?: string | null
          qualiopi?: boolean | null
          qualiopi_categories?:
            | Database["public"]["Enums"]["action_category"][]
            | null
          qualiopi_valid_until?: string | null
          settings?: Json | null
          siret?: string
          tva_exempt?: boolean | null
          tva_number?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      payment_reminders: {
        Row: {
          channel: string | null
          created_at: string | null
          id: string
          invoice_id: string
          notes: string | null
          reminder_level: number
          sent_at: string
          sent_by: string | null
        }
        Insert: {
          channel?: string | null
          created_at?: string | null
          id?: string
          invoice_id: string
          notes?: string | null
          reminder_level: number
          sent_at: string
          sent_by?: string | null
        }
        Update: {
          channel?: string | null
          created_at?: string | null
          id?: string
          invoice_id?: string
          notes?: string | null
          reminder_level?: number
          sent_at?: string
          sent_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_reminders_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_reminders_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          invoice_id: string
          notes: string | null
          organization_id: string
          payer_name: string | null
          payment_date: string
          payment_method: string | null
          reference: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          invoice_id: string
          notes?: string | null
          organization_id: string
          payer_name?: string | null
          payment_date: string
          payment_method?: string | null
          reference?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          invoice_id?: string
          notes?: string | null
          organization_id?: string
          payer_name?: string | null
          payment_date?: string
          payment_method?: string | null
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      pedagogical_resources: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          file_url: string | null
          formation_id: string | null
          id: string
          is_public: boolean | null
          organization_id: string
          resource_type: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          file_url?: string | null
          formation_id?: string | null
          id?: string
          is_public?: boolean | null
          organization_id: string
          resource_type?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          file_url?: string | null
          formation_id?: string | null
          id?: string
          is_public?: boolean | null
          organization_id?: string
          resource_type?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pedagogical_resources_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedagogical_resources_formation_id_fkey"
            columns: ["formation_id"]
            isOneToOne: false
            referencedRelation: "formations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedagogical_resources_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_interviews: {
        Row: {
          created_at: string | null
          document_url: string | null
          id: string
          interview_date: string
          interviewer_id: string | null
          next_interview: string | null
          objectives: string[] | null
          organization_id: string
          profile_id: string
          summary: string | null
          training_needs: string[] | null
        }
        Insert: {
          created_at?: string | null
          document_url?: string | null
          id?: string
          interview_date: string
          interviewer_id?: string | null
          next_interview?: string | null
          objectives?: string[] | null
          organization_id: string
          profile_id: string
          summary?: string | null
          training_needs?: string[] | null
        }
        Update: {
          created_at?: string | null
          document_url?: string | null
          id?: string
          interview_date?: string
          interviewer_id?: string | null
          next_interview?: string | null
          objectives?: string[] | null
          organization_id?: string
          profile_id?: string
          summary?: string | null
          training_needs?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_interviews_interviewer_id_fkey"
            columns: ["interviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_interviews_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_interviews_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          first_name: string
          id: string
          is_active: boolean | null
          is_referent_handicap: boolean | null
          is_referent_mobilite: boolean | null
          job_title: string | null
          last_login_at: string | null
          last_name: string
          organization_id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          first_name: string
          id: string
          is_active?: boolean | null
          is_referent_handicap?: boolean | null
          is_referent_mobilite?: boolean | null
          job_title?: string | null
          last_login_at?: string | null
          last_name: string
          organization_id: string
          phone?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean | null
          is_referent_handicap?: boolean | null
          is_referent_mobilite?: boolean | null
          job_title?: string | null
          last_login_at?: string | null
          last_name?: string
          organization_id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      qualiopi_evidence: {
        Row: {
          audit_type: string | null
          created_at: string | null
          description: string | null
          document_id: string | null
          evidence_url: string | null
          id: string
          indicator_number: number
          notes: string | null
          organization_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          audit_type?: string | null
          created_at?: string | null
          description?: string | null
          document_id?: string | null
          evidence_url?: string | null
          id?: string
          indicator_number: number
          notes?: string | null
          organization_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          audit_type?: string | null
          created_at?: string | null
          description?: string | null
          document_id?: string | null
          evidence_url?: string | null
          id?: string
          indicator_number?: number
          notes?: string | null
          organization_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qualiopi_evidence_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qualiopi_evidence_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qualiopi_evidence_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quality_reviews: {
        Row: {
          created_at: string | null
          created_by: string | null
          decisions: Json | null
          findings: Json | null
          id: string
          minutes_url: string | null
          organization_id: string
          participants: string[] | null
          review_date: string
          summary: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          decisions?: Json | null
          findings?: Json | null
          id?: string
          minutes_url?: string | null
          organization_id: string
          participants?: string[] | null
          review_date: string
          summary?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          decisions?: Json | null
          findings?: Json | null
          id?: string
          minutes_url?: string | null
          organization_id?: string
          participants?: string[] | null
          review_date?: string
          summary?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "quality_reviews_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_reviews_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      session_slots: {
        Row: {
          created_at: string | null
          end_time: string
          id: string
          location_id: string | null
          period: string | null
          session_id: string
          slot_date: string
          start_time: string
          topic: string | null
          trainer_id: string | null
        }
        Insert: {
          created_at?: string | null
          end_time: string
          id?: string
          location_id?: string | null
          period?: string | null
          session_id: string
          slot_date: string
          start_time: string
          topic?: string | null
          trainer_id?: string | null
        }
        Update: {
          created_at?: string | null
          end_time?: string
          id?: string
          location_id?: string | null
          period?: string | null
          session_id?: string
          slot_date?: string
          start_time?: string
          topic?: string | null
          trainer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_slots_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_slots_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_slots_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          alternance_calendar: Json | null
          code: string | null
          coordinator_id: string | null
          created_at: string | null
          end_date: string
          formation_id: string
          id: string
          is_remote: boolean | null
          location_id: string | null
          max_participants: number | null
          min_participants: number | null
          notes: string | null
          organization_id: string
          remote_url: string | null
          start_date: string
          status: Database["public"]["Enums"]["session_status"] | null
          trainer_id: string | null
          updated_at: string | null
        }
        Insert: {
          alternance_calendar?: Json | null
          code?: string | null
          coordinator_id?: string | null
          created_at?: string | null
          end_date: string
          formation_id: string
          id?: string
          is_remote?: boolean | null
          location_id?: string | null
          max_participants?: number | null
          min_participants?: number | null
          notes?: string | null
          organization_id: string
          remote_url?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["session_status"] | null
          trainer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          alternance_calendar?: Json | null
          code?: string | null
          coordinator_id?: string | null
          created_at?: string | null
          end_date?: string
          formation_id?: string
          id?: string
          is_remote?: boolean | null
          location_id?: string | null
          max_participants?: number | null
          min_participants?: number | null
          notes?: string | null
          organization_id?: string
          remote_url?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["session_status"] | null
          trainer_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_coordinator_id_fkey"
            columns: ["coordinator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_formation_id_fkey"
            columns: ["formation_id"]
            isOneToOne: false
            referencedRelation: "formations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_training: {
        Row: {
          certificate_url: string | null
          cost: number | null
          created_at: string | null
          description: string | null
          duration_hours: number | null
          end_date: string | null
          id: string
          notes: string | null
          organization_id: string
          profile_id: string
          provider: string | null
          start_date: string | null
          title: string
          training_type: string | null
        }
        Insert: {
          certificate_url?: string | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          end_date?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          profile_id: string
          provider?: string | null
          start_date?: string | null
          title: string
          training_type?: string | null
        }
        Update: {
          certificate_url?: string | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          end_date?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          profile_id?: string
          provider?: string | null
          start_date?: string | null
          title?: string
          training_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_training_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_training_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subcontractors: {
        Row: {
          company_id: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contract_end: string | null
          contract_start: string | null
          contract_url: string | null
          created_at: string | null
          has_quality_charter: boolean | null
          id: string
          is_active: boolean | null
          last_evaluation_date: string | null
          last_evaluation_score: number | null
          name: string
          notes: string | null
          organization_id: string
          quality_charter_url: string | null
          siret: string | null
          specialties: string[] | null
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contract_end?: string | null
          contract_start?: string | null
          contract_url?: string | null
          created_at?: string | null
          has_quality_charter?: boolean | null
          id?: string
          is_active?: boolean | null
          last_evaluation_date?: string | null
          last_evaluation_score?: number | null
          name: string
          notes?: string | null
          organization_id: string
          quality_charter_url?: string | null
          siret?: string | null
          specialties?: string[] | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contract_end?: string | null
          contract_start?: string | null
          contract_url?: string | null
          created_at?: string | null
          has_quality_charter?: boolean | null
          id?: string
          is_active?: boolean | null
          last_evaluation_date?: string | null
          last_evaluation_score?: number | null
          name?: string
          notes?: string | null
          organization_id?: string
          quality_charter_url?: string | null
          siret?: string | null
          specialties?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subcontractors_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subcontractors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_competencies: {
        Row: {
          formation_id: string
          id: string
          notes: string | null
          trainer_id: string
          validated: boolean | null
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          formation_id: string
          id?: string
          notes?: string | null
          trainer_id: string
          validated?: boolean | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          formation_id?: string
          id?: string
          notes?: string | null
          trainer_id?: string
          validated?: boolean | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trainer_competencies_formation_id_fkey"
            columns: ["formation_id"]
            isOneToOne: false
            referencedRelation: "formations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_competencies_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_competencies_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trainers: {
        Row: {
          bio: string | null
          company_id: string | null
          created_at: string | null
          cv_updated_at: string | null
          cv_url: string | null
          daily_rate: number | null
          email: string | null
          first_name: string
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          is_internal: boolean | null
          last_name: string
          organization_id: string
          phone: string | null
          profile_id: string | null
          qualifications: Json | null
          specialties: string[] | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          company_id?: string | null
          created_at?: string | null
          cv_updated_at?: string | null
          cv_url?: string | null
          daily_rate?: number | null
          email?: string | null
          first_name: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          is_internal?: boolean | null
          last_name: string
          organization_id: string
          phone?: string | null
          profile_id?: string | null
          qualifications?: Json | null
          specialties?: string[] | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          company_id?: string | null
          created_at?: string | null
          cv_updated_at?: string | null
          cv_url?: string | null
          daily_rate?: number | null
          email?: string | null
          first_name?: string
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          is_internal?: boolean | null
          last_name?: string
          organization_id?: string
          phone?: string | null
          profile_id?: string | null
          qualifications?: Json | null
          specialties?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trainers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      watch_entries: {
        Row: {
          action_taken: string | null
          category: Database["public"]["Enums"]["watch_category"]
          content: string | null
          created_at: string | null
          id: string
          impact: string | null
          organization_id: string
          qualiopi_indicators: number[] | null
          recorded_at: string | null
          recorded_by: string | null
          source: string | null
          source_url: string | null
          title: string
        }
        Insert: {
          action_taken?: string | null
          category: Database["public"]["Enums"]["watch_category"]
          content?: string | null
          created_at?: string | null
          id?: string
          impact?: string | null
          organization_id: string
          qualiopi_indicators?: number[] | null
          recorded_at?: string | null
          recorded_by?: string | null
          source?: string | null
          source_url?: string | null
          title: string
        }
        Update: {
          action_taken?: string | null
          category?: Database["public"]["Enums"]["watch_category"]
          content?: string | null
          created_at?: string | null
          id?: string
          impact?: string | null
          organization_id?: string
          qualiopi_indicators?: number[] | null
          recorded_at?: string | null
          recorded_by?: string | null
          source?: string | null
          source_url?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "watch_entries_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      organization_id: { Args: never; Returns: string }
      user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      action_category: "af" | "bc" | "vae" | "cfa"
      complaint_severity: "faible" | "moyenne" | "haute" | "critique"
      complaint_status: "ouvert" | "en_cours" | "resolu" | "clos"
      document_type:
        | "convention"
        | "contrat_formation"
        | "devis"
        | "programme"
        | "cgv"
        | "reglement_interieur"
        | "livret_accueil"
        | "emargement"
        | "attestation_fin"
        | "certificat_realisation"
        | "facture"
        | "avoir"
        | "cv_formateur"
        | "diplome"
        | "accord_prise_en_charge"
        | "bpf"
        | "autre"
      eval_type:
        | "positionnement"
        | "formative"
        | "sommative"
        | "satisfaction_chaud"
        | "satisfaction_froid"
        | "insertion_3m"
        | "insertion_6m"
        | "insertion_12m"
      funding_status:
        | "brouillon"
        | "depose"
        | "en_instruction"
        | "accorde"
        | "refuse"
        | "annule"
        | "realise"
        | "paye"
      funding_type:
        | "cpf"
        | "opco_plan"
        | "opco_apprentissage"
        | "opco_pro"
        | "france_travail_aif"
        | "france_travail_poei"
        | "france_travail_poec"
        | "france_travail_afc"
        | "france_travail_afpr"
        | "agefiph"
        | "fiphfp"
        | "fne"
        | "ptp"
        | "region"
        | "plan_entreprise"
        | "autofinancement"
        | "mixte"
      improvement_status: "planifie" | "en_cours" | "realise" | "abandonne"
      inscription_status:
        | "pre_inscrit"
        | "en_attente_financement"
        | "confirme"
        | "en_formation"
        | "abandonne"
        | "termine"
        | "annule"
      invoice_status:
        | "brouillon"
        | "emise"
        | "envoyee"
        | "payee_partiellement"
        | "payee"
        | "en_retard"
        | "contentieux"
        | "avoir"
      pipeline_stage:
        | "prospect"
        | "qualification"
        | "proposition"
        | "negociation"
        | "gagne"
        | "perdu"
        | "abandonne"
      session_status:
        | "planifiee"
        | "confirmee"
        | "en_cours"
        | "terminee"
        | "annulee"
      user_role:
        | "admin_of"
        | "gestionnaire"
        | "commercial"
        | "formateur"
        | "apprenant"
        | "apprenti"
        | "entreprise"
        | "financeur"
      watch_category: "legale" | "metiers" | "pedagogique" | "technologique"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      action_category: ["af", "bc", "vae", "cfa"],
      complaint_severity: ["faible", "moyenne", "haute", "critique"],
      complaint_status: ["ouvert", "en_cours", "resolu", "clos"],
      document_type: [
        "convention",
        "contrat_formation",
        "devis",
        "programme",
        "cgv",
        "reglement_interieur",
        "livret_accueil",
        "emargement",
        "attestation_fin",
        "certificat_realisation",
        "facture",
        "avoir",
        "cv_formateur",
        "diplome",
        "accord_prise_en_charge",
        "bpf",
        "autre",
      ],
      eval_type: [
        "positionnement",
        "formative",
        "sommative",
        "satisfaction_chaud",
        "satisfaction_froid",
        "insertion_3m",
        "insertion_6m",
        "insertion_12m",
      ],
      funding_status: [
        "brouillon",
        "depose",
        "en_instruction",
        "accorde",
        "refuse",
        "annule",
        "realise",
        "paye",
      ],
      funding_type: [
        "cpf",
        "opco_plan",
        "opco_apprentissage",
        "opco_pro",
        "france_travail_aif",
        "france_travail_poei",
        "france_travail_poec",
        "france_travail_afc",
        "france_travail_afpr",
        "agefiph",
        "fiphfp",
        "fne",
        "ptp",
        "region",
        "plan_entreprise",
        "autofinancement",
        "mixte",
      ],
      improvement_status: ["planifie", "en_cours", "realise", "abandonne"],
      inscription_status: [
        "pre_inscrit",
        "en_attente_financement",
        "confirme",
        "en_formation",
        "abandonne",
        "termine",
        "annule",
      ],
      invoice_status: [
        "brouillon",
        "emise",
        "envoyee",
        "payee_partiellement",
        "payee",
        "en_retard",
        "contentieux",
        "avoir",
      ],
      pipeline_stage: [
        "prospect",
        "qualification",
        "proposition",
        "negociation",
        "gagne",
        "perdu",
        "abandonne",
      ],
      session_status: [
        "planifiee",
        "confirmee",
        "en_cours",
        "terminee",
        "annulee",
      ],
      user_role: [
        "admin_of",
        "gestionnaire",
        "commercial",
        "formateur",
        "apprenant",
        "apprenti",
        "entreprise",
        "financeur",
      ],
      watch_category: ["legale", "metiers", "pedagogique", "technologique"],
    },
  },
} as const
