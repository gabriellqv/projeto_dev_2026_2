import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { App } from './App';

describe('App', () => {
  it('deve renderizar a página inicial com a identidade da clínica', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );

    const titulo = await screen.findByText(/O cuidado que o seu sorriso merece/i);
    expect(titulo).toBeInTheDocument();

    const subtitulo = await screen.findByText('Clínica Odontológica Especializada');
    expect(subtitulo).toBeInTheDocument();

    expect(screen.getAllByText('Sorriso Mineiro').length).toBeGreaterThan(0);
  });
});
