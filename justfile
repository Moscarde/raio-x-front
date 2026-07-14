# Comandos de setup e deploy do RadarSUS Municipal.
# Requer: node, npm, docker (com BuildKit), ssh configurado para o VPS de
# deploy. Ajuste `deploy_host` e `deploy_container` antes de usar `just deploy`.

image_name := "raio-x-front"
image_tag := "latest"
env_file := ".env"

# VPS de produção.
deploy_host := "moscarde@2.25.172.31"
deploy_container := "raio-x-front"
deploy_port := "3067"

export DOCKER_BUILDKIT := "1"

default:
    @just --list

# --- Ambiente local ---

# Instala dependências e prepara o .env.local (não sobrescreve se já existir)
setup:
    npm install
    [ -f .env.local ] || cp .env.example .env.local
    @echo "Preencha .env.local com as credenciais reais do Postgres (nunca versionar)."

dev:
    #!/usr/bin/env bash
    set -euo pipefail
    # Next.js 16 exige Node >=20.9 — usa o Node 20 do nvm se disponível
    # (system node pode estar preso numa versão mais velha via apt/distro).
    if [ -s "$HOME/.nvm/nvm.sh" ]; then
        . "$HOME/.nvm/nvm.sh"
        nvm use 20 > /dev/null
    fi
    npm run dev

# tsc + lint + testes — rodar antes de build/deploy
check:
    npx tsc --noEmit
    npm run lint
    npm run test

build:
    npm run build

# --- Docker / deploy ---

# Build da imagem de produção — precisa de .env com POSTGRES_*
# (rotas estáticas consultam o Postgres em build time; ver Dockerfile).
# --network=host: testado neste projeto — o Postgres do raio-x-engenharia
# é publicado só em 127.0.0.1 do host, inacessível pela rede bridge padrão
# do Docker. Se o seu Postgres estiver em outro host/rede, troque por
# POSTGRES_HOST real no .env e remova essa flag.
docker-build:
    docker build --network=host --secret id=env_production,src={{ env_file }} -t {{ image_name }}:{{ image_tag }} .

# Roda a imagem localmente para testar antes do deploy (mesma ressalva de rede acima)
docker-run:
    docker run --rm --network=host -e PORT={{ deploy_port }} --env-file {{ env_file }} --name {{ deploy_container }} {{ image_name }}:{{ image_tag }}

# Deploy executado no próprio VPS. Assume Postgres acessível via localhost
# (--network=host); ajuste se o seu setup usar outra rede Docker.
deploy: docker-build
    docker rm -f {{ deploy_container }} 2>/dev/null || true
    docker run -d --restart unless-stopped --network=host -e PORT={{ deploy_port }} --env-file {{ env_file }} --name {{ deploy_container }} {{ image_name }}:{{ image_tag }}

# Deploy remoto via docker save/load, para uso fora do VPS (sem registry).
deploy-remote: docker-build
    docker save {{ image_name }}:{{ image_tag }} | gzip | ssh {{ deploy_host }} "gunzip | docker load"
    scp {{ env_file }} {{ deploy_host }}:~/{{ image_name }}.env
    ssh {{ deploy_host }} "docker stop {{ deploy_container }} 2>/dev/null; docker rm {{ deploy_container }} 2>/dev/null; docker run -d --restart unless-stopped --network=host -e PORT={{ deploy_port }} --env-file ~/{{ image_name }}.env --name {{ deploy_container }} {{ image_name }}:{{ image_tag }}"

# --- Limpeza ---

clean:
    rm -rf .next node_modules

# --- Rebuild completo ---

# Rebuild local: limpa .next/node_modules, reinstala e builda.
# Credenciais vêm de .env (lido automaticamente pelo Next.js, sem export manual).
rebuild-local: clean
    npm install
    npm run build

# Rebuild da imagem Docker usando .env (ver env_file acima).
rebuild-docker: docker-build

# Rebuild do sistema inteiro: local (clean/install/build) + imagem Docker,
# ambos usando .env. Não reinicia `just dev` nem reimplanta na VPS — rode
# `just dev` ou `just deploy` depois, conforme o alvo.
rebuild: rebuild-local rebuild-docker
