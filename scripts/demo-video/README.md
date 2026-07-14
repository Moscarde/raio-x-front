# Demo em vídeo do RadarSUS

Este diretório contém a automação Playwright que grava uma demonstração comercial/técnica do RadarSUS navegando pelo deploy em `http://2.25.172.31:3067/`.
O script injeta um cursor visual e uma trilha temporária na página para que o caminho do mouse apareça no vídeo gravado pelo Playwright.

## Dependências

* Deploy RadarSUS acessível em `http://2.25.172.31:3067/`.
* Node.js compatível com o projeto. O Next.js 16 deste repositório requer Node 20.9+.
* Dependências de desenvolvimento: `playwright`, `tsx` e `ffmpeg-static`.
* Browser Chromium do Playwright instalado com `npx playwright install chromium`.
* FFmpeg no PATH ou o binário fornecido por `ffmpeg-static`.

Se quiser usar FFmpeg do sistema no Ubuntu/Debian:

```bash
sudo apt-get update && sudo apt-get install -y ffmpeg
```

## Como rodar

Com o deploy disponível em `http://2.25.172.31:3067/`:

```bash
npm run demo:video
```

O vídeo final será salvo em:

```txt
artifacts/demo-video/radarsus-demo.mp4
```

Artefatos intermediários do Playwright, como `.webm`, também ficam em `artifacts/demo-video/`.

## Como ajustar roteiro e duração

* Edite `storyboard.md` para alterar a narrativa das cenas.
* Edite `record-demo.ts` para mudar rotas, textos procurados, pausas e movimentos de mouse.
* A duração é controlada principalmente pelas chamadas `pause(...)`, `hoverText(...)`, `sweepRecharts(...)`, `smoothScrollBy(...)` e pelas cenas navegadas.

## Seletores

O script prioriza seletores resilientes:

* `getByRole` para links e botões.
* `getByText` para cards, títulos e blocos de conteúdo.
* Seletores CSS genéricos apenas para áreas gráficas (`svg`, `main`, `body`).

Quando um elemento esperado não aparece, o script registra um aviso e continua para a próxima cena.

## Problemas comuns

* Deploy indisponível: confirme acesso a `http://2.25.172.31:3067/` antes de gravar.
* Chromium ausente: rode `npx playwright install chromium`.
* FFmpeg ausente: instale via sistema ou mantenha `ffmpeg-static` instalado.
* Ambiente sem display: o script roda em modo headless por padrão, adequado para Linux sem interface gráfica.
* Node incompatível: se comandos do Next falharem, atualize para Node 20.9+.
