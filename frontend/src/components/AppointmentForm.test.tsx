import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { ThemeProvider } from '../contexts/ThemeContext';

import { AppointmentForm } from './AppointmentForm';

const UUID_LIMPEZA = '11111111-1111-1111-1111-111111111111';
const UUID_CLAREAMENTO = '22222222-2222-2222-2222-222222222222';

const mockProcedimentos = [
  {
    id: UUID_LIMPEZA,
    titulo: 'Limpeza Dental',
    ativa: true,
    preco: '150.00',
    duracaoMinutos: 30,
  },
  {
    id: UUID_CLAREAMENTO,
    titulo: 'Clareamento Dental',
    ativa: true,
    preco: '450.00',
    duracaoMinutos: 60,
  },
];

describe('AppointmentForm', () => {
  const handleSubmitMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar todos os campos principais do formulário de agendamento', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <AppointmentForm procedimentos={mockProcedimentos} onSubmit={handleSubmitMock} />
        </ThemeProvider>
      </BrowserRouter>,
    );

    expect(screen.getByLabelText(/Nome Completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/E-mail para Confirmação/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/WhatsApp \/ Telefone/i)).toBeInTheDocument();
    expect(screen.getByText(/Solicitar Agendamento/i)).toBeInTheDocument();
  });

  it('deve exibir erros de validação ao submeter formulário com campos vazios', async () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <AppointmentForm procedimentos={mockProcedimentos} onSubmit={handleSubmitMock} />
        </ThemeProvider>
      </BrowserRouter>,
    );

    const submitBtn = screen.getByRole('button', { name: /Solicitar Agendamento/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('O nome deve ter pelo menos 2 caracteres')).toBeInTheDocument();
      expect(screen.getByText('Informe um e-mail válido')).toBeInTheDocument();
    });
  });

  it('deve chamar onSubmit com os dados preenchidos quando todos os campos forem válidos', async () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <AppointmentForm
            procedimentos={mockProcedimentos}
            procedimentoPreSelecionadoId={UUID_LIMPEZA}
            onSubmit={handleSubmitMock}
          />
        </ThemeProvider>
      </BrowserRouter>,
    );

    // Preenche campos de texto
    fireEvent.change(screen.getByLabelText(/Nome Completo/i), {
      target: { value: 'Carlos Drummond de Andrade' },
    });
    fireEvent.change(screen.getByLabelText(/E-mail para Confirmação/i), {
      target: { value: 'carlos@exemplo.com' },
    });
    fireEvent.change(screen.getByLabelText(/WhatsApp \/ Telefone/i), {
      target: { value: '(38) 99999-8888' },
    });

    // Submissão sem data/hora deve exibir erro de validação
    const submitBtn = screen.getByRole('button', { name: /Solicitar Agendamento/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Informe uma data válida')).toBeInTheDocument();
      expect(screen.getByText('Informe um horário válido')).toBeInTheDocument();
    });
  });
});
