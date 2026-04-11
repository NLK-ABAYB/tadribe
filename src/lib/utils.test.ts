import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('merges a single class', () => {
    expect(cn('text-sm')).toBe('text-sm')
  })

  it('joins multiple classes separated by spaces', () => {
    expect(cn('text-sm', 'font-bold')).toBe('text-sm font-bold')
  })

  it('filters out falsy values', () => {
    expect(cn('a', false, null, undefined, '', 'b')).toBe('a b')
  })

  it('applies tailwind-merge conflict resolution (later class wins)', () => {
    expect(cn('text-sm', 'text-lg')).toBe('text-lg')
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('handles conditional objects', () => {
    expect(cn('base', { active: true, disabled: false })).toBe('base active')
  })

  it('handles arrays', () => {
    expect(cn(['a', 'b'], 'c')).toBe('a b c')
  })
})
