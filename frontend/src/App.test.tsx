import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { App } from './App';

describe('App', () => {
  it('deve renderizar a página inicial com a identidade da clínica', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getAllByText('Sorriso Mineiro').length).toBeGreaterThan(0);
    expect(screen.getByText('Clínica Odontológica Especializada')).toBeInTheDocument();
    expect(screen.getByText(/O cuidado que o seu sorriso merece/i)).toBeInTheDocument();
  });
});
