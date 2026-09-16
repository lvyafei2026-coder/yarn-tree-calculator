const SUPPORTED_LANGS = ['en','zh','zh-TW','ja','ko','de','ru','es'];
const DEFAULT_LANG = 'en';

const PATH_TO_LANG = {
  '/zh/': 'zh',
  '/zh-tw/': 'zh-TW',
  '/ja/': 'ja',
  '/ko/': 'ko',
  '/de/': 'de',
  '/ru/': 'ru',
  '/es/': 'es'
};

const LANG_TO_PATH = {
  'en': '/',
  'zh': '/zh/',
  'zh-TW': '/zh-tw/',
  'ja': '/ja/',
  'ko': '/ko/',
  'de': '/de/',
  'ru': '/ru/',
  'es': '/es/'
};

let currentLang = DEFAULT_LANG;
let translations = {};
const cache = {};

function detectPageLang() {
  if (window.__FORCE_LANG__ && SUPPORTED_LANGS.includes(window.__FORCE_LANG__)) {
    return window.__FORCE_LANG__;
  }
  const path = window.location.pathname.replace(/\/$/, '') + '/';
  if (PATH_TO_LANG[path]) return PATH_TO_LANG[path];
  return DEFAULT_LANG;
}

async function loadLocale(lang) {
  if (cache[lang]) return cache[lang];
  const res = await fetch('/locales/' + lang + '.json');
  if (!res.ok) throw new Error('Failed to load locale: ' + lang);
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
  const select = document.getElementById('langSelect');
  if (select) select.value = lang;
  window.__i18n = { t: translations, lang: currentLang };
}

function setLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) lang = DEFAULT_LANG;
  
  // 获取当前路径的第一段作为子目录（例如 /gfr-calculator 或 /code-tools）
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  const subdir = pathSegments.length > 0 ? '/' + pathSegments[0] : '';
  
  // 拼接子目录和语言路径
  const targetPath = subdir + (LANG_TO_PATH[lang] || '/');
  window.location.href = targetPath;
}

document.addEventListener('DOMContentLoaded', initPage);
