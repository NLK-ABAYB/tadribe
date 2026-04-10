-- ============================================================
-- REGLES RLS (Row Level Security) -- Supabase
-- 5 roles : admin_of, formateur, apprenant, apprenti, entreprise
-- ============================================================

-- Principe fondamental : ISOLATION PAR ORGANISATION (multi-tenant)
-- Chaque utilisateur ne voit que les donnees de son organization_id.
-- A l'interieur de l'organisation, les droits varient selon le role.

-- ===================== FONCTIONS HELPER =====================

-- Retourne l'organization_id de l'utilisateur connecte
CREATE OR REPLACE FUNCTION auth.organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Retourne le role de l'utilisateur connecte
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Verifie si l'utilisateur est staff (admin, gestionnaire, commercial)
CREATE OR REPLACE FUNCTION auth.is_staff()
RETURNS BOOLEAN AS $$
  SELECT role IN ('admin_of', 'gestionnaire', 'commercial')
  FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Verifie si l'utilisateur est admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
  SELECT role = 'admin_of'
  FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ===================== MATRICE DES DROITS =====================
--
-- Table               | admin_of | gestionnaire | commercial | formateur     | apprenant      | entreprise
-- --------------------|----------|--------------|------------|---------------|----------------|------------
-- organizations       | RW       | R            | R          | R             | R              | R
-- profiles            | CRUD     | R            | R          | R (soi)       | R (soi)        | R (soi)
-- companies           | CRUD     | CRUD         | CRUD       | R (ses sessions)| --           | R (la sienne)
-- contacts            | CRUD     | CRUD         | CRUD       | R             | --             | R (les siens)
-- opportunities       | CRUD     | CRUD         | CRUD       | --            | --             | --
-- interactions        | CRUD     | CRUD         | CRUD       | --            | --             | --
-- formations          | CRUD     | CRUD         | R          | R (les siennes)| R (ses inscr) | R
-- sessions            | CRUD     | CRUD         | R          | R (les siennes)| R (ses inscr) | R (ses salaries)
-- session_slots       | CRUD     | CRUD         | R          | R (ses sessions)| R (ses inscr)| --
-- beneficiaries       | CRUD     | CRUD         | R          | R (ses sessions)| R (soi)      | R (ses salaries)
-- enrollments         | CRUD     | CRUD         | CRUD       | R (ses sessions)| R (les siennes)| R (ses salaries)
-- attendances         | CRUD     | CRUD         | --         | RW (ses sessions)| R (les siennes)| --
-- funding_dossiers    | CRUD     | CRUD         | CRUD       | R (ses sessions)| R (les siens)| R (les siens)
-- invoices            | CRUD     | CRUD         | R          | --            | R (les siennes)| R (les siennes)
-- invoice_lines       | CRUD     | CRUD         | R          | --            | --             | R
-- payments            | CRUD     | CRUD         | R          | --            | --             | R
-- documents           | CRUD     | CRUD         | R          | R (ses sessions)| R (les siens)| R (les siens)
-- evaluations         | CRUD     | CRUD         | R          | R (ses sessions)| R             | R
-- evaluation_responses| CRUD     | CRUD         | R          | R             | CRU (les siennes)| CRU
-- certificates        | CRUD     | CRUD         | R          | R             | R (les siens) | R
-- complaints          | CRUD     | CRUD         | R          | CR            | CR             | CR
-- improvement_actions | CRUD     | CRUD         | R          | R             | --             | --
-- watch_entries       | CRUD     | CRUD         | R          | R             | --             | --
-- trainers            | CRUD     | CRUD         | R          | R (soi)       | --             | --
-- subcontractors      | CRUD     | CRUD         | R          | --            | --             | --
-- qualiopi_evidence   | CRUD     | CRUD         | R          | R             | --             | --

-- ===================== ACTIVATION RLS =====================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE formation_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_adaptations ENABLE ROW LEVEL SECURITY;
ALTER TABLE funding_dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE improvement_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE qualiopi_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcontractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE apprentice_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedagogical_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE opcos ENABLE ROW LEVEL SECURITY;

-- ===================== POLICIES =====================

-- =====================================================================
-- ORGANIZATIONS
-- =====================================================================
-- Tous les utilisateurs authentifies voient leur organisation
CREATE POLICY "org_select_own"
  ON organizations FOR SELECT
  USING (id = auth.organization_id());

-- Seul admin peut modifier
CREATE POLICY "org_update_admin"
  ON organizations FOR UPDATE
  USING (id = auth.organization_id() AND auth.is_admin());

-- =====================================================================
-- PROFILES
-- =====================================================================
-- Tout le monde dans l'org peut voir les profils
CREATE POLICY "profiles_select_org"
  ON profiles FOR SELECT
  USING (organization_id = auth.organization_id());

-- Chacun peut modifier son propre profil
CREATE POLICY "profiles_update_self"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Admin peut gerer tous les profils de l'org
CREATE POLICY "profiles_admin_all"
  ON profiles FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_admin());

-- =====================================================================
-- COMPANIES
-- =====================================================================
-- Staff voit toutes les entreprises de l'org
CREATE POLICY "companies_select_staff"
  ON companies FOR SELECT
  USING (organization_id = auth.organization_id() AND auth.is_staff());

-- Entreprise voit sa propre fiche
CREATE POLICY "companies_select_own"
  ON companies FOR SELECT
  USING (
    organization_id = auth.organization_id()
    AND auth.user_role() = 'entreprise'
    AND id IN (
      SELECT company_id FROM contacts WHERE user_id = auth.uid()
    )
  );

-- Formateur voit les entreprises de ses sessions
CREATE POLICY "companies_select_trainer"
  ON companies FOR SELECT
  USING (
    organization_id = auth.organization_id()
    AND auth.user_role() = 'formateur'
    AND id IN (
      SELECT DISTINCT e.company_id FROM enrollments e
      JOIN sessions s ON s.id = e.session_id
      JOIN trainers t ON t.id = s.trainer_id
      WHERE t.profile_id = auth.uid() AND e.company_id IS NOT NULL
    )
  );

-- Staff peut creer/modifier/supprimer
CREATE POLICY "companies_modify_staff"
  ON companies FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_staff());

-- =====================================================================
-- CONTACTS
-- =====================================================================
CREATE POLICY "contacts_select_staff"
  ON contacts FOR SELECT
  USING (organization_id = auth.organization_id() AND auth.is_staff());

CREATE POLICY "contacts_modify_staff"
  ON contacts FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_staff());

-- Entreprise voit ses propres contacts
CREATE POLICY "contacts_select_company"
  ON contacts FOR SELECT
  USING (
    organization_id = auth.organization_id()
    AND auth.user_role() = 'entreprise'
    AND company_id IN (
      SELECT company_id FROM contacts WHERE user_id = auth.uid()
    )
  );

-- =====================================================================
-- OPPORTUNITIES & INTERACTIONS (staff uniquement)
-- =====================================================================
CREATE POLICY "opportunities_staff"
  ON opportunities FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_staff());

CREATE POLICY "interactions_staff"
  ON interactions FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_staff());

-- =====================================================================
-- FORMATIONS
-- =====================================================================
-- Staff : acces complet
CREATE POLICY "formations_staff"
  ON formations FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_staff());

-- Formateur : lecture des formations qu'il delivre
CREATE POLICY "formations_trainer_select"
  ON formations FOR SELECT
  USING (
    organization_id = auth.organization_id()
    AND auth.user_role() = 'formateur'
    AND id IN (
      SELECT formation_id FROM sessions s
      JOIN trainers t ON t.id = s.trainer_id
      WHERE t.profile_id = auth.uid()
    )
  );

-- Apprenant/apprenti : lecture de ses formations inscrites
CREATE POLICY "formations_learner_select"
  ON formations FOR SELECT
  USING (
    organization_id = auth.organization_id()
    AND auth.user_role() IN ('apprenant', 'apprenti')
    AND id IN (
      SELECT s.formation_id FROM sessions s
      JOIN enrollments e ON e.session_id = s.id
      JOIN beneficiaries b ON b.id = e.beneficiary_id
      WHERE b.profile_id = auth.uid()
    )
  );

-- Entreprise : lecture des formations de ses salaries
CREATE POLICY "formations_company_select"
  ON formations FOR SELECT
  USING (
    organization_id = auth.organization_id()
    AND auth.user_role() = 'entreprise'
    AND id IN (
      SELECT s.formation_id FROM sessions s
      JOIN enrollments e ON e.session_id = s.id
      JOIN beneficiaries b ON b.id = e.beneficiary_id
      JOIN contacts c ON c.company_id = b.company_id
      WHERE c.user_id = auth.uid()
    )
  );

-- =====================================================================
-- SESSIONS
-- =====================================================================
CREATE POLICY "sessions_staff"
  ON sessions FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_staff());

CREATE POLICY "sessions_trainer_select"
  ON sessions FOR SELECT
  USING (
    organization_id = auth.organization_id()
    AND auth.user_role() = 'formateur'
    AND trainer_id IN (SELECT id FROM trainers WHERE profile_id = auth.uid())
  );

CREATE POLICY "sessions_learner_select"
  ON sessions FOR SELECT
  USING (
    organization_id = auth.organization_id()
    AND auth.user_role() IN ('apprenant', 'apprenti')
    AND id IN (
      SELECT session_id FROM enrollments e
      JOIN beneficiaries b ON b.id = e.beneficiary_id
      WHERE b.profile_id = auth.uid()
    )
  );

-- =====================================================================
-- ENROLLMENTS
-- =====================================================================
CREATE POLICY "enrollments_staff"
  ON enrollments FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_staff());

CREATE POLICY "enrollments_trainer_select"
  ON enrollments FOR SELECT
  USING (
    organization_id = auth.organization_id()
    AND auth.user_role() = 'formateur'
    AND session_id IN (
      SELECT id FROM sessions s
      JOIN trainers t ON t.id = s.trainer_id
      WHERE t.profile_id = auth.uid()
    )
  );

CREATE POLICY "enrollments_learner_select"
  ON enrollments FOR SELECT
  USING (
    organization_id = auth.organization_id()
    AND auth.user_role() IN ('apprenant', 'apprenti')
    AND beneficiary_id IN (
      SELECT id FROM beneficiaries WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "enrollments_company_select"
  ON enrollments FOR SELECT
  USING (
    organization_id = auth.organization_id()
    AND auth.user_role() = 'entreprise'
    AND company_id IN (
      SELECT company_id FROM contacts WHERE user_id = auth.uid()
    )
  );

-- =====================================================================
-- ATTENDANCES
-- =====================================================================
CREATE POLICY "attendances_staff"
  ON attendances FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.id = attendances.enrollment_id
      AND e.organization_id = auth.organization_id()
    )
    AND auth.is_staff()
  );

-- Formateur peut lire et mettre a jour les emargements de ses sessions
CREATE POLICY "attendances_trainer"
  ON attendances FOR ALL
  USING (
    auth.user_role() = 'formateur'
    AND EXISTS (
      SELECT 1 FROM enrollments e
      JOIN sessions s ON s.id = e.session_id
      JOIN trainers t ON t.id = s.trainer_id
      WHERE e.id = attendances.enrollment_id
      AND t.profile_id = auth.uid()
    )
  );

-- Apprenant voit ses propres emargements
CREATE POLICY "attendances_learner_select"
  ON attendances FOR SELECT
  USING (
    auth.user_role() IN ('apprenant', 'apprenti')
    AND EXISTS (
      SELECT 1 FROM enrollments e
      JOIN beneficiaries b ON b.id = e.beneficiary_id
      WHERE e.id = attendances.enrollment_id
      AND b.profile_id = auth.uid()
    )
  );

-- =====================================================================
-- INVOICES
-- =====================================================================
CREATE POLICY "invoices_staff"
  ON invoices FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_staff());

-- Apprenant voit ses factures
CREATE POLICY "invoices_learner_select"
  ON invoices FOR SELECT
  USING (
    organization_id = auth.organization_id()
    AND auth.user_role() IN ('apprenant', 'apprenti')
    AND beneficiary_id IN (
      SELECT id FROM beneficiaries WHERE profile_id = auth.uid()
    )
  );

-- Entreprise voit ses factures
CREATE POLICY "invoices_company_select"
  ON invoices FOR SELECT
  USING (
    organization_id = auth.organization_id()
    AND auth.user_role() = 'entreprise'
    AND company_id IN (
      SELECT company_id FROM contacts WHERE user_id = auth.uid()
    )
  );

-- =====================================================================
-- EVALUATIONS & RESPONSES
-- =====================================================================
CREATE POLICY "evaluations_staff"
  ON evaluations FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_staff());

-- Tous les roles peuvent voir les evaluations de leur perimetre
CREATE POLICY "evaluations_select_all"
  ON evaluations FOR SELECT
  USING (organization_id = auth.organization_id());

-- Staff peut gerer toutes les reponses
CREATE POLICY "eval_responses_staff"
  ON evaluation_responses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM evaluations ev
      WHERE ev.id = evaluation_responses.evaluation_id
      AND ev.organization_id = auth.organization_id()
    )
    AND auth.is_staff()
  );

-- Apprenant peut creer et voir ses propres reponses
CREATE POLICY "eval_responses_learner"
  ON evaluation_responses FOR SELECT
  USING (
    auth.user_role() IN ('apprenant', 'apprenti')
    AND beneficiary_id IN (
      SELECT id FROM beneficiaries WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "eval_responses_learner_insert"
  ON evaluation_responses FOR INSERT
  WITH CHECK (
    auth.user_role() IN ('apprenant', 'apprenti')
    AND beneficiary_id IN (
      SELECT id FROM beneficiaries WHERE profile_id = auth.uid()
    )
  );

-- =====================================================================
-- COMPLAINTS (ind. 31)
-- =====================================================================
-- Staff : acces complet
CREATE POLICY "complaints_staff"
  ON complaints FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_staff());

-- Formateur, apprenant, entreprise : peuvent creer et voir les leurs
CREATE POLICY "complaints_create_any"
  ON complaints FOR INSERT
  WITH CHECK (organization_id = auth.organization_id());

CREATE POLICY "complaints_select_own"
  ON complaints FOR SELECT
  USING (
    organization_id = auth.organization_id()
    AND (
      auth.is_staff()
      OR (auth.user_role() IN ('apprenant', 'apprenti') AND beneficiary_id IN (
        SELECT id FROM beneficiaries WHERE profile_id = auth.uid()
      ))
      OR (auth.user_role() = 'entreprise' AND company_id IN (
        SELECT company_id FROM contacts WHERE user_id = auth.uid()
      ))
      OR (auth.user_role() = 'formateur')
    )
  );

-- =====================================================================
-- DOCUMENTS
-- =====================================================================
CREATE POLICY "documents_staff"
  ON documents FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_staff());

CREATE POLICY "documents_learner_select"
  ON documents FOR SELECT
  USING (
    organization_id = auth.organization_id()
    AND auth.user_role() IN ('apprenant', 'apprenti')
    AND beneficiary_id IN (
      SELECT id FROM beneficiaries WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "documents_company_select"
  ON documents FOR SELECT
  USING (
    organization_id = auth.organization_id()
    AND auth.user_role() = 'entreprise'
    AND company_id IN (
      SELECT company_id FROM contacts WHERE user_id = auth.uid()
    )
  );

-- =====================================================================
-- QUALITE (improvement_actions, watch_entries, quality_reviews, qualiopi_evidence)
-- Staff uniquement (lecture + ecriture)
-- =====================================================================
CREATE POLICY "improvements_staff"
  ON improvement_actions FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_staff());

CREATE POLICY "watch_staff"
  ON watch_entries FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_staff());

CREATE POLICY "quality_reviews_staff"
  ON quality_reviews FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_staff());

CREATE POLICY "qualiopi_evidence_staff"
  ON qualiopi_evidence FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_staff());

-- Formateur : lecture seule sur qualite
CREATE POLICY "improvements_trainer_select"
  ON improvement_actions FOR SELECT
  USING (organization_id = auth.organization_id() AND auth.user_role() = 'formateur');

CREATE POLICY "watch_trainer_select"
  ON watch_entries FOR SELECT
  USING (organization_id = auth.organization_id() AND auth.user_role() = 'formateur');

-- =====================================================================
-- TRAINERS
-- =====================================================================
CREATE POLICY "trainers_staff"
  ON trainers FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_staff());

CREATE POLICY "trainers_self_select"
  ON trainers FOR SELECT
  USING (
    organization_id = auth.organization_id()
    AND auth.user_role() = 'formateur'
    AND profile_id = auth.uid()
  );

-- =====================================================================
-- REFERENTIELS (opcos, certifications) -- lecture pour tous
-- =====================================================================
CREATE POLICY "opcos_select_all"
  ON opcos FOR SELECT
  USING (true);

CREATE POLICY "certifications_select_all"
  ON certifications FOR SELECT
  USING (true);

-- Admin peut gerer les certifications
CREATE POLICY "certifications_admin"
  ON certifications FOR ALL
  USING (auth.is_admin());

-- =====================================================================
-- SUBCONTRACTORS
-- =====================================================================
CREATE POLICY "subcontractors_staff"
  ON subcontractors FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_staff());

-- =====================================================================
-- LOCATIONS
-- =====================================================================
CREATE POLICY "locations_staff"
  ON locations FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_staff());

CREATE POLICY "locations_select_all_org"
  ON locations FOR SELECT
  USING (organization_id = auth.organization_id());

-- =====================================================================
-- STAFF TRAINING & PROFESSIONAL INTERVIEWS (ind. 22)
-- =====================================================================
CREATE POLICY "staff_training_admin"
  ON staff_training FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_admin());

CREATE POLICY "staff_training_self_select"
  ON staff_training FOR SELECT
  USING (organization_id = auth.organization_id() AND profile_id = auth.uid());

CREATE POLICY "interviews_admin"
  ON professional_interviews FOR ALL
  USING (organization_id = auth.organization_id() AND auth.is_admin());

CREATE POLICY "interviews_self_select"
  ON professional_interviews FOR SELECT
  USING (organization_id = auth.organization_id() AND profile_id = auth.uid());

-- =====================================================================
-- SUPABASE STORAGE POLICIES (buckets)
-- =====================================================================
-- Bucket : documents
-- Structure : {organization_id}/{type}/{filename}
-- => Les policies Storage sont definies via le dashboard Supabase
-- Principe : meme logique que les tables documents
--   - Staff : upload/download tous les fichiers de l'org
--   - Apprenant : download de ses fichiers
--   - Entreprise : download de ses fichiers
--   - Formateur : download des fichiers de ses sessions
