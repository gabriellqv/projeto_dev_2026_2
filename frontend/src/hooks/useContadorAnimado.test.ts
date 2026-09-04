import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useContadorAnimado } from './useContadorAnimado.js';

describe('useContadorAnimado', () => {
  it('deve definir o valor final imediatamente quando prefers-reduced-motion estiver ativo', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
      matches: query.includes('prefers-reduced-motion: reduce'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useContadorAnimado(100));

    expect(result.current).toBe(100);
  });
});
