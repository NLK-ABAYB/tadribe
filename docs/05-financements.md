# Partie 4 -- Types de financement de la formation professionnelle en France (2026)

---

## 4.1 CPF -- Compte Personnel de Formation

### Mecanisme

- Chaque actif (salarie, independant, demandeur d'emploi) dispose d'un compte CPF credite annuellement en euros.
- Credits : **500 EUR/an** (plafond 5 000 EUR) pour un salarie a temps plein, **800 EUR/an** (plafond 8 000 EUR) pour les salaries non qualifies.
- Gere par la **Caisse des Depots et Consignations** via la plateforme **Mon Compte Formation**.
- Le titulaire choisit librement sa formation parmi les offres eligibles.

### Conditions d'eligibilite

**Pour l'OF :**
- Certification **Qualiopi** obligatoire
- Referencement sur **Mon Compte Formation**
- Formation menant a une certification RNCP, RS, ou bilan de competences, ou permis de conduire
- Respect des conditions de la Caisse des Depots (engagement de service)

**Pour le beneficiaire :**
- Etre actif (salarie, independant, demandeur d'emploi)
- Disposer de droits suffisants sur son compte
- S'identifier via **FranceConnect+** (identite numerique)
- Payer le **reste a charge** de 103,20 EUR (2026)
- Se presenter aux evaluations finales (obligation depuis 2026)

### Plafonds CPF (decret n 2026-127)

| Type d'action | Plafond |
|---|---|
| Certifications RNCP | Pas de plafond |
| Certifications RS (Repertoire Specifique) | 1 500 EUR |
| Bilans de competences | 1 600 EUR |
| Permis de conduire | 900 EUR |
| CleA | Exempt de plafond |

Si le cout depasse le plafond, le solde est a la charge du beneficiaire ou d'un financeur tiers (employeur, OPCO).

### Reste a charge

- **103,20 EUR** en 2026 (100 EUR en 2024, revalorise annuellement sur l'indice des prix).
- **Exonerations** : demandeurs d'emploi inscrits France Travail, cofinancement employeur/OPCO, C2P, AT/MP >= 10%.
- **Interdit** : l'OF ne peut pas financer le reste a charge du stagiaire.

### Processus

1. Le beneficiaire se connecte via FranceConnect+ sur Mon Compte Formation.
2. Il recherche et selectionne une formation.
3. Il s'inscrit et paie le reste a charge.
4. L'OF valide l'inscription sous 48h ouvrees.
5. La formation se deroule.
6. L'OF transmet le **certificat de realisation** via la plateforme.
7. La Caisse des Depots verse le paiement a l'OF (environ 4 semaines apres service fait).

### Lutte contre la fraude

- Demarchage interdit (amendes : 75 000 EUR PP, 375 000 EUR PM).
- Absence aux evaluations = remboursement integral par le titulaire.
- Suspension de referencement possible par la Caisse des Depots.
- Echanges renforces entre financeurs et administrations (loi 2025-594).

### Documents

- Fiche formation sur Mon Compte Formation
- Certificat de realisation
- Attestation de fin de formation
- Feuilles d'emargement

### Flux financiers

```
Beneficiaire ---(reste a charge 103,20 EUR)---> Caisse des Depots
Caisse des Depots ---(montant CPF)---> OF
```

### Gestion CRM

- Integration API Mon Compte Formation
- Suivi des inscriptions CPF (statut, dates, montants)
- Generation automatique du certificat de realisation
- Suivi des paiements Caisse des Depots
- Alerte si certificat de realisation non transmis
- Tableau de bord du CA CPF

---

## 4.2 OPCO -- Operateurs de Competences

### Les 11 OPCO

| OPCO | Secteurs principaux |
|---|---|
| AFDAS | Culture, medias, loisirs, sport |
| ATLAS | Services financiers, conseil |
| Constructys | BTP |
| AKTO | Services a forte intensite de main-d'oeuvre |
| OCAPIAT | Agriculture, peche, agroalimentaire |
| OPCO 2i | Interindustriel |
| OPCO Mobilites | Transports, logistique |
| OPCO EP | Entreprises de proximite |
| OPCO Sante | Sante, medico-social |
| Uniformation | Cohesion sociale, ESS |
| OPCO Commerce | Commerce |

### Dispositifs finances

#### a) Plan de developpement des competences (ex plan de formation)

**Mecanisme :** Financement des actions de formation decidees par l'employeur pour ses salaries.

**Eligibilite :** Entreprises de moins de 50 salaries (au-dela, l'entreprise finance sur ses fonds propres). L'OF doit etre certifie Qualiopi.

**Montants :** Variables selon l'OPCO, la branche et la taille de l'entreprise. Generalement entre 15 et 25 EUR/heure selon les branches.

**Processus :**
1. L'entreprise identifie le besoin de formation.
2. L'OF propose un devis et un programme.
3. L'entreprise depose le dossier de prise en charge aupres de son OPCO (15 jours a 1 mois avant le debut).
4. L'OPCO emet un accord de prise en charge.
5. La formation se deroule.
6. L'OF transmet les justificatifs (emargement, certificat de realisation, facture).
7. L'OPCO paie (en subrogation directe a l'OF ou remboursement a l'entreprise).

**Documents :** Devis, convention de formation, programme, accord de prise en charge, feuilles d'emargement, certificat de realisation, facture.

#### b) Contrat d'apprentissage

**Mecanisme :** Formation en alternance pour les 16-29 ans (sans limite d'age pour les travailleurs handicapes). Niveaux de prise en charge (NPEC) fixes par les branches professionnelles et valides par France Competences.

**Montants :** NPEC variables par certification (de 4 000 a 12 000+ EUR/an selon la branche et le diplome).

#### c) Contrat de professionnalisation

**Mecanisme :** Formation en alternance pour les 16-25 ans et demandeurs d'emploi de 26 ans et plus. Duree : 6 a 12 mois (jusqu'a 36 mois dans certains cas).

**Montants :** Prise en charge selon les accords de branche. Generalement 9,15 EUR/h (forfait minimum).

#### d) Pro-A (reconversion ou promotion par alternance)

**Mecanisme :** Pour les salaries en CDI, CDD sportifs, CUI, dont la qualification est inferieure a Bac+3. Formation en alternance visant une certification RNCP.

### Subrogation de paiement

L'OPCO paie directement l'OF au nom de l'entreprise :
```
Entreprise ---(dossier)---> OPCO
OPCO ---(accord prise en charge)---> OF
OF ---(formation)---> Stagiaire
OF ---(justificatifs)---> OPCO
OPCO ---(paiement)---> OF
```

**Delais :** Paiement sous 2 a 4 semaines apres validation des justificatifs.

### Gestion CRM

- Identification automatique de l'OPCO par code NAF/IDCC de l'entreprise
- Suivi des dossiers de prise en charge (depot, instruction, accord, refus)
- Alertes delai de depot (15j-1 mois avant debut)
- Generation automatique des documents (devis, convention, certificat realisation)
- Suivi des paiements OPCO avec relances
- Tableau de bord par OPCO (nb dossiers, montants, delais)

---

## 4.3 France Travail (ex Pole emploi)

### a) AIF -- Aide Individuelle a la Formation

**Mecanisme :** Financement total ou partiel d'une formation pour un demandeur d'emploi inscrit, lorsqu'aucun autre financement ne couvre la totalite du cout.

**Montant :** Jusqu'a **8 000 EUR** (montant maximum variable selon les regions et les situations).

**Processus :** Le demandeur d'emploi discute du projet avec son conseiller France Travail. L'OF etablit un devis via la plateforme **Kairos**. Le conseiller valide le financement.

**Delais :** Accord en 2 a 4 semaines. Paiement apres realisation.

### b) POEI -- Preparation Operationnelle a l'Emploi Individuelle

**Mecanisme :** Formation prealable a l'embauche. L'employeur s'engage a recruter le demandeur d'emploi en CDI, CDD >= 12 mois ou contrat de professionnalisation >= 12 mois a l'issue de la formation.

**Duree :** Jusqu'a **450 heures** (600 heures pour les publics prioritaires : RSA, seniors 55+).

**Montants :**
- Formation par un organisme : prise en charge du cout reel (valide par France Travail)
- Tutorat en entreprise : 5 EUR/h maximum (plafond 1 500 EUR)
- Cofinancement OPCO frequent

### c) POEC -- Preparation Operationnelle a l'Emploi Collective

**Mecanisme :** Formations collectives sur des metiers en tension, financees par les OPCO avec le soutien de France Travail.

**Duree :** Jusqu'a **400 heures**.

**Processus :** L'OPCO identifie les metiers en tension, lance un appel d'offres, selectionne les OF, France Travail oriente les demandeurs d'emploi.

### d) AFC -- Action de Formation Conventionnee

**Mecanisme :** Formations collectives conventionnees par France Travail pour repondre aux besoins du marche local de l'emploi. Achat de formations en volume via des marches publics.

### e) AFPR -- Action de Formation Prealable au Recrutement

**Mecanisme :** Similaire a la POEI mais pour des contrats de 6 a 12 mois (CDD ou interim).

**Duree :** Jusqu'a **400 heures**.

**Montants :** 5 EUR/h en tutorat (max 2 000 EUR), 8 EUR/h en organisme (max 3 200 EUR).

### Documents communs France Travail

- Devis via Kairos
- Convention de formation
- Programme detaille
- Feuilles d'emargement
- Attestation de fin de formation
- Certificat de realisation
- Bilan de la formation

### Flux financiers

```
France Travail ---(financement)---> OF
OPCO ---(cofinancement eventuel)---> OF ou France Travail
```

### Gestion CRM

- Integration Kairos pour la saisie des devis
- Suivi des dossiers France Travail par dispositif (AIF, POEI, POEC, AFC, AFPR)
- Statut de chaque demande (deposee, validee, refusee)
- Suivi des paiements France Travail
- Alertes de renouvellement de conventionnement

---

## 4.4 AGEFIPH / FIPHFP

### AGEFIPH (secteur prive)

**Mecanisme :** Financement complementaire pour les personnes en situation de handicap (travailleurs handicapes reconnus RQTH). Peut cofinancer une formation en complement du CPF, de l'OPCO ou de France Travail.

**Aides :**
- Aide a la formation dans le cadre du parcours vers l'emploi
- Aide a la formation dans le cadre du maintien dans l'emploi
- Aide aux adaptations pedagogiques et techniques
- Aide a la compensation du handicap en formation

**Montants :** Variables selon la situation. Aide a la formation : jusqu'a **3 000 EUR** pour les demandeurs d'emploi.

**Processus :** Demande aupres de l'AGEFIPH (en ligne), avis du conseiller Cap Emploi ou France Travail, etude du dossier, notification de decision.

### FIPHFP (secteur public)

**Mecanisme :** Equivalent de l'AGEFIPH pour la fonction publique. Financement des actions de formation pour les agents en situation de handicap.

### Gestion CRM

- Champ "RQTH" dans le dossier beneficiaire (avec consentement RGPD)
- Suivi des dossiers AGEFIPH/FIPHFP
- Lien avec le referent handicap de l'OF
- Suivi des amenagements specifiques finances
- Historique des aides obtenues

---

## 4.5 Plan de formation entreprise (fonds propres)

### Mecanisme

Pour les entreprises de **50 salaries et plus**, le plan de developpement des competences est finance sur les **fonds propres** de l'entreprise (pas de prise en charge OPCO sauf cas particuliers).

**Obligation de l'employeur :** Assurer l'adaptation des salaries a leur poste de travail et veiller au maintien de leur capacite a occuper un emploi (article L6321-1 du Code du travail).

### Processus

1. L'entreprise definit son plan de formation.
2. Consultation du CSE (Comite Social et Economique).
3. Selection des OFs et negociation des tarifs.
4. Commande (convention de formation ou bon de commande).
5. Realisation de la formation.
6. Facturation directe a l'entreprise.

### Flux financiers

```
Entreprise ---(paiement direct)---> OF
```

Delai de paiement : 30 jours (delai legal).

### Gestion CRM

- Gestion des clients entreprises avec suivi du plan de formation
- Devis, conventions, factures integres
- Historique des formations par entreprise et par salarie
- Relances automatiques pour le renouvellement du plan

---

## 4.6 FNE-Formation

### Mecanisme

Dispositif de soutien a la formation des salaries place sous l'autorite de l'Etat (DGEFP), cofinance avec les OPCO. Destine aux entreprises en mutation economique, ecologique ou numerique.

### Eligibilite

- Entreprises en difficulte, en mutation, en reprise d'activite.
- Priorite aux formations liees a la transition ecologique et numerique.
- Pas de condition de taille d'entreprise.

### Montants

- Prise en charge variable : de **40% a 100%** des couts pedagogiques selon la taille de l'entreprise et le contexte.
- Formations de 12 mois maximum.

### Processus

1. L'entreprise contacte son OPCO.
2. Montage du dossier (programme, devis, justification du contexte).
3. Instruction par l'OPCO / DREETS.
4. Accord de financement.
5. Realisation et justification.

### Gestion CRM

- Identification des entreprises eligibles FNE
- Suivi des dossiers FNE (depot, instruction, accord)
- Montants et taux de prise en charge

---

## 4.7 PTP -- Projet de Transition Professionnelle (ex CIF)

### Mecanisme

Permet a un salarie de suivre une formation certifiante (RNCP) pour changer de metier ou de profession, avec maintien de sa remuneration.

### Conditions

- **Salarie en CDI** : 24 mois d'anciennete (dont 12 dans l'entreprise actuelle).
- **Salarie en CDD** : 24 mois d'activite salariee dans les 5 dernieres annees (dont 4 mois en CDD dans les 12 derniers mois).
- Formation certifiante inscrite au RNCP.
- Demande d'autorisation d'absence a l'employeur.

### Organisme gestionnaire

Les **Transitions Pro** (ex FONGECIF), un par region, examinent les dossiers selon des criteres de coherence du projet, de pertinence du parcours et de perspectives d'emploi.

### Processus

1. Le salarie definit son projet avec un conseiller en evolution professionnelle (CEP).
2. Il monte son dossier aupres de Transitions Pro.
3. Examen du dossier par la commission paritaire.
4. En cas d'accord : maintien de la remuneration + prise en charge des couts pedagogiques.
5. Formation realisee.
6. Transitions Pro paie directement l'OF.

### Montants

- **Remuneration** : maintenue a 100% (si salaire <= 2 SMIC) ou 90% au-dela.
- **Couts pedagogiques** : prise en charge integrale dans la limite des plafonds de Transitions Pro.

### Flux financiers

```
Transitions Pro ---(couts pedagogiques)---> OF
Transitions Pro ---(remuneration)---> Salarie (via l'employeur)
```

### Gestion CRM

- Suivi des dossiers PTP (demande, instruction, accord, realisation)
- Lien avec Transitions Pro de chaque region
- Suivi des paiements Transitions Pro
- Alertes de depot de dossier (delais stricts)

---

## 4.8 Regions et collectivites territoriales

### Mecanisme

Les Conseils regionaux financent des programmes de formation pour les demandeurs d'emploi et les publics specifiques via des **marches publics** (appels d'offres).

### Types de programmes

- **PRF (Programme Regional de Formation)** : actions de formation qualifiantes ou certifiantes pour les demandeurs d'emploi.
- **Formations specifiques** : alphabetisation, FLE, savoirs de base, insertion professionnelle.
- **Accompagnement VAE** : certaines regions financent l'accompagnement VAE.

### Processus

1. La Region publie un appel d'offres sur sa plateforme de marches publics.
2. L'OF repond (memoire technique, references, prix).
3. Attribution du marche.
4. Execution des sessions de formation.
5. Facturation selon les termes du marche.

### Gestion CRM

- Veille sur les appels d'offres regionaux
- Gestion des reponses aux marches publics
- Suivi d'execution des marches (lots, sessions, places)
- Facturation selon les termes specifiques du marche

---

## 4.9 Autofinancement (paiement par le particulier)

### Mecanisme

Le stagiaire finance lui-meme sa formation, en totalite ou en complement d'un financement partiel (reste a charge apres CPF, cofinancement).

### Cadre legal

- **Contrat de formation** obligatoire (articles L6353-3 a L6353-7).
- **Droit de retractation** : 10 jours.
- **Paiement** : 30% max apres expiration du delai de retractation, solde echelonne.
- **Interruption** : seules les prestations realisees sont dues.

### Facilites de paiement

- Echeancier de paiement (mensualites)
- Paiement en 3 ou 4 fois sans frais
- Financement par un organisme de credit (soumis au Code de la consommation)

### Gestion CRM

- Generation automatique du contrat de formation B2C
- Gestion du delai de retractation (10 jours)
- Echeancier de paiement integre
- Relances automatiques en cas d'impaye
- Suivi des paiements par echeance

---

## Synthese des financements

| Financement | Payeur | Delai paiement OF | Qualiopi requis | Documents cles |
|---|---|---|---|---|
| CPF | Caisse des Depots | ~4 semaines | Oui | Certificat realisation |
| OPCO | OPCO (subrogation) | 2-4 semaines | Oui | Emargement, certificat, facture |
| France Travail | France Travail | 30-60 jours | Oui | Kairos, emargement, attestation |
| AGEFIPH | AGEFIPH | Variable | Oui | Dossier handicap, facture |
| Plan entreprise | Entreprise | 30 jours | Non* | Convention, facture |
| FNE | OPCO/DREETS | Variable | Oui | Dossier FNE, justificatifs |
| PTP | Transitions Pro | Variable | Oui | Dossier PTP, emargement |
| Region | Region | Selon marche | Oui | Selon marche public |
| Autofinancement | Particulier | Echeancier | Non* | Contrat B2C, facture |

*Qualiopi non requis si financement prive, mais fortement recommande pour la credibilite.*
