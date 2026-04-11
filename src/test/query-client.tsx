import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, renderHook, type RenderHookOptions, type RenderOptions } from '@testing-library/react'

/**
 * Creates a fresh QueryClient tuned for tests:
 * - no retries (so errors surface immediately instead of retrying 3 times)
 * - no stale time (refetches reflect the latest MSW handlers)
 * - silent logger (no console noise on expected errors)
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0, gcTime: 0 },
      mutations: { retry: false },
    },
  })
}

export function withQueryClient(client?: QueryClient) {
  const qc = client ?? createTestQueryClient()
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
  return { client: qc, Wrapper }
}

export function renderWithQueryClient(
  ui: ReactNode,
  options?: Omit<RenderOptions, 'wrapper'> & { client?: QueryClient },
) {
  const { client, Wrapper } = withQueryClient(options?.client)
  const utils = render(ui, { wrapper: Wrapper, ...options })
  return { ...utils, client }
}

export function renderHookWithQueryClient<Result, Props>(
  hook: (props: Props) => Result,
  options?: Omit<RenderHookOptions<Props>, 'wrapper'> & { client?: QueryClient },
) {
  const { client, Wrapper } = withQueryClient(options?.client)
  const utils = renderHook(hook, { wrapper: Wrapper, ...options })
  return { ...utils, client }
}
