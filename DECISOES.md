# Decisões do projeto

## Tema e produto

Escolhi a clínica odontológica fictícia **Sorriso Mineiro** porque o agendamento de consultas atende de forma natural a todos os requisitos do desafio: captação pública de solicitações, triagem com status inicial `PENDENTE` e painel de gestão com controle operacional. O tema permitiu incluir duração estimada, preço e catálogo de procedimentos ativos sem complexidade desnecessária no modelo relacional.

## Arquitetura e stack

Optei por uma stack amplamente adotada no mercado (Node.js, Express, React e PostgreSQL) por sua maturidade, performance e facilidade de manutenção por qualquer equipe de desenvolvimento.

- **Monorepo com TypeScript e Zod:** Compartilha tipos e validações entre frontend e backend, eliminando inconsistências de contrato.
- **Node.js, Express e PostgreSQL:** O Express fornece uma API REST leve. O PostgreSQL com Prisma cuida dos relacionamentos entre pacientes, horários e procedimentos com integridade referencial e índices de busca.
- **Inversão de Dependências (Repository Pattern):** Desacoplou a lógica de domínio do banco de dados, permitindo injetar repositórios in-memory para testes unitários instantâneos e isolados.
- **JWT em cookies httpOnly:** Protege a sessão do administrador contra acessos indevidos via scripts no navegador (XSS), com atributo `SameSite=Lax` e CORS restrito.
- **React, Vite e Tailwind CSS:** O React organiza a interface em componentes reutilizáveis, e o Tailwind dá suporte nativo ao modo escuro.

**O que ganhei:**

- Tipagem de ponta a ponta e um único contrato de validação (Zod) entre front e back.
- Testar regras de negócio sem subir containers (repositórios in-memory).
- Carregamento mais rápido com code-splitting por rota (`React.lazy`) e assets otimizados.
- Schema versionado via migrations do Prisma, com índices de busca declarados no próprio modelo.
- Documentação de API gerada (Swagger/OpenAPI) a partir das rotas.

**O que perdi:**

- Mais tempo de configuração inicial (monorepo, ESLint, Prettier, TypeScript, Husky) do que um framework opinado como Laravel ou Rails.
- Dois processos para rodar em dev (API e front), em vez de um único servidor.
- Autenticação por cookie httpOnly exige cuidar do ciclo do token e do `SameSite`/`Secure`, em vez de um `localStorage` simples.

## Ferramentas

- **Husky + commitlint + lint-staged:** mantém mensagens de commit padronizadas e lint no pre-commit.

## Decisões de produto

- **Procedimentos desativados:** Ao desativar um procedimento no painel, ele deixa de aparecer no formulário público. Agendamentos anteriores permanecem vinculados e visíveis no histórico operacional.
- **Painel sem registros (estado vazio):** Quando o banco ainda não possui agendamentos, o painel exibe um estado visual informativo orientando sobre o primeiro agendamento.
- **Transição de status:** O fluxo segue `PENDENTE` -> `CONFIRMADO` -> `ATENDIDO`. O status `CANCELADO` pode ser acionado a partir de pendente ou confirmado; tanto `CANCELADO` quanto `ATENDIDO` são estados finais irreversíveis. `ATENDIDO` é uma extensão do tema (distinguir "confirmado" de "já atendido"), mantendo os três status obrigatórios intactos.
- **Prevenção de duplicidade:** Uma _unique constraint_ composta no PostgreSQL (`email + data + horario`) impede que o mesmo paciente solicite dois agendamentos no mesmo horário.
- **Validação de datas:** O formulário bloqueia datas no passado e domingos diretamente no calendário, com validação complementar no backend.
- **Busca e paginação no backend:** A listagem principal do painel processa filtros por status, busca textual (nome/e-mail) e paginação (10 registros por página) diretamente nas queries do Prisma.

## Escopo consciente

- **Envio real de e-mails/WhatsApp:** Ficou fora para não introduzir provedores externos ou dependência de credenciais no teste. O fluxo exibe tela de confirmação imediata e gera links diretos para WhatsApp.
- **Notificações em tempo real:** Desnecessárias para a volumetria proposta; o painel atualiza os dados a cada ação do administrador.

## Testes

Cobri a pirâmide completa com foco nos fluxos centrais:

- **Backend:** 28 unitários (regras de negócio, repositórios in-memory) + 15 de integração (PostgreSQL real, Supertest).
- **Frontend:** 23 unitários (formulário público, hooks, `ProtectedRoute`).
- **E2E (Playwright):** 6 testes em Chromium headless cobrindo os fluxos reais de paciente e admin, na pipeline de CI.

## Melhorias além do mínimo

1. **Histórico de auditoria de status:** Tabela `HistoricoStatus` que registra todas as alterações de status com data/hora para rastreabilidade.
2. **Dashboard com KPIs e exportação CSV:** Cards de contagem por status, métricas e exportação direta da listagem para planilhas.
3. **Agenda diária/semanal e carteira de pacientes:** Visualizações complementares para facilitar a rotina da recepção.
4. **Otimização de assets:** Imagens da landing page convertidas para WebP, reduzindo o payload em 93%.
5. **Deploy em produção:** Aplicação e documentação online disponibilizadas para validação direta.

## Uso de IA

**O que foi delegado vs o que foi feito à mão**

Utilizei IA como apoio de produtividade (pair programming): ela ajudou na geração inicial de boilerplate (estruturas repetitivas de rotas Express e schemas Zod) e no rascunho de componentes visuais básicos (cards, badges, skeletons).

Todas as decisões arquiteturais, a modelagem relacional no Prisma, as regras de negócio de status, a autenticação JWT via cookies `httpOnly` e a implementação dos testes foram estruturadas e revisadas manualmente.

**Onde a IA errou**

Na criação inicial das telas do frontend, a IA gerou componentes monolíticos com mais de 350 linhas em um único arquivo, misturando formulário, pickers de data/hora, estados locais e regras de validação. Identifiquei o acoplamento excessivo e quebrei a estrutura em subcomponentes isolados e focados (`CalendarPicker`, `TimePicker`, `AppointmentFilters`, `AppointmentTable`, etc.).

**Decisões tomadas contra a sugestão da IA**

- **JWT em cookies httpOnly vs localStorage:** A IA sugeriu salvar o token no `localStorage` para simplificar requisições. Recusei por ser vulnerável a ataques XSS e optei por cookies `httpOnly` com `sameSite: 'strict'`, garantindo que o token fique inacessível a scripts do cliente.
- **Fábricas nativas vs bibliotecas pesadas de IoC:** A IA sugeriu instalar pacotes externos como `inversify` para injeção de dependências. Recusei a complexidade extra e implementei fábricas simples (factory functions), obtendo desacoplamento e testabilidade com TypeScript nativo e limpo.
