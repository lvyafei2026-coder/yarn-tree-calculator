const fs = require('fs');
const path = require('path');

// ============================================================
// HTML 模板（资源路径用相对路径，让 Worker 自动加前缀）
// ============================================================
function buildIndexHtml(forceLang, htmlLang, canonicalPath) {
  const forceLine = forceLang
    ? `<script>window.__FORCE_LANG__ = '${forceLang}';<\/script>\n`
    : '';
  const canonical = `https://toolara.dev${canonicalPath}`;

  return `<!DOCTYPE html>
<html lang="${htmlLang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Yarn Calculator — Estimate How Much Yarn You Need for Any Project</title>
<meta name="description" content="Free yarn calculator. Estimate how many skeins of yarn you need for sweaters, blankets, scarves and more. Works with any yarn weight and stitch pattern.">
<meta name="keywords" content="yarn calculator, yarn yardage calculator, how much yarn do i need, yarn estimator, knitting yarn calculator, crochet yarn calculator">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
<meta name="theme-color" content="#8b5a3c">

<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="en" href="https://toolara.dev/yarn-tree-calculator/">
<link rel="alternate" hreflang="zh-Hans" href="https://toolara.dev/yarn-tree-calculator/zh/">
<link rel="alternate" hreflang="zh-Hant" href="https://toolara.dev/yarn-tree-calculator/zh-tw/">
<link rel="alternate" hreflang="ja" href="https://toolara.dev/yarn-tree-calculator/ja/">
<link rel="alternate" hreflang="ko" href="https://toolara.dev/yarn-tree-calculator/ko/">
<link rel="alternate" hreflang="de" href="https://toolara.dev/yarn-tree-calculator/de/">
<link rel="alternate" hreflang="ru" href="https://toolara.dev/yarn-tree-calculator/ru/">
<link rel="alternate" hreflang="es" href="https://toolara.dev/yarn-tree-calculator/es/">
<link rel="alternate" hreflang="x-default" href="https://toolara.dev/yarn-tree-calculator/">

<meta property="og:type" content="website">
<meta property="og:title" content="Yarn Calculator — Estimate How Much Yarn You Need">
<meta property="og:description" content="Free yarn calculator for knitters and crocheters. Estimate skeins needed for any project.">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Yarn Tree Calculator",
  "url": "${canonical}",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "Any",
  "description": "Free yarn calculator that estimates the yardage and skeins needed for knitting and crochet projects.",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
}
<\/script>

${forceLine}<link rel="stylesheet" href="/css/style.css">
</head>
<body>

<header class="hero">
  <div class="lang-switch">
    <select id="langSelect" onchange="setLang(this.value)" aria-label="Language">
      <option value="en">English</option>
      <option value="zh">简体中文</option>
      <option value="zh-TW">繁體中文</option>
      <option value="ja">日本語</option>
      <option value="ko">한국어</option>
      <option value="de">Deutsch</option>
      <option value="ru">Русский</option>
      <option value="es">Español</option>
    </select>
  </div>
  <div class="hero-inner">
    <div class="hero-badge">🧶 Knitting & Crochet</div>
    <h1 data-i18n="title">Yarn Calculator</h1>
    <p data-i18n="subtitle">Estimate how many skeins of yarn you need for any project — sweaters, blankets, scarves, and more.</p>
  </div>
</header>

<main class="wrap">
  <section class="card">
    <h2 class="visually-hidden" data-i18n="calcHeading">Calculator</h2>

    <div class="row">
      <div>
        <label for="width" data-i18n="widthLabel">Width (cm)</label>
        <input type="number" id="width" min="1" step="1" placeholder="50" inputmode="decimal">
      </div>
      <div>
        <label for="height" data-i18n="heightLabel">Height (cm)</label>
        <input type="number" id="height" min="1" step="1" placeholder="60" inputmode="decimal">
      </div>
    </div>

    <label for="weight" data-i18n="weightLabel">Yarn weight (CYC standard)</label>
    <select id="weight">
      <option value="lace" data-i18n="weightLace">0 — Lace</option>
      <option value="superfine" data-i18n="weightSuperfine">1 — Super Fine (Sock)</option>
      <option value="fine" data-i18n="weightFine">2 — Fine (Sport)</option>
      <option value="light" data-i18n="weightLight">3 — Light (DK)</option>
      <option value="medium" selected data-i18n="weightMedium">4 — Medium (Worsted)</option>
      <option value="bulky" data-i18n="weightBulky">5 — Bulky (Chunky)</option>
      <option value="superbulky" data-i18n="weightSuperbulky">6 — Super Bulky</option>
    </select>

    <label for="stitch" data-i18n="stitchLabel">Stitch pattern</label>
    <select id="stitch">
      <option value="stockinette" selected data-i18n="stitchStockinette">Stockinette (smooth)</option>
      <option value="garter" data-i18n="stitchGarter">Garter stitch</option>
      <option value="ribbing" data-i18n="stitchRibbing">Ribbing (1x1, 2x2)</option>
      <option value="seed" data-i18n="stitchSeed">Seed stitch</option>
      <option value="cable" data-i18n="stitchCable">Cable</option>
      <option value="brioche" data-i18n="stitchBrioche">Brioche / Fisherman</option>
      <option value="lace" data-i18n="stitchLace">Lace / Openwork</option>
    </select>

    <label for="skeinYardage" data-i18n="skeinLabel">Yards per skein (check your yarn label)</label>
    <input type="number" id="skeinYardage" min="10" step="10" placeholder="200" value="200" inputmode="decimal">

    <button class="calc" type="button" onclick="calculate()" data-i18n="calcBtn">Calculate yarn needed</button>

    <div id="result" role="region" aria-live="polite">
      <div class="result-label" data-i18n="resultLabel">You'll need approximately</div>
      <div class="yardage"><span id="totalYards">—</span></div>
      <div class="freq-note" id="skeinNote"></div>

      <div class="breakdown">
        <div class="bd-row"><span data-i18n="bdArea">Project area</span><strong id="bdArea">—</strong></div>
        <div data-i18n="bdWeight">Yarn weight</div>
        <div data-i18n="bdStitch">Stitch pattern</div>
        <div data-i18n="bdBuffer">Buffer (10% added)</div>
        <div data-i18n="bdSkeins">Skeins to buy</div>
      </div>
      <div class="result-disclaimer" data-i18n="resultDisclaimer">Estimate only. Actual yarn usage varies by gauge, tension, and individual knitting style. Always buy one extra skein for safety.</div>
    </div>
  </section>

  <section>
    <h2 data-i18n="whatIsTitle">How yarn usage is estimated</h2>
    <p data-i18n="whatIsText">Yarn consumption depends on three main factors: the total area of your project, the weight (thickness) of the yarn, and the stitch pattern. Denser, more textured stitches like cables and brioche use significantly more yarn per square centimeter than smooth stockinette or open lace.</p>
  </section>

  <section>
    <h2 data-i18n="weightsTitle">Yarn weight categories</h2>
    <table>
      <thead>
        <tr><th data-i18n="thCat">Category</th><th data-i18n="thName">Common name</th><th data-i18n="thGauge">Typical gauge</th></tr>
      </thead>
      <tbody>
        <tr><td>0</td><td data-i18n="weightLace">Lace</td><td>33–40 sts / 10cm</td></tr>
        <tr><td>1</td><td data-i18n="weightSuperfine">Super Fine / Sock</td><td>27–32 sts / 10cm</td></tr>
        <tr><td>2</td><td data-i18n="weightFine">Fine / Sport</td><td>23–26 sts / 10cm</td></tr>
        <tr><td>3</td><td data-i18n="weightLight">Light / DK</td><td>21–24 sts / 10cm</td></tr>
        <tr><td>4</td><td data-i18n="weightMedium">Medium / Worsted</td><td>16–20 sts / 10cm</td></tr>
        <tr><td>5</td><td data-i18n="weightBulky">Bulky / Chunky</td><td>12–15 sts / 10cm</td></tr>
        <tr><td>6</td><td data-i18n="weightSuperbulky">Super Bulky</td><td>7–11 sts / 10cm</td></tr>
      </tbody>
    </table>
  </section>

  <section>
    <h2 data-i18n="patternsTitle">How stitch pattern affects yarn usage</h2>
    <p data-i18n="patternsText">Different stitch patterns consume yarn at very different rates. Compared to a smooth stockinette base:</p>
    <ul>
      <li data-i18n="patGarter"><strong>Garter stitch:</strong> +5%</li>
      <li data-i18n="patRibbing"><strong>Ribbing (1x1, 2x2):</strong> +15%</li>
      <li data-i18n="patSeed"><strong>Seed stitch:</strong> +20%</li>
      <li data-i18n="patCable"><strong>Cable:</strong> +35%</li>
      <li data-i18n="patBrioche"><strong>Brioche / Fisherman:</strong> +60%</li>
      <li data-i18n="patLace"><strong>Lace / Openwork:</strong> -15%</li>
    </ul>
  </section>

  <section>
    <h2 data-i18n="howToTitle">How to use this calculator</h2>
    <ol>
      <li data-i18n="howTo1">Enter the finished width and height of your project in centimeters.</li>
      <li data-i18n="howTo2">Select your yarn weight from the CYC standard category (check your yarn label).</li>
      <li data-i18n="howTo3">Choose the stitch pattern that dominates your project.</li>
      <li data-i18n="howTo4">Enter the yardage per skein from your yarn label (this varies by brand).</li>
      <li data-i18n="howTo5">Click "Calculate yarn needed" to see total yardage and skeins to buy.</li>
    </ol>
  </section>

  <section>
    <h2 data-i18n="faqTitle">Frequently asked questions</h2>
    <h3 data-i18n="faq1q">How much yarn do I need for a sweater?</h3>
    <p data-i18n="faq1a">An adult medium sweater in worsted weight yarn typically requires 1,200–1,800 yards. In bulky weight, 800–1,200 yards. In fingering weight, 1,800–2,500 yards. The exact amount depends on size, length, and stitch pattern.</p>

    <h3 data-i18n="faq2q">How many yards are in a skein of yarn?</h3>
    <p data-i18n="faq2a">It varies widely by brand and weight. Common yardages: Lace 400–800, Fingering 350–450, Sport 250–350, DK 200–300, Worsted 150–250, Bulky 100–150, Super Bulky 60–100 yards per skein. Always check your yarn label.</p>

    <h3 data-i18n="faq3q">Should I add a buffer?</h3>
    <p data-i18n="faq3a">Yes. This calculator already adds a 10% buffer. Professional knitters usually recommend buying one extra skein of the same dye lot, especially for large projects, because running out mid-project with a different dye lot can create visible color differences.</p>

    <h3 data-i18n="faq4q">Does crochet use more yarn than knitting?</h3>
    <p data-i18n="faq4a">Yes, generally 25–30% more yarn than knitting for the same surface area. Crochet stitches are taller and denser. If you plan to crochet a pattern designed for knitting, add about 30% to the estimate.</p>

    <h3 data-i18n="faq5q">Why does my finished project weigh more than predicted?</h3>
    <p data-i18n="faq5a">Common causes: looser or tighter gauge than expected, blocking that stretches the fabric, or a heavier stitch pattern than estimated. If you're following a pattern, always knit a gauge swatch and compare your actual yarn usage after the first few rows.</p>

    <div class="disclaimer" data-i18n="disclaimer"><strong>Note:</strong> This is an estimate. For critical projects, always buy an extra skein and work a gauge swatch to confirm your personal yardage consumption.</div>
  </section>
</main>

<footer class="footer" data-i18n="footer">Runs entirely in your browser. No data is collected or stored.</footer>

<script src="/js/i18n.js"><\/script>
<script src="/js/calculator.js"><\/script>
</body>
</html>`;
}

// ============================================================
// CSS — 暖手工风（米色 + 玫瑰粉 + 棕色）
// ============================================================
const STYLE_CSS = `:root {
  --bg: #fdf6f0; --card: #ffffff; --text: #3d2817; --muted: #8b6f5c;
  --accent: #c76b7e; --accent-dark: #a14d5e; --yarn: #8b5a3c; --gold: #d4a574;
  --border: #f0e0d0; --radius: 14px;
  --shadow: 0 1px 3px rgba(61,40,23,0.05), 0 8px 24px rgba(139,90,60,0.08);
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", Roboto, sans-serif; background: var(--bg); color: var(--text); line-height: 1.65; -webkit-font-smoothing: antialiased; }
.visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

/* ---------- Hero ---------- */
.hero {
  position: relative;
  overflow: hidden;
  color: #fff;
  padding: 64px 20px 96px;
  background:
    radial-gradient(circle at 20% 15%, rgba(212,165,116,0.35) 0%, transparent 50%),
    radial-gradient(circle at 80% 85%, rgba(199,107,126,0.32) 0%, transparent 55%),
    linear-gradient(135deg, #6b3d2e 0%, #8b5a3c 50%, #a14d5e 100%);
}
.hero::before {
  content: "";
  position: absolute; inset: 0;
  background-image:
    radial-gradient(rgba(255,255,255,0.08) 1.5px, transparent 1.5px);
  background-size: 24px 24px;
  opacity: 0.7;
  pointer-events: none;
}
.hero::after {
  content: "";
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at center, transparent 25%, rgba(61,40,23,0.30) 100%);
  pointer-events: none;
}
.hero-inner { max-width: 720px; margin: 0 auto; position: relative; z-index: 2; text-align: center; }
.hero-badge {
  display: inline-block;
  background: rgba(212,165,116,0.22);
  border: 1px solid rgba(212,165,116,0.5);
  color: #f5d9b8;
  padding: 5px 14px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  margin-bottom: 18px;
}
.hero h1 { font-size: 2.1rem; margin: 0 0 12px; font-weight: 800; letter-spacing: -0.02em; }
.hero p { margin: 0 auto; opacity: 0.92; font-size: 1rem; max-width: 560px; }

/* ---------- Lang switcher ---------- */
.lang-switch { position: absolute; top: 16px; right: 16px; z-index: 3; }
.lang-switch select {
  appearance: none; -webkit-appearance: none;
  background-color: rgba(255,255,255,0.15);
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat; background-position: right 10px center; background-size: 14px;
  border: 1px solid rgba(255,255,255,0.3);
  color: #fff; padding: 7px 32px 7px 12px; border-radius: 8px;
  font-size: 0.85rem; font-family: inherit; cursor: pointer;
}
.lang-switch select:hover { background-color: rgba(255,255,255,0.28); }
.lang-switch select option { color: #3d2817; background: #fff; }

/* ---------- Layout ---------- */
.wrap { max-width: 720px; margin: -56px auto 0; padding: 0 20px 64px; position: relative; z-index: 2; }
.card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 28px; margin-bottom: 22px; box-shadow: var(--shadow); }

label { display: block; font-weight: 600; font-size: 0.85rem; margin-bottom: 6px; }
input, select { width: 100%; padding: 11px 13px; border: 1px solid #e0d0c0; border-radius: 9px; font-size: 1rem; margin-bottom: 18px; background: #fff; color: var(--text); transition: border-color 0.15s, box-shadow 0.15s; font-family: inherit; }
input:focus, select:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px rgba(199,107,126,0.15); }
.row { display: flex; gap: 14px; }
.row > div { flex: 1; }
button.calc { width: 100%; padding: 15px; background: var(--accent); color: #fff; border: none; border-radius: 9px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: background 0.15s, transform 0.1s; font-family: inherit; }
button.calc:hover { background: var(--accent-dark); }
button.calc:active { transform: scale(0.99); }

/* ---------- Result ---------- */
#result { margin-top: 24px; padding: 24px; border-radius: 14px; background: linear-gradient(135deg, #fdf2f4 0%, #fdf6f0 100%); border: 2px solid var(--accent); display: none; animation: fadeIn 0.35s ease; }
#result.show { display: block; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.result-label { font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.07em; font-weight: 700; color: #a14d5e; margin-bottom: 4px; }
.yardage { font-size: 2.8rem; font-weight: 800; color: #6b3d2e; line-height: 1; letter-spacing: -0.02em; }
.yardage::after { content: " yards"; font-size: 1rem; font-weight: 500; color: var(--muted); margin-left: 6px; }
.freq-note { font-size: 0.9rem; color: #a14d5e; margin-top: 8px; font-weight: 600; }
.breakdown { margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(199,107,126,0.20); }
.bd-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 0.9rem; color: #6b3d2e; }
.bd-row strong { color: #3d2817; font-weight: 600; }
.result-disclaimer { margin-top: 16px; padding-top: 12px; border-top: 1px solid rgba(199,107,126,0.15); font-size: 0.78rem; color: var(--muted); }

/* ---------- Content ---------- */
h2 { font-size: 1.25rem; margin: 36px 0 12px; letter-spacing: -0.01em; }
h3 { font-size: 1rem; margin: 22px 0 6px; }
p { margin: 0 0 14px; }
ul, ol { margin: 0 0 16px; padding-left: 22px; }
li { margin-bottom: 8px; line-height: 1.65; }
table { width: 100%; border-collapse: collapse; font-size: 0.9rem; margin: 14px 0; }
th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #f0e0d0; }
th { background: #fdf2f4; font-weight: 600; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.04em; color: #a14d5e; }
tr:last-child td { border-bottom: none; }
.disclaimer { font-size: 0.85rem; color: var(--muted); border-left: 3px solid #e0d0c0; padding: 4px 0 4px 14px; margin-top: 18px; }
.footer { text-align: center; font-size: 0.8rem; color: var(--muted); padding: 24px 20px 48px; }

@media (max-width: 560px) {
  .hero { padding: 48px 16px 80px; }
  .hero h1 { font-size: 1.5rem; }
  .lang-switch { position: static; display: flex; justify-content: center; margin-bottom: 16px; }
  .wrap { padding: 0 14px 48px; }
  .card { padding: 20px; }
  .row { flex-direction: column; gap: 0; }
  .yardage { font-size: 2.2rem; }
}`;

// ============================================================
// i18n.js — fetch 使用绝对路径（含完整子目录前缀）
// ============================================================
const I18N_JS = `const SUPPORTED_LANGS = ['en','zh','zh-TW','ja','ko','de','ru','es'];
const DEFAULT_LANG = 'en';
const SUBDIR = '/yarn-tree-calculator';
const PATH_TO_LANG = { '/zh/':'zh', '/zh-tw/':'zh-TW', '/ja/':'ja', '/ko/':'ko', '/de/':'de', '/ru/':'ru', '/es/':'es' };
const LANG_TO_PATH = { 'en':'/', 'zh':'/zh/', 'zh-TW':'/zh-tw/', 'ja':'/ja/', 'ko':'/ko/', 'de':'/de/', 'ru':'/ru/', 'es':'/es/' };

let currentLang = DEFAULT_LANG;
let translations = {};
const cache = {};

function detectPageLang() {
  if (window.__FORCE_LANG__ && SUPPORTED_LANGS.includes(window.__FORCE_LANG__)) return window.__FORCE_LANG__;
  const p = window.location.pathname;
  const idx = p.indexOf(SUBDIR);
  if (idx === -1) return DEFAULT_LANG;
  const rest = p.slice(idx + SUBDIR.length);
  const m = rest.match(/^\\/(zh-tw|zh|ja|ko|de|ru|es)\\//);
  if (m) return PATH_TO_LANG['/' + m[1] + '/'] || DEFAULT_LANG;
  return DEFAULT_LANG;
}

async function loadLocale(lang) {
  if (cache[lang]) return cache[lang];
  const res = await fetch(SUBDIR + '/locales/' + lang + '.json');
  if (!res.ok) throw new Error('Failed: ' + lang);
  const data = await res.json();
  cache[lang] = data;
  return data;
}

function applyTranslations(t) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] === undefined) return;
    if (key === 'disclaimer') el.innerHTML = t[key];
    else el.textContent = t[key];
  });
}

async function initPage() {
  const lang = detectPageLang();
  try { translations = await loadLocale(lang); }
  catch (err) { console.error(err); return; }
  currentLang = lang;
  document.documentElement.lang = lang === 'zh' ? 'zh-Hans' : lang === 'zh-TW' ? 'zh-Hant' : lang;
  applyTranslations(translations);
  const sel = document.getElementById('langSelect');
  if (sel) sel.value = lang;
  window.__i18n = { t: translations, lang: currentLang };
}

function setLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) lang = DEFAULT_LANG;
  window.location.href = SUBDIR + (LANG_TO_PATH[lang] || '/');
}

document.addEventListener('DOMContentLoaded', initPage);`;

// ============================================================
// calculator.js
// ============================================================
const CALCULATOR_JS = `function t() { return (window.__i18n && window.__i18n.t) || {}; }

// 每平方厘米的基础码数（Worsted 基准值 0.55）
const WEIGHT_DENSITY = {
  lace: 0.15,
  superfine: 0.25,
  fine: 0.35,
  light: 0.45,
  medium: 0.55,
  bulky: 0.75,
  superbulky: 1.00
};

// 针法系数
const STITCH_FACTOR = {
  stockinette: 1.00,
  garter: 1.05,
  ribbing: 1.15,
  seed: 1.20,
  cable: 1.35,
  brioche: 1.60,
  lace: 0.85
};

function calculate() {
  const tr = t();
  const width = parseFloat(document.getElementById('width').value);
  const height = parseFloat(document.getElementById('height').value);
  const weight = document.getElementById('weight').value;
  const stitch = document.getElementById('stitch').value;
  const skeinYardage = parseFloat(document.getElementById('skeinYardage').value);

  if (!width || !height || width <= 0 || height <= 0) {
    alert(tr.alertFill || 'Please enter a valid width and height.');
    return;
  }
  if (!skeinYardage || skeinYardage <= 0) {
    alert(tr.alertSkein || 'Please enter the yardage per skein.');
    return;
  }

  const area = width * height;
  const density = WEIGHT_DENSITY[weight] || 0.55;
  const factor = STITCH_FACTOR[stitch] || 1.0;

  // 总码数 = 面积 × 密度 × 针法系数 × 1.1（缓冲）
  const totalYards = area * density * factor * 1.1;
  const totalYardsRounded = Math.ceil(totalYards);
  const skeins = Math.ceil(totalYards / skeinYardage);

  document.getElementById('totalYards').textContent = totalYardsRounded.toLocaleString();

  const noteTemplate = tr.skeinNote || 'Buy {n} skein(s) of {y} yards each';
  document.getElementById('skeinNote').textContent = noteTemplate
    .replace('{n}', skeins)
    .replace('{y}', skeinYardage);

  document.getElementById('bdArea').textContent = area.toLocaleString() + ' cm²';

  document.getElementById('result').classList.add('show');
}

window.calculate = calculate;`;

// ============================================================
// Locales
// ============================================================
const LOCALES = {
  'en': {
    title: "Yarn Calculator",
    subtitle: "Estimate how many skeins of yarn you need for any project — sweaters, blankets, scarves, and more.",
    calcHeading: "Calculator",
    widthLabel: "Width (cm)", heightLabel: "Height (cm)",
    weightLabel: "Yarn weight (CYC standard)",
    weightLace: "0 — Lace", weightSuperfine: "1 — Super Fine (Sock)",
    weightFine: "2 — Fine (Sport)", weightLight: "3 — Light (DK)",
    weightMedium: "4 — Medium (Worsted)", weightBulky: "5 — Bulky (Chunky)",
    weightSuperbulky: "6 — Super Bulky",
    stitchLabel: "Stitch pattern",
    stitchStockinette: "Stockinette (smooth)", stitchGarter: "Garter stitch",
    stitchRibbing: "Ribbing (1x1, 2x2)", stitchSeed: "Seed stitch",
    stitchCable: "Cable", stitchBrioche: "Brioche / Fisherman",
    stitchLace: "Lace / Openwork",
    skeinLabel: "Yards per skein (check your yarn label)",
    calcBtn: "Calculate yarn needed",
    resultLabel: "You'll need approximately",
    skeinNote: "Buy {n} skein(s) of {y} yards each",
    bdArea: "Project area", bdWeight: "Yarn weight",
    bdStitch: "Stitch pattern", bdBuffer: "Buffer (10% added)",
    bdSkeins: "Skeins to buy",
    resultDisclaimer: "Estimate only. Actual yarn usage varies by gauge, tension, and individual knitting style. Always buy one extra skein for safety.",
    whatIsTitle: "How yarn usage is estimated",
    whatIsText: "Yarn consumption depends on three main factors: the total area of your project, the weight (thickness) of the yarn, and the stitch pattern. Denser, more textured stitches like cables and brioche use significantly more yarn per square centimeter than smooth stockinette or open lace.",
    weightsTitle: "Yarn weight categories",
    thCat: "Category", thName: "Common name", thGauge: "Typical gauge",
    patternsTitle: "How stitch pattern affects yarn usage",
    patternsText: "Different stitch patterns consume yarn at very different rates. Compared to a smooth stockinette base:",
    patGarter: "Garter stitch: +5%",
    patRibbing: "Ribbing (1x1, 2x2): +15%",
    patSeed: "Seed stitch: +20%",
    patCable: "Cable: +35%",
    patBrioche: "Brioche / Fisherman: +60%",
    patLace: "Lace / Openwork: -15%",
    howToTitle: "How to use this calculator",
    howTo1: "Enter the finished width and height of your project in centimeters.",
    howTo2: "Select your yarn weight from the CYC standard category (check your yarn label).",
    howTo3: "Choose the stitch pattern that dominates your project.",
    howTo4: "Enter the yardage per skein from your yarn label (this varies by brand).",
    howTo5: "Click \"Calculate yarn needed\" to see total yardage and skeins to buy.",
    faqTitle: "Frequently asked questions",
    faq1q: "How much yarn do I need for a sweater?",
    faq1a: "An adult medium sweater in worsted weight yarn typically requires 1,200–1,800 yards. In bulky weight, 800–1,200 yards. In fingering weight, 1,800–2,500 yards. The exact amount depends on size, length, and stitch pattern.",
    faq2q: "How many yards are in a skein of yarn?",
    faq2a: "It varies widely by brand and weight. Common yardages: Lace 400–800, Fingering 350–450, Sport 250–350, DK 200–300, Worsted 150–250, Bulky 100–150, Super Bulky 60–100 yards per skein. Always check your yarn label.",
    faq3q: "Should I add a buffer?",
    faq3a: "Yes. This calculator already adds a 10% buffer. Professional knitters usually recommend buying one extra skein of the same dye lot, especially for large projects, because running out mid-project with a different dye lot can create visible color differences.",
    faq4q: "Does crochet use more yarn than knitting?",
    faq4a: "Yes, generally 25–30% more yarn than knitting for the same surface area. Crochet stitches are taller and denser. If you plan to crochet a pattern designed for knitting, add about 30% to the estimate.",
    faq5q: "Why does my finished project weigh more than predicted?",
    faq5a: "Common causes: looser or tighter gauge than expected, blocking that stretches the fabric, or a heavier stitch pattern than estimated. If you're following a pattern, always knit a gauge swatch and compare your actual yarn usage after the first few rows.",
    disclaimer: "<strong>Note:</strong> This is an estimate. For critical projects, always buy an extra skein and work a gauge swatch to confirm your personal yardage consumption.",
    footer: "Runs entirely in your browser. No data is collected or stored.",
    alertFill: "Please enter a valid width and height.",
    alertSkein: "Please enter the yardage per skein."
  },
  'zh': {
    title: "毛线用量计算器",
    subtitle: "估算毛衣、毛毯、围巾等任何编织项目需要多少团毛线。",
    calcHeading: "计算器",
    widthLabel: "宽度（厘米）", heightLabel: "高度（厘米）",
    weightLabel: "毛线粗细（CYC 标准）",
    weightLace: "0 — 蕾丝线", weightSuperfine: "1 — 超细（袜子线）",
    weightFine: "2 — 细（运动线）", weightLight: "3 — 轻（DK 线）",
    weightMedium: "4 — 中（中粗线）", weightBulky: "5 — 粗（粗线）",
    weightSuperbulky: "6 — 超粗",
    stitchLabel: "针法",
    stitchStockinette: "平针（光滑）", stitchGarter: "起伏针",
    stitchRibbing: "罗纹（1x1、2x2）", stitchSeed: "桂花针",
    stitchCable: "麻花", stitchBrioche: "双元宝 / 渔夫针",
    stitchLace: "镂空 / 花边",
    skeinLabel: "每团码数（查看毛线标签）",
    calcBtn: "计算所需毛线",
    resultLabel: "你大约需要",
    skeinNote: "建议购买 {n} 团，每团 {y} 码",
    bdArea: "项目面积", bdWeight: "毛线粗细",
    bdStitch: "针法", bdBuffer: "缓冲（已加 10%）",
    bdSkeins: "建议购买团数",
    resultDisclaimer: "仅为估算值。实际用量会因密度、手劲和个人编织习惯而不同。建议多买一团以防万一。",
    whatIsTitle: "毛线用量是如何估算的",
    whatIsText: "毛线消耗量取决于三个主要因素：项目总面积、毛线粗细（厚度）以及针法。麻花、双元宝这类密集、有纹理的针法，每平方厘米的用量明显高于平针或镂空。",
    weightsTitle: "毛线粗细分类",
    thCat: "分类", thName: "常用名称", thGauge: "典型密度",
    patternsTitle: "针法对毛线用量的影响",
    patternsText: "不同针法的毛线消耗速度差别很大。以平针为基准：",
    patGarter: "起伏针：+5%",
    patRibbing: "罗纹（1x1、2x2）：+15%",
    patSeed: "桂花针：+20%",
    patCable: "麻花：+35%",
    patBrioche: "双元宝 / 渔夫针：+60%",
    patLace: "镂空 / 花边：-15%",
    howToTitle: "如何使用本计算器",
    howTo1: "输入项目的成品宽度和高度（厘米）。",
    howTo2: "根据 CYC 标准选择毛线粗细（查看毛线标签）。",
    howTo3: "选择项目中占主导的针法。",
    howTo4: "输入毛线标签上的每团码数（不同品牌差异较大）。",
    howTo5: "点击“计算所需毛线”，查看总码数和建议购买团数。",
    faqTitle: "常见问题",
    faq1q: "织一件毛衣需要多少毛线？",
    faq1a: "成人中号毛衣使用中粗线通常需要 1,200–1,800 码。粗线需要 800–1,200 码。细线需要 1,800–2,500 码。具体用量取决于尺寸、长度和针法。",
    faq2q: "一团毛线通常有多少码？",
    faq2a: "因品牌和粗细差异很大。常见数据：蕾丝线 400–800，细线 350–450，运动线 250–350，DK 线 200–300，中粗线 150–250，粗线 100–150，超粗线 60–100 码/团。请务必查看毛线标签。",
    faq3q: "需要预留缓冲吗？",
    faq3a: "需要。本计算器已自动加入 10% 缓冲。专业编织者通常建议多买一团同一缸号的毛线，尤其是大项目，因为中途用完再买不同缸号会留下明显色差。",
    faq4q: "钩针比棒针更耗线吗？",
    faq4a: "是的，相同面积下钩针通常比棒针多用 25–30% 的毛线。钩针针目更高更密。如果你要用钩针做棒针图样，建议在估算基础上再加约 30%。",
    faq5q: "为什么成品比预估更重？",
    faq5a: "常见原因：密度比预期更松或更紧、定型后织物被拉长，或针法比预估更耗线。如果你在跟图样，建议先织一片密度样片，编织几行后对比实际用量。",
    disclaimer: "<strong>注意：</strong>本结果为估算值。对于关键项目，请务必多买一团并织密度样片来确认你的实际用量。",
    footer: "完全在您的浏览器中运行。不收集、不存储任何数据。",
    alertFill: "请输入有效的宽度和高度。",
    alertSkein: "请输入每团毛线的码数。"
  },
  'zh-TW': {
    title: "毛線用量計算器",
    subtitle: "估算毛衣、毛毯、圍巾等任何編織項目需要多少團毛線。",
    calcHeading: "計算器",
    widthLabel: "寬度（公分）", heightLabel: "高度（公分）",
    weightLabel: "毛線粗細（CYC 標準）",
    weightLace: "0 — 蕾絲線", weightSuperfine: "1 — 超細（襪線）",
    weightFine: "2 — 細（運動線）", weightLight: "3 — 輕（DK 線）",
    weightMedium: "4 — 中（中粗線）", weightBulky: "5 — 粗（粗線）",
    weightSuperbulky: "6 — 超粗",
    stitchLabel: "針法",
    stitchStockinette: "平針（光滑）", stitchGarter: "起伏針",
    stitchRibbing: "羅紋（1x1、2x2）", stitchSeed: "桂花針",
    stitchCable: "麻花", stitchBrioche: "雙元寶 / 漁夫針",
    stitchLace: "鏤空 / 花邊",
    skeinLabel: "每團碼數（查看毛線標籤）",
    calcBtn: "計算所需毛線",
    resultLabel: "你大約需要",
    skeinNote: "建議購買 {n} 團，每團 {y} 碼",
    bdArea: "項目面積", bdWeight: "毛線粗細",
    bdStitch: "針法", bdBuffer: "緩衝（已加 10%）",
    bdSkeins: "建議購買團數",
    resultDisclaimer: "僅為估算值。實際用量會因密度、手勁和個人編織習慣而不同。建議多買一團以防萬一。",
    whatIsTitle: "毛線用量是如何估算的",
    whatIsText: "毛線消耗量取決於三個主要因素：項目總面積、毛線粗細（厚度）以及針法。麻花、雙元寶這類密集、有紋理的針法，每平方公分的用量明顯高於平針或鏤空。",
    weightsTitle: "毛線粗細分類",
    thCat: "分類", thName: "常用名稱", thGauge: "典型密度",
    patternsTitle: "針法對毛線用量的影響",
    patternsText: "不同針法的毛線消耗速度差別很大。以平針為基準：",
    patGarter: "起伏針：+5%",
    patRibbing: "羅紋（1x1、2x2）：+15%",
    patSeed: "桂花針：+20%",
    patCable: "麻花：+35%",
    patBrioche: "雙元寶 / 漁夫針：+60%",
    patLace: "鏤空 / 花邊：-15%",
    howToTitle: "如何使用本計算器",
    howTo1: "輸入項目的成品寬度和高度（公分）。",
    howTo2: "根據 CYC 標準選擇毛線粗細（查看毛線標籤）。",
    howTo3: "選擇項目中占主導的針法。",
    howTo4: "輸入毛線標籤上的每團碼數（不同品牌差異較大）。",
    howTo5: "點擊「計算所需毛線」，查看總碼數和建議購買團數。",
    faqTitle: "常見問題",
    faq1q: "織一件毛衣需要多少毛線？",
    faq1a: "成人中號毛衣使用中粗線通常需要 1,200–1,800 碼。粗線需要 800–1,200 碼。細線需要 1,800–2,500 碼。具體用量取決於尺寸、長度和針法。",
    faq2q: "一團毛線通常有多少碼？",
    faq2a: "因品牌和粗細差異很大。常見數據：蕾絲線 400–800，細線 350–450，運動線 250–350，DK 線 200–300，中粗線 150–250，粗線 100–150，超粗線 60–100 碼/團。請務必查看毛線標籤。",
    faq3q: "需要預留緩衝嗎？",
    faq3a: "需要。本計算器已自動加入 10% 緩衝。專業編織者通常建議多買一團同一缸號的毛線，尤其是大項目，因為中途用完再買不同缸號會留下明顯色差。",
    faq4q: "鉤針比棒針更耗線嗎？",
    faq4a: "是的，相同面積下鉤針通常比棒針多用 25–30% 的毛線。鉤針針目更高更密。如果你要用鉤針做棒針圖樣，建議在估算基礎上再加約 30%。",
    faq5q: "為什麼成品比預估更重？",
    faq5a: "常見原因：密度比預期更鬆或更緊、定型後織物被拉長，或針法比預估更耗線。如果你在跟圖樣，建議先織一片密度樣片，編織幾行後對比實際用量。",
    disclaimer: "<strong>注意：</strong>本結果為估算值。對於關鍵項目，請務必多買一團並織密度樣片來確認你的實際用量。",
    footer: "完全在您的瀏覽器中運行。不收集、不儲存任何資料。",
    alertFill: "請輸入有效的寬度和高度。",
    alertSkein: "請輸入每團毛線的碼數。"
  },
  'ja': {
    title: "毛糸計算ツール",
    subtitle: "セーター、ブランケット、マフラーなど、あらゆる編み物プロジェクトに必要な毛糸の玉数を推定します。",
    calcHeading: "計算ツール",
    widthLabel: "幅（cm）", heightLabel: "高さ（cm）",
    weightLabel: "毛糸の太さ（CYC 標準）",
    weightLace: "0 — レース", weightSuperfine: "1 — 極細（ソック）",
    weightFine: "2 — 細（スポーツ）", weightLight: "3 — 並太（DK）",
    weightMedium: "4 — 中太（ウーステッド）", weightBulky: "5 — 太（チャンキー）",
    weightSuperbulky: "6 — 極太",
    stitchLabel: "編み模様",
    stitchStockinette: "メリヤス編み", stitchGarter: "ガーター編み",
    stitchRibbing: "ゴム編み（1x1、2x2）", stitchSeed: "裏メリヤス",
    stitchCable: "ケーブル", stitchBrioche: "ブリオッシュ／フィッシャーマン",
    stitchLace: "レース／透かし",
    skeinLabel: "1玉あたりのヤード数（毛糸ラベルを確認）",
    calcBtn: "必要な毛糸を計算",
    resultLabel: "必要な毛糸は約",
    skeinNote: "{y}ヤードの毛糸を{n}玉購入してください",
    bdArea: "プロジェクト面積", bdWeight: "毛糸の太さ",
    bdStitch: "編み模様", bdBuffer: "バッファ（10% 加算済み）",
    bdSkeins: "購入する玉数",
    resultDisclaimer: "あくまで推定値です。実際の消費量はゲージ、テンション、編み方によって異なります。安全のため1玉多めに購入することをお勧めします。",
    whatIsTitle: "毛糸消費量の推定方法",
    whatIsText: "毛糸の消費量は3つの主要因で決まります：プロジェクトの総面積、毛糸の太さ、編み模様。ケーブルやブリオッシュのような密度が高くテクスチャのある編み方は、メリヤスや透かし編みよりも1平方センチあたりのはるかに多くの毛糸を使います。",
    weightsTitle: "毛糸の太さカテゴリ",
    thCat: "カテゴリ", thName: "一般名", thGauge: "標準ゲージ",
    patternsTitle: "編み模様が毛糸消費量に与える影響",
    patternsText: "編み模様によって毛糸の消費速度は大きく異なります。メリヤス編みを基準に：",
    patGarter: "ガーター編み：+5%",
    patRibbing: "ゴム編み（1x1、2x2）：+15%",
    patSeed: "裏メリヤス：+20%",
    patCable: "ケーブル：+35%",
    patBrioche: "ブリオッシュ／フィッシャーマン：+60%",
    patLace: "レース／透かし：-15%",
    howToTitle: "使い方",
    howTo1: "プロジェクトの完成幅と高さをセンチで入力します。",
    howTo2: "毛糸ラベルを確認して、CYC 標準カテゴリから太さを選択します。",
    howTo3: "プロジェクトの主要な編み模様を選択します。",
    howTo4: "毛糸ラベルに記載された1玉あたりのヤード数を入力します（ブランドにより異なります）。",
    howTo5: "「必要な毛糸を計算」をクリックすると、総ヤード数と購入すべき玉数が表示されます。",
    faqTitle: "よくある質問",
    faq1q: "セーター1枚に必要な毛糸は？",
    faq1a: "大人用Mサイズのセーターは、中太糸で通常1,200〜1,800ヤード必要です。太糸なら800〜1,200ヤード、極細糸なら1,800〜2,500ヤードです。正確な量はサイズ、丈、編み模様によって変わります。",
    faq2q: "毛糸1玉は何ヤード？",
    faq2a: "ブランドと太さにより大きく異なります。一般的な目安：レース400〜800、極細350〜450、スポーツ250〜350、DK 200〜300、中太150〜250、太100〜150、極太60〜100ヤード/玉。必ずラベルを確認してください。",
    faq3q: "バッファは必要ですか？",
    faq3a: "はい。この計算ツールは既に10%のバッファを加算しています。プロの編み手は、特に大きなプロジェクトでは同じロットの毛糸を1玉多めに買うことを勧めます。途中で足りなくなって別ロットを買うと、目立つ色差が出る可能性があるためです。",
    faq4q: "かぎ針編みは棒針編みより毛糸を使いますか？",
    faq4a: "はい、同じ面積で一般的に25〜30%多く使います。かぎ針の編み目は高く密です。棒針用のパターンかぎ針で編む場合は、推定値に約30%加算してください。",
    faq5q: "完成品が予想より重いのはなぜ？",
    faq5a: "よくある原因：ゲージが予想より緩いかきつい、ブロッキングで布が伸びた、または編み模様が推定より重い。パターンに従う場合は、必ずゲージスワッチを編み、数段編んだ後に実際の消費量と比較してください。",
    disclaimer: "<strong>注意：</strong>これは推定値です。重要なプロジェクトでは、必ず1玉多く購入し、ゲージスワッチを編んで実際の消費量を確認してください。",
    footer: "すべてブラウザ内で実行されます。データの収集・保存は行いません。",
    alertFill: "有効な幅と高さを入力してください。",
    alertSkein: "1玉あたりのヤード数を入力してください。"
  },
  'ko': {
    title: "실 계산기",
    subtitle: "스웨터, 담요, 목도리 등 모든 뜨개질 프로젝트에 필요한 실의 볼 수를 추정합니다.",
    calcHeading: "계산기",
    widthLabel: "너비 (cm)", heightLabel: "높이 (cm)",
    weightLabel: "실 굵기 (CYC 표준)",
    weightLace: "0 — 레이스", weightSuperfine: "1 — 극세 (양말)",
    weightFine: "2 — 가는 (스포츠)", weightLight: "3 — 중간 (DK)",
    weightMedium: "4 — 중간굵기 (워스티드)", weightBulky: "5 — 굵은 (청키)",
    weightSuperbulky: "6 — 극굵",
    stitchLabel: "뜨개 패턴",
    stitchStockinette: "메리야스 (평편)", stitchGarter: "가터 스티치",
    stitchRibbing: "고무뜨기 (1x1, 2x2)", stitchSeed: "씨앗뜨기",
    stitchCable: "케이블", stitchBrioche: "브리오슈 / 피셔맨",
    stitchLace: "레이스 / 망사",
    skeinLabel: "볼당 야드 (실 라벨 확인)",
    calcBtn: "필요한 실 계산",
    resultLabel: "필요한 실은 약",
    skeinNote: "{y}야드 실을 {n}볼 구매하세요",
    bdArea: "프로젝트 면적", bdWeight: "실 굵기",
    bdStitch: "뜨개 패턴", bdBuffer: "여유분 (10% 추가됨)",
    bdSkeins: "구매할 볼 수",
    resultDisclaimer: "추정치입니다. 실제 사용량은 게이지, 장력, 개인 뜨개 습관에 따라 달라집니다. 안전을 위해 한 볼 더 구매하세요.",
    whatIsTitle: "실 사용량 추정 방법",
    whatIsText: "실 소비량은 세 가지 주요 요인에 따라 결정됩니다: 프로젝트 총 면적, 실의 굵기, 뜨개 패턴. 케이블이나 브리오슈처럼 촘촘하고 질감이 있는 패턴은 매끄러운 메리야스나 레이스보다 제곱센티미터당 훨씬 많은 실을 사용합니다.",
    weightsTitle: "실 굵기 카테고리",
    thCat: "카테고리", thName: "일반 명칭", thGauge: "표준 게이지",
    patternsTitle: "뜨개 패턴이 실 사용량에 미치는 영향",
    patternsText: "패턴에 따라 실 소비 속도가 크게 다릅니다. 메리야스 기준:",
    patGarter: "가터 스티치: +5%",
    patRibbing: "고무뜨기 (1x1, 2x2): +15%",
    patSeed: "씨앗뜨기: +20%",
    patCable: "케이블: +35%",
    patBrioche: "브리오슈 / 피셔맨: +60%",
    patLace: "레이스 / 망사: -15%",
    howToTitle: "사용 방법",
    howTo1: "프로젝트의 완성 너비와 높이를 센티미터로 입력합니다.",
    howTo2: "실 라벨을 확인하여 CYC 표준 카테고리에서 굵기를 선택합니다.",
    howTo3: "프로젝트의 주요 뜨개 패턴을 선택합니다.",
    howTo4: "실 라벨에 표시된 볼당 야드를 입력합니다 (브랜드마다 다름).",
    howTo5: "\"필요한 실 계산\"을 클릭하면 총 야드와 구매할 볼 수가 표시됩니다.",
    faqTitle: "자주 묻는 질문",
    faq1q: "스웨터 하나에 실이 얼마나 필요하나요?",
    faq1a: "성인 M 사이즈 스웨터는 중간굵기 실로 보통 1,200~1,800야드 필요합니다. 굵은 실은 800~1,200야드, 극세 실은 1,800~2,500야드입니다. 정확한 양은 사이즈, 길이, 패턴에 따라 다릅니다.",
    faq2q: "실 한 볼은 몇 야드인가요?",
    faq2a: "브랜드와 굵기에 따라 크게 다릅니다. 일반적인 기준: 레이스 400~800, 극세 350~450, 스포츠 250~350, DK 200~300, 중간굵기 150~250, 굵은 100~150, 극굵 60~100야드/볼. 항상 라벨을 확인하세요.",
    faq3q: "여유분을 추가해야 하나요?",
    faq3a: "네. 이 계산기는 이미 10% 여유분을 추가합니다. 전문 뜨개인은 특히 큰 프로젝트에서 같은 염색 로트의 실을 한 볼 더 구매할 것을 권장합니다. 중간에 부족해서 다른 로트를 사면 눈에 띄는 색 차이가 생길 수 있기 때문입니다.",
    faq4q: "코바늘이 대바늘보다 실을 더 많이 쓰나요?",
    faq4a: "네, 같은 면적에서 일반적으로 25~30% 더 많이 사용합니다. 코바늘 코는 더 높고 촘촘합니다. 대바늘 패턴을 코바늘로 뜨려면 추정치에 약 30%를 더하세요.",
    faq5q: "완성품이 예상보다 무거운 이유는?",
    faq5a: "흔한 원인: 예상보다 느슨하거나 빡빡한 게이지, 블로킹으로 천이 늘어남, 또는 예상보다 무거운 패턴. 패턴을 따르는 경우 항상 게이지 스와치를 뜨고 몇 단 후 실제 사용량과 비교하세요.",
    disclaimer: "<strong>참고:</strong> 추정치입니다. 중요한 프로젝트의 경우 한 볼 더 구매하고 게이지 스와치를 떠서 실제 사용량을 확인하세요.",
    footer: "전적으로 브라우저에서 실행됩니다. 데이터를 수집하거나 저장하지 않습니다.",
    alertFill: "유효한 너비와 높이를 입력하세요.",
    alertSkein: "볼당 야드를 입력하세요."
  },
  'de': {
    title: "Wolle-Rechner",
    subtitle: "Schätzen Sie, wie viele Wollknäuel Sie für Pullover, Decken, Schals und mehr benötigen.",
    calcHeading: "Rechner",
    widthLabel: "Breite (cm)", heightLabel: "Höhe (cm)",
    weightLabel: "Garnstärke (CYC-Standard)",
    weightLace: "0 — Lace", weightSuperfine: "1 — Super Fine (Socken)",
    weightFine: "2 — Fine (Sport)", weightLight: "3 — Light (DK)",
    weightMedium: "4 — Medium (Worsted)", weightBulky: "5 — Bulky (Chunky)",
    weightSuperbulky: "6 — Super Bulky",
    stitchLabel: "Strickmuster",
    stitchStockinette: "Glatt rechts", stitchGarter: "Kraus rechts",
    stitchRibbing: "Rippenmuster (1x1, 2x2)", stitchSeed: "Perlmuster",
    stitchCable: "Zopfmuster", stitchBrioche: "Patentmuster / Fischerman",
    stitchLace: "Spitze / Lochmuster",
    skeinLabel: "Meter pro Knäuel (Etikett prüfen)",
    calcBtn: "Benötigte Wolle berechnen",
    resultLabel: "Sie benötigen etwa",
    skeinNote: "Kaufen Sie {n} Knäuel à {y} Meter",
    bdArea: "Projektfläche", bdWeight: "Garnstärke",
    bdStitch: "Strickmuster", bdBuffer: "Puffer (10% hinzugefügt)",
    bdSkeins: "Zu kaufende Knäuel",
    resultDisclaimer: "Nur eine Schätzung. Der tatsächliche Verbrauch hängt von Maschenprobe, Spannung und individuellem Stil ab. Kaufen Sie immer ein Knäuel extra.",
    whatIsTitle: "Wie der Wollverbrauch geschätzt wird",
    whatIsText: "Der Wollverbrauch hängt von drei Hauptfaktoren ab: der Gesamtfläche des Projekts, der Garnstärke und dem Strickmuster. Dichte, strukturierte Muster wie Zopf oder Patent verbrauchen pro Quadratzentimeter deutlich mehr Wolle als glatt rechts oder Lochmuster.",
    weightsTitle: "Garnstärke-Kategorien",
    thCat: "Kategorie", thName: "Üblicher Name", thGauge: "Typische Maschenprobe",
    patternsTitle: "Wie das Strickmuster den Verbrauch beeinflusst",
    patternsText: "Verschiedene Muster verbrauchen Wolle sehr unterschiedlich. Bezogen auf glatt rechts:",
    patGarter: "Kraus rechts: +5%",
    patRibbing: "Rippenmuster (1x1, 2x2): +15%",
    patSeed: "Perlmuster: +20%",
    patCable: "Zopfmuster: +35%",
    patBrioche: "Patentmuster / Fischerman: +60%",
    patLace: "Spitze / Lochmuster: -15%",
    howToTitle: "Verwendung",
    howTo1: "Geben Sie die fertige Breite und Höhe Ihres Projekts in Zentimetern ein.",
    howTo2: "Wählen Sie die Garnstärke aus der CYC-Kategorie (Etikett prüfen).",
    howTo3: "Wählen Sie das dominierende Strickmuster.",
    howTo4: "Geben Sie die Meter pro Knäuel vom Etikett ein (variiert je nach Marke).",
    howTo5: "Klicken Sie auf \"Benötigte Wolle berechnen\", um Gesamtmeter und Knäuelanzahl zu sehen.",
    faqTitle: "Häufig gestellte Fragen",
    faq1q: "Wie viel Wolle brauche ich für einen Pullover?",
    faq1a: "Ein Pullover in Größe M aus Worsted-Garn benötigt typischerweise 1.100–1.650 Meter. In Bulky 730–1.100 Meter. In Fingering 1.650–2.300 Meter. Der genaue Bedarf hängt von Größe, Länge und Muster ab.",
    faq2q: "Wie viele Meter hat ein Wollknäuel?",
    faq2a: "Das variiert stark je nach Marke und Stärke. Übliche Werte: Lace 370–730, Fingering 320–410, Sport 230–320, DK 180–270, Worsted 140–230, Bulky 90–140, Super Bulky 55–90 Meter pro Knäuel. Prüfen Sie immer das Etikett.",
    faq3q: "Sollte ich einen Puffer einplanen?",
    faq3a: "Ja. Dieser Rechner fügt bereits 10% Puffer hinzu. Professionelle Stricker empfehlen, ein Extraknäuel derselben Partie zu kaufen, besonders bei großen Projekten, da ein Partiewechsel sichtbare Farbunterschiede verursachen kann.",
    faq4q: "Verbraucht Häkeln mehr Wolle als Stricken?",
    faq4a: "Ja, in der Regel 25–30% mehr bei gleicher Fläche. Häkelmaschen sind höher und dichter. Wenn Sie ein Strickmuster häkeln möchten, rechnen Sie etwa 30% hinzu.",
    faq5q: "Warum wiegt mein fertiges Projekt mehr als geschätzt?",
    faq5a: "Häufige Ursachen: lockerere oder festere Maschenprobe als erwartet, Dehnen beim Spannen, oder ein schwereres Muster als geschätzt. Stricken Sie immer eine Maschenprobe und vergleichen Sie nach den ersten Reihen.",
    disclaimer: "<strong>Hinweis:</strong> Dies ist eine Schätzung. Für kritische Projekte kaufen Sie immer ein Extraknäuel und stricken eine Maschenprobe.",
    footer: "Läuft vollständig in Ihrem Browser. Es werden keine Daten gesammelt oder gespeichert.",
    alertFill: "Bitte geben Sie eine gültige Breite und Höhe ein.",
    alertSkein: "Bitte geben Sie die Meter pro Knäuel ein."
  },
  'ru': {
    title: "Калькулятор пряжи",
    subtitle: "Рассчитайте, сколько мотков пряжи нужно для свитеров, пледов, шарфов и других проектов.",
    calcHeading: "Калькулятор",
    widthLabel: "Ширина (см)", heightLabel: "Высота (см)",
    weightLabel: "Толщина пряжи (стандарт CYC)",
    weightLace: "0 — Кружевная", weightSuperfine: "1 — Сверхтонкая (носочная)",
    weightFine: "2 — Тонкая (спортивная)", weightLight: "3 — Лёгкая (DK)",
    weightMedium: "4 — Средняя (Worsted)", weightBulky: "5 — Объёмная (Chunky)",
    weightSuperbulky: "6 — Сверхобъёмная",
    stitchLabel: "Узор вязания",
    stitchStockinette: "Лицевая гладь", stitchGarter: "Платочная вязка",
    stitchRibbing: "Резинка (1x1, 2x2)", stitchSeed: "Жемчужный узор",
    stitchCable: "Косы", stitchBrioche: "Бриошь / патентная",
    stitchLace: "Кружево / ажур",
    skeinLabel: "Метров в мотке (проверьте этикетку)",
    calcBtn: "Рассчитать необходимое количество",
    resultLabel: "Вам понадобится примерно",
    skeinNote: "Купите {n} мотков по {y} метров",
    bdArea: "Площадь проекта", bdWeight: "Толщина пряжи",
    bdStitch: "Узор", bdBuffer: "Запас (добавлено 10%)",
    bdSkeins: "Купить мотков",
    resultDisclaimer: "Только оценка. Фактический расход зависит от плотности, натяжения и индивидуального стиля. Всегда покупайте лишний моток.",
    whatIsTitle: "Как оценивается расход пряжи",
    whatIsText: "Расход пряжи зависит от трёх основных факторов: общей площади проекта, толщины пряжи и узора. Плотные, рельефные узоры (косы, бриошь) расходуют значительно больше пряжи на квадратный сантиметр, чем гладь или ажур.",
    weightsTitle: "Категории толщины пряжи",
    thCat: "Категория", thName: "Обычное название", thGauge: "Типичная плотность",
    patternsTitle: "Как узор влияет на расход пряжи",
    patternsText: "Разные узоры расходуют пряжу с разной скоростью. Относительно лицевой глади:",
    patGarter: "Платочная вязка: +5%",
    patRibbing: "Резинка (1x1, 2x2): +15%",
    patSeed: "Жемчужный узор: +20%",
    patCable: "Косы: +35%",
    patBrioche: "Бриошь / патентная: +60%",
    patLace: "Кружево / ажур: -15%",
    howToTitle: "Как пользоваться",
    howTo1: "Введите готовую ширину и высоту проекта в сантиметрах.",
    howTo2: "Выберите толщину пряжи по стандарту CYC (смотрите этикетку).",
    howTo3: "Выберите основной узор проекта.",
    howTo4: "Введите метраж мотка с этикетки (зависит от бренда).",
    howTo5: "Нажмите «Рассчитать необходимое количество», чтобы увидеть общий метраж и число мотков.",
    faqTitle: "Часто задаваемые вопросы",
    faq1q: "Сколько пряжи нужно на свитер?",
    faq1a: "Взрослый свитер размера M из пряжи средней толщины требует примерно 1 100–1 650 метров. Из объёмной пряжи — 730–1 100 метров. Из тонкой — 1 650–2 300 метров. Точное количество зависит от размера, длины и узора.",
    faq2q: "Сколько метров в мотке?",
    faq2a: "Зависит от бренда и толщины. Обычные значения: кружевная 370–730, тонкая 320–410, спортивная 230–320, DK 180–270, средняя 140–230, объёмная 90–140, сверхобъёмная 55–90 метров в мотке. Всегда проверяйте этикетку.",
    faq3q: "Нужно ли добавлять запас?",
    faq3a: "Да. Этот калькулятор уже добавляет 10% запаса. Профессиональные вязальщицы советуют покупать лишний моток из той же партии, особенно для больших проектов, так как смена партии даёт заметную разницу в цвете.",
    faq4q: "Вязание крючком расходует больше пряжи, чем спицами?",
    faq4a: "Да, обычно на 25–30% больше при той же площади. Столбики крючком выше и плотнее. Если вы вяжете крючком узор, предназначенный для спиц, добавьте около 30%.",
    faq5q: "Почему готовое изделие весит больше, чем предполагалось?",
    faq5a: "Частые причины: более свободная или плотная вязка, растяжение при блокировке, или более тяжёлый узор. Всегда вяжите образец и сравнивайте фактический расход после первых рядов.",
    disclaimer: "<strong>Примечание:</strong> Это оценка. Для важных проектов всегда покупайте лишний моток и вяжите образец.",
    footer: "Полностью работает в вашем браузере. Данные не собираются и не хранятся.",
    alertFill: "Пожалуйста, введите корректную ширину и высоту.",
    alertSkein: "Пожалуйста, введите метраж мотка."
  },
  'es': {
    title: "Calculadora de Lana",
    subtitle: "Estime cuántos ovillos de lana necesita para suéteres, mantas, bufandas y más.",
    calcHeading: "Calculadora",
    widthLabel: "Ancho (cm)", heightLabel: "Alto (cm)",
    weightLabel: "Grosor de la lana (estándar CYC)",
    weightLace: "0 — Encaje", weightSuperfine: "1 — Súper Fina (Calcetín)",
    weightFine: "2 — Fina (Sport)", weightLight: "3 — Ligera (DK)",
    weightMedium: "4 — Media (Worsted)", weightBulky: "5 — Gruesa (Chunky)",
    weightSuperbulky: "6 — Súper Gruesa",
    stitchLabel: "Punto",
    stitchStockinette: "Jersey liso", stitchGarter: "Punto bobo",
    stitchRibbing: "Elástico (1x1, 2x2)", stitchSeed: "Punto arroz",
    stitchCable: "Trenzas", stitchBrioche: "Brioche / Fisherman",
    stitchLace: "Encaje / Calado",
    skeinLabel: "Metros por ovillo (revise la etiqueta)",
    calcBtn: "Calcular lana necesaria",
    resultLabel: "Necesitará aproximadamente",
    skeinNote: "Compre {n} ovillo(s) de {y} metros cada uno",
    bdArea: "Área del proyecto", bdWeight: "Grosor de lana",
    bdStitch: "Punto", bdBuffer: "Margen (10% añadido)",
    bdSkeins: "Ovillos a comprar",
    resultDisclaimer: "Solo una estimación. El consumo real varía según la tensión del tejido y el estilo individual. Siempre compre un ovillo extra.",
    whatIsTitle: "Cómo se estima el consumo de lana",
    whatIsText: "El consumo de lana depende de tres factores principales: el área total del proyecto, el grosor de la lana y el punto. Los puntos más densos y texturizados como trenzas o brioche consumen mucho más por centímetro cuadrado que el jersey liso o el encaje.",
    weightsTitle: "Categorías de grosor de lana",
    thCat: "Categoría", thName: "Nombre común", thGauge: "Muestra típica",
    patternsTitle: "Cómo afecta el punto al consumo de lana",
    patternsText: "Diferentes puntos consumen lana a velocidades muy distintas. Respecto al jersey liso:",
    patGarter: "Punto bobo: +5%",
    patRibbing: "Elástico (1x1, 2x2): +15%",
    patSeed: "Punto arroz: +20%",
    patCable: "Trenzas: +35%",
    patBrioche: "Brioche / Fisherman: +60%",
    patLace: "Encaje / Calado: -15%",
    howToTitle: "Cómo usar esta calculadora",
    howTo1: "Introduzca el ancho y alto final de su proyecto en centímetros.",
    howTo2: "Seleccione el grosor de lana del estándar CYC (revise la etiqueta).",
    howTo3: "Elija el punto dominante del proyecto.",
    howTo4: "Introduzca los metros por ovillo de la etiqueta (varía según la marca).",
    howTo5: "Haga clic en \"Calcular lana necesaria\" para ver el total de metros y los ovillos a comprar.",
    faqTitle: "Preguntas frecuentes",
    faq1q: "¿Cuánta lana necesito para un suéter?",
    faq1a: "Un suéter de talla M para adulto en lana worsted requiere típicamente 1.100–1.650 metros. En bulky, 730–1.100 metros. En fingering, 1.650–2.300 metros. La cantidad exacta depende de talla, largo y punto.",
    faq2q: "¿Cuántos metros tiene un ovillo?",
    faq2a: "Varía mucho según marca y grosor. Valores comunes: Encaje 370–730, Fingering 320–410, Sport 230–320, DK 180–270, Worsted 140–230, Bulky 90–140, Super Bulky 55–90 metros por ovillo. Siempre revise la etiqueta.",
    faq3q: "¿Debo añadir un margen?",
    faq3a: "Sí. Esta calculadora ya añade un 10% de margen. Los tejedores profesionales suelen recomendar comprar un ovillo extra del mismo lote de tinte, especialmente para proyectos grandes, porque quedarse sin lana y comprar otro lote puede causar diferencias visibles de color.",
    faq4q: "¿El ganchillo usa más lana que el tejido de punto?",
    faq4a: "Sí, generalmente 25–30% más para la misma superficie. Los puntos de ganchillo son más altos y densos. Si planea hacer ganchillo con un patrón de punto, añada aproximadamente un 30%.",
    faq5q: "¿Por qué mi proyecto terminado pesa más de lo previsto?",
    faq5a: "Causas comunes: tensión más suelta o apretada de lo esperado, bloqueo que estira la tela, o un punto más pesado de lo estimado. Siempre haga una muestra de tensión y compare el consumo real después de las primeras vueltas.",
    disclaimer: "<strong>Nota:</strong> Esta es una estimación. Para proyectos críticos, siempre compre un ovillo extra y teja una muestra de tensión.",
    footer: "Se ejecuta completamente en su navegador. No se recopilan ni almacenan datos.",
    alertFill: "Por favor introduzca un ancho y alto válidos.",
    alertSkein: "Por favor introduzca los metros por ovillo."
  }
};

// ============================================================
// 生成文件
// ============================================================
const files = {};

files['index.html'] = buildIndexHtml(null, 'en', '/yarn-tree-calculator/');
files['zh/index.html'] = buildIndexHtml('zh', 'zh-Hans', '/yarn-tree-calculator/zh/');
files['zh-tw/index.html'] = buildIndexHtml('zh-TW', 'zh-Hant', '/yarn-tree-calculator/zh-tw/');
files['ja/index.html'] = buildIndexHtml('ja', 'ja', '/yarn-tree-calculator/ja/');
files['ko/index.html'] = buildIndexHtml('ko', 'ko', '/yarn-tree-calculator/ko/');
files['de/index.html'] = buildIndexHtml('de', 'de', '/yarn-tree-calculator/de/');
files['ru/index.html'] = buildIndexHtml('ru', 'ru', '/yarn-tree-calculator/ru/');
files['es/index.html'] = buildIndexHtml('es', 'es', '/yarn-tree-calculator/es/');

files['css/style.css'] = STYLE_CSS;
files['js/i18n.js'] = I18N_JS;
files['js/calculator.js'] = CALCULATOR_JS;

for (const [lang, data] of Object.entries(LOCALES)) {
  files[`locales/${lang}.json`] = JSON.stringify(data, null, 2);
}

files['.gitignore'] = `node_modules/
.wrangler/
.dev.vars
.DS_Store
*.log
.vscode/
.idea/
dist/
build/
`;

// ============================================================
// 写入
// ============================================================
const root = '.';
let count = 0;
for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(root, filePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Created: ' + filePath);
  count++;
}
console.log(`\nDone. ${count} files generated.`);
console.log('\nNext steps:');
console.log('  1. git init && git add . && git commit -m "Initial: yarn calculator"');
console.log('  2. Push to a new GitHub repo "yarn-tree-calculator"');
console.log('  3. Deploy as a new Cloudflare Worker (no build command needed)');
console.log('  4. In tool-proxy/src/index.js PROXY_MAP, add:');
console.log('     \'/yarn-tree-calculator\': \'https://yarn-tree-calculator.lvyafei2026.workers.dev\'');
console.log('  5. In tool-proxy/wrangler.toml run_worker_first, add:');
console.log('     "/yarn-tree-calculator/*"');
console.log('  6. In Cloudflare tool-proxy Domains & Routes, add:');
console.log('     toolara.dev/yarn-tree-calculator/*');
console.log('     www.toolara.dev/yarn-tree-calculator/*');
console.log('  7. Update tool-proxy/public/sitemap.xml and index.html');