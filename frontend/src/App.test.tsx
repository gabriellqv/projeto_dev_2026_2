import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { App } from './App';

describe('App', () => {
  it('deve renderizar a pagina inicial com a identidade da clinica', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByText('OdontoAgenda')).toBeInTheDocument();
    expect(screen.getByText('Seu sorriso em boas maos')).toBeInTheDocument();
  });
});
