import { describe, expect, it } from 'vitest'
import {
  USER_ROLES,
  STAFF_ROLES,
  PIPELINE_STAGES,
  SESSION_STATUSES,
  INSCRIPTION_STATUSES,
  FUNDING_TYPES,
  INVOICE_STATUSES,
  FUNDING_STATUSES,
  ACTION_CATEGORIES,
  FORMATION_MODALITIES,
  EVAL_TYPES,
  QUALIFICATION_LEVELS,
} from './constants'

describe('constants — USER_ROLES', () => {
  it('exposes all 8 roles expected by the CRM', () => {
    expect(Object.keys(USER_ROLES).sort()).toEqual(
      [
        'admin_of',
        'apprenant',
        'apprenti',
        'commercial',
        'entreprise',
        'financeur',
        'formateur',
        'gestionnaire',
      ].sort(),
    )
  })

  it('maps each role to a non-empty French label', () => {
    for (const label of Object.values(USER_ROLES)) {
      expect(typeof label).toBe('string')
      expect(label.length).toBeGreaterThan(0)
    }
  })
})

describe('constants — STAFF_ROLES', () => {
  it('includes admin_of, gestionnaire and commercial', () => {
    expect(STAFF_ROLES).toEqual(['admin_of', 'gestionnaire', 'commercial'])
  })

  it('only contains roles that exist in USER_ROLES', () => {
    for (const role of STAFF_ROLES) {
      expect(USER_ROLES).toHaveProperty(role)
    }
  })

  it('does not include learner/company/trainer roles', () => {
    expect(STAFF_ROLES).not.toContain('apprenant')
    expect(STAFF_ROLES).not.toContain('apprenti')
    expect(STAFF_ROLES).not.toContain('entreprise')
    expect(STAFF_ROLES).not.toContain('formateur')
  })
})

describe('constants — pipeline and statuses', () => {
  it('pipeline stages cover prospect through gagne/perdu', () => {
    expect(PIPELINE_STAGES).toMatchObject({
      prospect: expect.any(String),
      qualification: expect.any(String),
      proposition: expect.any(String),
      negociation: expect.any(String),
      gagne: expect.any(String),
      perdu: expect.any(String),
    })
  })

  it('session statuses cover the full lifecycle', () => {
    expect(Object.keys(SESSION_STATUSES)).toEqual(
      expect.arrayContaining(['planifiee', 'confirmee', 'en_cours', 'terminee', 'annulee']),
    )
  })

  it('invoice statuses include brouillon, payee and avoir', () => {
    expect(INVOICE_STATUSES.brouillon).toBeDefined()
    expect(INVOICE_STATUSES.payee).toBeDefined()
    expect(INVOICE_STATUSES.avoir).toBeDefined()
  })

  it('inscription statuses include the pre_inscrit → termine path', () => {
    expect(INSCRIPTION_STATUSES.pre_inscrit).toBeDefined()
    expect(INSCRIPTION_STATUSES.en_formation).toBeDefined()
    expect(INSCRIPTION_STATUSES.termine).toBeDefined()
  })
})

describe('constants — funding', () => {
  it('exposes the main French funding sources (CPF, OPCO, France Travail, AGEFIPH)', () => {
    expect(FUNDING_TYPES).toMatchObject({
      cpf: 'CPF',
      opco_plan: expect.any(String),
      opco_apprentissage: expect.any(String),
      france_travail_aif: expect.any(String),
      agefiph: 'AGEFIPH',
    })
  })

  it('funding statuses follow the dossier lifecycle', () => {
    expect(Object.keys(FUNDING_STATUSES)).toEqual(
      expect.arrayContaining([
        'brouillon',
        'depose',
        'en_instruction',
        'accorde',
        'refuse',
        'realise',
        'paye',
      ]),
    )
  })
})

describe('constants — Qualiopi catalog', () => {
  it('action categories match AF, BC, VAE, CFA', () => {
    expect(Object.keys(ACTION_CATEGORIES)).toEqual(['af', 'bc', 'vae', 'cfa'])
  })

  it('formation modalities include presentiel, distanciel, hybride and AFEST', () => {
    expect(Object.keys(FORMATION_MODALITIES)).toEqual(
      expect.arrayContaining(['presentiel', 'distanciel', 'hybride', 'afest']),
    )
  })

  it('evaluation types cover positionnement → insertion follow-ups', () => {
    expect(EVAL_TYPES.positionnement).toBeDefined()
    expect(EVAL_TYPES.satisfaction_chaud).toBeDefined()
    expect(EVAL_TYPES.insertion_6m).toBeDefined()
  })

  it('qualification levels span 1 to 8 (RNCP)', () => {
    for (let level = 1; level <= 8; level++) {
      expect(QUALIFICATION_LEVELS).toHaveProperty(String(level))
    }
  })
})
