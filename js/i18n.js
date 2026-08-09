// =============================================================================
// i18n.js — Internationalization engine for the portfolio
// Supports English (en) and Spanish (es) with localStorage persistence
// and automatic browser language detection.
// =============================================================================

(function () {
  'use strict';

  const SUPPORTED_LANGS = ['en', 'es'];
  const DEFAULT_LANG = 'en';
  const STORAGE_KEY = 'portfolio_lang';

  // Cache for loaded translations
  const translationsCache = {};

  // ── Core Module ───────────────────────────────────────────────────────────
  window.I18n = {
    currentLang: DEFAULT_LANG,

    // ── Initialize ────────────────────────────────────────────────────────
    async init() {
      // Determine language: localStorage > browser > default
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED_LANGS.includes(saved)) {
        this.currentLang = saved;
      } else {
        const browserLang = (navigator.language || navigator.userLanguage || '').slice(0, 2).toLowerCase();
        this.currentLang = SUPPORTED_LANGS.includes(browserLang) ? browserLang : DEFAULT_LANG;
      }

      // Pre-load both languages for instant switching
      await Promise.all(SUPPORTED_LANGS.map((lang) => this.loadTranslations(lang)));

      // Apply current language
      this.applyLanguage(this.currentLang);

      // Setup toggle button
      this.setupToggle();
    },

    // ── Load translation file ─────────────────────────────────────────────
    async loadTranslations(lang) {
      if (translationsCache[lang]) return translationsCache[lang];

      try {
        const res = await fetch(`js/i18n/${lang}.json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        translationsCache[lang] = data;
        return data;
      } catch (err) {
        console.error(`[i18n] Failed to load ${lang}.json:`, err);
        return null;
      }
    },

    // ── Get a translation by dot-path key ─────────────────────────────────
    t(key, lang) {
      const translations = translationsCache[lang || this.currentLang];
      if (!translations) return key;

      const parts = key.split('.');
      let value = translations;
      for (const part of parts) {
        if (value === undefined || value === null) return key;
        value = value[part];
      }
      return value !== undefined && value !== null ? value : key;
    },

    // ── Apply language to the entire page ─────────────────────────────────
    applyLanguage(lang) {
      this.currentLang = lang;
      localStorage.setItem(STORAGE_KEY, lang);

      const translations = translationsCache[lang];
      if (!translations) return;

      // Update <html lang>
      document.documentElement.lang = lang;

      // Update meta tags
      this.updateMeta(translations.meta);

      // Update all data-i18n elements (text content)
      document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        const value = this.t(key, lang);
        if (value && value !== key) {
          el.textContent = value;
        }
      });

      // Update all data-i18n-html elements (innerHTML with links etc.)
      document.querySelectorAll('[data-i18n-html]').forEach((el) => {
        const key = el.getAttribute('data-i18n-html');
        const value = this.t(key, lang);
        if (value && value !== key) {
          el.innerHTML = value;
        }
      });

      // Update all data-i18n-placeholder elements
      document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        const key = el.getAttribute('data-i18n-placeholder');
        const value = this.t(key, lang);
        if (value && value !== key) {
          el.placeholder = value;
        }
      });

      // Update toggle button state
      this.updateToggleUI(lang);

      // Restart typing animation with translated words
      this.updateTypingAnimation(lang);

      // Re-render GitHub section with translated labels
      this.updateGitHub(lang);
    },

    // ── Update <meta> tags ────────────────────────────────────────────────
    updateMeta(meta) {
      if (!meta) return;

      // Title
      if (meta.title) document.title = meta.title;

      // Meta description
      const descMeta = document.querySelector('meta[name="description"]');
      if (descMeta && meta.description) descMeta.setAttribute('content', meta.description);

      // Open Graph
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle && meta.ogTitle) ogTitle.setAttribute('content', meta.ogTitle);

      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc && meta.ogDescription) ogDesc.setAttribute('content', meta.ogDescription);

      const ogLocale = document.querySelector('meta[property="og:locale"]');
      if (ogLocale) ogLocale.setAttribute('content', this.currentLang === 'es' ? 'es_ES' : 'en_US');

      // Twitter
      const twTitle = document.querySelector('meta[name="twitter:title"]');
      if (twTitle && meta.twitterTitle) twTitle.setAttribute('content', meta.twitterTitle);

      const twDesc = document.querySelector('meta[name="twitter:description"]');
      if (twDesc && meta.twitterDescription) twDesc.setAttribute('content', meta.twitterDescription);
    },

    // ── Setup language toggle button ──────────────────────────────────────
    setupToggle() {
      const toggle = document.getElementById('lang-toggle');
      if (!toggle) return;

      toggle.addEventListener('click', () => {
        const newLang = this.currentLang === 'en' ? 'es' : 'en';
        this.applyLanguage(newLang);
      });

      this.updateToggleUI(this.currentLang);
    },

    // ── Update toggle button visual state ─────────────────────────────────
    updateToggleUI(lang) {
      const enLabel = document.getElementById('lang-en');
      const esLabel = document.getElementById('lang-es');
      if (!enLabel || !esLabel) return;

      enLabel.classList.toggle('active', lang === 'en');
      esLabel.classList.toggle('active', lang === 'es');
    },

    // ── Restart typing animation with translated words ────────────────────
    updateTypingAnimation(lang) {
      const words = this.t('hero.typingWords', lang);
      if (Array.isArray(words) && window.TypingAnimation) {
        window.TypingAnimation.updateWords(words);
      }
    },

    // ── Re-render GitHub with translated labels ───────────────────────────
    updateGitHub(lang) {
      if (window.GitHubIntegration && window.GitHubIntegration._lastData) {
        window.GitHubIntegration.renderStats(window.GitHubIntegration._lastData);
        window.GitHubIntegration.renderContributionGraph(window.GitHubIntegration._lastData);
      }
    },
  };
})();
