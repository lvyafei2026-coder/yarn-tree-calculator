const SUPPORTED_LANGS = ['en','zh','zh-TW','ja','ko','de','ru','es'];
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
  const m = rest.match(/^\/(zh-tw|zh|ja|ko|de|ru|es)\//);
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

document.addEventListener('DOMContentLoaded', initPage);