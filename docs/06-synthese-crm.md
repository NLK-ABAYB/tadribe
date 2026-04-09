# Partie 5 -- Synthese des fonctionnalites CRM pour un organisme de formation

Ce chapitre synthetise l'ensemble des fonctionnalites qu'un CRM SaaS dedie aux organismes de formation doit integrer, en croisant les exigences legales, le cycle de vie de la formation et les indicateurs Qualiopi.

---

## 5.1 Modules fonctionnels

### Module 1 -- Gestion commerciale et prospection

| Fonctionnalite | Indicateurs Qualiopi | Etape cycle de vie |
|---|---|---|
| Fiche prospect/client (SIRET, NAF, OPCO, IDCC, effectif) | -- | Prospection |
| Pipeline commercial (etapes, probabilite, montant) | -- | Prospection |
| Historique des interactions (appels, emails, RDV) | -- | Prospection |
| Generation de devis | -- | Montage admin |
| Suivi des relances commerciales | -- | Prospection |
| Veille appels d'offres | -- | Prospection |

### Module 2 -- Catalogue et offre de formation

| Fonctionnalite | Indicateurs Qualiopi | Etape cycle de vie |
|---|---|---|
| Fiches programme avec champs obligatoires | 1, 5, 6 | Prospection |
| Base de certifications RNCP/RS avec alertes echeance | 3, 7 | Prospection |
| Matrice correspondance programme/referentiel | 7 | Montage admin |
| Versioning des programmes et supports | 6 | Execution |
| Publication automatique vers site web | 1, 2 | Prospection |
| Indicateurs de resultats par formation | 2 | Bilan |

### Module 3 -- Gestion des beneficiaires

| Fonctionnalite | Indicateurs Qualiopi | Etape cycle de vie |
|---|---|---|
| Dossier individuel complet | 4, 8, 10 | Qualification |
| Formulaire de recueil des besoins | 4 | Qualification |
| Tests de positionnement en ligne | 8 | Qualification |
| Suivi de progression individuel | 10 | Execution |
| Champ handicap (avec consentement RGPD) | 26 | Qualification |
| Historique des formations suivies | -- | Suivi post |
| Base alumni | 29 | Suivi post |

### Module 4 -- Gestion des sessions

| Fonctionnalite | Indicateurs Qualiopi | Etape cycle de vie |
|---|---|---|
| Creation et planification de sessions | 17 | Planification |
| Affectation formateurs/salles/materiel | 17, 18 | Planification |
| Envoi automatique des convocations | 9 | Planification |
| Gestion des inscriptions (confirmation, annulation, liste d'attente) | -- | Planification |
| Emargement numerique (signature electronique) | 12 | Execution |
| Suivi de l'assiduite en temps reel | 12 | Execution |
| Alertes d'absence avec workflow de relance (J+1, J+3, J+7) | 12 | Execution |
| Gestion des groupes de niveaux | 10 | Execution |

### Module 5 -- Gestion des formateurs/intervenants

| Fonctionnalite | Indicateurs Qualiopi | Etape cycle de vie |
|---|---|---|
| Base de donnees intervenants (CV, diplomes, certifications) | 21 | Planification |
| Matrice competences / formations | 21 | Planification |
| Alerte mise a jour annuelle des CVs | 21 | -- |
| Plan de developpement des competences | 22 | -- |
| Suivi des entretiens professionnels | 22 | -- |
| Evaluations des formateurs par les stagiaires | 21, 30 | Evaluation |

### Module 6 -- Gestion des financements

| Fonctionnalite | Indicateurs Qualiopi | Etape cycle de vie |
|---|---|---|
| Identification automatique OPCO (par NAF/IDCC) | -- | Qualification |
| Suivi des dossiers de prise en charge multi-financeurs | -- | Financement |
| Alertes delai de depot OPCO (15j-1 mois avant) | -- | Financement |
| Integration API Mon Compte Formation (CPF) | -- | Financement |
| Suivi des conventions France Travail / Kairos | -- | Financement |
| Suivi des dossiers AGEFIPH | -- | Financement |
| Gestion de la subrogation OPCO | -- | Facturation |
| Tableau de bord par type de financement | -- | Bilan |

### Module 7 -- Facturation et comptabilite

| Fonctionnalite | Indicateurs Qualiopi | Etape cycle de vie |
|---|---|---|
| Generation de factures (mentions obligatoires + NDA) | -- | Facturation |
| Gestion TVA / exoneration (art. 261-4-4 CGI) | -- | Facturation |
| Echeancier de paiement (B2C) | -- | Facturation |
| Suivi des paiements par financeur | -- | Facturation |
| Relances automatiques (1ere, 2e, mise en demeure) | -- | Facturation |
| Generation certificats de realisation | -- | Facturation |
| Tableau de bord CA par formation/client/financeur/periode | -- | Bilan |
| Delai moyen de paiement par financeur | -- | Bilan |
| Export comptable | -- | Bilan |

### Module 8 -- Evaluations et satisfaction

| Fonctionnalite | Indicateurs Qualiopi | Etape cycle de vie |
|---|---|---|
| Module d'evaluation en ligne (QCM, quiz) | 11 | Evaluation |
| Questionnaires de satisfaction a chaud | 30 | Evaluation |
| Questionnaires a froid (3-6 mois) automatises | 30 | Suivi post |
| Enquetes d'insertion professionnelle | 29 | Suivi post |
| Formulaires par partie prenante (stagiaire, entreprise, financeur, formateur) | 30 | Evaluation |
| Generation automatique attestations de fin de formation | 11 | Evaluation |
| Calcul automatique des indicateurs (satisfaction, reussite, abandon, insertion) | 2 | Bilan |
| Alertes si note < seuil | 30 | Evaluation |

### Module 9 -- Qualite et amelioration continue (Qualiopi)

| Fonctionnalite | Indicateurs Qualiopi | Etape cycle de vie |
|---|---|---|
| Registre des reclamations (formulaire, workflow, statut) | 31 | Toutes |
| Plan d'actions d'amelioration (action, responsable, echeance, statut) | 32 | Bilan |
| Lien automatique reclamations/evaluations -> actions | 31, 32 | Bilan |
| Module de veille (legale, metiers, pedagogique) | 23, 24, 25 | Toutes |
| Tableau de bord amelioration continue | 32 | Bilan |
| Historique revues qualite | 32 | Bilan |
| Generation du bilan annuel qualite | 32 | Bilan |
| Preparation d'audit Qualiopi (checklist, preuves par indicateur) | Tous | -- |

### Module 10 -- Gestion de la sous-traitance

| Fonctionnalite | Indicateurs Qualiopi | Etape cycle de vie |
|---|---|---|
| Base sous-traitants (competences, evaluations) | 27 | Planification |
| Contrats et chartes qualite | 27 | Planification |
| Workflow de validation des sous-traitants | 27 | Planification |
| Suivi evaluations par prestation | 27 | Evaluation |
| Alertes renouvellement contrats | 27 | -- |

### Module 11 -- Accessibilite et handicap

| Fonctionnalite | Indicateurs Qualiopi | Etape cycle de vie |
|---|---|---|
| Fiche referent handicap | 26 | Toutes |
| Annuaire partenaires handicap (AGEFIPH, MDPH, Cap Emploi) | 26 | Qualification |
| Suivi des amenagements par beneficiaire | 26 | Execution |
| Checklist accessibilite par site/salle | 26 | Planification |
| Tracabilite des sensibilisations equipe | 26 | -- |

### Module 12 -- Specificites CFA/Apprentissage

| Fonctionnalite | Indicateurs Qualiopi | Etape cycle de vie |
|---|---|---|
| Livret d'apprentissage numerique | 13 | Execution |
| Planning alternance centre/entreprise | 13 | Planification |
| Portail tripartite (apprenant, tuteur, formateur) | 13 | Execution |
| Suivi des visites en entreprise | 13 | Execution |
| Actions citoyennes et socio-educatives | 14 | Execution |
| Checklist integration apprenti | 15 | Planification |
| Calendrier examens avec alertes inscription | 16 | Evaluation |
| Conseil de perfectionnement (CR, decisions) | 20 | Bilan |
| Suivi insertion post-formation | 29 | Suivi post |

### Module 13 -- BPF et reporting reglementaire

| Fonctionnalite | Indicateurs Qualiopi | Etape cycle de vie |
|---|---|---|
| Generation automatique du BPF | -- | Bilan |
| Alerte campagne BPF (avril-mai) | -- | Bilan |
| Donnees pre-remplies depuis l'activite de l'annee | -- | Bilan |
| Export vers Mon Activite Formation | -- | Bilan |
| Tableau de bord reglementaire (NDA, Qualiopi, BPF) | -- | -- |

---

## 5.2 Integrations externes cles

| Systeme externe | Usage |
|---|---|
| Mon Compte Formation (API) | Gestion des inscriptions et certificats CPF |
| Mon Activite Formation (MAF) | BPF, declaration d'activite |
| Kairos (France Travail) | Devis et conventions France Travail |
| Plateformes OPCO | Dossiers de prise en charge |
| France Competences | Fiches RNCP/RS, alertes modifications |
| Signature electronique | Emargement numerique, contrats |
| LMS / plateforme e-learning | Suivi pedagogique distanciel |
| Comptabilite (export) | Factures, ecritures comptables |
| Site web de l'OF | Publication catalogue, indicateurs |
| Email / SMS | Convocations, relances, enquetes |

---

## 5.3 Donnees sensibles et conformite RGPD

| Donnee | Niveau de sensibilite | Mesures |
|---|---|---|
| Identite et coordonnees stagiaires | Standard | Consentement, information |
| Situation de handicap (RQTH) | Sensible | Consentement explicite, acces restreint |
| Resultats d'evaluation | Standard | Information, droit d'acces |
| Donnees de connexion LMS | Standard | Information, duree limitee |
| Donnees financieres | Standard | Securisation, conservation 10 ans |
| Casier judiciaire (dirigeant) | Sensible | Acces tres restreint |

### Obligations

- Registre des traitements
- Politique de confidentialite accessible
- Procedure de gestion des droits (acces, rectification, effacement, portabilite)
- Durees de conservation definies par type de donnee
- Sous-traitants conformes (hebergement UE, clauses RGPD)
- DPO recommande

---

## 5.4 Architecture de donnees principales

```
Organisme de formation (OF)
  |-- NDA, Qualiopi (validite), TVA
  |
  |-- Catalogue
  |     |-- Formation
  |     |     |-- Programme (versions)
  |     |     |-- Certifications RNCP/RS
  |     |     |-- Indicateurs de resultats
  |     |
  |     |-- Session
  |           |-- Dates, lieu, formateur, salle
  |           |-- Inscriptions
  |           |-- Emargements
  |           |-- Evaluations
  |
  |-- Contacts
  |     |-- Entreprises (SIRET, OPCO, IDCC)
  |     |-- Beneficiaires (stagiaires, apprentis)
  |     |-- Financeurs
  |     |-- Sous-traitants
  |     |-- Formateurs
  |
  |-- Dossiers de financement
  |     |-- Type (CPF, OPCO, France Travail, AGEFIPH, PTP...)
  |     |-- Statut (demande, accord, realise, paye)
  |     |-- Montants (demande, accorde, facture, paye)
  |
  |-- Facturation
  |     |-- Factures
  |     |-- Paiements
  |     |-- Relances
  |
  |-- Qualite
        |-- Reclamations
        |-- Plan d'amelioration
        |-- Veille
        |-- Revues qualite
```
