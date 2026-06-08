/**
 * goal.js — Goal Section Pop-Up & AI Chat Loop
 *
 * initGoalPopUp: IntersectionObserver fires spring animation when cards enter viewport.
 * initAIChatLoop: Types queries, shows loader, renders SVG charts in a loop.
 */

window.SmartBI_Goal = {
  init() {
    this.initGoalPopUp();
    this.initAIChatLoop();
  },

  /**
   * Push-Notification Pop-Up Animation
   * Watches the goal section and fires .is-visible on each card
   * as soon as 15% of the card enters the viewport.
   */
  initGoalPopUp() {
    const goalCard = document.querySelector('.goal-card');
    const aiCard   = document.querySelector('.ai-interactive-card');
    const targets  = [goalCard, aiCard].filter(Boolean);

    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // fire only once
          }
        });
      },
      { threshold: 0.15 }
    );

    targets.forEach((el) => observer.observe(el));
  },

  /**
   * AI Conversational Search Assistant Loop
   * Types out business queries, runs loader, and renders SVG charts in loop.
   */
  initAIChatLoop() {
    const inputField = document.getElementById('ai-query-input');
    const sendBtn    = document.getElementById('ai-send-btn');
    const chartSlot  = document.getElementById('ai-chart-slot');
    const loader     = document.getElementById('ai-loader');

    if (!inputField || !chartSlot || !loader) return;

    // Welcome State rendering
    const welcomeHtml = `
      <div class="ai-welcome-state" style="text-align:center; padding:20px; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; width:100%; animation: fade-in-up 0.5s ease-out;">
        <div class="ai-sparkle-icon" style="margin-bottom:12px; font-size:24px; color:#7C3BED; display:inline-block; animation: pulse-sparkle 2.2s infinite ease-in-out;">✨</div>
        <div style="font-weight:600; font-size:13px; color:#232020; margin-bottom:4px;">SMarBI Concept & Goal Demo</div>
        <div style="font-size:10px; color:#717171; max-width:280px; line-height:1.5; margin-bottom:14px;">Simulating SMarBI's conversational analytics, zero-tech dashboard designs, and no-code calculations.</div>
      </div>
    `;

    chartSlot.innerHTML = welcomeHtml;

    // Inject welcome state keyframes once
    if (!document.getElementById('ai-sim-styles')) {
      const style = document.createElement('style');
      style.id = 'ai-sim-styles';
      style.innerHTML = `
        @keyframes pulse-sparkle {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.8; }
          50% { transform: scale(1.15) rotate(15deg); opacity: 1; filter: drop-shadow(0 0 4px #7C3BED); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `;
      document.head.appendChild(style);
    }

    const scenarios = [
      // 1. Concept & Goal
      {
        text: "Explain SMarBI's core concept and goal",
        run(onComplete) {
          chartSlot.innerHTML = `<div class="ai-chat-thread" id="chat-thread"></div>`;
          const thread = chartSlot.querySelector('#chat-thread');
          
          loader.style.display = 'flex';
          
          setTimeout(() => {
            loader.style.display = 'none';
            
            // Add User bubble
            thread.innerHTML += `<div class="ai-msg-bubble user">Explain SMarBI's core concept and goal</div>`;
            thread.scrollTop = thread.scrollHeight;
            
            setTimeout(() => {
              // Add System bubble 1
              thread.innerHTML += `<div class="ai-msg-bubble system">SMarBI is designed to solve high cognitive load in traditional BI by shifting from SQL database joining to natural language conversation.</div>`;
              thread.scrollTop = thread.scrollHeight;
              
              setTimeout(() => {
                // Add System bubble 2
                thread.innerHTML += `<div class="ai-msg-bubble system">SMarBI handles data ingestion, automatic schema parsing, and metric dictionary generation. The goal is to let business operators explore data naturally, design metrics without code, and automatically generate visual widgets.</div>`;
                thread.scrollTop = thread.scrollHeight;
                
                setTimeout(() => {
                  // Add SVG Concept Pipeline
                  thread.innerHTML += `
                    <div class="ai-chat-chart-wrapper" style="height: 140px;">
                      <svg class="ai-svg-chart" viewBox="0 0 320 130">
                        <text x="160" y="15" class="ai-svg-text-title" text-anchor="middle">SMarBI Concept Pipeline</text>
                        
                        <!-- Flow Nodes -->
                        <rect x="15" y="32" width="75" height="20" fill="#1E293B" rx="6" />
                        <text x="52.5" y="44" font-family="var(--font-family)" font-size="7.5px" font-weight="600" fill="#F8FAFC" text-anchor="middle">Raw Data</text>
                        
                        <rect x="120" y="32" width="80" height="20" fill="#7C3BED" rx="6" />
                        <text x="160" y="44" font-family="var(--font-family)" font-size="7.5px" font-weight="700" fill="#FFFFFF" text-anchor="middle">SMarBI AI Brain</text>
                        
                        <rect x="230" y="32" width="75" height="20" fill="#1E293B" rx="6" />
                        <text x="267.5" y="44" font-family="var(--font-family)" font-size="7.5px" font-weight="600" fill="#F8FAFC" text-anchor="middle">Dashboard</text>
                        
                        <!-- Connectors -->
                        <path d="M 90 42 L 120 42" stroke="#7C3BED" stroke-width="1.5" stroke-dasharray="3 3" />
                        <path d="M 200 42 L 230 42" stroke="#7C3BED" stroke-width="1.5" stroke-dasharray="3 3" />
                        
                        <!-- Details -->
                        <rect x="15" y="65" width="290" height="48" fill="#FAF8F5" stroke="#ECEEEF" stroke-width="1" rx="8" />
                        <text x="160" y="80" font-family="var(--font-family)" font-size="7px" font-weight="700" fill="#232020" text-anchor="middle">Goal: Solve cognitive load and SQL/DAX complexity</text>
                        <text x="160" y="95" font-family="var(--font-family)" font-size="6.5px" fill="#717171" text-anchor="middle">✓ Zero manual schema mapping  ·  ✓ Ephemeral Insights  ·  ✓ Auto-dashboarding</text>
                      </svg>
                    </div>
                  `;
                  
                  thread.scrollTop = thread.scrollHeight;
                  setTimeout(onComplete, 6000);
                }, 800);
              }, 1000);
            }, 800);
          }, 1200);
        }
      },
      
      // 2. Zero-Tech Dashboards (Design & Widgets)
      {
        text: "How are dashboard widgets designed?",
        run(onComplete) {
          chartSlot.innerHTML = `<div class="ai-chat-thread" id="chat-thread"></div>`;
          const thread = chartSlot.querySelector('#chat-thread');
          
          loader.style.display = 'flex';
          
          setTimeout(() => {
            loader.style.display = 'none';
            
            // Add User bubble
            thread.innerHTML += `<div class="ai-msg-bubble user">How are dashboard widgets designed?</div>`;
            thread.scrollTop = thread.scrollHeight;
            
            setTimeout(() => {
              // Add System bubble
              thread.innerHTML += `<div class="ai-msg-bubble system">SMarBI features a Zero-Tech Dashboard with auto-building widgets. Consecutive queries sequentially cycle through three widget designs: <strong>Strategic Progress</strong>, <strong>Segmented Donut</strong>, and <strong>Trend Line</strong>.</div>`;
              thread.scrollTop = thread.scrollHeight;
              
              setTimeout(() => {
                // Add System bubble 2
                thread.innerHTML += `<div class="ai-msg-bubble system">Cards support interactive customization: double-clicking title headers triggers inline renaming, dragging grids allows sorting, and a hover trash button enables deletion.</div>`;
                thread.scrollTop = thread.scrollHeight;
                
                setTimeout(() => {
                  // Add SVG Widget Showcase
                  thread.innerHTML += `
                    <div class="ai-chat-chart-wrapper" style="height: 140px;">
                      <svg class="ai-svg-chart" viewBox="0 0 320 130">
                        <text x="160" y="15" class="ai-svg-text-title" text-anchor="middle">Zero-Tech Widget Cycle</text>
                        
                        <!-- Progress Bar Widget -->
                        <g transform="translate(8, 25)">
                          <rect x="0" y="0" width="92" height="75" fill="#FFFFFF" stroke="#ECEEEF" stroke-width="1" rx="8" />
                          <text x="10" y="16" font-family="var(--font-family)" font-size="6.5px" font-weight="600" fill="#717171">Revenue Widget</text>
                          <text x="10" y="32" font-family="var(--font-family)" font-size="11px" font-weight="700" fill="#0F172A">$124.5K</text>
                          <rect x="10" y="44" width="72" height="5" fill="#E2E8F0" rx="2.5" />
                          <rect x="10" y="44" width="55" height="5" fill="#7C3BED" rx="2.5" />
                          <line x1="68" y1="40" x2="68" y2="53" stroke="#EF4444" stroke-width="1" />
                          <text x="10" y="62" font-family="var(--font-family)" font-size="5.5px" fill="#10B981">108% of Q2 Goal</text>
                        </g>
                        
                        <!-- Donut Widget -->
                        <g transform="translate(114, 25)">
                          <rect x="0" y="0" width="92" height="75" fill="#FFFFFF" stroke="#ECEEEF" stroke-width="1" rx="8" />
                          <text x="10" y="16" font-family="var(--font-family)" font-size="6.5px" font-weight="600" fill="#717171">Acquisition</text>
                          <circle cx="46" cy="42" r="16" fill="none" stroke="#E2E8F0" stroke-width="6" />
                          <circle cx="46" cy="42" r="16" fill="none" stroke="#7C3BED" stroke-width="6" stroke-dasharray="100.5" stroke-dashoffset="35" transform="rotate(-90 46 42)" />
                          <text x="46" y="45" font-family="var(--font-family)" font-size="8px" font-weight="700" fill="#0F172A" text-anchor="middle">65%</text>
                          <text x="10" y="65" font-family="var(--font-family)" font-size="5.5px" fill="#717171">Organic traffic lead</text>
                        </g>
                        
                        <!-- Trend Line -->
                        <g transform="translate(220, 25)">
                          <rect x="0" y="0" width="92" height="75" fill="#FFFFFF" stroke="#ECEEEF" stroke-width="1" rx="8" />
                          <text x="10" y="16" font-family="var(--font-family)" font-size="6.5px" font-weight="600" fill="#717171">MoM Growth</text>
                          <path d="M 10 52 Q 30 32 50 42 T 82 25" fill="none" stroke="#7C3BED" stroke-width="2" />
                          <circle cx="82" cy="25" r="3" fill="#7C3BED" />
                          <text x="10" y="65" font-family="var(--font-family)" font-size="6px" font-weight="600" fill="#10B981">+14.3% MoM</text>
                        </g>
                        
                        <text x="160" y="118" font-family="var(--font-family)" font-size="6.5px" fill="#717171" text-anchor="middle">Design: Cycle widgets, rename headers inline, drag-and-drop sort</text>
                      </svg>
                    </div>
                  `;
                  
                  thread.scrollTop = thread.scrollHeight;
                  setTimeout(onComplete, 6000);
                }, 800);
              }, 1200);
            }, 800);
          }, 1200);
        }
      },
      
      // 3. Calculated Metrics Builder (Concept & Design)
      {
        text: "How do I build calculated metrics?",
        run(onComplete) {
          chartSlot.innerHTML = `<div class="ai-chat-thread" id="chat-thread"></div>`;
          const thread = chartSlot.querySelector('#chat-thread');
          
          loader.style.display = 'flex';
          
          setTimeout(() => {
            loader.style.display = 'none';
            
            // Add User bubble
            thread.innerHTML += `<div class="ai-msg-bubble user">How do I build calculated metrics?</div>`;
            thread.scrollTop = thread.scrollHeight;
            
            setTimeout(() => {
              // Add System bubble 1
              thread.innerHTML += `<div class="ai-msg-bubble system">Using SMarBI's non-technical Calculated Metrics Builder, users select pre-built math patterns (Divide, Growth MoM, Sum, Product) instead of SQL/DAX formulas.</div>`;
              thread.scrollTop = thread.scrollHeight;
              
              setTimeout(() => {
                // Add System bubble 2
                thread.innerHTML += `<div class="ai-msg-bubble system">Simply name the metric, pick Metric A and Metric B from visual dropdown lists, and click 'Create'. The card is calculated instantly and injected into the active dashboard workspace.</div>`;
                thread.scrollTop = thread.scrollHeight;
                
                setTimeout(() => {
                  // Add SVG Formula Creator
                  thread.innerHTML += `
                    <div class="ai-chat-chart-wrapper" style="height: 140px;">
                      <svg class="ai-svg-chart" viewBox="0 0 320 130">
                        <text x="160" y="15" class="ai-svg-text-title" text-anchor="middle">Calculated Metrics Builder</text>
                        
                        <!-- Formula Card Mockup -->
                        <g transform="translate(35, 22)">
                          <rect x="0" y="0" width="250" height="78" fill="#FFFFFF" stroke="#7C3BED" stroke-width="1.5" rx="10" />
                          <rect x="0" y="0" width="250" height="20" fill="#F3E8FF" rx="10" />
                          <text x="12" y="13" font-family="var(--font-family)" font-size="8px" font-weight="700" fill="#7C3BED">Calculated Metric Creator</text>
                          
                          <text x="12" y="34" font-family="var(--font-family)" font-size="7px" font-weight="600" fill="#64748B">Formula Pattern: <span style="font-weight:700; color:#7C3BED;">Divide (Metric A / Metric B)</span></text>
                          <text x="12" y="45" font-family="var(--font-family)" font-size="7px" font-weight="600" fill="#64748B">Target inputs: <span style="color:#0F172A; font-weight:700;">Revenue / Orders</span></text>
                          
                          <line x1="12" y1="52" x2="238" y2="52" stroke="#ECEEEF" stroke-width="1" />
                          
                          <!-- Output Card preview -->
                          <text x="12" y="67" font-family="var(--font-family)" font-size="8.5px" font-weight="700" fill="#0F172A">Average Order Value: $43.73</text>
                          <text x="238" y="67" font-family="var(--font-family)" font-size="6.5px" font-weight="600" fill="#10B981" text-anchor="end">✓ Injected successfully</text>
                        </g>
                        
                        <text x="160" y="118" font-family="var(--font-family)" font-size="6.5px" fill="#717171" text-anchor="middle">Concept: Zero-code metric cards bound to active dashboard grid</text>
                      </svg>
                    </div>
                  `;
                  
                  thread.scrollTop = thread.scrollHeight;
                  setTimeout(onComplete, 7000);
                }, 800);
              }, 1200);
            }, 800);
          }, 1200);
        }
      }
    ];

    let currentIdx = 0;
    let mainLoopTimeout = null;

    const playScenario = () => {
      const s = scenarios[currentIdx];
      inputField.setAttribute('placeholder', '');
      
      const cursor = document.querySelector('.ai-input-cursor');
      if (cursor) { cursor.style.display = "inline"; cursor.style.transform = "translateX(0px)"; }
      
      let charIdx = 0, typedText = '';
      
      const typeText = () => {
        if (charIdx < s.text.length) {
          typedText += s.text[charIdx];
          inputField.value = typedText;
          if (cursor) cursor.style.transform = `translateX(${typedText.length * 6.8}px)`;
          charIdx++;
          mainLoopTimeout = setTimeout(typeText, 60 + Math.random() * 40);
        } else {
          if (cursor) cursor.style.display = "none";
          
          mainLoopTimeout = setTimeout(() => {
            if (sendBtn) {
              sendBtn.style.transform = "scale(0.86)";
              setTimeout(() => { sendBtn.style.transform = "scale(1)"; }, 120);
            }
            
            mainLoopTimeout = setTimeout(() => {
              inputField.value = '';
              s.run(() => {
                currentIdx = (currentIdx + 1) % scenarios.length;
                mainLoopTimeout = setTimeout(playScenario, 1500);
              });
            }, 600);
          }, 800);
        }
      };
      
      typeText();
    };

    mainLoopTimeout = setTimeout(playScenario, 2500);
  }
};
