import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from './App';

describe('App', () => {
  it('deve renderizar o nome da aplicação', () => {
    render(<App />);

    expect(screen.getByText('Sorriso Mineiro')).toBeInTheDocument();
  });
});
