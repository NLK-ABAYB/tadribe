# Liste exhaustive des fonctionnalites -- Priorisees

**Priorites :**
- **P0 (MVP)** : Indispensable pour lancer le produit. Couvre le cycle de vie minimal et la conformite Qualiopi de base.
- **P1 (V1)** : Necessaire pour un usage quotidien complet. Couvre tous les indicateurs Qualiopi.
- **P2 (V2)** : Differenciation produit, automatisation avancee, integrations.
- **P3 (Roadmap)** : Fonctionnalites avancees et specifiques (CFA, marches publics, IA).

---

## Module 1 -- Authentification et multi-tenant

| # | Fonctionnalite | Priorite | Qualiopi |
|---|---|---|---|
| 1.1 | Inscription / connexion (email + magic link) | P0 | -- |
| 1.2 | Gestion des roles (admin_of, gestionnaire, commercial, formateur, apprenant) | P0 | -- |
| 1.3 | Multi-tenancy : isolation des donnees par organisation | P0 | -- |
| 1.4 | Invitation de collaborateurs par email | P0 | -- |
| 1.5 | Profil utilisateur (photo, coordonnees, preferences) | P0 | -- |
| 1.6 | Portail apprenant (acces restreint) | P1 | 9 |
| 1.7 | Portail entreprise (acces restreint) | P1 | -- |
| 1.8 | SSO / SAML pour les grands comptes | P3 | -- |

## Module 2 -- Gestion commerciale (CRM)

| # | Fonctionnalite | Priorite | Qualiopi |
|---|---|---|---|
| 2.1 | Fiche entreprise (SIRET, NAF, OPCO, IDCC, effectif) | P0 | -- |
| 2.2 | Fiche contact (coordonnees, poste, entreprise) | P0 | -- |
| 2.3 | Pipeline commercial (kanban, etapes, montants) | P0 | -- |
| 2.4 | Historique des interactions (appels, emails, RDV) | P0 | -- |
| 2.5 | Generation de devis PDF | P0 | -- |
| 2.6 | Identification automatique OPCO par code NAF/IDCC | P1 | -- |
| 2.7 | Tableau de bord commercial (CA previsionnel, taux conversion) | P1 | -- |
| 2.8 | Import/export contacts (CSV) | P1 | -- |
| 2.9 | Scoring des leads | P2 | -- |
| 2.10 | Integration emailing (templates, envoi en masse) | P2 | -- |
| 2.11 | Veille appels d'offres | P3 | -- |

## Module 3 -- Catalogue de formations

| # | Fonctionnalite | Priorite | Qualiopi |
|---|---|---|---|
| 3.1 | Fiche formation avec tous les champs obligatoires Qualiopi | P0 | 1, 5, 6 |
| 3.2 | Programme detaille (modules, durees, contenus) | P0 | 6 |
| 3.3 | Objectifs pedagogiques structures | P0 | 5 |
| 3.4 | Gestion des pre-requis et public vise | P0 | 1 |
| 3.5 | Prix et modalites d'acces | P0 | 1 |
| 3.6 | Mention accessibilite handicap | P0 | 1, 26 |
| 3.7 | Base de certifications RNCP/RS | P1 | 3, 7 |
| 3.8 | Matrice de correspondance programme/referentiel | P1 | 7 |
| 3.9 | Versioning des programmes (historique) | P1 | 6 |
| 3.10 | Indicateurs de resultats par formation (satisfaction, reussite) | P1 | 2 |
| 3.11 | Bibliotheque de ressources pedagogiques | P1 | 19 |
| 3.12 | Eligibilite CPF (flag + ID Mon Compte Formation) | P1 | -- |
| 3.13 | Duplication de fiche formation | P1 | -- |
| 3.14 | Publication catalogue sur page publique | P2 | 1 |
| 3.15 | Alerte echeance certification RNCP/RS | P2 | 3 |

## Module 4 -- Gestion des sessions

| # | Fonctionnalite | Priorite | Qualiopi |
|---|---|---|---|
| 4.1 | Creation de sessions (dates, lieu, formateur, capacite) | P0 | 17 |
| 4.2 | Planning calendaire des sessions | P0 | -- |
| 4.3 | Creneaux horaires detailles par session | P0 | -- |
| 4.4 | Affectation de formateurs aux sessions | P0 | 18 |
| 4.5 | Gestion des lieux et salles (capacite, equipements, accessibilite) | P0 | 17, 26 |
| 4.6 | Statut de session (planifiee -> confirmee -> en cours -> terminee) | P0 | -- |
| 4.7 | Gestion des sessions distancielles (lien visio) | P1 | 17 |
| 4.8 | Vue planning des formateurs (disponibilites) | P1 | 18 |
| 4.9 | Gestion liste d'attente | P1 | -- |
| 4.10 | Duplication de session | P1 | -- |
| 4.11 | Planning alternance centre/entreprise (CFA) | P2 | 13 |

## Module 5 -- Beneficiaires et inscriptions

| # | Fonctionnalite | Priorite | Qualiopi |
|---|---|---|---|
| 5.1 | Fiche beneficiaire complete | P0 | -- |
| 5.2 | Inscription a une session | P0 | -- |
| 5.3 | Workflow d'inscription (pre-inscrit -> confirme -> en formation -> termine) | P0 | -- |
| 5.4 | Formulaire d'analyse des besoins | P0 | 4 |
| 5.5 | Test de positionnement a l'entree | P1 | 8 |
| 5.6 | Envoi automatique de la convocation | P1 | 9 |
| 5.7 | Transmission livret d'accueil + reglement interieur | P1 | 9 |
| 5.8 | Checklist documents transmis par inscription | P1 | 9 |
| 5.9 | Gestion du delai de retractation B2C (10 jours) | P1 | -- |
| 5.10 | Suivi des adaptations individuelles | P1 | 10 |
| 5.11 | Champ handicap avec consentement RGPD | P1 | 26 |
| 5.12 | Portail apprenant : consulter ses formations, documents, evaluations | P2 | 9 |
| 5.13 | Inscription en ligne par le beneficiaire | P2 | -- |
| 5.14 | Import beneficiaires en masse (CSV) | P2 | -- |

## Module 6 -- Emargement et assiduite

| # | Fonctionnalite | Priorite | Qualiopi |
|---|---|---|---|
| 6.1 | Feuille d'emargement numerique par creneau | P0 | 12 |
| 6.2 | Signature electronique (tactile/souris) | P0 | 12 |
| 6.3 | Tableau de bord assiduite par session | P0 | 12 |
| 6.4 | Alerte absence (notification au coordinateur) | P1 | 12 |
| 6.5 | Workflow de relance automatique (J+1, J+3, J+7) | P1 | 12 |
| 6.6 | Signalement des absences au financeur | P1 | 12 |
| 6.7 | Export feuilles d'emargement PDF | P1 | -- |
| 6.8 | Emargement par QR code (presentiel) | P2 | 12 |
| 6.9 | Taux de presence en temps reel | P2 | 12 |

## Module 7 -- Financements

| # | Fonctionnalite | Priorite | Qualiopi |
|---|---|---|---|
| 7.1 | Dossier de financement multi-types (CPF, OPCO, FT, etc.) | P0 | -- |
| 7.2 | Workflow de suivi (brouillon -> depose -> accorde -> paye) | P0 | -- |
| 7.3 | Montants : demande, accorde, reste a charge | P0 | -- |
| 7.4 | Gestion de la subrogation OPCO | P1 | -- |
| 7.5 | Alertes delais de depot | P1 | -- |
| 7.6 | Suivi des paiements par financeur | P1 | -- |
| 7.7 | Tableau de bord financements (repartition, montants, delais) | P1 | -- |
| 7.8 | Modeles de dossiers par type de financement | P2 | -- |
| 7.9 | Integration API Mon Compte Formation | P3 | -- |
| 7.10 | Integration Kairos (France Travail) | P3 | -- |

## Module 8 -- Facturation

| # | Fonctionnalite | Priorite | Qualiopi |
|---|---|---|---|
| 8.1 | Generation de factures PDF (mentions legales + NDA) | P0 | -- |
| 8.2 | Numerotation sequentielle automatique | P0 | -- |
| 8.3 | Gestion TVA / exoneration | P0 | -- |
| 8.4 | Suivi des paiements (facture emise -> payee) | P0 | -- |
| 8.5 | Generation du certificat de realisation | P0 | -- |
| 8.6 | Relances automatiques (1ere, 2e, mise en demeure) | P1 | -- |
| 8.7 | Echeancier de paiement (B2C) | P1 | -- |
| 8.8 | Factures d'avoir | P1 | -- |
| 8.9 | Tableau de bord CA (par formation, client, financeur, periode) | P1 | -- |
| 8.10 | Delai moyen de paiement par financeur | P2 | -- |
| 8.11 | Export comptable (FEC, CSV) | P2 | -- |

## Module 9 -- Evaluations et satisfaction

| # | Fonctionnalite | Priorite | Qualiopi |
|---|---|---|---|
| 9.1 | Questionnaire de satisfaction a chaud (fin de formation) | P0 | 30 |
| 9.2 | Envoi automatique a la fin de chaque session | P0 | 30 |
| 9.3 | Calcul automatique des taux de satisfaction | P0 | 2 |
| 9.4 | Evaluation des acquis (QCM, quiz) | P1 | 11 |
| 9.5 | Generation attestation de fin de formation | P1 | 11 |
| 9.6 | Questionnaire a froid (3-6 mois) automatise | P1 | 30 |
| 9.7 | Enquetes par partie prenante (entreprise, financeur) | P1 | 30 |
| 9.8 | Tableau de bord satisfaction (par formation, formateur, session) | P1 | 2 |
| 9.9 | Enquete d'insertion professionnelle (3, 6, 12 mois) | P2 | 29 |
| 9.10 | Alerte si note de satisfaction < seuil | P2 | 30 |
| 9.11 | Evaluations formatives en cours de formation | P2 | 11 |

## Module 10 -- Formateurs et competences

| # | Fonctionnalite | Priorite | Qualiopi |
|---|---|---|---|
| 10.1 | Fiche formateur (CV, diplomes, specialites, tarifs) | P0 | 21 |
| 10.2 | Matrice competences / formations delivrees | P1 | 21 |
| 10.3 | Alerte mise a jour annuelle des CVs | P1 | 21 |
| 10.4 | Evaluation des formateurs par les stagiaires | P1 | 21, 30 |
| 10.5 | Plan de developpement des competences de l'equipe | P1 | 22 |
| 10.6 | Suivi des formations suivies par les collaborateurs | P1 | 22 |
| 10.7 | Gestion des entretiens professionnels | P2 | 22 |

## Module 11 -- Qualite et amelioration continue

| # | Fonctionnalite | Priorite | Qualiopi |
|---|---|---|---|
| 11.1 | Registre des reclamations (formulaire, workflow, suivi) | P0 | 31 |
| 11.2 | Plan d'actions d'amelioration (action, responsable, echeance) | P0 | 32 |
| 11.3 | Lien reclamation -> action d'amelioration | P1 | 31, 32 |
| 11.4 | Lien evaluation insatisfaisante -> action | P1 | 32 |
| 11.5 | Tableau de bord qualite (reclamations, actions, indicateurs) | P1 | 32 |
| 11.6 | Journal de veille (legale, metiers, pedagogique, techno) | P1 | 23, 24, 25 |
| 11.7 | Revues qualite (CR, decisions, participants) | P1 | 32 |
| 11.8 | Preparation d'audit Qualiopi (checklist par indicateur) | P2 | Tous |
| 11.9 | Generation du bilan annuel qualite | P2 | 32 |
| 11.10 | Comparaison indicateurs N vs N-1 | P2 | 32 |

## Module 12 -- Sous-traitance

| # | Fonctionnalite | Priorite | Qualiopi |
|---|---|---|---|
| 12.1 | Base des sous-traitants (competences, contrats, evaluations) | P1 | 27 |
| 12.2 | Charte qualite et contrats stockes | P1 | 27 |
| 12.3 | Evaluation de chaque prestation sous-traitee | P1 | 27 |
| 12.4 | Alerte renouvellement contrat | P2 | 27 |

## Module 13 -- Accessibilite et handicap

| # | Fonctionnalite | Priorite | Qualiopi |
|---|---|---|---|
| 13.1 | Fiche referent handicap (coordonnees, missions) | P0 | 26 |
| 13.2 | Annuaire partenaires handicap (AGEFIPH, MDPH, Cap Emploi) | P1 | 26 |
| 13.3 | Suivi amenagements par beneficiaire | P1 | 26 |
| 13.4 | Checklist accessibilite par site/salle | P1 | 26 |
| 13.5 | Tracabilite des sensibilisations equipe | P2 | 26 |

## Module 14 -- Specificites CFA / Apprentissage

| # | Fonctionnalite | Priorite | Qualiopi |
|---|---|---|---|
| 14.1 | Livret d'apprentissage numerique | P2 | 13 |
| 14.2 | Portail tripartite (apprenant, tuteur, formateur) | P2 | 13 |
| 14.3 | Suivi des visites en entreprise (planif, CR, signatures) | P2 | 13 |
| 14.4 | Actions citoyennes et socio-educatives | P2 | 14 |
| 14.5 | Checklist integration apprenti (droits, securite) | P2 | 15 |
| 14.6 | Calendrier examens + alertes inscription | P2 | 16 |
| 14.7 | Conseil de perfectionnement (CR, decisions) | P2 | 20 |
| 14.8 | Suivi insertion post-formation | P2 | 29 |

## Module 15 -- Documents et GED

| # | Fonctionnalite | Priorite | Qualiopi |
|---|---|---|---|
| 15.1 | Upload et stockage de documents (Supabase Storage) | P0 | -- |
| 15.2 | Classement par type (convention, programme, CV, etc.) | P0 | -- |
| 15.3 | Lien documents -> entites (session, inscription, formateur) | P0 | -- |
| 15.4 | Generation PDF (devis, convention, attestation, facture) | P1 | -- |
| 15.5 | Signature electronique des documents | P2 | -- |
| 15.6 | Versioning des documents | P2 | -- |

## Module 16 -- BPF et reporting reglementaire

| # | Fonctionnalite | Priorite | Qualiopi |
|---|---|---|---|
| 16.1 | Alerte campagne BPF (avril-mai) | P1 | -- |
| 16.2 | Donnees BPF pre-calculees depuis l'activite | P1 | -- |
| 16.3 | Generation du BPF | P2 | -- |
| 16.4 | Tableau de bord reglementaire (NDA, Qualiopi, BPF) | P2 | -- |

## Module 17 -- Notifications et alertes

| # | Fonctionnalite | Priorite | Qualiopi |
|---|---|---|---|
| 17.1 | Notifications in-app (cloche) | P0 | -- |
| 17.2 | Notifications par email | P1 | -- |
| 17.3 | Alertes automatiques configurables | P1 | -- |
| 17.4 | Rappels de taches | P2 | -- |

---

## Synthese par priorite

| Priorite | Nombre de fonctionnalites | Description |
|---|---|---|
| **P0 (MVP)** | ~40 | CRM de base, sessions, inscriptions, emargement, facturation, reclamations, satisfaction a chaud |
| **P1 (V1)** | ~45 | Couverture Qualiopi complete, financements, evaluations, veille, sous-traitance, portails |
| **P2 (V2)** | ~30 | CFA, BPF, audit Qualiopi, integrations, signature electronique, insertion |
| **P3 (Roadmap)** | ~5 | API Mon Compte Formation, Kairos, SSO, IA |
