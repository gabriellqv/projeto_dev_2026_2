#!/usr/bin/env bash
# Script de smoke test para validação de boot da stack com Docker Compose

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

CREATED_ENV=0

# Garante a existência do arquivo de configuração de variáveis caso não exista
if [ ! -f .env ]; then
  echo "Arquivo .env não encontrado na raiz. Criando cópia temporária a partir de .env.example..."
  cp .env.example .env
  CREATED_ENV=1
fi

# Define credenciais padrão seguras para teste caso não estejam exportadas no ambiente
export JWT_SECRET="${JWT_SECRET:-chave-secreta-de-teste-ci-minimo-32-caracteres}"
export ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin123}"

# Função para limpeza de recursos e encerramento seguro
cleanup() {
  local exit_code=$?
  if [ "${SMOKE_KEEP:-0}" = "1" ]; then
    echo "Variável SMOKE_KEEP=1 detectada: mantendo os containers da stack ativos para depuração."
  else
    echo "Encerrando e removendo containers da stack..."
    docker compose down -v --remove-orphans || true
  fi

  if [ "$CREATED_ENV" -eq 1 ] && [ -f .env ]; then
    echo "Removendo arquivo .env temporário criado pelo script..."
    rm -f .env
  fi

  exit "$exit_code"
}

trap cleanup EXIT INT TERM

# Função para aguardar o status healthy de um serviço
wait_for_health() {
  local service="$1"
  local timeout="${2:-90}"
  local elapsed=0

  echo "Aguardando serviço '$service' atingir o status de saúde (healthy)..."

  while [ "$elapsed" -lt "$timeout" ]; do
    local cid
    cid="$(docker compose ps -q "$service" 2>/dev/null || true)"

    if [ -n "$cid" ]; then
      local status
      status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$cid" 2>/dev/null || true)"

      if [ "$status" = "healthy" ]; then
        echo "Serviço '$service' confirmado como saudável (healthy) após ${elapsed}s."
        return 0
      fi

      if [ "$status" = "unhealthy" ] || [ "$status" = "exited" ]; then
        echo "Erro: Serviço '$service' apresentou status '$status'."
        docker compose logs "$service" || true
        return 1
      fi
    fi

    sleep 2
    elapsed=$((elapsed + 2))
  done

  echo "Erro: Tempo limite de ${timeout}s esgotado aguardando o serviço '$service' ficar saudável."
  docker compose logs "$service" || true
  return 1
}

# Função para validar resposta HTTP 200 em uma URL
wait_for_http() {
  local url="$1"
  local timeout="${2:-60}"
  local elapsed=0

  echo "Validando requisição HTTP 200 em $url..."

  while [ "$elapsed" -lt "$timeout" ]; do
    local code
    code="$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || true)"

    if [ "$code" = "200" ]; then
      echo "Requisição para $url retornou HTTP 200 com sucesso após ${elapsed}s."
      return 0
    fi

    sleep 2
    elapsed=$((elapsed + 2))
  done

  echo "Erro: Tempo limite de ${timeout}s esgotado aguardando resposta HTTP 200 em $url."
  echo "Logs gerais da stack para diagnóstico:"
  docker compose logs || true
  return 1
}

echo "Iniciando a stack via Docker Compose..."
if [ "${SMOKE_SKIP_BUILD:-0}" = "1" ]; then
  echo "SMOKE_SKIP_BUILD=1: pulando build, levantando containers com imagens existentes..."
  docker compose up -d
else
  echo "Executando build das imagens antes de iniciar os containers..."
  docker compose up --build -d
fi

# Verificação de saúde dos serviços principais
wait_for_health "postgres" 90
wait_for_health "backend" 90

# Validação das respostas HTTP nos endpoints da aplicação
wait_for_http "http://localhost:3000/api/health" 30
wait_for_http "http://localhost" 30

echo "Smoke test concluído com sucesso."
