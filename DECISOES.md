# Decisões do projeto

## Tema e produto

Escolhi a clínica odontológica fictícia **Sorriso Mineiro** porque o agendamento de consultas atende de forma natural a todos os requisitos do desafio: captação pública de solicitações, triagem com status inicial `PENDENTE` e painel de gestão com controle operacional. O tema permitiu incluir duração estimada, preço e catálogo de procedimentos ativos sem complexidade desnecessária no modelo relacional.

## Arquitetura e stack

Optei por uma stack muito usada no mercado (Node.js, Express, React e PostgreSQL) por ter uma comunidade ampla e facilitar a manutenção por outros desenvolvedores. Estruturei a arquitetura em camadas simples para que o código seja fácil de entender e testar, evitando a complexidade de frameworks mais opinados como NestJS:

- **Monorepo com TypeScript e Zod:** Compartilha os mesmos tipos e validações no frontend e no backend, evitando erros de contrato.
- **Node.js, Express e PostgreSQL:** O Express fornece uma API leve e flexível sem complexidade desnecessária. O PostgreSQL com Prisma cuida dos relacionamentos entre pacientes, horários e procedimentos, garantindo que não existam agendamentos duplicados.
- **Arquitetura em camadas e injeção de dependências:** Adotei o Repository Pattern com injeção de dependências via factories (inversão de controle). Isso desacoplou as regras de negócio do banco de dados e permitiu injetar repositórios em memória para rodar testes unitários rápidos e isolados.
- **JWT em cookies httpOnly:** Protege a sessão do administrador contra acessos indevidos via scripts no navegador (XSS), sendo mais seguro do que salvar no `localStorage`.
- **React, Vite e Tailwind CSS:** O Vite entrega inicialização rápida e build otimizado. O React organiza a interface em componentes isolados com carregamento sob demanda, enquanto o Tailwind facilita a criação do tema visual e do modo escuro.

## Decisões de produto

- **Procedimentos desativados:** Ao desativar um procedimento no painel, ele deixa de aparecer no formulário público. Agendamentos anteriores permanecem vinculados e visíveis no histórico operacional.
- **Painel sem registros (estado vazio):** Quando o banco ainda não possui agendamentos, o painel exibe um estado visual informativo orientando sobre o primeiro agendamento em vez de uma tabela vazia e fria.
- **Transição de status:** O fluxo segue `PENDENTE` -> `CONFIRMADO` -> `ATENDIDO`. O status `CANCELADO` pode ser acionado a partir de pendente ou confirmado; tanto `CANCELADO` quanto `ATENDIDO` são estados finais irreversíveis.
- **Prevenção de duplicidade:** Uma _unique constraint_ composta no PostgreSQL (`email + data + horario`) impede que o mesmo paciente solicite dois agendamentos no mesmo horário.
- **Validação de datas:** O formulário bloqueia datas no passado e domingos diretamente no calendário, com validação complementar no backend.
- **Busca e paginação no backend:** A listagem principal do painel processa filtros por status, busca textual (nome/e-mail) e paginação (10 registros por página) diretamente nas queries do Prisma.

## Escopo consciente

- **Envio real de e-mails/WhatsApp:** Ficou fora para não introduzir provedores externos ou dependência de credenciais no teste. O fluxo exibe tela de confirmação imediata e gera links diretos para WhatsApp.
- **Notificações em tempo real:** Desnecessárias para a volumetria proposta; o painel atualiza os dados a cada ação do administrador.

## Testes

Priorizei testar os fluxos centrais que não podem falhar em produção:

- **Backend:** Testes unitários de regras de negócio (criação de registros, recusa de inválidos e transição de status) com repositórios in-memory e testes de integração com banco de dados.
- **Frontend:** Testes do formulário público com React Testing Library, roteamento e bloqueio do painel sem autenticação (`ProtectedRoute`).

## Melhorias além do mínimo

1. **Histórico de auditoria de status:** Tabela `HistoricoStatus` que registra todas as alterações de status com data/hora para rastreabilidade.
2. **Dashboard com KPIs e exportação CSV:** Cards de contagem por status, métricas e exportação direta da listagem para planilhas.
3. **Agenda diária/semanal e carteira de pacientes:** Visualizações complementares para facilitar a rotina da recepção.
4. **Otimização de assets:** Imagens da landing page convertidas para WebP, reduzindo o payload em 93%.
5. **Deploy em produção:** Aplicação e documentação online disponibilizadas para validação direta.

## Uso de IA

**O que foi delegado vs o que foi feito à mão**

Utilizei IA como apoio de produtividade (pair programming): ela ajudou na geração inicial de boilerplate (estruturas repetitivas de rotas Express e schemas Zod), redação dos textos fictícios da clínica para a landing page e rascunho de componentes visuais básicos (cards, badges, skeletons).

Todas as decisões arquiteturais (Repository Pattern, factories de injeção de dependências, DTOs de saída), modelagem relacional no Prisma, regras de negócio de status, autenticação JWT via cookies `httpOnly` e implementação dos testes foram estruturadas e revisadas manualmente.

**Onde a IA errou**

Na criação inicial das telas do frontend, a IA gerou componentes monolíticos com mais de 350 linhas em um único arquivo, misturando formulário, pickers de data/hora, estados locais e regras de validação. Identifiquei o acoplamento excessivo e quebrei a estrutura em subcomponentes isolados e focados (`CalendarPicker`, `TimePicker`, `AppointmentFilters`, `AppointmentTable`, etc.).

**Decisões tomadas contra a sugestão da IA**

- **JWT em cookies httpOnly vs localStorage:** A IA sugeriu salvar o token no `localStorage` para simplificar requisições. Recusei por ser vulnerável a ataques XSS e optei por cookies `httpOnly` com `sameSite: 'strict'`, garantindo que o token fique inacessível a scripts do cliente.
- **Fábricas nativas vs bibliotecas pesadas de IoC:** A IA sugeriu instalar pacotes externos como `inversify` para injeção de dependências. Recusei a complexidade extra e implementei fábricas simples (factory functions), obtendo desacoplamento e testabilidade com TypeScript nativo e limpo.
