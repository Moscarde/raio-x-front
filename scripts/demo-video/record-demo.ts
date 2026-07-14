import { execFile } from "node:child_process";
import { access, mkdir, stat } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { promisify } from "node:util";
import { chromium, type Locator, type Page } from "playwright";

const execFileAsync = promisify(execFile);
const requireFromScript = createRequire(import.meta.url);
const appUrl = process.env.DEMO_APP_URL ?? "http://127.0.0.1:3000";
const artifactDir = path.resolve("artifacts/demo-video");
const municipioInicialPath = "/municipios/3303807";
const viewport = { width: 1920, height: 1080 };

type AriaRole = Parameters<Page["getByRole"]>[0];
type VideoMetadata = {
  durationSeconds: number | null;
  sizeBytes: number;
  path: string;
};

async function main(): Promise<void> {
  await mkdir(artifactDir, { recursive: true });
  await waitForApp();

  const webmPath = await recordDemoSession();
  const finalVideoPath = await getFinalVideoPath();
  await convertWebmToMp4(webmPath, finalVideoPath);

  const metadata = await getVideoMetadata(finalVideoPath);
  console.log(JSON.stringify({ event: "demo_video_created", ...metadata }));
}

async function getFinalVideoPath(): Promise<string> {
  const commitHash = await getCurrentCommitHash();
  const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  return path.join(artifactDir, `radarsus-demo-${commitHash}-${timestamp}.mp4`);
}

async function getCurrentCommitHash(): Promise<string> {
  try {
    const { stdout } = await execFileAsync("git", ["rev-parse", "--short", "HEAD"]);
    return stdout.trim();
  } catch {
    return "sem-commit";
  }
}

async function waitForApp(): Promise<void> {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 60_000) {
    if (await isAppAvailable()) return;
    await pause(1_000);
  }
  throw new Error(`Aplicação indisponível em ${appUrl}. Inicie o Next.js ou defina DEMO_APP_URL.`);
}

async function isAppAvailable(): Promise<boolean> {
  try {
    return (await fetch(appUrl, { method: "HEAD" })).ok;
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
  await sceneFinancing(page);
  await sceneAlerts(page);
  await sceneComparator(page);
  await sceneReport(page);
  await sceneQualityAndDocs(page);
  await sceneClosing(page);
}

async function sceneHome(page: Page): Promise<void> {
  await gotoPage(page, "/");
  await spotlightText(page, "RadarSUS");
  await hoverRole(page, "link", "Rio de Janeiro");
  await hoverRole(page, "link", "São Gonçalo");
  await hoverRole(page, "link", "Duque de Caxias");
  await clickRole(page, "link", "Rio de Janeiro");
  await settle(page);
}

async function sceneOverview(page: Page): Promise<void> {
  await showMunicipalCoverage(page, ["Niterói", "Petrópolis"]);
  await spotlightText(page, "Raio-X municipal");
  await hoverText(page, "Cobertura APS");
  await hoverText(page, "Equipes ESF ativas");
  await hoverText(page, "Internações ICSAP");
  await sweepRecharts(page, 0, 8);
  await smoothScrollBy(page, 480);
  await hoverText(page, "Rede instalada");
  await hoverText(page, "Indicadores APS");
}

async function sceneNetwork(page: Page): Promise<void> {
  await clickRole(page, "link", "Rede e CNES");
  await settle(page);
  await showMunicipalCoverage(page, ["Campos dos Goytacazes", "Volta Redonda"]);
  await hoverText(page, "Estabelecimentos cadastrados");
  await hoverText(page, "Com vínculo SUS");
  await hoverText(page, "Estabelecimentos por tipo");
  await smoothScrollBy(page, 460);
  await hoverText(page, "Unidades cadastradas");
}

async function scenePrimaryCare(page: Page): Promise<void> {
  await clickRole(page, "link", "Atenção Primária");
  await settle(page);
  await showMunicipalCoverage(page, ["Macaé", "Angra dos Reis"]);
  await hoverText(page, "Indicadores por visão de equipe");
  await hoverText(page, "Válidas");
  await smoothScrollBy(page, 350);
  await hoverText(page, "Equipes e unidades de Atenção Primária");
}

async function sceneProduction(page: Page): Promise<void> {
  await clickRole(page, "link", "Produção");
  await settle(page);
  await showMunicipalCoverage(page, ["Nova Iguaçu", "Itaboraí"]);
  await hoverText(page, "Procedimentos aprovados");
  await hoverText(page, "Valor aprovado");
  await sweepRecharts(page, 0, 10);
  await smoothScrollBy(page, 380);
  await hoverText(page, "Produção por grupo de procedimento");
}

async function sceneFinancing(page: Page): Promise<void> {
  await clickRole(page, "link", "Financiamento");
  await settle(page);
  await showMunicipalCoverage(page, ["Cabo Frio", "Teresópolis"]);
  await hoverText(page, "Aplicação em saúde");
  await hoverText(page, "Repasses por fonte");
  await hoverText(page, "Lançamentos de repasses federais");
}

async function sceneAlerts(page: Page): Promise<void> {
  await clickRole(page, "link", "Alertas");
  await settle(page);
  await showMunicipalCoverage(page, ["Maricá", "Barra Mansa"]);
  await hoverText(page, "Todos os alertas");
  await pause(1_000);
}

async function sceneComparator(page: Page): Promise<void> {
  await clickRole(page, "link", "Comparador");
  await settle(page);
  await showComparatorCoverage(page, ["Niterói", "Campos dos Goytacazes"]);
  await spotlightText(page, "vs. pares");
  await hoverText(page, "Indicadores lado a lado");
  await smoothScrollBy(page, 520);
  await hoverText(page, "Porte de rede");
  await hoverText(page, "Produção ambulatorial");
}

async function sceneReport(page: Page): Promise<void> {
  await gotoPage(page, `${municipioInicialPath}/relatorio`);
  await settle(page);
  await showMunicipalCoverage(page, ["São João de Meriti", "Resende"]);
  await hoverText(page, "Geração de relatório com IA");
  await hoverText(page, "dados reais");
}

async function sceneQualityAndDocs(page: Page): Promise<void> {
  await clickRole(page, "link", "Qualidade dos dados");
  await settle(page);
  await hoverText(page, "Fontes carregadas");
  await hoverText(page, "Campos críticos nulos");
  await clickRole(page, "link", "metodologia e limitações");
  await settle(page);
  await hoverText(page, "Metodologia");
  await smoothScrollBy(page, 620);
}

async function sceneClosing(page: Page): Promise<void> {
  await gotoPage(page, municipioInicialPath);
  await settle(page);
  await showMunicipalCoverage(page, ["Rio de Janeiro", "Paraty"]);
  await spotlightText(page, "Raio-X municipal");
  await sweepRecharts(page, 0, 10);
  await smoothScrollBy(page, 420);
  await pause(2_000);
}

async function showMunicipalCoverage(
  page: Page,
  municipios: readonly [string, string],
): Promise<void> {
  await switchMunicipio(page, municipios[0]);
  await switchMunicipio(page, municipios[1]);
}

async function showComparatorCoverage(
  page: Page,
  municipios: readonly [string, string],
): Promise<void> {
  await switchMunicipio(page, municipios[0]);
  await switchMunicipio(page, municipios[1]);
}

async function switchMunicipio(page: Page, municipio: string): Promise<void> {
  const trigger = page.getByRole("combobox").first();
  if (!(await moveToLocator(page, trigger, "seletor de município"))) return;

  await trigger.click({ force: true, timeout: 4_000 });
  await pause(350);
  const option = page
    .getByRole("option", { name: new RegExp(`${escapeRegex(municipio)}.*RJ`, "i") })
    .first();
  if (!(await moveToLocator(page, option, `município ${municipio}`))) {
    await page.keyboard.press("Escape");
    return;
  }

  await option.click({ force: true, timeout: 4_000 });
  await pulseCursor(page);
  await settle(page);
  await spotlightText(page, municipio);
}

async function gotoPage(page: Page, route: string): Promise<void> {
  await page.goto(`${appUrl}${route}`, { timeout: 45_000, waitUntil: "networkidle" });
  await ensureCursorVisible(page);
}

async function settle(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle");
  await ensureCursorVisible(page);
  await pause(600);
}

async function hoverRole(page: Page, role: AriaRole, name: string): Promise<void> {
  const locator = page.getByRole(role, { name: new RegExp(escapeRegex(name), "i") }).first();
  await moveToLocator(page, locator, `role=${role} name=${name}`);
}

async function clickRole(page: Page, role: AriaRole, name: string): Promise<void> {
  const locator = page.getByRole(role, { name: new RegExp(escapeRegex(name), "i") }).first();
  if (!(await moveToLocator(page, locator, `role=${role} name=${name}`))) return;
  await locator.click({ force: true, timeout: 4_000 });
  await pulseCursor(page);
  await pause(700);
}

async function hoverText(page: Page, text: string): Promise<void> {
  const locator = page.getByText(new RegExp(escapeRegex(text), "i")).first();
  await moveToLocator(page, locator, `text=${text}`);
}

async function spotlightText(page: Page, text: string): Promise<void> {
  await hoverText(page, text);
  await pause(600);
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
    await pause(220);
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

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 24 });
  await pause(400);
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
      window.setTimeout(resolve, 800);
    }),
    pixels,
  );
  await pause(350);
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
  return staticPath && (await exists(staticPath)) ? staticPath : null;
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
    #radarsus-demo-cursor { position: fixed; left: 0; top: 0; z-index: 2147483647; width: 22px; height: 22px; border: 2px solid #0b4f8a; border-radius: 999px; pointer-events: none; box-shadow: 0 0 0 5px rgba(34,184,207,.18), 0 8px 24px rgba(11,79,138,.22); transform: translate(-50%, -50%); transition: width .12s ease, height .12s ease; }
    #radarsus-demo-cursor::after { content: ""; position: absolute; left: 50%; top: 50%; width: 5px; height: 5px; background: #22b8cf; border-radius: 999px; transform: translate(-50%, -50%); }
    #radarsus-demo-cursor.is-clicking { width: 34px; height: 34px; }
    .radarsus-demo-trail { position: fixed; z-index: 2147483646; width: 8px; height: 8px; border-radius: 999px; background: rgba(34,184,207,.45); pointer-events: none; transform: translate(-50%, -50%); animation: radarsus-demo-trail .65s ease-out forwards; }
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
    if (Date.now() - lastTrailAt < 80) return;
    lastTrailAt = Date.now();
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
