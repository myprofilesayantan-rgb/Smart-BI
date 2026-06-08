/* ══════════════════════════════════════════════════════
   SmartBI Onboarding — Complete JS Engine
   Phases: 1-Business Identity | 2-Data Source |
           3-Team Setup | 4-KPI Discovery | 5-Preview
   ══════════════════════════════════════════════════════ */

'use strict';

// ─── Global State ──────────────────────────────────────
const state = {
  phase: 1,
  answers: {},          // Phase 1 Q&A answers
  qIndex: 0,            // Current question index in Phase 1
  p2Mode: 'db',         // 'db' | 'file' | 'skip'
  p2File: null,
  p2TeamDataUsed: false,
  p3Sub: 'roles',       // 'roles' | 'teams' | 'invite'
  p3Roles: new Set(['Analyst']),
  p3CustomRoles: [],
  p3Teams: [],          // [{name, division}]
  p3InviteMode: 'small',
  p3Emails: new Set(),
  kpiData: null,        // set on phase 4 init
  kpiApproved: 0,
  kpiTotal: 0,
  activeKpiCat: null,   // expanded category id
};

// ─── Phase 1 Questions ─────────────────────────────────
const questions = [
  {
    id: 'bizName',
    icon: 'business',
    ask: () => "Welcome! Let's start with the basics — what's the name of your business?",
    sub: null,
    type: 'text',
    placeholder: 'e.g. Acme Corporation',
    required: true,
    validate: v => v.trim().length >= 2,
  },
  {
    id: 'location',
    icon: 'location_on',
    ask: a => `Great to meet you, ${a.bizName}! Where is ${a.bizName} headquartered?`,
    sub: 'City, Country — this helps personalise your regional KPI benchmarks.',
    type: 'text',
    placeholder: 'e.g. New York, USA',
    required: true,
    validate: v => v.trim().length >= 2,
  },
  {
    id: 'multiRegion',
    icon: 'public',
    ask: a => `Does ${a.bizName} operate in multiple countries or regions?`,
    sub: null,
    type: 'choice',
    options: [
      { label: 'Yes — we operate globally', value: 'yes', icon: 'travel_explore' },
      { label: 'No — single location', value: 'no', icon: 'place' },
    ],
    autoAdvance: true,
    required: true,
  },
  {
    id: 'regions',
    icon: 'travel_explore',
    ask: () => 'Which regions or countries does your business operate in?',
    sub: 'Press Enter or comma to add each region.',
    type: 'tags',
    placeholder: 'e.g. Europe, Southeast Asia...',
    skipIf: a => a.multiRegion !== 'yes',
    optional: true,
    skipLabel: 'Skip for now',
  },
  {
    id: 'cities',
    icon: 'location_city',
    ask: a => {
      const list = a.regions || [];
      if (list.length > 0) {
        return `Got it! What are the primary cities you operate in within ${list.join(', ')}?`;
      }
      return 'Which cities does your business operate in?';
    },
    sub: 'Press Enter or comma to add each city.',
    type: 'tags',
    placeholder: 'e.g. New York, London, Tokyo...',
    skipIf: a => {
      if (!a.regions || a.regions.length === 0) return true;
      const COUNTRY_KEYWORDS = new Set([
        'india', 'usa', 'us', 'united states', 'uk', 'united kingdom', 'gb', 'great britain', 'germany', 'de', 'france', 'fr', 'australia', 'aus', 'canada', 'ca', 'singapore', 'sg', 'japan', 'jp', 'china', 'cn', 'brazil', 'br', 'mexico', 'mx', 'italy', 'it', 'spain', 'es', 'netherlands', 'nl', 'switzerland', 'ch', 'sweden', 'se', 'norway', 'no', 'denmark', 'dk', 'finland', 'fi', 'ireland', 'ie', 'belgium', 'be', 'austria', 'at', 'new zealand', 'nz', 'south africa', 'za', 'uae', 'united arab emirates', 'saudi arabia', 'sa', 'russia', 'ru', 'korea', 'south korea', 'kr',
        'europe', 'asia', 'north america', 'south america', 'africa', 'middle east', 'latam', 'apac'
      ]);
      const hasCountry = a.regions.some(r => COUNTRY_KEYWORDS.has(r.toLowerCase().trim()));
      return !hasCountry;
    },
    optional: true,
    skipLabel: 'Skip for now',
  },
  {
    id: 'industry',
    icon: 'category',
    ask: a => `What industry is ${a.bizName} in?`,
    sub: null,
    type: 'industry-grid',
    options: [
      { label: 'Technology', icon: 'computer' },
      { label: 'Finance & Banking', icon: 'account_balance' },
      { label: 'Healthcare', icon: 'local_hospital' },
      { label: 'Retail & E-commerce', icon: 'shopping_bag' },
      { label: 'Manufacturing', icon: 'factory' },
      { label: 'Real Estate', icon: 'apartment' },
      { label: 'Education', icon: 'school' },
      { label: 'Logistics', icon: 'local_shipping' },
      { label: 'Other', icon: 'more_horiz' },
    ],
    autoAdvance: true,
    required: true,
  },
  {
    id: 'customIndustry',
    icon: 'category',
    ask: () => 'Could you specify your industry?',
    sub: null,
    type: 'text',
    placeholder: 'e.g. Hospitality, Entertainment, Agriculture...',
    skipIf: a => a.industry !== 'Other',
    required: true,
    validate: v => v.trim().length >= 2,
  },
  {
    id: 'description',
    icon: 'description',
    ask: a => `How would you describe what ${a.bizName} does? (2–3 sentences)`,
    sub: 'This helps SmartBI generate context-aware KPI recommendations.',
    type: 'textarea',
    placeholder: 'We help companies by...',
    optional: true,
    skipLabel: 'Skip for now',
  },
  {
    id: 'goals',
    icon: 'flag',
    ask: a => `What are ${a.bizName}'s primary goals for this year? (Select all that apply)`,
    sub: null,
    type: 'multi-choice',
    options: [
      { label: '↑ Grow Revenue', value: 'revenue' },
      { label: '↓ Reduce Costs', value: 'costs' },
      { label: '🌍 Enter New Markets', value: 'markets' },
      { label: '♻ Improve Retention', value: 'retention' },
      { label: '👥 Scale Team', value: 'team' },
      { label: '🚀 Launch Products', value: 'launch' },
      { label: '⚙ Optimize Operations', value: 'ops' },
    ],
    required: true,
    validate: v => Array.isArray(v) && v.length > 0,
    nextLabel: 'Save Goals & Continue',
  },
  {
    id: 'document',
    icon: 'upload_file',
    ask: () => 'Do you have business documents to upload? Annual reports, org charts, or strategy docs help SmartBI understand your context faster.',
    sub: null,
    type: 'file-or-skip',
    accept: '.pdf,.docx,.xlsx,.csv,.pptx',
    optional: true,
    skipLabel: 'Skip for now',
    nextLabel: 'Continue to Data Source',
    isLast: true,
  },
];

// ─── KPI Data ──────────────────────────────────────────
const kpiCategories = [
  {
    id: 'revenue', name: 'Revenue & Sales', icon: 'payments', color: '#10b981', bgColor: 'rgba(16,185,129,0.08)',
    count: 124, approved: true,
    kpis: [
      { id: 'arr', name: 'Annual Recurring Revenue (ARR)', approved: true },
      { id: 'mrr', name: 'Monthly Recurring Revenue (MRR)', approved: true },
      { id: 'churn', name: 'Customer Churn Rate', approved: true },
      { id: 'ltv', name: 'Customer Lifetime Value (LTV)', approved: true },
      { id: 'arpa', name: 'Average Revenue Per Account', approved: false },
      { id: 'win', name: 'Sales Win Rate', approved: true },
      { id: 'pipeline', name: 'Sales Pipeline Value', approved: true },
      { id: 'conv', name: 'Lead Conversion Rate', approved: true },
    ],
  },
  {
    id: 'hr', name: 'HR & People', icon: 'groups', color: '#3b82f6', bgColor: 'rgba(59,130,246,0.08)',
    count: 98, approved: true,
    kpis: [
      { id: 'headcount', name: 'Total Headcount', approved: true },
      { id: 'turnover', name: 'Employee Turnover Rate', approved: true },
      { id: 'esat', name: 'Employee Satisfaction (eNPS)', approved: true },
      { id: 'ttf', name: 'Time to Fill', approved: false },
      { id: 'absentee', name: 'Absenteeism Rate', approved: false },
      { id: 'training', name: 'Training Hours per Employee', approved: true },
    ],
  },
  {
    id: 'marketing', name: 'Marketing', icon: 'campaign', color: '#8b5cf6', bgColor: 'rgba(139,92,246,0.08)',
    count: 67, approved: true,
    kpis: [
      { id: 'cac', name: 'Customer Acquisition Cost (CAC)', approved: true },
      { id: 'roas', name: 'Return on Ad Spend (ROAS)', approved: true },
      { id: 'ctr', name: 'Click-Through Rate (CTR)', approved: true },
      { id: 'impressions', name: 'Total Impressions', approved: false },
      { id: 'organic', name: 'Organic Traffic Share', approved: true },
    ],
  },
  {
    id: 'finance', name: 'Finance & Accounting', icon: 'account_balance', color: '#0891b2', bgColor: 'rgba(8,145,178,0.08)',
    count: 156, approved: true,
    kpis: [
      { id: 'ebitda', name: 'EBITDA Margin', approved: true },
      { id: 'gross', name: 'Gross Profit Margin', approved: true },
      { id: 'burn', name: 'Cash Burn Rate', approved: true },
      { id: 'runway', name: 'Cash Runway (months)', approved: true },
      { id: 'ar-days', name: 'Accounts Receivable Days', approved: false },
    ],
  },
  {
    id: 'ops', name: 'Operations', icon: 'settings', color: '#f59e0b', bgColor: 'rgba(245,158,11,0.08)',
    count: 89, approved: false,
    kpis: [
      { id: 'cycle', name: 'Order Cycle Time', approved: false },
      { id: 'otd', name: 'On-Time Delivery Rate', approved: false },
      { id: 'util', name: 'Resource Utilization Rate', approved: false },
      { id: 'defect', name: 'Product Defect Rate', approved: false },
    ],
  },
  {
    id: 'it', name: 'IT & Infrastructure', icon: 'computer', color: '#64748b', bgColor: 'rgba(100,116,139,0.08)',
    count: 312, approved: false,
    kpis: [
      { id: 'uptime', name: 'System Uptime (%)', approved: false },
      { id: 'incident', name: 'Incident Resolution Time', approved: false },
      { id: 'latency', name: 'API Response Latency', approved: false },
    ],
  },
];

// ─── Utility: Toast ─────────────────────────────────────
function showToast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  const icons = { success: 'check_circle', error: 'error', info: 'info' };
  const colors = { success: '#10b981', error: '#ef4444', info: '#7c3bed' };
  const toast = document.createElement('div');
  toast.className = 'toast-card';
  toast.innerHTML = `
    <span class="material-symbols-outlined" style="color:${colors[type]};font-size:20px;flex-shrink:0;margin-top:1px" style="font-variation-settings:'FILL' 1">${icons[type]}</span>
    <div><p style="font-size:11.5px;font-weight:700;color:#0f172a;margin:0 0 2px">${msg}</p></div>`;
  container.appendChild(toast);
  gsap.fromTo(toast, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.35, ease: 'back.out(1.4)' });
  setTimeout(() => gsap.to(toast, { opacity: 0, x: 40, duration: 0.3, onComplete: () => toast.remove() }), 3200);
}

// ─── Stepper Update ─────────────────────────────────────
function completeStep(n) {
  const circle = document.getElementById(`sc-${n}`);
  const line   = document.getElementById(`sl-${n}`);
  if (!circle) return;
  circle.classList.remove('border-2','border-primary','text-primary','bg-white','bg-surface-variant','text-on-surface-variant','border-outline');
  circle.classList.add('bg-primary','text-white');
  circle.innerHTML = `<span class="material-symbols-outlined text-[14px] font-bold" style="font-variation-settings:'FILL' 1">check</span>`;
  if (line) { line.classList.remove('bg-outline-variant'); line.classList.add('bg-primary'); }
}

function activateStep(n) {
  const circle = document.getElementById(`sc-${n}`);
  const detail = document.getElementById(`sd-${n}`);
  if (!circle) return;
  circle.classList.remove('bg-surface-variant','text-on-surface-variant','border-outline','bg-primary','text-white');
  circle.classList.add('border-2','border-primary','bg-white','text-primary');
  circle.innerHTML = `<div class="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></div>`;
  if (detail) { detail.querySelectorAll('h4,p').forEach(el => { el.classList.remove('text-on-surface-variant'); el.classList.add('text-on-surface'); }); }
}

function updateHeaderDots(phase) {
  document.querySelectorAll('.phase-dot').forEach(d => {
    const ph = parseInt(d.dataset.ph);
    d.classList.toggle('bg-primary', ph === phase);
    d.classList.toggle('bg-outline', ph !== phase);
  });
  const labels = ['Business Identity','Data Source','Team Setup','KPI Review','Preview & Launch'];
  const label = document.getElementById('phase-label');
  if (label) label.textContent = labels[phase - 1] || 'Workspace Setup';
}

// ─── Phase Navigation ────────────────────────────────────
function showPhase(n) {
  // Hide all phase panels
  ['phase-1','phase-2','phase-3','phase-wrapper','phase-4','phase-5'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });

  state.phase = n;
  updateHeaderDots(n);

  if (n === 1 || n === 2 || n === 3) {
    const wrapper = document.getElementById('phase-wrapper');
    if (wrapper) wrapper.classList.remove('hidden');
    const stepperCol = document.getElementById('stepper-col');
    if (stepperCol) stepperCol.classList.remove('hidden');
    [`phase-1`,`phase-2`,`phase-3`].forEach((id, i) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (i + 1 === n) {
        el.classList.remove('hidden');
        gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.2)' });
      } else {
        el.classList.add('hidden');
      }
    });
  } else if (n === 4) {
    const el = document.getElementById('phase-4');
    if (el) { el.classList.remove('hidden'); gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.2)' }); }
    initPhase4();
  } else if (n === 5) {
    const el = document.getElementById('phase-5');
    if (el) { el.classList.remove('hidden'); gsap.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.2)' }); }
    initPhase5();
  }
}

// ════════════════════════════════════════════════════════
// PHASE 1 — Conversational Business Identity
// ════════════════════════════════════════════════════════
function initPhase1() {
  state.qIndex = 0;
  state.answers = {};
  
  // Clear chat feed
  const feed = document.getElementById('onboarding-chat-feed');
  if (feed) feed.innerHTML = '';
  
  // Rebuild summary strip (will hide it since index is 0)
  rebuildSummaryStrip();
  
  // Bind listeners to bottom input rail
  const sendBtn = document.getElementById('onboarding-send-btn');
  const textarea = document.getElementById('onboarding-textarea');
  const addBtn = document.getElementById('onboarding-add-btn');
  const railFileInp = document.getElementById('onboarding-rail-file-input');
  
  if (sendBtn && !sendBtn.dataset.bound) {
    sendBtn.dataset.bound = 'true';
    sendBtn.addEventListener('click', handleBottomSend);
  }
  
  if (textarea && !textarea.dataset.bound) {
    textarea.dataset.bound = 'true';
    textarea.addEventListener('input', () => {
      const q = questions[state.qIndex];
      if (q && q.validate) {
        sendBtn.disabled = !q.validate(textarea.value);
      } else {
        sendBtn.disabled = textarea.value.trim().length === 0;
      }
    });
    textarea.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn.disabled) {
          handleBottomSend();
        }
      }
    });
  }

  if (addBtn && !addBtn.dataset.bound) {
    addBtn.dataset.bound = 'true';
    addBtn.addEventListener('click', () => {
      if (railFileInp) railFileInp.click();
    });
  }

  if (railFileInp && !railFileInp.dataset.bound) {
    railFileInp.dataset.bound = 'true';
    railFileInp.addEventListener('change', handleRailFileUpload);
  }
  
  renderQuestion(0);
}

function handleRailFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const currentQ = questions[state.qIndex];
  if (!currentQ) return;

  if (currentQ.id === 'cities') {
    // Switch to bulk upload tab
    const tabBulk = document.getElementById('inline-cities-tab-bulk');
    if (tabBulk) {
      tabBulk.click();
    }
    
    // Find the inline cities file input
    const inlineCitiesFileInp = document.getElementById('inline-cities-file-inp');
    if (inlineCitiesFileInp) {
      const dt = new DataTransfer();
      dt.items.add(file);
      inlineCitiesFileInp.files = dt.files;
      inlineCitiesFileInp.dispatchEvent(new Event('change'));
      showToast(`Attached ${file.name} to cities upload`, 'success');
    }
  } else if (currentQ.id === 'document') {
    // Find the inline strategy document file input
    const inlineFileInp = document.getElementById('inline-file-inp');
    if (inlineFileInp) {
      const dt = new DataTransfer();
      dt.items.add(file);
      inlineFileInp.files = dt.files;
      inlineFileInp.dispatchEvent(new Event('change'));
      showToast(`Attached ${file.name} to strategy document`, 'success');
    }
  } else {
    showToast('Please upload files during the cities or document upload step.', 'info');
  }
  
  // Clear the input value so the same file can be selected again
  e.target.value = '';
}

function handleBottomSend() {
  const textarea = document.getElementById('onboarding-textarea');
  if (!textarea) return;
  const val = textarea.value.trim();
  if (!val) return;
  
  const q = questions[state.qIndex];
  if (q && q.validate && !q.validate(val)) return;
  
  textarea.value = '';
  document.getElementById('onboarding-send-btn').disabled = true;
  advanceQuestion(val, val);
}

function toggleBottomInputDeck(enabled, placeholder = 'Ask anything about your business...') {
  const deck = document.getElementById('onboarding-ai-input-deck');
  const textarea = document.getElementById('onboarding-textarea');
  const sendBtn = document.getElementById('onboarding-send-btn');
  const addBtn = document.getElementById('onboarding-add-btn');
  
  if (!deck || !textarea || !sendBtn) return;
  
  const textareaWrapper = textarea.parentElement;
  const historyBtn = addBtn ? addBtn.nextElementSibling?.nextElementSibling : null;
  const rightControls = sendBtn.parentElement;
  
  if (enabled) {
    textarea.disabled = false;
    textarea.placeholder = placeholder;
    
    // Remove disabled/faded styling from individual controls
    if (textareaWrapper) textareaWrapper.classList.remove('opacity-40', 'pointer-events-none');
    if (historyBtn) historyBtn.classList.remove('opacity-40', 'pointer-events-none');
    if (rightControls) rightControls.classList.remove('opacity-40', 'pointer-events-none');
    
    // Make sure addBtn remains active and clickable
    if (addBtn) {
      addBtn.classList.remove('opacity-40');
      addBtn.classList.add('pointer-events-auto');
    }
  } else {
    textarea.disabled = true;
    textarea.placeholder = placeholder;
    sendBtn.disabled = true;
    
    // Apply disabled/faded styling to individual controls, leaving addBtn alone
    if (textareaWrapper) textareaWrapper.classList.add('opacity-40', 'pointer-events-none');
    if (historyBtn) historyBtn.classList.add('opacity-40', 'pointer-events-none');
    if (rightControls) rightControls.classList.add('opacity-40', 'pointer-events-none');
    
    // Ensure addBtn has full opacity and pointer-events-auto
    if (addBtn) {
      addBtn.classList.remove('opacity-40');
      addBtn.classList.add('pointer-events-auto');
    }
  }
}

function renderQuestion(idx) {
  const q = questions[idx];
  if (!q) { finalisePhase1(); return; }

  // Skip conditional questions
  if (q.skipIf && q.skipIf(state.answers)) {
    state.qIndex++;
    renderQuestion(state.qIndex);
    return;
  }

  const feed = document.getElementById('onboarding-chat-feed');
  if (!feed) return;

  const questionText = typeof q.ask === 'function' ? q.ask(state.answers) : q.ask;
  
  // Create AI Bubble Card
  const qBlock = document.createElement('div');
  qBlock.className = 'flex flex-col gap-2 mb-4 active-q-block';
  qBlock.dataset.qidx = idx;
  
  qBlock.innerHTML = `
    <div class="flex gap-3 ai-bubble-card">
      <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shrink-0 text-white shadow-sm shadow-primary/20">
        <span class="material-symbols-outlined text-[17px]" style="font-variation-settings:'FILL' 1">smart_toy</span>
      </div>
      <div class="bg-white rounded-xl rounded-tl-sm p-4 border border-outline shadow-sm max-w-[85%]">
        <p class="font-body text-sm text-on-surface leading-relaxed">${questionText}</p>
        ${q.sub ? `<p class="font-body text-[10px] text-on-surface-variant mt-1">${q.sub}</p>` : ''}
      </div>
    </div>
    <div class="ml-12 mr-4 q-inline-area"></div>
  `;
  
  feed.appendChild(qBlock);
  
  // Scroll to bottom
  feed.scrollTop = feed.scrollHeight;
  
  // Animate the block using GSAP
  gsap.fromTo(qBlock.querySelector('.ai-bubble-card'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' });
  
  // Setup inputs
  const inlineArea = qBlock.querySelector('.q-inline-area');
  
  if (q.type === 'text' || q.type === 'textarea') {
    // Enable bottom input deck
    toggleBottomInputDeck(true, q.placeholder || 'Type your answer...');
    const textarea = document.getElementById('onboarding-textarea');
    if (textarea) {
      if (state.answers[q.id]) {
        textarea.value = state.answers[q.id];
        document.getElementById('onboarding-send-btn').disabled = false;
      } else {
        textarea.value = '';
        document.getElementById('onboarding-send-btn').disabled = true;
      }
      textarea.focus();
    }
    
    // If optional, show skip button inline
    if (q.optional) {
      inlineArea.innerHTML = `
        <div class="flex items-center gap-2 mt-1">
          <button type="button" class="text-[10px] text-on-surface-variant hover:text-primary font-semibold transition-colors cursor-pointer" onclick="handleSkipQuestion(${idx})">
            ${q.skipLabel || 'Skip this step →'}
          </button>
        </div>`;
    }
  } else {
    // Disable bottom input deck
    toggleBottomInputDeck(false, 'Select option above...');
    
    // Render inline input controls based on type
    renderInlineInput(q, inlineArea, idx);
  }
}

function renderInlineInput(q, inlineArea, idx) {
  switch (q.type) {
    case 'choice': {
      let html = `<div class="flex flex-col sm:flex-row gap-2 mt-1.5 flex-wrap">`;
      q.options.forEach(o => {
        html += `
          <button type="button" class="choice-btn py-2 px-3 border border-outline rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-2" onclick="handleChoiceSelect('${o.value}', '${o.label}')">
            <span class="material-symbols-outlined text-[14px] text-primary">${o.icon}</span>
            <span>${o.label}</span>
          </button>`;
      });
      html += `</div>`;
      inlineArea.innerHTML = html;
      
      window.handleChoiceSelect = function(value, label) {
        advanceQuestion(value, label);
      };
      break;
    }
    
    case 'industry-grid': {
      let html = `<div class="grid grid-cols-3 gap-2 mt-1.5 max-w-sm">`;
      q.options.forEach(o => {
        html += `
          <button type="button" class="industry-card p-2.5 border border-outline rounded-xl bg-white hover:bg-slate-50 transition-all cursor-pointer text-center flex flex-col items-center gap-1" onclick="handleIndustrySelect('${o.label}')">
            <span class="material-symbols-outlined text-[16px] text-primary">${o.icon}</span>
            <span class="text-[9px] font-semibold">${o.label}</span>
          </button>`;
      });
      html += `</div>`;
      inlineArea.innerHTML = html;
      
      window.handleIndustrySelect = function(val) {
        advanceQuestion(val, val);
      };
      break;
    }
    
    case 'tags': {
      if (q.id === 'cities') {
        let html = `
          <div class="mt-1.5 flex flex-col gap-3 bg-white border border-outline rounded-xl p-3 shadow-sm max-w-sm">
            <!-- Tab selector inside the card -->
            <div class="flex gap-1 p-0.5 bg-slate-100 rounded-lg border border-outline/30">
              <button id="inline-cities-tab-manual" type="button" class="flex-1 py-1 text-[10px] font-bold rounded bg-white shadow-sm border border-outline text-on-surface transition-all cursor-pointer">
                Manual Entry
              </button>
              <button id="inline-cities-tab-bulk" type="button" class="flex-1 py-1 text-[10px] font-semibold rounded text-on-surface-variant hover:text-on-surface transition-all cursor-pointer">
                Bulk Upload
              </button>
            </div>

            <!-- Panel 1: Manual Tag Input -->
            <div id="inline-cities-panel-manual" class="flex flex-col gap-2">
              <div class="flex items-center gap-2 bg-slate-50 rounded-lg border border-outline px-2 py-1.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                <input id="inline-tag-input" type="text" class="flex-1 bg-transparent border-none focus:ring-0 text-xs text-on-surface placeholder:text-on-surface-variant/40 p-0" placeholder="Type city and press Enter...">
                <button id="inline-tag-add-btn" type="button" class="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/15 transition-colors cursor-pointer">
                  <span class="material-symbols-outlined text-[14px]">add</span>
                </button>
              </div>
              <div id="inline-tags-container" class="flex flex-wrap gap-1.5 empty:hidden mt-1"></div>
            </div>

            <!-- Panel 2: Bulk File Upload -->
            <div id="inline-cities-panel-bulk" class="hidden flex flex-col gap-2">
              <div id="inline-cities-dropzone" class="relative flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-outline rounded-lg p-4 text-center bg-slate-50/50 hover:bg-primary-container/10 hover:border-primary/40 transition-all cursor-pointer group">
                <input id="inline-cities-file-inp" type="file" accept=".csv,.xlsx,.xls" class="absolute inset-0 opacity-0 cursor-pointer w-full h-full">
                <span class="material-symbols-outlined text-[16px] text-primary">cloud_upload</span>
                <div>
                  <p class="text-[9px] font-bold text-on-surface">Upload cities list</p>
                  <p class="text-[8px] text-on-surface-variant">Drop .CSV or .XLSX here</p>
                </div>
              </div>
              <div id="inline-cities-file-preview" class="hidden flex items-center gap-2 bg-primary-container/20 border border-primary/20 rounded-lg px-2.5 py-1.5">
                <span class="material-symbols-outlined text-[12px] text-primary">description</span>
                <p id="inline-cities-file-name" class="text-[10px] font-bold text-on-surface truncate flex-1"></p>
                <button id="inline-cities-file-clear" type="button" class="text-on-surface-variant/50 hover:text-error">
                  <span class="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            </div>

            <!-- Common Actions footer -->
            <div class="flex justify-end gap-2 mt-1 pt-2 border-t border-outline/40">
              ${q.optional ? `<button type="button" class="px-2 py-1 text-[10px] text-on-surface-variant hover:text-on-surface font-semibold" onclick="handleSkipQuestion(${idx})">${q.skipLabel || 'Skip'}</button>` : ''}
              <button id="inline-tags-submit" type="button" class="bg-primary text-on-primary text-[10px] font-bold py-1 px-3 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed" disabled>
                Confirm Cities
              </button>
            </div>
          </div>`;
        inlineArea.innerHTML = html;

        const inp = document.getElementById('inline-tag-input');
        const addBtn = document.getElementById('inline-tag-add-btn');
        const container = document.getElementById('inline-tags-container');
        const submitBtn = document.getElementById('inline-tags-submit');

        const tabManual = document.getElementById('inline-cities-tab-manual');
        const tabBulk = document.getElementById('inline-cities-tab-bulk');
        const panelManual = document.getElementById('inline-cities-panel-manual');
        const panelBulk = document.getElementById('inline-cities-panel-bulk');

        const dropzone = document.getElementById('inline-cities-dropzone');
        const fileInp = document.getElementById('inline-cities-file-inp');
        const preview = document.getElementById('inline-cities-file-preview');
        const nameEl = document.getElementById('inline-cities-file-name');
        const clearBtn = document.getElementById('inline-cities-file-clear');

        let selectedFile = null;
        let activeTab = 'manual';

        const switchTab = (tab) => {
          activeTab = tab;
          if (tab === 'manual') {
            tabManual.className = "flex-1 py-1 text-[10px] font-bold rounded bg-white shadow-sm border border-outline text-on-surface transition-all cursor-pointer";
            tabBulk.className = "flex-1 py-1 text-[10px] font-semibold rounded text-on-surface-variant hover:text-on-surface transition-all cursor-pointer";
            panelManual.classList.remove('hidden');
            panelBulk.classList.add('hidden');
            submitBtn.disabled = tags.length === 0;
          } else {
            tabBulk.className = "flex-1 py-1 text-[10px] font-bold rounded bg-white shadow-sm border border-outline text-on-surface transition-all cursor-pointer";
            tabManual.className = "flex-1 py-1 text-[10px] font-semibold rounded text-on-surface-variant hover:text-on-surface transition-all cursor-pointer";
            panelBulk.classList.remove('hidden');
            panelManual.classList.add('hidden');
            submitBtn.disabled = !selectedFile;
          }
        };

        tabManual.addEventListener('click', () => switchTab('manual'));
        tabBulk.addEventListener('click', () => switchTab('bulk'));

        const tags = state.answers[q.id] ? [...state.answers[q.id]] : [];

        const updateTagsUI = () => {
          container.innerHTML = tags.map((t, i) => `
            <span class="tag-chip">
              ${t}
              <button type="button" class="ml-1 text-[10px]" onclick="handleRemoveInlineTag(${i})">
                <span class="material-symbols-outlined text-[12px] font-bold">close</span>
              </button>
            </span>`).join('');
          if (activeTab === 'manual') submitBtn.disabled = tags.length === 0;
        };

        window.handleRemoveInlineTag = function(i) {
          tags.splice(i, 1);
          updateTagsUI();
        };

        const addTag = () => {
          const val = inp.value.trim().replace(/,/g, '');
          if (val && !tags.includes(val)) {
            tags.push(val);
            updateTagsUI();
          }
          inp.value = '';
        };

        inp.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
          }
        });
        addBtn.addEventListener('click', addTag);

        const showPreview = (file) => {
          selectedFile = file;
          nameEl.textContent = file.name;
          preview.classList.remove('hidden');
          if (activeTab === 'bulk') submitBtn.disabled = false;
          gsap.fromTo(preview, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.25 });
        };

        fileInp.addEventListener('change', () => {
          if (fileInp.files[0]) showPreview(fileInp.files[0]);
        });

        dropzone.addEventListener('dragover', e => {
          e.preventDefault();
          dropzone.classList.add('dropzone-active');
        });

        dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dropzone-active'));

        dropzone.addEventListener('drop', e => {
          e.preventDefault();
          dropzone.classList.remove('dropzone-active');
          const file = e.dataTransfer.files[0];
          if (file) showPreview(file);
        });

        clearBtn.addEventListener('click', () => {
          selectedFile = null;
          preview.classList.add('hidden');
          if (activeTab === 'bulk') submitBtn.disabled = true;
          fileInp.value = '';
        });

        submitBtn.addEventListener('click', () => {
          if (activeTab === 'manual') {
            advanceQuestion(tags, tags.join(', '));
          } else {
            advanceQuestion(selectedFile.name, `Uploaded ${selectedFile.name} (Bulk Upload)`);
          }
        });

        if (tags.length > 0) updateTagsUI();
      } else {
        // Normal Tag Rendering (e.g. for regions)
        let html = `
          <div class="mt-1.5 flex flex-col gap-2 bg-white border border-outline rounded-xl p-3 shadow-sm max-w-xs">
            <div class="flex items-center gap-2 bg-slate-50 rounded-lg border border-outline px-2 py-1.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
              <input id="inline-tag-input" type="text" class="flex-1 bg-transparent border-none focus:ring-0 text-xs text-on-surface placeholder:text-on-surface-variant/40 p-0" placeholder="${q.placeholder || 'Type here...'}">
              <button id="inline-tag-add-btn" type="button" class="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/15 transition-colors cursor-pointer">
                <span class="material-symbols-outlined text-[14px]">add</span>
              </button>
            </div>
            <div id="inline-tags-container" class="flex flex-wrap gap-1.5 empty:hidden mt-1"></div>
            <div class="flex justify-end gap-2 mt-2 pt-2 border-t border-outline/40">
              ${q.optional ? `<button type="button" class="px-2 py-1 text-[10px] text-on-surface-variant hover:text-on-surface font-semibold" onclick="handleSkipQuestion(${idx})">${q.skipLabel || 'Skip'}</button>` : ''}
              <button id="inline-tags-submit" type="button" class="bg-primary text-on-primary text-[10px] font-bold py-1 px-3 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed" disabled>
                Confirm Regions
              </button>
            </div>
          </div>`;
        inlineArea.innerHTML = html;

        const inp = document.getElementById('inline-tag-input');
        const addBtn = document.getElementById('inline-tag-add-btn');
        const container = document.getElementById('inline-tags-container');
        const submitBtn = document.getElementById('inline-tags-submit');

        const tags = state.answers[q.id] ? [...state.answers[q.id]] : [];

        const updateTagsUI = () => {
          container.innerHTML = tags.map((t, i) => `
            <span class="tag-chip">
              ${t}
              <button type="button" class="ml-1 text-[10px]" onclick="handleRemoveInlineTag(${i})">
                <span class="material-symbols-outlined text-[12px] font-bold">close</span>
              </button>
            </span>`).join('');
          submitBtn.disabled = tags.length === 0;
        };

        window.handleRemoveInlineTag = function(i) {
          tags.splice(i, 1);
          updateTagsUI();
        };

        const addTag = () => {
          const val = inp.value.trim().replace(/,/g, '');
          if (val && !tags.includes(val)) {
            tags.push(val);
            updateTagsUI();
          }
          inp.value = '';
        };

        inp.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
          }
        });
        addBtn.addEventListener('click', addTag);
        submitBtn.addEventListener('click', () => {
          advanceQuestion(tags, tags.join(', '));
        });

        if (tags.length > 0) updateTagsUI();
      }
      break;
    }
    
    case 'multi-choice': {
      const selected = new Set(state.answers[q.id] || []);
      let html = `
        <div class="mt-1.5 flex flex-col gap-2.5 bg-white border border-outline rounded-xl p-3 shadow-sm max-w-sm">
          <div class="flex flex-wrap gap-1.5">`;
      q.options.forEach(o => {
        html += `
            <button type="button" class="goal-chip py-1 px-3 border border-outline rounded-full text-[10px] font-semibold bg-white hover:bg-slate-50 transition-all cursor-pointer ${selected.has(o.value) ? 'selected' : ''}" data-val="${o.value}" onclick="handleInlineGoalToggle(this)">
              ${o.label}
            </button>`;
      });
      html += `
          </div>
          <div class="flex justify-end pt-2 border-t border-outline/40">
            <button id="inline-goals-submit" type="button" class="bg-primary text-on-primary text-[10px] font-bold py-1 px-3 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed" ${selected.size === 0 ? 'disabled' : ''}>
              ${q.nextLabel || 'Confirm Goals'}
            </button>
          </div>
        </div>`;
      inlineArea.innerHTML = html;
      
      const submitBtn = document.getElementById('inline-goals-submit');
      
      window.handleInlineGoalToggle = function(btn) {
        const val = btn.dataset.val;
        btn.classList.toggle('selected');
        if (selected.has(val)) {
          selected.delete(val);
        } else {
          selected.add(val);
        }
        submitBtn.disabled = selected.size === 0;
      };
      
      submitBtn.addEventListener('click', () => {
        const labels = Array.from(selected).map(val => {
          return q.options.find(o => o.value === val).label;
        });
        advanceQuestion(Array.from(selected), labels.join(', '));
      });
      break;
    }
    
    case 'file-or-skip': {
      let html = `
        <div class="mt-1.5 flex flex-col gap-2.5 bg-white border border-outline rounded-xl p-3 shadow-sm max-w-xs">
          <div id="inline-dropzone" class="relative flex flex-col items-center justify-center gap-2 border-2 border-dashed border-outline rounded-lg p-5 text-center bg-slate-50/50 hover:bg-primary-container/10 hover:border-primary/40 transition-all cursor-pointer group">
            <input id="inline-file-inp" type="file" accept="${q.accept}" class="absolute inset-0 opacity-0 cursor-pointer w-full h-full">
            <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/15 transition-colors">
              <span class="material-symbols-outlined text-[16px]">upload_file</span>
            </div>
            <div>
              <p class="text-[10px] font-bold text-on-surface">Drop document here</p>
              <p class="text-[8px] text-on-surface-variant mt-0.5">or <span class="text-primary font-semibold underline underline-offset-1">browse files</span></p>
            </div>
            <div class="flex gap-1 mt-0.5">
              <span class="px-1 py-0.5 bg-white border border-outline rounded text-[7px] font-semibold text-on-surface-variant">.PDF</span>
              <span class="px-1 py-0.5 bg-white border border-outline rounded text-[7px] font-semibold text-on-surface-variant">.DOCX</span>
              <span class="px-1 py-0.5 bg-white border border-outline rounded text-[7px] font-semibold text-on-surface-variant">.XLSX</span>
            </div>
          </div>
          <div id="inline-file-preview" class="hidden flex items-center gap-2 bg-primary-container/20 border border-primary/20 rounded-lg px-2.5 py-1.5">
            <div class="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <span class="material-symbols-outlined text-[12px]">description</span>
            </div>
            <div class="flex-1 min-w-0">
              <p id="inline-file-name" class="text-[10px] font-bold text-on-surface truncate"></p>
            </div>
            <button id="inline-file-clear" type="button" class="text-on-surface-variant/50 hover:text-error">
              <span class="material-symbols-outlined text-[14px]">close</span>
            </button>
          </div>
          <div class="flex justify-end gap-2 pt-2 border-t border-outline/40">
            ${q.optional ? `<button type="button" class="px-2 py-1 text-[10px] text-on-surface-variant hover:text-on-surface font-semibold" onclick="handleSkipQuestion(${idx})">${q.skipLabel || 'Skip'}</button>` : ''}
            <button id="inline-file-submit" type="button" class="bg-primary text-on-primary text-[10px] font-bold py-1 px-3 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed" disabled>
              ${q.nextLabel || 'Continue'}
            </button>
          </div>
        </div>`;
      inlineArea.innerHTML = html;
      
      const dropzone = document.getElementById('inline-dropzone');
      const fileInp = document.getElementById('inline-file-inp');
      const preview = document.getElementById('inline-file-preview');
      const nameEl = document.getElementById('inline-file-name');
      const clearBtn = document.getElementById('inline-file-clear');
      const submitBtn = document.getElementById('inline-file-submit');
      
      let selectedFile = null;
      
      const showPreview = (file) => {
        selectedFile = file;
        nameEl.textContent = file.name;
        preview.classList.remove('hidden');
        submitBtn.disabled = false;
        gsap.fromTo(preview, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.25 });
      };
      
      fileInp.addEventListener('change', () => {
        if (fileInp.files[0]) showPreview(fileInp.files[0]);
      });
      
      dropzone.addEventListener('dragover', e => {
        e.preventDefault();
        dropzone.classList.add('dropzone-active');
      });
      
      dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dropzone-active'));
      
      dropzone.addEventListener('drop', e => {
        e.preventDefault();
        dropzone.classList.remove('dropzone-active');
        const file = e.dataTransfer.files[0];
        if (file) showPreview(file);
      });
      
      clearBtn.addEventListener('click', () => {
        selectedFile = null;
        preview.classList.add('hidden');
        submitBtn.disabled = true;
        fileInp.value = '';
      });
      
      submitBtn.addEventListener('click', () => {
        if (selectedFile) {
          advanceQuestion(selectedFile.name, selectedFile.name);
        }
      });
      break;
    }
  }
}

window.handleSkipQuestion = function(idx) {
  const q = questions[idx];
  advanceQuestion(null, q.skipLabel || 'Skipped');
};

function advanceQuestion(value, displayValue) {
  const q = questions[state.qIndex];
  state.answers[q.id] = value;

  // Rebuild summary strip to include this question
  rebuildSummaryStrip();

  // Find active-q-block and remove its inline area so we don't have active buttons in history
  const activeBlock = document.querySelector(`.active-q-block[data-qidx="${state.qIndex}"]`);
  if (activeBlock) {
    const inlineArea = activeBlock.querySelector('.q-inline-area');
    if (inlineArea) {
      inlineArea.innerHTML = ''; // Clear inline inputs since they are answered
    }
    activeBlock.classList.remove('active-q-block');
  }

  // Append User response bubble to the chat feed
  const feed = document.getElementById('onboarding-chat-feed');
  if (feed) {
    const userVal = displayValue !== undefined ? displayValue : value;
    const userBlock = document.createElement('div');
    userBlock.className = 'flex justify-end gap-3 mb-4 user-bubble-card group';
    userBlock.dataset.qidx = state.qIndex;
    
    userBlock.innerHTML = `
      <div class="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button type="button" onclick="handleEditAnswer(${state.qIndex})" class="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 border border-outline flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors shadow-sm" title="Edit this answer">
          <span class="material-symbols-outlined text-[13px]">edit</span>
        </button>
      </div>
      <div class="bg-primary text-on-primary rounded-xl rounded-tr-sm p-3 shadow-sm max-w-[85%] relative">
        <p class="font-body text-sm leading-relaxed">${userVal}</p>
      </div>
      <div class="w-9 h-9 rounded-xl bg-slate-200 flex items-center justify-center shrink-0 border border-outline overflow-hidden">
        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrV2uuXVfrfG8zmwRQLReo3dmLsCwzQirSxa1dvyB1mCOceZVJEBtWGd3HNJ_zvKiqT2iHBjEjJjv4Y_42JYRkJme-aByzDa2iuDD1fhzLNSoNerZg64hR-9rmeR_w8zaxBuEFYZqe3gJY9ChJhcRULMfFKZ2mVOS7ZELOYQ1ikzCLE5hIz3IcZ4oGswTzljbafhwDSJjJaIUm2kRCe8cJY-tm0QZS0j4sFuUfXU0f9tYs586ImtR0pP2OLSK2d9aN4SNc_UWT8hvR" alt="User" class="w-full h-full object-cover">
      </div>
    `;
    
    feed.appendChild(userBlock);
    
    // Scroll to bottom
    feed.scrollTop = feed.scrollHeight;
    
    // Animate User Bubble
    gsap.fromTo(userBlock, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
  }

  if (q.isLast) {
    setTimeout(finalisePhase1, 400);
    return;
  }

  state.qIndex++;
  renderQuestion(state.qIndex);
}

window.handleEditAnswer = function(targetIdx) {
  // Clear answers from targetIdx onwards
  for (let i = targetIdx; i < questions.length; i++) {
    const q = questions[i];
    if (q) delete state.answers[q.id];
  }
  
  state.qIndex = targetIdx;
  
  // Rebuild summary strip
  rebuildSummaryStrip();
  
  // Remove all feed elements with data-qidx >= targetIdx
  const feed = document.getElementById('onboarding-chat-feed');
  if (feed) {
    const bubbles = Array.from(feed.querySelectorAll('[data-qidx]'));
    bubbles.forEach(b => {
      const idx = parseInt(b.dataset.qidx);
      if (idx >= targetIdx) {
        b.remove();
      }
    });
  }
  
  // Re-render the question
  renderQuestion(targetIdx);
};

function rebuildSummaryStrip() {
  const strip = document.getElementById('q-summary');
  if (!strip) return;
  // Clear all summary chips but keep title
  strip.innerHTML = '<span class="font-bold text-on-surface-variant uppercase tracking-wider mr-1 text-[9.5px]">Setup so far</span>';
  
  let hasAny = false;
  // Loop through answered questions up to current qIndex
  for (let i = 0; i < state.qIndex; i++) {
    const q = questions[i];
    if (q && state.answers[q.id] !== undefined && state.answers[q.id] !== null) {
      hasAny = true;
      const icons = { bizName:'business', location:'location_on', multiRegion:'public', regions:'travel_explore', cities:'location_city', industry:'category', customIndustry:'category', description:'description', goals:'flag', document:'upload_file' };
      let val = state.answers[q.id];
      if (Array.isArray(val)) {
        val = val.slice(0,2).join(', ') + (val.length > 2 ? '…' : '');
      }
      
      const chip = document.createElement('span');
      chip.className = 'summary-chip';
      chip.innerHTML = `<span class="material-symbols-outlined text-[11px]">${icons[q.id] || 'check'}</span>${val}`;
      strip.appendChild(chip);
    }
  }
  
  if (hasAny) {
    strip.classList.remove('hidden');
    strip.classList.add('flex');
  } else {
    strip.classList.add('hidden');
    strip.classList.remove('flex');
  }
}

function finalisePhase1() {
  completeStep(1);
  activateStep(2);
  const detail = document.getElementById('sd-1');
  if (detail) {
    detail.innerHTML = `<h4 class="font-body text-xs font-bold text-primary">1. Business Identity</h4><p class="text-[10px] text-on-surface-variant opacity-70 mt-0.5">✓ ${state.answers.bizName || 'Completed'}</p>`;
  }
  showToast('Business profile saved!', 'success');
  setTimeout(() => {
    initPhase2();
    showPhase(2);
  }, 500);
}

// ════════════════════════════════════════════════════════
// PHASE 2 — Connect Data Source
// ════════════════════════════════════════════════════════
function initPhase2() {
  const aiText = document.getElementById('p2-ai-text');
  if (aiText && state.answers.bizName) {
    aiText.innerHTML = `Perfect, ${state.answers.bizName}! Now let's connect your data. Choose how you want to bring your business data into SmartBI.`;
  }
  const srcCard = document.getElementById('p2-source-card');
  const succCard = document.getElementById('p2-success-card');
  const errCard  = document.getElementById('p2-error-card');
  if (srcCard) {
    srcCard.classList.remove('hidden');
    srcCard.style.opacity = '1';
    srcCard.style.transform = 'none';
  }
  if (succCard) succCard.classList.add('hidden');
  if (errCard) errCard.classList.add('hidden');
  const connectBtn = document.getElementById('p2-connect-btn');
  if (connectBtn) connectBtn.disabled = false;

  setP2Mode('db');
}

const P2_TAB_ACTIVE   = ['bg-white','shadow-sm','border','border-outline','text-on-surface','font-bold'];
const P2_TAB_INACTIVE = ['text-on-surface-variant','font-semibold'];

function setP2Mode(mode) {
  state.p2Mode = mode;
  // Tabs
  ['p2-tab-db','p2-tab-file','p2-tab-skip'].forEach(id => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.classList.remove(...P2_TAB_ACTIVE, ...P2_TAB_INACTIVE);
    btn.classList.add(...P2_TAB_INACTIVE);
  });
  const activeTab = { db:'p2-tab-db', file:'p2-tab-file', skip:'p2-tab-skip' }[mode];
  const activeBtn = document.getElementById(activeTab);
  if (activeBtn) { activeBtn.classList.remove(...P2_TAB_INACTIVE); activeBtn.classList.add(...P2_TAB_ACTIVE); }
  // Panels
  document.getElementById('p2-db-panel').classList.toggle('hidden', mode !== 'db');
  document.getElementById('p2-file-panel').classList.toggle('hidden', mode !== 'file');
  document.getElementById('p2-skip-panel').classList.toggle('hidden', mode !== 'skip');
  // Button label
  const icon  = document.getElementById('p2-btn-icon');
  const label = document.getElementById('p2-btn-label');
  const btn   = document.getElementById('p2-connect-btn');
  if (mode === 'db')   { icon.textContent='flash_on'; label.textContent='Test & Connect'; btn.disabled = !isDbFilled(); }
  if (mode === 'file') { icon.textContent='upload'; label.textContent='Upload & Analyse'; btn.disabled = !state.p2File; }
  if (mode === 'skip') { icon.textContent='arrow_forward'; label.textContent='Continue with Demo Data'; btn.disabled = false; }
}

function isDbFilled() {
  return ['db-host','db-name','db-user','db-pass'].every(id => (document.getElementById(id)?.value || '').trim().length > 0);
}

function setupP2Tabs() {
  document.getElementById('p2-tab-db')?.addEventListener('click', () => setP2Mode('db'));
  document.getElementById('p2-tab-file')?.addEventListener('click', () => setP2Mode('file'));
  document.getElementById('p2-tab-skip')?.addEventListener('click', () => setP2Mode('skip'));
  ['db-host','db-name','db-user','db-pass'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => {
      if (state.p2Mode === 'db') document.getElementById('p2-connect-btn').disabled = !isDbFilled();
    });
  });
  // Password toggle
  const toggleBtn = document.getElementById('db-toggle-pass');
  const passInp   = document.getElementById('db-pass');
  if (toggleBtn && passInp) {
    toggleBtn.addEventListener('click', () => {
      const t = passInp.type === 'password' ? 'text' : 'password';
      passInp.type = t;
      toggleBtn.querySelector('.material-symbols-outlined').textContent = t === 'password' ? 'visibility' : 'visibility_off';
    });
  }
}

function setupP2FileUpload() {
  const fileInput  = document.getElementById('p2-file-input');
  const dropzone   = document.getElementById('p2-dropzone');
  const preview    = document.getElementById('p2-file-preview');
  const nameEl     = document.getElementById('p2-file-name');
  const metaEl     = document.getElementById('p2-file-meta');
  const clearBtn   = document.getElementById('p2-file-clear');
  const connectBtn = document.getElementById('p2-connect-btn');

  const showFilePreview = (file) => {
    state.p2File = file;
    const size = file.size > 1048576 ? `${(file.size/1048576).toFixed(1)} MB` : `${(file.size/1024).toFixed(1)} KB`;
    nameEl.textContent = file.name;
    metaEl.textContent = `${size} · Ready to upload`;
    preview.classList.remove('hidden');
    gsap.fromTo(preview, { opacity:0, y:6 }, { opacity:1, y:0, duration:0.3 });
    if (state.p2Mode === 'file') connectBtn.disabled = false;
  };

  fileInput?.addEventListener('change', () => { if (fileInput.files[0]) showFilePreview(fileInput.files[0]); });
  dropzone?.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('dropzone-active'); });
  dropzone?.addEventListener('dragleave', () => dropzone.classList.remove('dropzone-active'));
  dropzone?.addEventListener('drop', e => {
    e.preventDefault(); dropzone.classList.remove('dropzone-active');
    const file = e.dataTransfer.files[0];
    const ok = ['.csv','.xlsx','.xls','.json'].some(ext => file.name.toLowerCase().endsWith(ext));
    ok ? showFilePreview(file) : showToast('Unsupported format. Use CSV, XLSX, or JSON.', 'error');
  });
  clearBtn?.addEventListener('click', () => { state.p2File = null; preview.classList.add('hidden'); if (state.p2Mode === 'file') connectBtn.disabled = true; });
}

function setupP2ConnectBtn() {
  const btn     = document.getElementById('p2-connect-btn');
  const spinner = document.getElementById('p2-spinner');
  const spinLbl = document.getElementById('p2-spinner-label');
  const srcCard = document.getElementById('p2-source-card');
  const succCard = document.getElementById('p2-success-card');
  const errCard  = document.getElementById('p2-error-card');
  const backBtn  = document.getElementById('p2-back');

  btn?.addEventListener('click', () => {
    btn.disabled = true;
    spinner.classList.remove('hidden'); spinner.classList.add('flex');
    spinLbl.textContent = state.p2Mode === 'file' ? 'Uploading file...' : 'Testing connection...';

    const delay = state.p2Mode === 'skip' ? 800 : (state.p2Mode === 'file' ? 1400 : 1800);
    // 20% chance of simulated error for DB mode
    const willFail = state.p2Mode === 'db' && Math.random() < 0.2;

    setTimeout(() => {
      spinner.classList.add('hidden'); spinner.classList.remove('flex');
      if (willFail) {
        gsap.to(srcCard, { opacity:0, y:10, duration:0.25, onComplete:() => { srcCard.classList.add('hidden'); errCard.classList.remove('hidden'); gsap.fromTo(errCard, {opacity:0,y:10},{opacity:1,y:0,duration:0.35}); }});
        return;
      }
      // Success
      const desc = document.getElementById('p2-success-desc');
      if (state.p2Mode === 'skip') {
        if (desc) desc.textContent = 'Using SmartBI demo data. You can connect your real data source from Settings at any time.';
        document.getElementById('p2-data-summary') && (document.getElementById('p2-data-summary').innerHTML = `<div class="bg-surface-variant/40 rounded-xl p-3 text-center border border-outline/40 col-span-2"><p class="text-sm font-bold font-display text-primary">Demo</p><p class="text-[9px] text-on-surface-variant">Dataset</p></div><div class="bg-surface-variant/40 rounded-xl p-3 text-center border border-outline/40"><p class="text-sm font-bold font-display text-primary">50K</p><p class="text-[9px] text-on-surface-variant">Rows</p></div><div class="bg-surface-variant/40 rounded-xl p-3 text-center border border-outline/40"><p class="text-sm font-bold font-display text-primary">No</p><p class="text-[9px] text-on-surface-variant">Team Data</p></div>`);
        const teamNotice = succCard.querySelector('.bg-primary-container\\/30');
        if (teamNotice) teamNotice.remove();
      } else {
        if (desc) desc.textContent = state.p2Mode === 'file' ? `${state.p2File?.name || 'File'} uploaded and indexed successfully.` : 'Connected to PostgreSQL database. Analysing data structure...';
      }
      gsap.to(srcCard, { opacity:0, y:10, duration:0.25, onComplete:() => { srcCard.classList.add('hidden'); succCard.classList.remove('hidden'); gsap.fromTo(succCard, {opacity:0,y:10},{opacity:1,y:0,duration:0.35}); }});
      showToast(state.p2Mode === 'skip' ? 'Demo data loaded.' : 'Data source connected!', 'success');
    }, delay);
  });

  // Team data choice
  document.getElementById('p2-use-team-data')?.addEventListener('click', () => { state.p2TeamDataUsed = true; showToast('Will use database team data for Team Setup.', 'info'); document.getElementById('p2-next-btn').click(); });
  document.getElementById('p2-skip-team-data')?.addEventListener('click', () => { state.p2TeamDataUsed = false; document.getElementById('p2-next-btn').click(); });

  // Next after success
  document.getElementById('p2-next-btn')?.addEventListener('click', () => {
    completeStep(2); activateStep(3);
    document.getElementById('sd-2').innerHTML = `<h4 class="font-body text-xs font-bold text-primary">2. Data Source</h4><p class="text-[10px] text-on-surface-variant opacity-70 mt-0.5">✓ Connected</p>`;
    showPhase(3);
    initPhase3();
  });

  // Retry
  document.getElementById('p2-retry-btn')?.addEventListener('click', () => {
    errCard.classList.add('hidden');
    srcCard.classList.remove('hidden');
    gsap.fromTo(srcCard, {opacity:0,y:10},{opacity:1,y:0,duration:0.3});
    btn.disabled = !isDbFilled();
  });
  document.getElementById('p2-change-source')?.addEventListener('click', () => {
    errCard.classList.add('hidden'); srcCard.classList.remove('hidden');
    gsap.fromTo(srcCard, {opacity:0,y:10},{opacity:1,y:0,duration:0.3});
  });

  // Back
  backBtn?.addEventListener('click', () => { showPhase(1); renderQuestion(state.qIndex); });
}

// ════════════════════════════════════════════════════════
// PHASE 3 — Team & Organisation
// ════════════════════════════════════════════════════════
function initPhase3() {
  const aiText = document.getElementById('p3-ai-text');
  if (aiText) {
    const msg = state.p2TeamDataUsed
      ? `I detected your team structure from the database. Let's review and confirm roles before setting up invitations.`
      : `Let's set up your team. I'll guide you through roles, team structure, and employee invitations.`;
    aiText.textContent = msg;
  }
  goP3Sub('roles');
}

function goP3Sub(sub) {
  state.p3Sub = sub;
  const cards = { roles:'p3-roles-card', teams:'p3-teams-card', invite:'p3-invite-card' };
  Object.entries(cards).forEach(([s, id]) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (s === sub) { el.classList.remove('hidden'); gsap.fromTo(el, {opacity:0,y:12},{opacity:1,y:0,duration:0.35,ease:'back.out(1.2)'}); }
    else { el.classList.add('hidden'); }
  });
  // Update sub-step indicators
  const dots = ['roles','teams','invite'];
  dots.forEach((s, i) => {
    const dot = document.getElementById(`p3-sub-dot-${s}`);
    if (!dot) return;
    const done = dots.indexOf(sub) > i;
    const active = sub === s;
    dot.classList.remove('bg-primary','text-white','bg-surface-variant','text-on-surface-variant','border','border-outline');
    if (done) { dot.classList.add('bg-primary','text-white'); dot.innerHTML = '✓'; }
    else if (active) { dot.classList.add('bg-primary','text-white'); dot.innerHTML = `${i+1}`; }
    else { dot.classList.add('bg-surface-variant','text-on-surface-variant','border','border-outline'); dot.innerHTML = `${i+1}`; }
  });
}

function setupRoles() {
  document.querySelectorAll('.role-card').forEach(card => {
    card.addEventListener('click', () => {
      const role = card.dataset.role;
      if (state.p3Roles.has(role)) { state.p3Roles.delete(role); card.classList.remove('selected'); }
      else { state.p3Roles.add(role); card.classList.add('selected'); }
      const radio = card.querySelector('.role-radio div');
      if (radio) radio.style.display = state.p3Roles.has(role) ? 'block' : 'none';
      card.querySelector('.role-radio').classList.toggle('border-primary', state.p3Roles.has(role));
    });
  });

  const customInput = document.getElementById('custom-role-input');
  const addBtn      = document.getElementById('add-role-btn');
  const chipList    = document.getElementById('custom-roles-list');

  const addCustomRole = () => {
    const raw = customInput.value.trim().replace(/\.$/, '');
    const parts = raw.split(/[.,]/).map(r=>r.trim()).filter(Boolean);
    parts.forEach(role => {
      if (!state.p3CustomRoles.includes(role)) {
        state.p3CustomRoles.push(role);
        state.p3Roles.add(role);
        const chip = document.createElement('span');
        chip.className = 'role-chip';
        chip.innerHTML = `${role}<button data-r="${role}"><span class="material-symbols-outlined text-[13px]">close</span></button>`;
        chip.querySelector('button').addEventListener('click', () => {
          state.p3CustomRoles = state.p3CustomRoles.filter(r=>r!==role);
          state.p3Roles.delete(role);
          chip.remove();
        });
        chipList.appendChild(chip);
        gsap.fromTo(chip,{opacity:0,x:-8},{opacity:1,x:0,duration:0.25});
      }
    });
    customInput.value = '';
  };

  addBtn?.addEventListener('click', addCustomRole);
  customInput?.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === '.') { e.preventDefault(); addCustomRole(); } });
}

function setupTeamUpload() {
  const teamInput   = document.getElementById('p3-team-input');
  const nextBtn     = document.getElementById('p3-teams-next');
  const tableWrap   = document.getElementById('p3-team-table-wrap');
  const tbody       = document.getElementById('p3-teams-body');
  const badge       = document.getElementById('p3-team-badge');

  // Simulate team detection from file
  const DEMO_TEAMS = [
    { name: 'Sales', division: 'Revenue' },
    { name: 'Engineering', division: 'Technology' },
    { name: 'Marketing', division: 'Growth' },
    { name: 'HR & People', division: 'Operations' },
  ];

  const renderTeamTable = (teams) => {
    state.p3Teams = teams;
    tbody.innerHTML = teams.map((t, i) => `
      <tr class="hover:bg-surface-variant/20 transition-colors">
        <td class="px-3 py-2.5"><input class="bg-transparent border-none focus:ring-0 text-xs font-bold text-on-surface w-full" value="${t.name}" data-i="${i}" data-field="name"></td>
        <td class="px-3 py-2.5"><span class="text-[10px] text-on-surface-variant">${t.division}</span></td>
        <td class="px-3 py-2.5 text-right"><span class="text-[9px] font-bold text-success bg-success-container px-2 py-0.5 rounded-full">✓ Confirmed</span></td>
      </tr>`).join('');
    tbody.querySelectorAll('input[data-field="name"]').forEach(inp => {
      inp.addEventListener('change', () => { state.p3Teams[parseInt(inp.dataset.i)].name = inp.value; });
    });
    badge.textContent = `${teams.length} team${teams.length !== 1 ? 's' : ''}`;
    tableWrap.classList.remove('hidden');
    gsap.fromTo(tableWrap, {opacity:0,y:8},{opacity:1,y:0,duration:0.35});
    nextBtn.disabled = false;
  };

  teamInput?.addEventListener('change', () => {
    if (teamInput.files[0]) {
      showToast(`Processing ${teamInput.files[0].name}...`, 'info');
      setTimeout(() => { renderTeamTable(DEMO_TEAMS); showToast('4 teams detected — please review.', 'success'); }, 1000);
    }
  });
}

function setupInvite() {
  const tabSmall = document.getElementById('invite-tab-small');
  const tabLarge = document.getElementById('invite-tab-large');
  const smallPnl = document.getElementById('invite-small-panel');
  const largePnl = document.getElementById('invite-large-panel');

  const ITAB_ACTIVE   = ['bg-white','shadow-sm','border','border-outline','text-on-surface','font-bold'];
  const ITAB_INACTIVE = ['text-on-surface-variant','font-semibold'];

  const setInviteTab = (mode) => {
    state.p3InviteMode = mode;
    [tabSmall,tabLarge].forEach(b => { if (!b) return; b.classList.remove(...ITAB_ACTIVE,...ITAB_INACTIVE); b.classList.add(...ITAB_INACTIVE); });
    const activeTab = mode === 'small' ? tabSmall : tabLarge;
    if (activeTab) { activeTab.classList.remove(...ITAB_INACTIVE); activeTab.classList.add(...ITAB_ACTIVE); }
    smallPnl?.classList.toggle('hidden', mode !== 'small');
    largePnl?.classList.toggle('hidden', mode !== 'large');
  };
  tabSmall?.addEventListener('click', () => setInviteTab('small'));
  tabLarge?.addEventListener('click', () => setInviteTab('large'));
  setInviteTab('small');

  // Email chip input
  const emailInput = document.getElementById('invite-email-input');
  const emailChips = document.getElementById('invite-email-chips');
  const addEmail = () => {
    const v = emailInput.value.trim();
    if (v && v.includes('@') && !state.p3Emails.has(v)) {
      state.p3Emails.add(v);
      const chip = document.createElement('span');
      chip.className = 'email-chip';
      chip.innerHTML = `${v}<button data-e="${v}"><span class="material-symbols-outlined text-[13px]">close</span></button>`;
      chip.querySelector('button').addEventListener('click', () => { state.p3Emails.delete(v); chip.remove(); });
      emailChips.appendChild(chip);
      gsap.fromTo(chip, {opacity:0,x:-8},{opacity:1,x:0,duration:0.25});
    }
    emailInput.value = '';
  };
  emailInput?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addEmail(); } });
}

function advanceToPhase4() {
  completeStep(3); activateStep(4);
  document.getElementById('sd-3').innerHTML = `<h4 class="font-body text-xs font-bold text-primary">3. Team Setup</h4><p class="text-[10px] text-on-surface-variant opacity-70 mt-0.5">✓ ${state.p3Roles.size} roles, ${state.p3Teams.length} teams</p>`;
  showToast('Team setup saved!', 'success');
  setTimeout(() => showPhase(4), 400);
}

// ════════════════════════════════════════════════════════
// PHASE 4 — KPI Discovery
// ════════════════════════════════════════════════════════
function initPhase4() {
  if (!state.kpiData) {
    state.kpiData = JSON.parse(JSON.stringify(kpiCategories));
  }
  updateKpiCounts();
  renderKpiGrid();
  setupKpiControls();
}

function renderKpiGrid() {
  const grid = document.getElementById('kpi-categories-grid');
  if (!grid) return;
  grid.innerHTML = state.kpiData.map(cat => `
    <div class="kpi-cat-card ${!cat.approved ? 'rejected' : ''}" data-cat="${cat.id}">
      <div class="kpi-cat-status ${cat.approved ? 'approved' : 'rejected'}">
        <span class="material-symbols-outlined text-[13px]" style="font-variation-settings:'FILL' 1">${cat.approved ? 'check_circle' : 'cancel'}</span>
      </div>
      <div class="flex items-center gap-3 mb-3">
        <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style="background:${cat.bgColor};color:${cat.color}">
          <span class="material-symbols-outlined text-[18px]">${cat.icon}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-bold text-on-surface truncate">${cat.name}</p>
          <p class="text-[9px] text-on-surface-variant">${cat.count} metrics</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button class="kpi-cat-approve flex-1 text-[9.5px] font-bold text-success border border-success/30 bg-success-container/30 hover:bg-success-container/50 px-2 py-1.5 rounded-lg transition-all cursor-pointer" data-cat="${cat.id}">Approve</button>
        <button class="kpi-cat-reject flex-1 text-[9.5px] font-bold text-on-surface-variant border border-outline hover:bg-surface-variant/50 px-2 py-1.5 rounded-lg transition-all cursor-pointer" data-cat="${cat.id}">Reject</button>
        <button class="kpi-cat-expand text-[9.5px] font-semibold text-primary hover:underline px-2 py-1.5 cursor-pointer" data-cat="${cat.id}">View ↗</button>
      </div>
    </div>`).join('');

  // Bind buttons
  grid.querySelectorAll('.kpi-cat-approve').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); setCatApproval(btn.dataset.cat, true); }));
  grid.querySelectorAll('.kpi-cat-reject').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); setCatApproval(btn.dataset.cat, false); }));
  grid.querySelectorAll('.kpi-cat-expand').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); expandCategory(btn.dataset.cat); }));
  grid.querySelectorAll('.kpi-cat-card').forEach(card => card.addEventListener('dblclick', () => expandCategory(card.dataset.cat)));
}

function setCatApproval(catId, approved) {
  const cat = state.kpiData.find(c => c.id === catId);
  if (!cat) return;
  cat.approved = approved;
  cat.kpis.forEach(k => k.approved = approved);
  renderKpiGrid();
  updateKpiCounts();
}

function expandCategory(catId) {
  const cat = state.kpiData.find(c => c.id === catId);
  if (!cat) return;
  state.activeKpiCat = catId;
  document.getElementById('kpi-categories-grid').classList.add('hidden');
  const panel = document.getElementById('kpi-expanded-panel');
  const title = document.getElementById('kpi-exp-title');
  const badge = document.getElementById('kpi-exp-badge');
  const list  = document.getElementById('kpi-items-list');

  if (title) title.textContent = cat.name;
  if (badge) badge.textContent = `${cat.count} KPIs`;

  list.innerHTML = cat.kpis.map(k => `
    <div class="kpi-item ${k.approved ? 'approved' : 'rejected'}" data-kpi="${k.id}" data-cat="${catId}">
      <div class="kpi-toggle">${k.approved ? `<span class="material-symbols-outlined text-[12px]" style="font-variation-settings:'FILL' 1">check</span>` : `<span class="material-symbols-outlined text-[12px]">close</span>`}</div>
      <span class="text-[10px] font-semibold text-on-surface leading-tight">${k.name}</span>
    </div>`).join('');

  list.querySelectorAll('.kpi-item').forEach(item => {
    item.addEventListener('click', () => {
      const kpi = cat.kpis.find(k => k.id === item.dataset.kpi);
      if (!kpi) return;
      kpi.approved = !kpi.approved;
      cat.approved = cat.kpis.some(k => k.approved);
      expandCategory(catId); // re-render
      updateKpiCounts();
    });
  });

  panel.classList.remove('hidden');
  gsap.fromTo(panel, {opacity:0,y:8},{opacity:1,y:0,duration:0.3});
}

function setupKpiControls() {
  const kpiCollapse = document.getElementById('kpi-collapse');
  if (kpiCollapse && !kpiCollapse.dataset.bound) {
    kpiCollapse.dataset.bound = 'true';
    kpiCollapse.addEventListener('click', () => {
      document.getElementById('kpi-categories-grid').classList.remove('hidden');
      document.getElementById('kpi-expanded-panel').classList.add('hidden');
      state.activeKpiCat = null;
    });
  }

  const kpiApproveAll = document.getElementById('kpi-approve-all');
  if (kpiApproveAll && !kpiApproveAll.dataset.bound) {
    kpiApproveAll.dataset.bound = 'true';
    kpiApproveAll.addEventListener('click', () => {
      state.kpiData.forEach(c => { c.approved = true; c.kpis.forEach(k => k.approved = true); });
      renderKpiGrid();
      updateKpiCounts();
      showToast('All KPIs approved.', 'success');
    });
  }

  const kpiRejectAll = document.getElementById('kpi-reject-all');
  if (kpiRejectAll && !kpiRejectAll.dataset.bound) {
    kpiRejectAll.dataset.bound = 'true';
    kpiRejectAll.addEventListener('click', () => {
      state.kpiData.forEach(c => { c.approved = false; c.kpis.forEach(k => k.approved = false); });
      renderKpiGrid();
      updateKpiCounts();
      showToast('All KPIs rejected.', 'info');
    });
  }

  const kpiExpApprove = document.getElementById('kpi-exp-approve-all');
  if (kpiExpApprove && !kpiExpApprove.dataset.bound) {
    kpiExpApprove.dataset.bound = 'true';
    kpiExpApprove.addEventListener('click', () => {
      if (!state.activeKpiCat) return;
      setCatApproval(state.activeKpiCat, true);
      expandCategory(state.activeKpiCat);
    });
  }

  const kpiExpReject = document.getElementById('kpi-exp-reject-all');
  if (kpiExpReject && !kpiExpReject.dataset.bound) {
    kpiExpReject.dataset.bound = 'true';
    kpiExpReject.addEventListener('click', () => {
      if (!state.activeKpiCat) return;
      setCatApproval(state.activeKpiCat, false);
      expandCategory(state.activeKpiCat);
    });
  }

  const searchInput = document.getElementById('kpi-search');
  if (searchInput && !searchInput.dataset.bound) {
    searchInput.dataset.bound = 'true';
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase();
      if (!q) {
        document.querySelectorAll('.kpi-item').forEach(el => el.style.display = '');
        return;
      }
      document.querySelectorAll('.kpi-item').forEach(el => {
        const name = el.querySelector('span:last-child')?.textContent.toLowerCase() || '';
        el.style.display = name.includes(q) ? '' : 'none';
      });
    });
  }

  const p4Back = document.getElementById('p4-back');
  if (p4Back && !p4Back.dataset.bound) {
    p4Back.dataset.bound = 'true';
    p4Back.addEventListener('click', () => { showPhase(3); initPhase3(); });
  }

  const p4Skip = document.getElementById('p4-skip');
  if (p4Skip && !p4Skip.dataset.bound) {
    p4Skip.dataset.bound = 'true';
    p4Skip.addEventListener('click', () => advanceToPhase5());
  }

  const p4Confirm = document.getElementById('p4-confirm');
  if (p4Confirm && !p4Confirm.dataset.bound) {
    p4Confirm.dataset.bound = 'true';
    p4Confirm.addEventListener('click', () => advanceToPhase5());
  }
}

function updateKpiCounts() {
  let total = 0, approved = 0;
  state.kpiData.forEach(cat => { cat.kpis.forEach(k => { total++; if(k.approved) approved++; }); });
  state.kpiApproved = approved;
  state.kpiTotal = total;
  document.getElementById('kpi-approved-n') && (document.getElementById('kpi-approved-n').textContent = approved);
  document.getElementById('kpi-total-n')    && (document.getElementById('kpi-total-n').textContent = total);
  // Update confirm button label
  const confirmLabel = document.getElementById('p4-confirm-label');
  if (confirmLabel) confirmLabel.textContent = `Confirm Selected KPIs (${approved})`;
}

function advanceToPhase5() {
  completeStep(4); activateStep(5);
  const approved = state.kpiApproved || 847;
  document.getElementById('sd-4').innerHTML = `<h4 class="font-body text-xs font-bold text-primary">4. KPI Review</h4><p class="text-[10px] text-on-surface-variant opacity-70 mt-0.5">✓ ${approved} metrics approved</p>`;
  showToast(`${approved} KPIs confirmed!`,'success');
  setTimeout(() => showPhase(5), 400);
}

// ════════════════════════════════════════════════════════
// PHASE 5 — Workspace Preview
// ════════════════════════════════════════════════════════
function initPhase5() {
  // Populate biz info
  const bizName = state.answers.bizName || 'Your Business';
  const industry = state.answers.industry === 'Other' ? (state.answers.customIndustry || 'Other') : (state.answers.industry || '');
  const location = state.answers.location || '';
  document.getElementById('p5-biz-label') && (document.getElementById('p5-biz-label').textContent = [bizName, industry, location].filter(Boolean).join(' · '));
  document.getElementById('p5-ai-biz')    && (document.getElementById('p5-ai-biz').textContent = `${bizName} in ${industry || 'your industry'}`);

  // KPI info
  const kpiCount = state.kpiApproved || 847;
  document.getElementById('p5-kpi-chip')       && (document.getElementById('p5-kpi-chip').textContent = kpiCount);
  document.getElementById('p5-kpi-label')      && (document.getElementById('p5-kpi-label').textContent = `${kpiCount} KPIs confirmed`);
  document.getElementById('p5-ai-kpi-detail')  && (document.getElementById('p5-ai-kpi-detail').textContent = `${kpiCount} metrics approved across ${state.kpiData?.length || 6} categories`);

  // Team info
  const teamCount = state.p3Teams.length || 3;
  document.getElementById('p5-team-chip')  && (document.getElementById('p5-team-chip').textContent = `${teamCount} Teams`);
  document.getElementById('p5-employee-n') && (document.getElementById('p5-employee-n').textContent = teamCount * 47);

  // AI recommendation
  const goals = state.answers.goals || [];
  let rec = `Based on your business goals, I recommend starting with the `;
  rec += goals.includes('revenue') ? `Revenue and ` : ``;
  rec += goals.includes('team') ? `HR ` : `Operations `;
  rec += `dashboards. Your data shows the strongest signals in those areas.`;
  document.getElementById('p5-ai-rec') && (document.getElementById('p5-ai-rec').textContent = rec);

  // Set up phase 5 controls if not already done
  setupPhase5Controls();

  // Mark step 5 active in stepper (complete all)
  completeStep(5);
  ['sl-1','sl-2','sl-3','sl-4'].forEach(id => {
    const l = document.getElementById(id);
    if (l) { l.classList.remove('bg-outline-variant'); l.classList.add('bg-primary'); }
  });

  // Stepper column shows in Phase 5 via phase-5 wrapper (full width, no wrapper)
  document.getElementById('stepper-col')?.classList.add('hidden');
}

function resetStepperToActiveStep(activeStep) {
  const titles = {
    1: { h: '1. Business Identity', p: 'Tell us about your business' },
    2: { h: '2. Data Source', p: 'Connect your business data' },
    3: { h: '3. Team Setup', p: 'Roles, teams & invitations' },
    4: { h: '4. KPI Review', p: 'Confirm your metric library' },
    5: { h: '5. Preview & Launch', p: 'Review and go live' }
  };

  state.phase = activeStep;

  for (let i = 1; i <= 5; i++) {
    const circle = document.getElementById(`sc-${i}`);
    const detail = document.getElementById(`sd-${i}`);
    const line = document.getElementById(`sl-${i}`);

    if (i < activeStep) {
      if (circle) {
        circle.className = 'step-circle relative z-10 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0';
        circle.innerHTML = `<span class="material-symbols-outlined text-[14px] font-bold" style="font-variation-settings:'FILL' 1">check</span>`;
      }
      if (detail) {
        let textVal = 'Completed';
        if (i === 1) textVal = state.answers.bizName || 'Completed';
        else if (i === 2) textVal = 'Connected';
        detail.innerHTML = `<h4 class="font-body text-xs font-bold text-primary">${titles[i].h}</h4><p class="text-[10px] text-on-surface-variant opacity-70 mt-0.5">✓ ${textVal}</p>`;
      }
      if (line) {
        if (line.classList.contains('bg-outline-variant')) line.classList.remove('bg-outline-variant');
        line.classList.add('bg-primary');
      }
    } else if (i === activeStep) {
      if (circle) {
        circle.className = 'step-circle relative z-10 w-8 h-8 rounded-full border-2 border-primary bg-white flex items-center justify-center text-primary shrink-0';
        circle.innerHTML = `<div class="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></div>`;
      }
      if (detail) {
        detail.innerHTML = `<h4 class="font-body text-xs font-bold text-on-surface">${titles[i].h}</h4><p class="text-[10px] text-on-surface-variant opacity-70 mt-0.5">${titles[i].p}</p>`;
      }
      if (line) {
        if (line.classList.contains('bg-primary')) line.classList.remove('bg-primary');
        line.classList.add('bg-outline-variant');
      }
    } else {
      if (circle) {
        circle.className = 'step-circle relative z-10 w-8 h-8 rounded-full border border-outline bg-surface-variant text-on-surface-variant flex items-center justify-center shrink-0';
        circle.innerHTML = `<span class="font-body text-[10px] font-bold">${i}</span>`;
      }
      if (detail) {
        detail.innerHTML = `<h4 class="font-body text-xs font-bold text-on-surface-variant">${titles[i].h}</h4><p class="text-[10px] text-on-surface-variant opacity-40 mt-0.5">${titles[i].p}</p>`;
      }
      if (line) {
        if (line.classList.contains('bg-primary')) line.classList.remove('bg-primary');
        line.classList.add('bg-outline-variant');
      }
    }
  }
}

function renderDiscoveredKpis(searchQuery = '') {
  const listContainer = document.getElementById('modal-kpi-list');
  const emptyContainer = document.getElementById('modal-kpi-empty');
  if (!listContainer) return;

  if (!state.kpiData) {
    state.kpiData = JSON.parse(JSON.stringify(kpiCategories));
  }

  const query = searchQuery.toLowerCase().trim();
  let html = '';
  let count = 0;

  state.kpiData.forEach(cat => {
    cat.kpis.forEach(k => {
      const dataCount = (k.id.charCodeAt(0) * 13 + k.id.charCodeAt(k.id.length - 1) * 7) % 890 + 24;
      const kpiNameWithCount = `${k.name} (${dataCount})`;
      
      if (!query || kpiNameWithCount.toLowerCase().includes(query) || cat.name.toLowerCase().includes(query)) {
        count++;
        html += `
          <div class="p-3.5 bg-white border border-outline/60 rounded-xl hover:border-primary/40 hover:shadow-sm transition-all flex items-start gap-3">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style="background:${cat.bgColor};color:${cat.color}">
              <span class="material-symbols-outlined text-[16px]">${cat.icon}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[11.5px] font-bold text-on-surface leading-tight">${k.name} <span class="text-primary font-semibold">(${dataCount})</span></p>
              <div class="flex items-center gap-1.5 mt-1">
                <span class="text-[9px] font-medium text-on-surface-variant/70 bg-slate-100 px-1.5 py-0.5 rounded">${cat.name}</span>
                <span class="text-[8.5px] font-bold text-success bg-success-container/30 text-success-container px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span> Ready
                </span>
              </div>
            </div>
          </div>
        `;
      }
    });
  });

  listContainer.innerHTML = html;
  
  if (count === 0) {
    emptyContainer?.classList.remove('hidden');
    listContainer.classList.add('hidden');
  } else {
    emptyContainer?.classList.add('hidden');
    listContainer.classList.remove('hidden');
  }
}

function openKpiPreviewModal() {
  const overlay = document.getElementById('kpi-preview-overlay');
  if (!overlay) return;
  
  overlay.classList.remove('hidden');
  overlay.classList.add('flex');
  
  const searchInput = document.getElementById('modal-kpi-search');
  if (searchInput) searchInput.value = '';
  renderDiscoveredKpis();
  
  const modalBox = overlay.querySelector('.bg-white');
  if (window.gsap) {
    gsap.killTweensOf([overlay, modalBox]);
    gsap.fromTo(overlay, 
      { opacity: 0 }, 
      { opacity: 1, duration: 0.3, ease: 'power2.out' }
    );
    gsap.fromTo(modalBox, 
      { scale: 0.95, y: 15, opacity: 0 }, 
      { scale: 1, y: 0, opacity: 1, duration: 0.35, ease: 'back.out(1.2)' }
    );
  }
}

function closeKpiPreviewModal() {
  const overlay = document.getElementById('kpi-preview-overlay');
  if (!overlay) return;
  
  const modalBox = overlay.querySelector('.bg-white');
  if (window.gsap) {
    gsap.killTweensOf([overlay, modalBox]);
    gsap.to(modalBox, { 
      scale: 0.95, y: 15, opacity: 0, duration: 0.25, ease: 'power2.in' 
    });
    gsap.to(overlay, { 
      opacity: 0, duration: 0.25, ease: 'power2.in', 
      onComplete: () => {
        overlay.classList.add('hidden');
        overlay.classList.remove('flex');
      }
    });
  } else {
    overlay.classList.add('hidden');
    overlay.classList.remove('flex');
  }
}

function setupKpiPreviewModalHandlers() {
  const previewBtn = document.getElementById('p2-view-discovered-btn');
  const closeBtnHeader = document.getElementById('close-kpi-preview-modal');
  const closeBtnFooter = document.getElementById('close-kpi-preview-modal-footer');
  const searchInput = document.getElementById('modal-kpi-search');

  previewBtn?.addEventListener('click', openKpiPreviewModal);
  closeBtnHeader?.addEventListener('click', closeKpiPreviewModal);
  closeBtnFooter?.addEventListener('click', closeKpiPreviewModal);
  
  searchInput?.addEventListener('input', (e) => {
    renderDiscoveredKpis(e.target.value);
  });
}

function setupStepperClicks() {
  document.querySelectorAll('.step-item').forEach(item => {
    item.addEventListener('click', () => {
      const stepNum = parseInt(item.dataset.step);
      if (stepNum <= state.phase) {
        if (stepNum === state.phase) return;
        
        if (stepNum === 1) {
          showPhase(1);
          handleEditAnswer(0);
          resetStepperToActiveStep(1);
        } else if (stepNum === 2) {
          showPhase(2);
          initPhase2();
          resetStepperToActiveStep(2);
        } else if (stepNum === 3) {
          showPhase(3);
          initPhase3();
          resetStepperToActiveStep(3);
        } else if (stepNum === 4) {
          showPhase(4);
          initPhase4();
          resetStepperToActiveStep(4);
        } else if (stepNum === 5) {
          showPhase(5);
          resetStepperToActiveStep(5);
        }
      } else {
        showToast('Please complete the current setup step first.', 'info');
      }
    });
  });
}

// ─── INIT ───────────────────────────────────────────────
function runWelcomeAnimation() {
  const overlay = document.getElementById('welcome-overlay');
  if (!overlay) {
    initPhase1();
    return;
  }

  const title = document.getElementById('welcome-title');
  const sub = document.getElementById('welcome-sub');
  const progWrap = document.getElementById('welcome-progress-wrap');
  const progBar = document.getElementById('welcome-progress');
  const statusText = document.getElementById('welcome-status');

  // GSAP Entrance
  const tl = gsap.timeline();
  tl.to(title, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' })
    .to(sub, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')
    .to([progWrap, statusText], { opacity: 1, duration: 0.3 }, '-=0.2');

  // Simulate loading steps
  const statuses = [
    { text: 'Initializing BI Brain...', pct: 20 },
    { text: 'Connecting to SmartBI Core...', pct: 50 },
    { text: 'Loading Workspace Components...', pct: 85 },
    { text: 'BI Brain Activated!', pct: 100 }
  ];

  let step = 0;
  const runLoadingStep = () => {
    if (step >= statuses.length) {
      // Fade out overlay and remove it
      setTimeout(() => {
        gsap.to(overlay, {
          opacity: 0,
          scale: 1.05,
          duration: 0.5,
          ease: 'power2.inOut',
          onComplete: () => {
            overlay.remove();
            initPhase1();
          }
        });
      }, 500);
      return;
    }

    const current = statuses[step];
    statusText.textContent = current.text;
    progBar.style.width = `${current.pct}%`;
    step++;

    const delay = step === 1 ? 500 : (step === 2 ? 600 : (step === 3 ? 700 : 400));
    setTimeout(runLoadingStep, delay);
  };

  // Start the loading sequence after entrance finishes
  tl.call(() => {
    setTimeout(runLoadingStep, 200);
  });
}

function setupPhase2Controls() {
  setupP2Tabs();
  setupP2FileUpload();
  setupP2ConnectBtn();
}

function setupPhase3Controls() {
  setupRoles();
  setupTeamUpload();
  setupInvite();

  const p3RolesBack = document.getElementById('p3-roles-back');
  if (p3RolesBack && !p3RolesBack.dataset.bound) {
    p3RolesBack.dataset.bound = 'true';
    p3RolesBack.addEventListener('click', () => showPhase(2));
  }

  const p3RolesNext = document.getElementById('p3-roles-next');
  if (p3RolesNext && !p3RolesNext.dataset.bound) {
    p3RolesNext.dataset.bound = 'true';
    p3RolesNext.addEventListener('click', () => goP3Sub('teams'));
  }

  const p3TeamsBack = document.getElementById('p3-teams-back');
  if (p3TeamsBack && !p3TeamsBack.dataset.bound) {
    p3TeamsBack.dataset.bound = 'true';
    p3TeamsBack.addEventListener('click', () => goP3Sub('roles'));
  }

  const p3TeamsSkip = document.getElementById('p3-teams-skip');
  if (p3TeamsSkip && !p3TeamsSkip.dataset.bound) {
    p3TeamsSkip.dataset.bound = 'true';
    p3TeamsSkip.addEventListener('click', () => goP3Sub('invite'));
  }

  const p3TeamsNext = document.getElementById('p3-teams-next');
  if (p3TeamsNext && !p3TeamsNext.dataset.bound) {
    p3TeamsNext.dataset.bound = 'true';
    p3TeamsNext.addEventListener('click', () => goP3Sub('invite'));
  }

  const p3InviteBack = document.getElementById('p3-invite-back');
  if (p3InviteBack && !p3InviteBack.dataset.bound) {
    p3InviteBack.dataset.bound = 'true';
    p3InviteBack.addEventListener('click', () => goP3Sub('teams'));
  }

  const p3InviteSkip = document.getElementById('p3-invite-skip');
  if (p3InviteSkip && !p3InviteSkip.dataset.bound) {
    p3InviteSkip.dataset.bound = 'true';
    p3InviteSkip.addEventListener('click', () => advanceToPhase4());
  }

  const p3InviteNext = document.getElementById('p3-invite-next');
  if (p3InviteNext && !p3InviteNext.dataset.bound) {
    p3InviteNext.dataset.bound = 'true';
    p3InviteNext.addEventListener('click', () => advanceToPhase4());
  }
}

function setupPhase5Controls() {
  document.querySelectorAll('.p5-edit').forEach(btn => {
    if (!btn.dataset.bound) {
      btn.dataset.bound = 'true';
      btn.addEventListener('click', () => {
        const target = parseInt(btn.dataset.goto);
        if (target <= 3) {
          showPhase(target);
          if (target === 1) handleEditAnswer(0);
          if (target === 2) initPhase2();
          if (target === 3) initPhase3();
          resetStepperToActiveStep(target);
        } else if (target === 4) {
          showPhase(4);
          resetStepperToActiveStep(4);
        }
      });
    }
  });

  const p5Launch = document.getElementById('p5-launch');
  if (p5Launch && !p5Launch.dataset.bound) {
    p5Launch.dataset.bound = 'true';
    p5Launch.addEventListener('click', () => {
      const portal = document.getElementById('launch-portal');
      if (!portal) {
        window.location.href = 'dashboard.html';
        return;
      }
      
      // Make portal visible
      portal.classList.remove('hidden');
      portal.classList.add('flex');
      
      const progress = document.getElementById('launch-progress');
      const pctLabel = document.getElementById('launch-pct');
      
      // Animate entry with GSAP
      gsap.fromTo(portal, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' });
      gsap.fromTo(portal.querySelector('.relative'), { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.2)' });
      
      const steps = [
        { id: 'lp-status-1', pct: 25, duration: 1200 },
        { id: 'lp-status-2', pct: 55, duration: 1500 },
        { id: 'lp-status-3', pct: 80, duration: 1200 },
        { id: 'lp-status-4', pct: 100, duration: 1000 }
      ];
      
      let currentStep = 0;
      const executeStep = () => {
        if (currentStep >= steps.length) {
          setTimeout(() => {
            gsap.to(portal, {
              opacity: 0,
              scale: 1.05,
              duration: 0.5,
              ease: 'power2.inOut',
              onComplete: () => {
                window.location.href = 'dashboard.html';
              }
            });
          }, 650);
          return;
        }
        
        const stepData = steps[currentStep];
        const el = document.getElementById(stepData.id);
        if (el) {
          el.classList.remove('opacity-30');
          el.classList.add('opacity-100');
          const icon = el.querySelector('.lp-step-icon');
          if (icon) {
            icon.textContent = 'autorenew';
            icon.classList.remove('text-slate-500');
            icon.classList.add('animate-spin', 'text-primary');
          }
        }
        
        let startPct = currentStep === 0 ? 0 : steps[currentStep - 1].pct;
        let targetPct = stepData.pct;
        let startTime = performance.now();
        
        const animateProgress = (now) => {
          let elapsed = now - startTime;
          let p = Math.min(elapsed / stepData.duration, 1);
          
          // Easing progress percentage slightly
          let currentPct = Math.round(startPct + p * (targetPct - startPct));
          if (progress) progress.style.width = `${currentPct}%`;
          if (pctLabel) pctLabel.textContent = `${currentPct}% Completed`;
          
          if (p < 1) {
            requestAnimationFrame(animateProgress);
          } else {
            if (el) {
              const icon = el.querySelector('.lp-step-icon');
              if (icon) {
                icon.textContent = 'check_circle';
                icon.classList.remove('animate-spin', 'text-primary');
                icon.classList.add('text-success');
                icon.style.color = '#10b981';
              }
            }
            currentStep++;
            setTimeout(executeStep, 400); // Small pause between steps for human-readable flow
          }
        };
        requestAnimationFrame(animateProgress);
      };
      
      // Start the deploy steps sequence after a brief entrance pause
      setTimeout(executeStep, 500);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Start with welcome animation
  runWelcomeAnimation();

  // Setup stepper click listeners and KPI preview handlers
  setupStepperClicks();
  setupKpiPreviewModalHandlers();
  setupPhase2Controls();
  setupPhase3Controls();
  setupKpiControls();
  setupPhase5Controls();

  // --- Sidebar Collapse Logic (responsive without media queries) ---
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.querySelector("main");
  const mainHeader = document.getElementById("main-header");
  const toggleBtn = document.getElementById("sidebar-toggle");

  const updateSidebarState = () => {
    if (!sidebar || !mainContent || !mainHeader) return;
    const width = window.innerWidth;
    if (width < 1024) {
      sidebar.classList.add("sidebar-collapsed");
      mainContent.classList.add("content-collapsed");
      mainHeader.classList.add("header-collapsed");
    } else {
      sidebar.classList.remove("sidebar-collapsed");
      mainContent.classList.remove("content-collapsed");
      mainHeader.classList.remove("header-collapsed");
    }
  };

  updateSidebarState();
  window.addEventListener("resize", updateSidebarState);

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      if (!sidebar || !mainContent || !mainHeader) return;
      sidebar.classList.toggle("sidebar-collapsed");
      mainContent.classList.toggle("content-collapsed");
      mainHeader.classList.toggle("header-collapsed");
      
      if (window.gsap) {
        gsap.fromTo(
          ".logo-text, .nav-text, .help-logout-text",
          { opacity: 0 },
          { opacity: 1, duration: 0.3, stagger: 0.05, ease: "power2.out" }
        );
      }
    });
  }

  // Animate entrance
  gsap.from('#phase-wrapper', { opacity: 0, y: 20, duration: 0.6, ease: 'power3.out', delay: 0.1 });
});

