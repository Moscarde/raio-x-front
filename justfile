# Comandos de setup e deploy do RadarSUS Municipal.
# Requer: node, npm, docker (com BuildKit), ssh configurado para o VPS de
# deploy. Ajuste `deploy_host` e `deploy_container` antes de usar `just deploy`.

image_name := "raio-x-front"
image_tag := "latest"
env_file := ".env"

# VPS de deploy — ajuste antes de rodar `just deploy`.
deploy_host := "usuario@seu-servidor"
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

# Deploy no VPS via docker save/load por SSH (sem depender de um registry).
# Assume Postgres acessível via localhost no próprio VPS (--network=host);
# ajuste se o seu setup remoto for diferente (ex.: mesma rede docker-compose).
deploy: docker-build
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
