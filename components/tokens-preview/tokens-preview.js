/**
 * tokens-preview.js — Renders live token values from :root CSS custom properties
 * v2.0 — Comprehensive overhaul with all token categories, gradient details,
 *         alpha overlays, status/absolute scales, and enhanced previews.
 */

window.SmartBI_TokensPreview = {
  init() {
    this.toast = document.getElementById('token-copy-toast');
    this.searchInput = document.getElementById('token-search');

    // Hidden probe element for color resolution (reused)
    this._probe = document.createElement('div');
    this._probe.style.cssText = 'position:fixed;left:-9999px;top:-9999px;visibility:hidden;pointer-events:none;';
    document.body.appendChild(this._probe);

    this.initNavHeight();
    this.initInteractiveWidgets();

    this.allTokens = this.collectTokens();

    this.renderColorScales();
    this.renderStatusScale();
    this.renderAbsoluteScale();
    this.renderSemanticColors();
    this.renderTypography();
    this.renderSpacing();
    this.renderRadius();
    this.renderShadows();
    this.renderGradients();
    this.renderAlphaOverlays();
    this.renderComponents();
    this.renderMotion();
    this.renderTokenTables();
    this.renderComponentTokenUsages();
    this.bindSearch();
    this.bindSidebar();
    this.bindCopyHandlers();
  },

  initNavHeight() {
    const nav = document.querySelector('.smartbi-nav');
    if (!nav) return;

    const updateHeight = () => {
      const height = nav.offsetHeight;
      document.documentElement.style.setProperty('--sbi-nav-height', `${height}px`);
    };

    window.addEventListener('resize', updateHeight);
    updateHeight();
    window.addEventListener('load', updateHeight);
  },

  initInteractiveWidgets() {
    // 1. Filter Dropdown Interaction
    const selectTrigger = document.querySelector('.token-select');
    const dropdownPanel = document.querySelector('.token-select-dropdown-panel');
    const options = document.querySelectorAll('.token-select-option');

    if (selectTrigger && dropdownPanel) {
      // Toggle dropdown open
      selectTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownPanel.style.display = dropdownPanel.style.display === 'none' ? 'flex' : 'none';
      });

      // Close when clicking outside
      document.addEventListener('click', () => {
        dropdownPanel.style.display = 'none';
      });

      // Handle option selection
      options.forEach(opt => {
        opt.addEventListener('click', (e) => {
          e.stopPropagation();
          options.forEach(o => o.classList.remove('selected'));
          opt.classList.add('selected');
          
          // Remove checkmark icon from other options
          options.forEach(o => {
            const check = o.querySelector('.material-icons');
            if (check) check.remove();
          });
          const textSpan = opt.querySelector('span');
          selectTrigger.querySelector('span').textContent = textSpan.textContent;
          
          // Append check icon to selected option
          const checkIcon = document.createElement('span');
          checkIcon.className = 'material-icons token-icon-style--blue token-icon--sm';
          checkIcon.textContent = 'check';
          opt.appendChild(checkIcon);
          
          dropdownPanel.style.display = 'none';
        });
      });
    }

    // Hide dropdown panel initially
    if (dropdownPanel) dropdownPanel.style.display = 'none';

    // 2. Datepicker Range Selection Interaction
    const days = document.querySelectorAll('.token-datepicker-calendar .token-datepicker-day:not(.muted)');
    let rangeStart = 12; // Initial mockup start
    let rangeEnd = 18;   // Initial mockup end

    days.forEach(day => {
      day.addEventListener('click', () => {
        const val = parseInt(day.textContent);
        if (isNaN(val)) return;

        // Reset if we already have both start and end, or if we click the same day
        if (rangeStart && rangeEnd) {
          rangeStart = val;
          rangeEnd = null;
        } else if (!rangeStart) {
          rangeStart = val;
        } else {
          // If clicked day is before start, make it the new start
          if (val < rangeStart) {
            rangeStart = val;
          } else {
            rangeEnd = val;
          }
        }

        // Render selection states
        days.forEach(d => {
          const dVal = parseInt(d.textContent);
          d.classList.remove('active', 'in-range');
          if (dVal === rangeStart || dVal === rangeEnd) {
            d.classList.add('active');
          } else if (rangeStart && rangeEnd && dVal > rangeStart && dVal < rangeEnd) {
            d.classList.add('in-range');
          }
        });
      });
    });

    // 3. Widget Code Drawer & Copy Interaction
    const cards = document.querySelectorAll('.token-widget-card');
    cards.forEach(card => {
      const codeBtn = card.querySelector('.copy-html-btn');
      const drawer = card.querySelector('.token-widget-code-drawer');
      if (!codeBtn || !drawer) return;

      // Toggle drawer
      codeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = drawer.style.display !== 'none';
        drawer.style.display = isOpen ? 'none' : 'flex';
        codeBtn.classList.toggle('active', !isOpen);
      });

      // Handle tab switching
      const tabs = drawer.querySelectorAll('.token-widget-code-tab');
      const htmlPre = drawer.querySelector('.widget-html-code');
      const cssPre = drawer.querySelector('.widget-css-code');

      tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
          e.stopPropagation();
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');

          const activeTab = tab.dataset.tab;
          if (activeTab === 'html') {
            htmlPre.style.display = 'block';
            cssPre.style.display = 'none';
          } else {
            htmlPre.style.display = 'none';
            cssPre.style.display = 'block';
          }
        });
      });

      // Handle copy to clipboard
      const copyBtn = drawer.querySelector('.token-widget-code-copy-btn');
      if (copyBtn) {
        copyBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const activeTab = drawer.querySelector('.token-widget-code-tab.active').dataset.tab;
          const activePre = activeTab === 'html' ? htmlPre : cssPre;
          const codeText = activePre.textContent;

          navigator.clipboard.writeText(codeText).then(() => {
            // Temporarily update button content to show feedback
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = '<span class="material-icons" style="font-size:12px; color:var(--sbi-text-success);">check</span><span style="color:var(--sbi-text-success);">Copied!</span>';
            this.showToast("Copied snippet to clipboard!");
            setTimeout(() => {
              copyBtn.innerHTML = originalHTML;
            }, 2000);
          });
        });
      }
    });
  },

  /* ═══════════════════════════════════════════════════════════════════════
     TOKEN COLLECTION
     ═══════════════════════════════════════════════════════════════════════ */

  collectTokens() {
    const styles = getComputedStyle(document.documentElement);
    let tokens = [];

    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.selectorText === ':root' || rule.selectorText?.includes(':root')) {
            for (let i = 0; i < rule.style.length; i++) {
              const name = rule.style[i];
              if (name.startsWith('--sbi-') || name.startsWith('--color-smartbi-')) {
                tokens.push({
                  name,
                  value: styles.getPropertyValue(name).trim() || rule.style.getPropertyValue(name).trim(),
                  category: this.categorize(name)
                });
              }
            }
          }
        }
      } catch (_) { /* cross-origin sheets */ }
    }

    // Fallback if stylesheets are blocked by CORS (e.g. file:/// protocol)
    if (tokens.length === 0 && window.SmartBI_TokensData) {
      console.log("Using static tokens-data.js fallback (file:/// protocol detected)");
      tokens = window.SmartBI_TokensData.map(t => ({
        name: t.name,
        value: styles.getPropertyValue(t.name).trim() || t.value,
        category: this.categorize(t.name)
      }));
    }

    // Dedupe and sort
    const seen = new Set();
    return tokens
      .filter(t => { if (seen.has(t.name)) return false; seen.add(t.name); return true; })
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  categorize(name) {
    // Backward-compat aliases
    if (name.startsWith('--color-smartbi-')) return 'color';
    if (name.includes('color') || name.includes('chart-series') || name.includes('kpi') || name.includes('alpha')) return 'color';
    if (name.includes('font') || name.match(/--sbi-text-(eyebrow|display|heading|body|caption|label)-/) || name.includes('line-height') || name.includes('letter-spacing')) return 'typography';
    if (name.includes('space') || name.includes('layout') || name.includes('gap')) return 'spacing';
    if (name.includes('radius')) return 'radius';
    if (name.includes('shadow') || name.includes('blur') || name.includes('backdrop')) return 'elevation';
    if (name.includes('gradient')) return 'gradient';
    if (name.includes('duration') || name.includes('ease') || name.includes('transition')) return 'motion';
    if (name.includes('border')) return 'border';
    if (name.includes('surface') || name.includes('action') || name.includes('focus') || name.match(/--sbi-ai-(?!card|viewport|input|send)/) || name.includes('legacy')) return 'semantic';
    if (name.match(/--sbi-text-(primary|secondary|tertiary|muted|inverse|on-|brand|accent|link|success|danger|console)/)) return 'semantic';
    if (name.match(/--sbi-chart-(?!series)/)) return 'semantic';
    if (name.includes('nav-') || name.includes('hero-') || name.includes('goal-') || name.includes('ai-card') || name.includes('ai-viewport') || name.includes('ai-input') || name.includes('ai-send') || name.includes('bubble') || name.includes('button') || name.includes('mockup') || name.includes('process') || name.includes('footer') || name.includes('discover') || name.includes('goal-section')) return 'component';
    if (name.includes('z-')) return 'z-index';
    return 'other';
  },

  /* ═══════════════════════════════════════════════════════════════════════
     COLOR DETECTION — Paint-engine approach
     ═══════════════════════════════════════════════════════════════════════ */

  /**
   * Robust color detection: resolve the value via the browser paint engine.
   * If getComputedStyle(probe).backgroundColor returns anything other than
   * transparent/rgba(0,0,0,0), it IS a color token.
   */
  isColorToken(name, value) {
    if (!name || !value) return false;
    const n = name.toLowerCase();

    // Definite non-colors by token semantics (no need to probe)
    if (n.includes('shadow') || n.includes('gradient') || n.includes('ease') ||
        n.includes('duration') || n.includes('font-family') || n.includes('font-size') ||
        n.includes('font-weight') || n.includes('line-height') || n.includes('letter-spacing') ||
        n.includes('space-') || n.includes('radius') || n.includes('blur') ||
        n.includes('z-') || n.includes('layout') || n.includes('padding') ||
        n.includes('max-width') || n.includes('transform') || n.includes('brand-name') ||
        n.includes('brand-tagline') || n.includes('brand-personality') ||
        n.includes('thinking-text') || n.includes('transition') || n.includes('backdrop') ||
        n.includes('height') && !n.includes('line-height')) return false;

    // Try paint-engine resolution
    const css = this.resolveColor(value);
    if (!css || css === 'transparent' || css === 'none') return false;

    this._probe.style.backgroundColor = '';
    this._probe.style.backgroundColor = css;
    const painted = getComputedStyle(this._probe).backgroundColor;
    return painted !== '' && painted !== 'transparent' && painted !== 'rgba(0, 0, 0, 0)';
  },

  resolveColor(value) {
    if (!value) return 'transparent';
    let v = value.trim();

    // hsl(var(--token)) or hsl(var(--token) / alpha)
    const hslVar = v.match(/^hsl\(\s*var\((--[^,)]+)(?:,\s*[^)]+)?\)\s*(?:\/\s*([^)]+))?\s*\)$/i);
    if (hslVar) {
      const channel = getComputedStyle(document.documentElement).getPropertyValue(hslVar[1]).trim();
      const alpha = hslVar[2] ? ` / ${hslVar[2].trim()}` : '';
      return `hsl(${channel}${alpha})`;
    }

    if (v.startsWith('hsl(') || v.startsWith('#') || v.startsWith('rgb')) return v;
    if (/^\d+\s+\d+%\s+\d+%/.test(v)) return `hsl(${v})`;

    if (v.startsWith('var(')) {
      const inner = v.match(/var\((--[^,)]+)/)?.[1];
      if (inner) {
        const resolved = getComputedStyle(document.documentElement).getPropertyValue(inner).trim();
        return this.resolveColor(resolved);
      }
    }

    return v;
  },

  /** Resolve any CSS color string to { css, hex, raw } using browser paint engine */
  resolveColorMeta(value) {
    const raw = (value || '').trim();
    const css = this.resolveColor(raw);
    if (!css || css === 'transparent' || css === 'none') {
      return { css: 'transparent', hex: '—', raw };
    }

    this._probe.style.backgroundColor = '';
    this._probe.style.backgroundColor = css;
    const painted = getComputedStyle(this._probe).backgroundColor;

    if (!painted || painted === 'transparent' || painted === 'rgba(0, 0, 0, 0)') {
      return { css: 'transparent', hex: '—', raw };
    }

    const hex = this.rgbStringToHex(painted);
    return { css: painted, hex, raw };
  },

  rgbStringToHex(rgbStr) {
    if (!rgbStr || rgbStr === 'transparent') return '—';
    if (rgbStr.startsWith('#')) return rgbStr.toUpperCase();

    const match = rgbStr.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/);
    if (!match) return rgbStr;

    const r = Math.round(Number(match[1]));
    const g = Math.round(Number(match[2]));
    const b = Math.round(Number(match[3]));
    const a = match[4] !== undefined ? Number(match[4]) : 1;

    const toHex = (n) => n.toString(16).padStart(2, '0').toUpperCase();
    const base = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

    if (a < 1) {
      return `${base}${toHex(Math.round(a * 255))}`;
    }
    return base;
  },

  /** Calculate relative luminance for contrast text */
  luminance(rgbStr) {
    const match = rgbStr.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/);
    if (!match) return 0.5;
    const [, rr, gg, bb] = match.map(Number);
    const [rs, gs, bs] = [rr / 255, gg / 255, bb / 255].map(c =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  isDisplayableColor(name, value) {
    if (!this.isColorToken(name, value)) return false;
    const meta = this.resolveColorMeta(value);
    return meta.hex !== '—';
  },

  colorPreviewHTML(value, sizeClass = '') {
    const meta = this.resolveColorMeta(value);
    return `<div class="token-color-box ${sizeClass}" style="background-color:${meta.css};" title="${meta.hex}"></div>`;
  },

  colorHexHTML(value, extraClass = '') {
    const meta = this.resolveColorMeta(value);
    return `<span class="token-hex-value ${extraClass}" data-copy-hex="${meta.hex}">${meta.hex}</span>`;
  },

  /* ═══════════════════════════════════════════════════════════════════════
     COLOR SCALES
     ═══════════════════════════════════════════════════════════════════════ */

  renderColorScales() {
    const scales = {
      navy: [], orange: [], blue: [], teal: [], purple: [], green: [],
      charcoal: [], warm: [], slate: []
    };

    this.allTokens.forEach(t => {
      const m = t.name.match(/--sbi-color-(navy|orange|blue|teal|purple|green|charcoal|warm|slate)-/);
      if (m && scales[m[1]]) {
        scales[m[1]].push(t);
      }
      if (t.name === '--sbi-color-green-brand') scales.green.push(t);
    });

    Object.entries(scales).forEach(([family, tokens]) => {
      const container = document.getElementById(`scale-${family}`);
      if (!container || !tokens.length) return;
      container.innerHTML = tokens.map(t => this.swatchHTML(t)).join('');
    });

    // Chart series
    const chartContainer = document.getElementById('scale-chart');
    if (chartContainer) {
      const chartTokens = this.allTokens.filter(t => t.name.startsWith('--sbi-chart-series'));
      chartContainer.innerHTML = chartTokens.map(t => this.swatchHTML(t)).join('');
    }
  },

  renderStatusScale() {
    const container = document.getElementById('scale-status');
    if (!container) return;

    const statusTokens = this.allTokens.filter(t =>
      t.name.match(/--sbi-color-(red|amber|cyan|yellow)-/)
    );
    container.innerHTML = statusTokens.map(t => this.swatchHTML(t)).join('');
  },

  renderAbsoluteScale() {
    const container = document.getElementById('scale-absolute');
    if (!container) return;

    const absTokens = this.allTokens.filter(t =>
      t.name === '--sbi-color-white' || t.name === '--sbi-color-black'
    );
    container.innerHTML = absTokens.map(t => this.swatchHTML(t)).join('');
  },

  /* ═══════════════════════════════════════════════════════════════════════
     SEMANTIC COLORS — Grouped by subcategory
     ═══════════════════════════════════════════════════════════════════════ */

  renderSemanticColors() {
    const container = document.getElementById('scale-semantic');
    if (!container) return;

    // Collect ALL semantic tokens that resolve to colors
    const groups = [
      { label: 'Surfaces', prefix: /--sbi-surface-/ },
      { label: 'Text', prefix: /--sbi-text-(primary|secondary|tertiary|muted|inverse|on-|brand|accent|link|success|danger|console)/ },
      { label: 'Borders', prefix: /--sbi-border-/ },
      { label: 'Actions', prefix: /--sbi-action-/ },
      { label: 'Focus', prefix: /--sbi-focus-/ },
      { label: 'AI / Conversational', prefix: /--sbi-ai-(?!card|viewport|input-radius|input-padding|send-size|thinking)/ },
      { label: 'Chart Viz', prefix: /--sbi-chart-(?!series)/ },
      { label: 'KPI', prefix: /--sbi-kpi-/ },
      { label: 'Legacy BI', prefix: /--sbi-legacy-/ },
    ];

    let html = '';
    groups.forEach(group => {
      const tokens = this.allTokens.filter(t =>
        group.prefix.test(t.name) && this.isDisplayableColor(t.name, t.value)
      );
      if (!tokens.length) return;

      html += `<div class="token-semantic-group">
        <h4 class="token-semantic-group-label">${group.label}</h4>
        <div class="token-color-scale">${tokens.map(t => this.swatchHTML(t)).join('')}</div>
      </div>`;
    });

    container.innerHTML = html;
  },

  /* ═══════════════════════════════════════════════════════════════════════
     ENHANCED SWATCH — HEX overlaid on color with contrast text
     ═══════════════════════════════════════════════════════════════════════ */

  swatchHTML(token) {
    const meta = this.resolveColorMeta(token.value);
    const shortName = token.name.replace('--sbi-', '').replace('--color-smartbi-', '');

    // Determine contrast text color based on luminance
    const lum = this.luminance(meta.css);
    const contrastColor = lum > 0.4 ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.9)';

    return `
      <div class="token-swatch" title="Click HEX to copy">
        <div class="token-swatch-color" style="background-color: ${meta.css};">
          <span class="token-swatch-hex-overlay" style="color: ${contrastColor};" data-copy-hex="${meta.hex}">${meta.hex}</span>
        </div>
        <div class="token-swatch-meta">
          <div class="token-swatch-hex-row">
            ${this.colorPreviewHTML(token.value, 'token-swatch-mini-box')}
            <span class="token-swatch-hex" data-copy-hex="${meta.hex}">${meta.hex}</span>
          </div>
          <div class="token-swatch-name" data-copy="${token.name}">${shortName}</div>
          <div class="token-swatch-value">${meta.raw}</div>
        </div>
      </div>`;
  },

  /* ═══════════════════════════════════════════════════════════════════════
     TYPOGRAPHY
     ═══════════════════════════════════════════════════════════════════════ */

  renderTypography() {
    const specimens = [
      { id: 'type-display', cls: 'sbi-text-display', label: '--sbi-text-display-* / Space Grotesk', text: 'The Decision Layer for Enterprise Data' },
      { id: 'type-heading', cls: 'sbi-text-heading', label: '--sbi-text-heading-*', text: 'Solving the high cognitive load for modern BI tools' },
      { id: 'type-body', cls: 'sbi-text-body', label: '--sbi-text-body-*', text: 'Imagine a BI tool that never asks you to understand SQL or wrestle with data schemas, but prompts you to ask the right question.' },
      { id: 'type-eyebrow', cls: 'sbi-text-eyebrow', label: '--sbi-text-eyebrow-*', text: 'Conversational BI · UX Case Study' }
    ];

    const container = document.getElementById('typography-specimens');
    if (!container) return;

    container.innerHTML = specimens.map(s => `
      <div class="token-type-specimen">
        <div class="token-type-specimen-label">${s.label}</div>
        <div class="${s.cls}">${s.text}</div>
      </div>
    `).join('');

    // Font size scale
    const sizeContainer = document.getElementById('font-size-scale');
    if (sizeContainer) {
      const sizes = this.allTokens.filter(t => t.name.startsWith('--sbi-font-size-'));
      sizeContainer.innerHTML = sizes.map(t => `
        <div class="token-type-specimen">
          <div class="token-type-specimen-label">${t.name} → ${t.value}</div>
          <div style="font-size: var(${t.name}); font-weight: 400; line-height: 1.3;">Smart BI typography at ${t.name.replace('--sbi-font-size-', '')}</div>
        </div>
      `).join('');
    }
  },

  /* ═══════════════════════════════════════════════════════════════════════
     SPACING
     ═══════════════════════════════════════════════════════════════════════ */

  renderSpacing() {
    const container = document.getElementById('spacing-scale');
    if (!container) return;

    const spaces = this.allTokens.filter(t =>
      t.name.startsWith('--sbi-space-') &&
      !t.name.includes('layout')
    );

    container.innerHTML = spaces.map(t => `
      <div class="token-spacing-row">
        <div class="token-spacing-bar" style="width: var(${t.name});"></div>
        <div class="token-spacing-label">${t.name}<br>${t.value}</div>
      </div>
    `).join('');
  },

  /* ═══════════════════════════════════════════════════════════════════════
     RADIUS
     ═══════════════════════════════════════════════════════════════════════ */

  renderRadius() {
    const container = document.getElementById('radius-scale');
    if (!container) return;

    const radii = this.allTokens.filter(t => t.name.startsWith('--sbi-radius-'));
    container.innerHTML = radii.map(t => `
      <div class="token-radius-item">
        <div class="token-radius-box" style="border-radius: var(${t.name});"></div>
        <div class="token-radius-label">${t.name.replace('--sbi-', '')}<br>${t.value}</div>
      </div>
    `).join('');
  },

  /* ═══════════════════════════════════════════════════════════════════════
     SHADOWS
     ═══════════════════════════════════════════════════════════════════════ */

  renderShadows() {
    const container = document.getElementById('shadow-scale');
    if (!container) return;

    const shadows = this.allTokens.filter(t => t.name.startsWith('--sbi-shadow-'));
    container.innerHTML = shadows.map(t => `
      <div class="token-shadow-box" style="box-shadow: var(${t.name});">
        ${t.name.replace('--sbi-', '')}
      </div>
    `).join('');
  },

  /* ═══════════════════════════════════════════════════════════════════════
     GRADIENTS — with detail cards showing color stops
     ═══════════════════════════════════════════════════════════════════════ */

  renderGradients() {
    const container = document.getElementById('gradient-scale');
    if (!container) return;

    const gradients = this.allTokens.filter(t => t.name.startsWith('--sbi-gradient-'));
    container.innerHTML = gradients.map(t => `
      <div class="token-gradient-box" style="background: var(${t.name});">
        <span class="token-gradient-label">${t.name.replace('--sbi-', '')}</span>
      </div>
    `).join('');

    // Gradient detail cards
    const detailsContainer = document.getElementById('gradient-details');
    if (!detailsContainer) return;

    detailsContainer.innerHTML = `<div class="token-subsection" style="margin-top:24px;">
      <h3>Gradient Color Stops</h3>
      <div class="token-gradient-detail-grid">
        ${gradients.map(t => this._gradientDetailCard(t)).join('')}
      </div>
    </div>`;
  },

  _gradientDetailCard(token) {
    const cssVal = token.value;
    // Extract hsl(...) color stops, accounting for nested var() parenthesis
    const hslMatches = cssVal.match(/hsl\(\s*var\([^)]+\)(?:\s*\/[^)]+)?\)|hsl\([^)]+\)/gi) || [];
    // Also extract hex colors
    const hexMatches = cssVal.match(/#[0-9a-fA-F]{3,8}/gi) || [];
    const allColorStrings = [...hslMatches, ...hexMatches];

    const stopsHTML = allColorStrings.map(colorStr => {
      const meta = this.resolveColorMeta(colorStr);
      return `<div class="token-gradient-stop">
        <div class="token-gradient-stop-swatch" style="background-color:${meta.css};"></div>
        <code class="token-gradient-stop-hex" data-copy-hex="${meta.hex}">${meta.hex}</code>
      </div>`;
    }).join('');

    return `<div class="token-gradient-detail">
      <div class="token-gradient-detail-preview" style="background: var(${token.name});"></div>
      <div class="token-gradient-detail-meta">
        <div class="token-gradient-detail-name" data-copy="${token.name}">${token.name}</div>
        <div class="token-gradient-detail-value">${cssVal.substring(0, 120)}${cssVal.length > 120 ? '…' : ''}</div>
        <div class="token-gradient-detail-stops">${stopsHTML || '<span style="color:var(--sbi-text-muted);">Complex gradient</span>'}</div>
      </div>
    </div>`;
  },

  /* ═══════════════════════════════════════════════════════════════════════
     ALPHA OVERLAYS
     ═══════════════════════════════════════════════════════════════════════ */

  renderAlphaOverlays() {
    const scaleContainer = document.getElementById('scale-alpha');
    const tableContainer = document.getElementById('table-alpha');
    if (!scaleContainer && !tableContainer) return;

    const alphaTokens = this.allTokens.filter(t => t.name.startsWith('--sbi-alpha-'));

    if (scaleContainer) {
      // Render swatches with a checkerboard behind to show transparency
      scaleContainer.innerHTML = alphaTokens.map(t => {
        const meta = this.resolveColorMeta(`hsl(${t.value})`);
        const shortName = t.name.replace('--sbi-', '');
        const lum = this.luminance(meta.css);
        const contrastColor = lum > 0.4 ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.9)';

        return `
          <div class="token-swatch" title="Click HEX to copy">
            <div class="token-swatch-color token-swatch-color--alpha" style="background-color: hsl(${t.value});">
              <span class="token-swatch-hex-overlay" style="color: ${contrastColor};" data-copy-hex="${meta.hex}">${meta.hex}</span>
            </div>
            <div class="token-swatch-meta">
              <div class="token-swatch-hex-row">
                <div class="token-color-box token-swatch-mini-box" style="background-color:hsl(${t.value});" title="${meta.hex}"></div>
                <span class="token-swatch-hex" data-copy-hex="${meta.hex}">${meta.hex}</span>
              </div>
              <div class="token-swatch-name" data-copy="${t.name}">${shortName}</div>
              <div class="token-swatch-value">${t.value}</div>
            </div>
          </div>`;
      }).join('');
    }

    if (tableContainer) {
      tableContainer.innerHTML = alphaTokens.map(t => {
        const meta = this.resolveColorMeta(`hsl(${t.value})`);
        return `
          <tr data-token="${t.name}" data-category="color" data-hex="${meta.hex}">
            <td class="token-table-preview-cell"><div class="token-table-color-box" style="background-color:hsl(${t.value});"></div></td>
            <td><code class="token-table-name" data-copy="${t.name}">${t.name}</code></td>
            <td><code class="token-table-hex" data-copy-hex="${meta.hex}">${meta.hex}</code></td>
            <td class="token-table-value">${t.value}</td>
          </tr>`;
      }).join('');
    }
  },

  /* ═══════════════════════════════════════════════════════════════════════
     COMPONENTS
     ═══════════════════════════════════════════════════════════════════════ */

  renderComponents() {
    /* Static HTML in page — no JS needed */
  },

  /* ═══════════════════════════════════════════════════════════════════════
     MOTION
     ═══════════════════════════════════════════════════════════════════════ */

  renderMotion() {
    document.querySelectorAll('.token-motion-box').forEach(box => {
      box.addEventListener('click', () => {
        const ease = box.dataset.ease;
        box.animate([
          { transform: 'translateX(0) scale(1)' },
          { transform: 'translateX(120px) scale(1.1)' },
          { transform: 'translateX(0) scale(1)' }
        ], { duration: 800, easing: ease || 'ease' });
      });
    });
  },

  /* ═══════════════════════════════════════════════════════════════════════
     TOKEN TABLES — Enhanced previews for all types
     ═══════════════════════════════════════════════════════════════════════ */

  renderTokenTables() {
    const categories = ['color', 'semantic', 'typography', 'spacing', 'radius', 'elevation', 'gradient', 'motion', 'border', 'component', 'z-index', 'other'];

    categories.forEach(cat => {
      const tbody = document.getElementById(`table-${cat}`);
      if (!tbody) return;

      const tokens = this.allTokens.filter(t => t.category === cat);
      tbody.innerHTML = this.renderTableRows(tokens);
    });

    const allBody = document.getElementById('table-all');
    if (allBody) {
      allBody.innerHTML = this.renderTableRows(this.allTokens);
    }

    const countEl = document.getElementById('token-total-count');
    if (countEl) countEl.textContent = `${this.allTokens.length} tokens`;
  },

  renderTableRows(tokens) {
    return tokens.map(t => {
      const isColor = this.isDisplayableColor(t.name, t.value);
      const isGradient = t.category === 'gradient' || t.name.includes('gradient');
      const isRadius = t.category === 'radius' || t.name.includes('radius');
      const isSpacing = (t.category === 'spacing' || t.name.includes('space-')) && !t.name.includes('layout');
      const isShadow = t.name.includes('shadow');
      const isDuration = t.name.includes('duration');
      const isEasing = t.name.includes('ease');
      const isZIndex = t.category === 'z-index' || t.name.includes('z-');
      const isBorderWidth = t.name.includes('border-width');
      const meta = isColor ? this.resolveColorMeta(t.value) : null;

      let previewCell = '<td></td>';
      if (isColor) {
        previewCell = `<td class="token-table-preview-cell">${this.colorPreviewHTML(t.value, 'token-table-color-box')}</td>`;
      } else if (isGradient) {
        previewCell = `<td class="token-table-preview-cell"><div class="token-table-color-box" style="background:${t.value};"></div></td>`;
      } else if (isShadow) {
        previewCell = `<td class="token-table-preview-cell"><div class="token-table-color-box" style="background:white; box-shadow:${t.value};"></div></td>`;
      } else if (isRadius) {
        previewCell = `<td class="token-table-preview-cell"><div class="token-table-color-box" style="background:var(--sbi-color-blue-100); border-radius: ${t.value}; border: 1.5px solid var(--sbi-action-primary-bg);"></div></td>`;
      } else if (isSpacing) {
        previewCell = `<td class="token-table-preview-cell"><div class="token-table-color-box" style="display:flex; align-items:center;"><div style="height:8px; background:var(--sbi-action-primary-bg); width:${t.value}; border-radius:2px;"></div></div></td>`;
      } else if (isDuration) {
        previewCell = `<td class="token-table-preview-cell"><div class="token-table-preview-label">${t.value}</div></td>`;
      } else if (isEasing) {
        previewCell = `<td class="token-table-preview-cell"><div class="token-table-preview-label" style="font-style:italic;">curve</div></td>`;
      } else if (isZIndex) {
        previewCell = `<td class="token-table-preview-cell"><div class="token-table-preview-label" style="font-weight:700;font-size:14px;">${t.value}</div></td>`;
      } else if (isBorderWidth) {
        previewCell = `<td class="token-table-preview-cell"><div style="width:40px;border-bottom:${t.value} solid var(--sbi-text-primary);margin:12px 0;"></div></td>`;
      } else {
        previewCell = `<td class="token-table-preview-cell"><div class="token-table-preview-label" style="font-family:var(--sbi-font-family-mono);font-size:10px;color:var(--sbi-text-muted);">${(t.value || '').substring(0, 20)}</div></td>`;
      }

      const hexCell = isColor
        ? `<td><code class="token-table-hex" data-copy-hex="${meta.hex}">${meta.hex}</code></td>`
        : '<td class="token-table-hex-empty">—</td>';

      return `
        <tr data-token="${t.name}" data-category="${t.category}" data-hex="${meta?.hex || ''}">
          ${previewCell}
          <td><code class="token-table-name" data-copy="${t.name}">${t.name}</code></td>
          ${hexCell}
          <td class="token-table-value">${t.value || '(computed)'}</td>
        </tr>`;
    }).join('');
  },

  /* ═══════════════════════════════════════════════════════════════════════
     SEARCH
     ═══════════════════════════════════════════════════════════════════════ */

  bindSearch() {
    if (!this.searchInput) return;

    this.searchInput.addEventListener('input', () => {
      const q = this.searchInput.value.toLowerCase();
      document.querySelectorAll('.token-table tbody tr').forEach(row => {
        const name = row.dataset.token?.toLowerCase() || '';
        const hex = row.dataset.hex?.toLowerCase() || '';
        const val = row.querySelector('.token-table-value')?.textContent.toLowerCase() || '';
        row.style.display = (!q || name.includes(q) || hex.includes(q) || val.includes(q)) ? '' : 'none';
      });

      document.querySelectorAll('.token-swatch').forEach(swatch => {
        const hex = swatch.querySelector('.token-swatch-hex')?.textContent.toLowerCase() || '';
        const name = swatch.querySelector('.token-swatch-name')?.textContent.toLowerCase() || '';
        swatch.style.display = (!q || hex.includes(q) || name.includes(q)) ? '' : 'none';
      });
    });
  },

  /* ═══════════════════════════════════════════════════════════════════════
     SIDEBAR — fixed classList bug
     ═══════════════════════════════════════════════════════════════════════ */

  bindSidebar() {
    const links = document.querySelectorAll('.token-sidebar-nav a');
    const sections = document.querySelectorAll('.token-section[id]');

    links.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const id = link.getAttribute('href').slice(1);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      });
    });

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${entry.target.id}`));
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });

    sections.forEach(s => observer.observe(s));
  },

  /* ═══════════════════════════════════════════════════════════════════════
     COPY HANDLERS
     ═══════════════════════════════════════════════════════════════════════ */

  bindCopyHandlers() {
    document.addEventListener('click', e => {
      const hexEl = e.target.closest('[data-copy-hex]');
      if (hexEl && hexEl.dataset.copyHex && hexEl.dataset.copyHex !== '—') {
        navigator.clipboard.writeText(hexEl.dataset.copyHex)
          .then(() => this.showToast(`Copied ${hexEl.dataset.copyHex}`));
        return;
      }

      const el = e.target.closest('[data-copy]');
      if (!el) return;
      const name = el.dataset.copy;
      navigator.clipboard.writeText(`var(${name})`).then(() => this.showToast(`Copied var(${name})`));
    });
  },

  showToast(msg) {
    if (!this.toast) return;
    this.toast.textContent = msg;
    this.toast.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => this.toast.classList.remove('show'), 2000);
  },

  /* ═══════════════════════════════════════════════════════════════════════
     COMPONENT TOKEN USAGES
     ═══════════════════════════════════════════════════════════════════════ */

  renderComponentTokenUsages() {
    document.querySelectorAll('.token-usage-list').forEach(container => {
      const tokensAttr = container.dataset.tokens || '';
      const tokenNames = tokensAttr.split(',').map(s => s.trim()).filter(Boolean);

      container.innerHTML = tokenNames.map(name => {
        const styles = getComputedStyle(document.documentElement);
        const value = styles.getPropertyValue(name).trim();
        const isColor = this.isDisplayableColor(name, value);
        const meta = isColor ? this.resolveColorMeta(value) : null;

        if (isColor) {
          return `
            <div class="token-usage-item" title="Click HEX to copy">
              <div class="token-usage-swatch" style="background-color: ${meta.css};"></div>
              <span class="token-usage-name" data-copy="${name}">${name}</span>
              <span class="token-usage-hex" data-copy-hex="${meta.hex}">${meta.hex}</span>
            </div>`;
        } else {
          return `
            <div class="token-usage-item">
              <div class="token-usage-swatch non-color"></div>
              <span class="token-usage-name" data-copy="${name}">${name}</span>
              <span class="token-usage-val">${value || '(computed)'}</span>
            </div>`;
        }
      }).join('');
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.SmartBI_Nav?.init();
  window.SmartBI_TokensPreview.init();
});
