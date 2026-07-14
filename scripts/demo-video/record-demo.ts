import { execFile } from "node:child_process";
import { createRequire } from "node:module";
import { access, mkdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { chromium, type Locator, type Page } from "playwright";

const execFileAsync = promisify(execFile);
const requireFromScript = createRequire(import.meta.url);

const appUrl = "http://2.25.172.31:3067";
const artifactDir = path.resolve("artifacts/demo-video");
const finalVideoPath = path.join(artifactDir, "radarsus-demo.mp4");
const municipioBase = "/municipios/3303807";
const viewport = { width: 1920, height: 1080 };

type AriaRole = Parameters<Page["getByRole"]>[0];
type VideoMetadata = { durationSeconds: number | null; sizeBytes: number; path: string };

async function main(): Promise<void> {
  await mkdir(artifactDir, { recursive: true });
  await removeIfExists(finalVideoPath);
  await waitForLocalApp();

  const webmPath = await recordDemoSession();
  await convertWebmToMp4(webmPath, finalVideoPath);

  const metadata = await getVideoMetadata(finalVideoPath);
  console.log(JSON.stringify({ event: "demo_video_created", ...metadata }));
}

async function waitForLocalApp(): Promise<void> {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 60_000) {
    if (await isAppAvailable()) return;
    await pause(1_000);
  }

  throw new Error(`Aplicação indisponível em ${appUrl}. Esperado deploy ativo em http://2.25.172.31:3067/.`);
}

async function isAppAvailable(): Promise<boolean> {
  try {
    const response = await fetch(appUrl, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}

async function recordDemoSession(): Promise<string> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    recordVideo: { dir: artifactDir, size: viewport },
    viewport,
  });
  await context.addInitScript(injectDemoCursor);

  const page = await context.newPage();
  await runStoryboard(page);

  const video = page.video();
  await context.close();
  await browser.close();

  if (!video) throw new Error("Playwright não retornou o artefato de vídeo.");
  return video.path();
}

async function runStoryboard(page: Page): Promise<void> {
  await sceneHome(page);
  await sceneOverview(page);
  await sceneNetwork(page);
  await scenePrimaryCare(page);
  await sceneProduction(page);
  await sceneAlerts(page);
  await sceneComparator(page);
  await sceneReport(page);
  await sceneQualityAndDocs(page);
  await sceneClosing(page);
}

async function sceneHome(page: Page): Promise<void> {
  await gotoPage(page, "/");
  await settle(page);
  await spotlightText(page, "RadarSUS");
  await hoverRole(page, "link", "Nova Iguaçu");
  await hoverRole(page, "link", "Rio de Janeiro");
  await clickRole(page, "link", "Paraty");
  await settle(page);
}

async function sceneOverview(page: Page): Promise<void> {
  await spotlightText(page, "RAIO-X MUNICIPAL");
  await hoverText(page, "Paraty");
  await hoverText(page, "UNIDADES CNES");
  await hoverText(page, "PRODUÇÃO AMB. / MÊS");
  await hoverText(page, "Internações (SIH)");
  await openMunicipioSelect(page);
  await hoverText(page, "Produção ambulatorial");
  await sweepRecharts(page, 0, 8);
  await hoverText(page, "Alertas priorizados");
  await smoothScrollBy(page, 520);
  await hoverText(page, "Rede instalada");
  await hoverText(page, "Indicadores APS");
  await smoothScrollBy(page, -520);
}

async function sceneNetwork(page: Page): Promise<void> {
  await clickRole(page, "link", "Rede e CNES");
  await settle(page);
  await hoverText(page, "Estabelecimentos cadastrados");
  await hoverText(page, "Com vínculo SUS");
  await hoverText(page, "Consultório Isolado");
  await hoverText(page, "Centro de Saúde/Unidade Básica de Saúde");
  await hoverText(page, "Sociedade Empresária Limitada");
  await smoothScrollBy(page, 430);
  await hoverText(page, "Unidades cadastradas");
  await hoverText(page, "Exibindo");
}

async function scenePrimaryCare(page: Page): Promise<void> {
  await clickRole(page, "link", "Atenção Primária");
  await settle(page);
  await hoverText(page, "Indicadores por visão de equipe");
  await hoverText(page, "Válidas");
  await smoothScrollBy(page, 360);
  await hoverText(page, "Previne Brasil foi extinto em 2024");
}

async function sceneProduction(page: Page): Promise<void> {
  await clickRole(page, "link", "Produção");
  await settle(page);
  await hoverText(page, "Procedimentos aprovados");
  await hoverText(page, "Valor aprovado");
  await hoverText(page, "Produção por competência");
  await sweepRecharts(page, 0, 12);
  await pause(500);
  await sweepRecharts(page, 0, 12);
  await smoothScrollBy(page, 420);
  await hoverText(page, "Produção por grupo de procedimento");
  await hoverText(page, "Grupo 02");
  await hoverText(page, "Grupo 03");
}

async function sceneAlerts(page: Page): Promise<void> {
  await clickRole(page, "link", "Alertas");
  await settle(page);
  await hoverText(page, "Todos os alertas");
  await hoverText(page, "Nenhuma regra de alerta implementada");
}

async function sceneComparator(page: Page): Promise<void> {
  await clickRole(page, "link", "Comparador");
  await settle(page);
  await hoverText(page, "Resumo comparativo");
  await hoverText(page, "Nova Iguaçu");
  await hoverText(page, "Rio de Janeiro");
  await smoothScrollBy(page, 500);
  await hoverText(page, "Indicadores APS");
  await hoverText(page, "Paraty");
}

async function sceneReport(page: Page): Promise<void> {
  await gotoPage(page, `${municipioBase}/relatorio`);
  await settle(page);
  await hoverText(page, "Relatório executivo");
  await hoverText(page, "Geração de relatório com IA");
  await hoverText(page, "Visão Geral, Rede e CNES, Atenção Primária e Produção");
}

async function sceneQualityAndDocs(page: Page): Promise<void> {
  await clickRole(page, "link", "Qualidade dos dados");
  await settle(page);
  await hoverText(page, "Fontes carregadas");
  await hoverText(page, "SIA");
  await hoverText(page, "Campos críticos nulos");
  await clickRole(page, "link", "metodologia e limitações");
  await settle(page);
  await hoverText(page, "Metodologia e fontes dos indicadores");
  await smoothScrollBy(page, 720);
  await hoverText(page, "Produção ambulatorial");
}

async function sceneClosing(page: Page): Promise<void> {
  await gotoPage(page, municipioBase);
  await settle(page);
  await hoverText(page, "RAIO-X MUNICIPAL");
  await sweepRecharts(page, 0, 10);
  await smoothScrollBy(page, 380);
  await hoverText(page, "Rede instalada");
  await pause(3_000);
}

async function gotoPage(page: Page, route: string): Promise<void> {
  await page.goto(`${appUrl}${route}`, { timeout: 45_000, waitUntil: "networkidle" });
  await ensureCursorVisible(page);
}

async function settle(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle");
  await ensureCursorVisible(page);
  await pause(700);
}

async function openMunicipioSelect(page: Page): Promise<void> {
  const trigger = page.getByRole("combobox").first();
  if (!(await isVisible(trigger))) return warnMissing("municipio select");
  await moveToLocator(page, trigger, "municipio select");
  await trigger.click({ force: true, timeout: 4_000 });
  await pause(900);
  await hoverText(page, "Rio de Janeiro · RJ");
  await page.keyboard.press("Escape");
}

async function hoverRole(page: Page, role: AriaRole, name: string): Promise<void> {
  const locator = page.getByRole(role, { name: new RegExp(name, "i") }).first();
  await moveToLocator(page, locator, `role=${role} name=${name}`);
}

async function clickRole(page: Page, role: AriaRole, name: string): Promise<void> {
  const locator = page.getByRole(role, { name: new RegExp(name, "i") }).first();
  if (!(await moveToLocator(page, locator, `role=${role} name=${name}`))) return;
  await locator.click({ force: true, timeout: 4_000 });
  await pulseCursor(page);
  await pause(800);
}

async function hoverText(page: Page, text: string): Promise<void> {
  const locator = page.getByText(new RegExp(escapeRegex(text), "i")).first();
  await moveToLocator(page, locator, `text=${text}`);
}

async function spotlightText(page: Page, text: string): Promise<void> {
  await hoverText(page, text);
  await pause(900);
}

async function sweepRecharts(page: Page, index: number, steps: number): Promise<void> {
  const chart = page.locator(".recharts-wrapper").nth(index);
  if (!(await isVisible(chart))) return warnMissing(`recharts-wrapper[${index}]`);

  await chart.scrollIntoViewIfNeeded({ timeout: 4_000 });
  const box = await chart.boundingBox();
  if (!box) return warnMissing(`recharts-wrapper[${index}] box`);

  const y = box.y + box.height * 0.55;
  for (let step = 0; step < steps; step += 1) {
    const progress = steps === 1 ? 0.5 : step / (steps - 1);
    const x = box.x + box.width * (0.08 + progress * 0.84);
    await page.mouse.move(x, y + Math.sin(step) * 16, { steps: 18 });
    await pause(280);
  }
}

async function moveToLocator(page: Page, locator: Locator, label: string): Promise<boolean> {
  if (!(await isVisible(locator))) {
    warnMissing(label);
    return false;
  }

  await locator.scrollIntoViewIfNeeded({ timeout: 4_000 });
  const box = await locator.boundingBox();
  if (!box) {
    warnMissing(`${label} box`);
    return false;
  }

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 32 });
  await pause(620);
  return true;
}

async function isVisible(locator: Locator): Promise<boolean> {
  try {
    return await locator.isVisible({ timeout: 2_000 });
  } catch {
    return false;
  }
}

async function smoothScrollBy(page: Page, pixels: number): Promise<void> {
  await page.evaluate(
    (distance) => new Promise<void>((resolve) => {
      window.scrollBy({ top: distance, behavior: "smooth" });
      window.setTimeout(resolve, 1_000);
    }),
    pixels,
  );
  await pause(500);
}

async function ensureCursorVisible(page: Page): Promise<void> {
  await page.mouse.move(1320, 180, { steps: 16 });
}

async function pulseCursor(page: Page): Promise<void> {
  await page.evaluate(() => window.dispatchEvent(new CustomEvent("radarsus-demo-click")));
}

async function convertWebmToMp4(inputPath: string, outputPath: string): Promise<void> {
  const ffmpegPath = await getFfmpegPath();
  if (!ffmpegPath) throw new Error(getFfmpegInstallMessage());

  await execFileAsync(ffmpegPath, [
    "-y", "-i", inputPath, "-c:v", "libx264", "-pix_fmt", "yuv420p",
    "-movflags", "+faststart", outputPath,
  ]);
}

async function getFfmpegPath(): Promise<string | null> {
  const pathFfmpeg = await findExecutable("ffmpeg");
  if (pathFfmpeg) return pathFfmpeg;

  const staticPath = requireFromScript("ffmpeg-static") as string | null;
  if (staticPath && (await exists(staticPath))) return staticPath;
  return null;
}

async function findExecutable(binaryName: string): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync("which", [binaryName]);
    return stdout.trim() || null;
  } catch {
    return null;
  }
}

async function getVideoMetadata(videoPath: string): Promise<VideoMetadata> {
  const fileStat = await stat(videoPath);
  return {
    durationSeconds: await getDurationWithFfmpeg(videoPath),
    path: videoPath,
    sizeBytes: fileStat.size,
  };
}

async function getDurationWithFfmpeg(videoPath: string): Promise<number | null> {
  const ffmpegPath = await getFfmpegPath();
  if (!ffmpegPath) return null;

  try {
    const { stderr } = await execFileAsync(ffmpegPath, ["-i", videoPath]);
    return parseDuration(stderr);
  } catch (error) {
    return parseDuration((error as { stderr?: string }).stderr ?? "");
  }
}

function parseDuration(ffmpegOutput: string): number | null {
  const match = ffmpegOutput.match(/Duration: (\d{2}):(\d{2}):(\d{2})\.(\d{2})/);
  if (!match) return null;

  const [, hours, minutes, seconds, centiseconds] = match;
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds) + Number(centiseconds) / 100;
}

async function removeIfExists(filePath: string): Promise<void> {
  try {
    await unlink(filePath);
  } catch {
    return;
  }
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function injectDemoCursor(): void {
  const style = document.createElement("style");
  style.textContent = `
    body { cursor: none !important; }
    #radarsus-demo-cursor {
      position: fixed; left: 0; top: 0; z-index: 2147483647; width: 22px; height: 22px;
      border: 2px solid #0b4f8a; border-radius: 999px; pointer-events: none;
      box-shadow: 0 0 0 5px rgba(34,184,207,.18), 0 8px 24px rgba(11,79,138,.22);
      transform: translate(-50%, -50%); transition: width .12s ease, height .12s ease;
    }
    #radarsus-demo-cursor::after {
      content: ""; position: absolute; left: 50%; top: 50%; width: 5px; height: 5px;
      background: #22b8cf; border-radius: 999px; transform: translate(-50%, -50%);
    }
    #radarsus-demo-cursor.is-clicking { width: 34px; height: 34px; }
    .radarsus-demo-trail {
      position: fixed; z-index: 2147483646; width: 8px; height: 8px; border-radius: 999px;
      background: rgba(34,184,207,.45); pointer-events: none; transform: translate(-50%, -50%);
      animation: radarsus-demo-trail .65s ease-out forwards;
    }
    @keyframes radarsus-demo-trail { to { opacity: 0; transform: translate(-50%, -50%) scale(2.4); } }
  `;
  document.documentElement.appendChild(style);

  const cursor = document.createElement("div");
  cursor.id = "radarsus-demo-cursor";
  document.documentElement.appendChild(cursor);

  let lastTrailAt = 0;
  window.addEventListener("mousemove", (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
    const now = Date.now();
    if (now - lastTrailAt < 80) return;
    lastTrailAt = now;
    const trail = document.createElement("span");
    trail.className = "radarsus-demo-trail";
    trail.style.left = `${event.clientX}px`;
    trail.style.top = `${event.clientY}px`;
    document.documentElement.appendChild(trail);
    window.setTimeout(() => trail.remove(), 700);
  });

  window.addEventListener("radarsus-demo-click", () => {
    cursor.classList.add("is-clicking");
    window.setTimeout(() => cursor.classList.remove("is-clicking"), 180);
  });
}

function warnMissing(label: string): void {
  console.warn(JSON.stringify({ event: "demo_selector_missing", label }));
}

function getFfmpegInstallMessage(): string {
  return "FFmpeg não encontrado. Instale com: sudo apt-get update && sudo apt-get install -y ffmpeg";
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function pause(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
