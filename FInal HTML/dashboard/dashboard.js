/* Dashboard Logic & Animations (dashboard/dashboard.js) */

document.addEventListener("DOMContentLoaded", () => {
  // --- Sidebar Collapse Logic (responsive without media queries) ---
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("main-content");
  const mainHeader = document.getElementById("main-header");
  const toggleBtn = document.getElementById("sidebar-toggle");

  // Global query input reference
  const queryInput = document.getElementById("ask-ai-input");

  // Toast System
  const showToast = (message, type = 'success') => {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "pointer-events-auto flex items-center gap-2.5 py-2 px-3.5 bg-white/95 backdrop-blur-md border border-outline rounded-xl shadow-lg transition-all duration-300 transform -translate-y-10 opacity-0 min-w-[200px]";
    
    const icon = type === 'success' ? 'check_circle' : 'info';
    const iconColor = type === 'success' ? 'text-success' : 'text-primary';

    toast.innerHTML = `
      <span class="material-symbols-outlined ${iconColor} text-[18px]" style="font-variation-settings: 'FILL' 1;">${icon}</span>
      <span class="text-[10px] font-semibold text-on-surface font-body">${message}</span>
    `;

    container.appendChild(toast);

    gsap.to(toast, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: "power3.out"
    });

    setTimeout(() => {
      gsap.to(toast, {
        opacity: 0,
        y: -10,
        duration: 0.35,
        ease: "power2.in",
        onComplete: () => {
          toast.remove();
        }
      });
    }, 3000);
  };

  // Voice Mic Simulation State
  const voiceBtn = document.getElementById("voice-input-btn");
  let isRecording = false;
  let voiceTimeout = null;

  const updateSidebarState = () => {
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
      sidebar.classList.toggle("sidebar-collapsed");
      mainContent.classList.toggle("content-collapsed");
      mainHeader.classList.toggle("header-collapsed");
      
      gsap.fromTo(
        ".logo-text, .nav-text, .help-logout-text",
        { opacity: 0 },
        { opacity: 1, duration: 0.3, stagger: 0.05, ease: "power2.out" }
      );
    });
  }

  // --- Popover Dropdowns Toggle Logic (Helper Function) ---
  const registerDropdown = (triggerEl, menuEl) => {
    if (!triggerEl || !menuEl) return;
    
    triggerEl.addEventListener("click", (e) => {
      e.stopPropagation();
      
      // Close other dropdowns first
      closeAllDropdowns(menuEl);
      
      const isVisible = !menuEl.classList.contains("opacity-0") && !menuEl.classList.contains("hidden");
      if (isVisible) {
        gsap.to(menuEl, {
          opacity: 0,
          y: -10,
          duration: 0.2,
          onComplete: () => {
            menuEl.classList.add("opacity-0", "hidden");
          }
        });
      } else {
        menuEl.classList.remove("hidden");
        // Simple force layout reflow
        menuEl.offsetHeight;
        menuEl.classList.remove("opacity-0");
        gsap.fromTo(menuEl, 
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }
        );
      }
    });
  };

  // Close all open dropdown menus except the active one
  const closeAllDropdowns = (exceptMenu = null) => {
    const menus = [
      { el: document.getElementById("notifications-menu"), type: "hide" },
      { el: document.getElementById("profile-menu"), type: "hide" },
      { el: document.getElementById("chat-context-menu"), type: "hide" },
      { el: document.getElementById("history-panel"), type: "hide" },
      { el: document.getElementById("dashboard-select-menu"), type: "hide" }
    ];

    menus.forEach(m => {
      if (m.el && m.el !== exceptMenu && !m.el.classList.contains("hidden") && !m.el.classList.contains("opacity-0")) {
        if (m.type === "fade") {
          gsap.to(m.el, {
            opacity: 0,
            y: -10,
            duration: 0.15,
            onComplete: () => {
              m.el.classList.add("opacity-0", "invisible");
            }
          });
        } else {
          gsap.to(m.el, {
            opacity: 0,
            y: -10,
            duration: 0.15,
            onComplete: () => {
              m.el.classList.add("opacity-0", "hidden");
            }
          });
        }
      }
    });
  };

  registerDropdown(document.getElementById("notifications-toggle"), document.getElementById("notifications-menu"));
  registerDropdown(document.getElementById("profile-toggle"), document.getElementById("profile-menu"));
  registerDropdown(document.getElementById("chat-context-toggle"), document.getElementById("chat-context-menu"));
  registerDropdown(document.getElementById("dashboard-select-toggle"), document.getElementById("dashboard-select-menu"));

  // Global outer-click closes dropdowns & voice mic recording
  document.addEventListener("click", () => {
    closeAllDropdowns();
    if (isRecording) {
      if (voiceTimeout) clearTimeout(voiceTimeout);
      isRecording = false;
      if (voiceBtn) {
        voiceBtn.classList.remove("text-error", "animate-pulse");
        voiceBtn.style.borderColor = "";
      }
      if (queryInput) {
        queryInput.placeholder = "Type your request: I'll search, answer, or build it for you.";
      }
    }
  });

  // --- Voice Mic Simulation Interaction ---
  if (voiceBtn && queryInput) {
    voiceBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      isRecording = !isRecording;
      if (isRecording) {
        // Close other panels first
        closeAllDropdowns();
        voiceBtn.classList.add("text-error", "animate-pulse");
        voiceBtn.style.borderColor = "rgba(239, 68, 68, 0.4)";
        queryInput.placeholder = "Listening... Speak now.";
        queryInput.value = "";
        
        voiceTimeout = setTimeout(() => {
          if (isRecording) {
            queryInput.value = "Show me last month's active user growth stats";
            isRecording = false;
            voiceBtn.classList.remove("text-error", "animate-pulse");
            voiceBtn.style.borderColor = "";
            queryInput.placeholder = "Type your request: I'll search, answer, or build it for you.";
            gsap.fromTo(queryInput, { opacity: 0.5 }, { opacity: 1, duration: 0.3 });
          }
        }, 2200);
      } else {
        if (voiceTimeout) clearTimeout(voiceTimeout);
        voiceBtn.classList.remove("text-error", "animate-pulse");
        voiceBtn.style.borderColor = "";
        queryInput.placeholder = "Type your request: I'll search, answer, or build it for you.";
      }
    });
  }

  // --- Top Dashboard Selection Switcher (Interactive Mock Data Reload) ---
  let activeDashboardName = "Main Dashboard";

  // Dynamic Widgets State Database (loaded from localStorage or initialized)
  const storedWidgets = localStorage.getItem("SmartBI_dashboard_widgets");
  const dashboardWidgets = storedWidgets ? JSON.parse(storedWidgets) : {
    "Main Dashboard": [],
    "Operations Overview": [],
    "Financials": [],
    "Team Performance": []
  };

  const storedSectionNames = localStorage.getItem("SmartBI_dashboard_section_names");
  const dashboardSectionNames = storedSectionNames ? JSON.parse(storedSectionNames) : {
    "Main Dashboard": "Custom Widgets",
    "Operations Overview": "Custom Widgets",
    "Financials": "Custom Widgets",
    "Team Performance": "Custom Widgets"
  };

  let draggedWidgetId = null;
  let draggedElement = null;

  const renderWidgets = () => {
    const activeDashboard = activeDashboardName;
    const widgets = dashboardWidgets[activeDashboard] || [];
    const section = document.getElementById("dynamic-widgets-section");
    const grid = document.getElementById("dynamic-widgets-grid");

    if (!section || !grid) return;

    // Load active dashboard's section name
    const titleEl = document.getElementById("dynamic-widgets-title");
    const titleText = dashboardSectionNames[activeDashboard] || "Custom Widgets";
    if (titleEl && !titleEl.classList.contains("hidden")) {
      titleEl.innerText = titleText;
    }

    if (widgets.length === 0) {
      section.classList.add("hidden");
      grid.innerHTML = "";
    } else {
      section.classList.remove("hidden");
      grid.innerHTML = widgets.map(w => {
        let cardContent = "";

        if (w.type === "pie") {
          // --- Pie Chart Layout ---
          let metric = "45% Direct";
          let subtext = "Marketing Traffic Distribution Channels";
          let indicatorClass = "bg-success/15 text-success";
          let indicatorTrend = "trending_up";
          let indicatorDiff = "+12.4% MoM";
          let comment = "<strong>Executive Summary:</strong> Organic and Direct channels remain the largest sources of high-LTV traffic. Social campaigns grew by 25% but have lower checkout conversion.";

          cardContent = `
            <!-- Card Header -->
            <div class="flex items-start justify-between mb-3">
              <div class="min-w-0 flex-1 pr-2">
                <span class="text-[8px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full uppercase tracking-wider">CEO Strategic KPI</span>
                <h4 class="text-[10.5px] font-bold text-on-surface uppercase tracking-wider mt-1 truncate" title="${w.title}">${w.title}</h4>
                <p class="text-[9px] text-on-surface-variant/60">${subtext}</p>
              </div>
              <div class="flex items-center gap-1.5 flex-shrink-0 min-h-[28px]" id="action-container-${w.id}">
                <span class="material-symbols-outlined text-[15px] text-on-surface-variant/40 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-all duration-200 select-none" title="Drag to reorder">drag_indicator</span>
                <button class="delete-widget-btn p-1 text-on-surface-variant hover:text-error hover:bg-error/5 rounded flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer" data-widget-id="${w.id}" title="Remove Widget">
                  <span class="material-symbols-outlined text-[15px]">delete</span>
                </button>
              </div>
            </div>
            
            <!-- KPI Value -->
            <div class="flex items-baseline gap-2 mb-2">
              <span class="font-display font-bold text-xl text-on-surface">${metric}</span>
              <span class="text-[9px] font-bold ${indicatorClass} px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <span class="material-symbols-outlined text-[10px]" style="font-variation-settings: 'FILL' 1;">${indicatorTrend}</span> ${indicatorDiff}
              </span>
            </div>

            <!-- Pie Chart SVG -->
            <div class="py-3 flex items-center justify-center relative">
              <svg class="w-20 h-20 transform -rotate-90" viewBox="0 0 64 64">
                <circle r="15.915" cx="32" cy="32" fill="transparent" stroke="#7c3bed" stroke-width="31.83" stroke-dasharray="45 100" stroke-dashoffset="0" />
                <circle r="15.915" cx="32" cy="32" fill="transparent" stroke="#a855f7" stroke-width="31.83" stroke-dasharray="25 100" stroke-dashoffset="-45" />
                <circle r="15.915" cx="32" cy="32" fill="transparent" stroke="#3b82f6" stroke-width="31.83" stroke-dasharray="20 100" stroke-dashoffset="-70" />
                <circle r="15.915" cx="32" cy="32" fill="transparent" stroke="#ec4899" stroke-width="31.83" stroke-dasharray="10 100" stroke-dashoffset="-90" />
              </svg>
            </div>
            
            <!-- Legend -->
            <div class="mt-2 pt-2 border-t border-outline/50 grid grid-cols-2 gap-1.5 text-[8.5px] font-semibold text-on-surface-variant font-body">
              <div class="flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span>
                <span class="truncate">Direct (45%)</span>
              </div>
              <div class="flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0"></span>
                <span class="truncate">Social (25%)</span>
              </div>
              <div class="flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>
                <span class="truncate">Email (20%)</span>
              </div>
              <div class="flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-pink-500 flex-shrink-0"></span>
                <span class="truncate">Referrals (10%)</span>
              </div>
            </div>
            
            <!-- Executive Commentary -->
            <div class="mt-2.5 pt-2.5 border-t border-outline/50 flex items-start gap-1.5">
              <span class="material-symbols-outlined text-primary text-[13px] mt-0.5" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
              <p class="text-[9px] text-on-surface-variant leading-relaxed">
                ${comment}
              </p>
            </div>
          `;
        } else if (w.type === "line") {
          // --- Line Graph Layout ---
          let metric = "+14.3% MoM";
          let subtext = "Active Revenue Performance Index";
          let indicatorClass = "bg-success/15 text-success";
          let indicatorTrend = "trending_up";
          let indicatorDiff = "ARR Target met";
          let comment = "<strong>Executive Summary:</strong> Compound monthly expansion continues to track ahead of estimates. Expansion contracts from current enterprise clients drove 90% of this month's growth.";

          cardContent = `
            <!-- Card Header -->
            <div class="flex items-start justify-between mb-3">
              <div class="min-w-0 flex-1 pr-2">
                <span class="text-[8px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full uppercase tracking-wider">CEO Strategic KPI</span>
                <h4 class="text-[10.5px] font-bold text-on-surface uppercase tracking-wider mt-1 truncate" title="${w.title}">${w.title}</h4>
                <p class="text-[9px] text-on-surface-variant/60">${subtext}</p>
              </div>
              <div class="flex items-center gap-1.5 flex-shrink-0 min-h-[28px]" id="action-container-${w.id}">
                <span class="material-symbols-outlined text-[15px] text-on-surface-variant/40 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-all duration-200 select-none" title="Drag to reorder">drag_indicator</span>
                <button class="delete-widget-btn p-1 text-on-surface-variant hover:text-error hover:bg-error/5 rounded flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer" data-widget-id="${w.id}" title="Remove Widget">
                  <span class="material-symbols-outlined text-[15px]">delete</span>
                </button>
              </div>
            </div>
            
            <!-- KPI Value -->
            <div class="flex items-baseline gap-2 mb-2">
              <span class="font-display font-bold text-xl text-on-surface">${metric}</span>
              <span class="text-[9px] font-bold ${indicatorClass} px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <span class="material-symbols-outlined text-[10px]" style="font-variation-settings: 'FILL' 1;">${indicatorTrend}</span> ${indicatorDiff}
              </span>
            </div>

            <!-- Line Chart SVG -->
            <div class="py-2">
              <svg class="w-full h-16 overflow-visible" viewBox="0 0 100 30">
                <defs>
                  <linearGradient id="line-grad-${w.id}" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#7c3bed" stop-opacity="0.25" />
                    <stop offset="100%" stop-color="#7c3bed" stop-opacity="0.0" />
                  </linearGradient>
                </defs>
                <!-- Target Line -->
                <line x1="0" y1="15" x2="100" y2="15" stroke="#cbd5e1" stroke-width="0.75" stroke-dasharray="2 2" />
                
                <!-- Area -->
                <path d="M 0 30 L 0 25 Q 25 10 50 18 T 100 8 L 100 30 Z" fill="url(#line-grad-${w.id})" />
                
                <!-- Stroke -->
                <path d="M 0 25 Q 25 10 50 18 T 100 8" fill="transparent" stroke="#7c3bed" stroke-width="1.5" />
                
                <!-- Points -->
                <circle cx="0" cy="25" r="1" fill="#7c3bed" stroke="#ffffff" stroke-width="0.3" />
                <circle cx="25" cy="11.5" r="1" fill="#7c3bed" stroke="#ffffff" stroke-width="0.3" />
                <circle cx="50" cy="18" r="1" fill="#7c3bed" stroke="#ffffff" stroke-width="0.3" />
                <circle cx="100" cy="8" r="1" fill="#7c3bed" stroke="#ffffff" stroke-width="0.3" />
              </svg>
              <div class="flex justify-between text-[7px] text-on-surface-variant/60 font-semibold px-1 mt-1 font-body">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr (Current)</span>
              </div>
            </div>
            
            <!-- Executive Commentary -->
            <div class="mt-2.5 pt-2.5 border-t border-outline/50 flex items-start gap-1.5">
              <span class="material-symbols-outlined text-primary text-[13px] mt-0.5" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
              <p class="text-[9px] text-on-surface-variant leading-relaxed">
                ${comment}
              </p>
            </div>
          `;
        } else {
          // --- Progress Chart Layout ---
          let metric = "$1.42M";
          let subtext = "Annual Recurring Revenue (ARR) Target Achievement";
          let targetText = "Q2 Target: $1.31M";
          let actualText = "Actual: $1.42M";
          let progressWidth = "87%";
          let indicatorClass = "bg-success/15 text-success";
          let indicatorTrend = "trending_up";
          let indicatorDiff = "+8.4% vs Target";
          let barClass = "from-primary to-purple-500";
          let comment = "<strong>Executive Summary:</strong> Q2 Board target achieved 18 days ahead of forecast. Expansion MRR from enterprise accounts contributed to +74% of the ARR upside.";

          const lowerQuery = w.title.toLowerCase();
          if (lowerQuery.includes("product") || lowerQuery.includes("underperform")) {
            metric = "82% CSAT";
            subtext = "Customer Satisfaction & Engagement Goal";
            targetText = "Goal: 85% CSAT";
            actualText = "Actual: 82% CSAT";
            progressWidth = "72%";
            indicatorClass = "bg-error/15 text-error";
            indicatorTrend = "trending_down";
            indicatorDiff = "-3.5% vs Goal";
            barClass = "from-red-400 to-orange-500";
            comment = "<strong>Executive Summary:</strong> Customer satisfaction dropped by 3.5% this month, primarily linked to recent Shopify Webhook latency spikes in high-volume regions.";
          } else if (!lowerQuery.includes("revenue") && !lowerQuery.includes("month")) {
            metric = "3.24%";
            subtext = "Active Checkout Conversion Rate Target";
            targetText = "Goal: 3.50%";
            actualText = "Actual: 3.24%";
            progressWidth = "78%";
            indicatorClass = "bg-error/15 text-error";
            indicatorTrend = "trending_down";
            indicatorDiff = "-0.26% vs Goal";
            barClass = "from-purple-400 to-indigo-500";
            comment = "<strong>Executive Summary:</strong> Overall conversion rate is lagging behind our optimization goal. Checkout funnel analysis shows abandonment spikes at the shipping fee calculation step.";
          }

          cardContent = `
            <!-- Card Header -->
            <div class="flex items-start justify-between mb-3">
              <div class="min-w-0 flex-1 pr-2">
                <span class="text-[8px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full uppercase tracking-wider">CEO Strategic KPI</span>
                <h4 class="text-[10.5px] font-bold text-on-surface uppercase tracking-wider mt-1 truncate" title="${w.title}">${w.title}</h4>
                <p class="text-[9px] text-on-surface-variant/60">${subtext}</p>
              </div>
              <div class="flex items-center gap-1.5 flex-shrink-0 min-h-[28px]" id="action-container-${w.id}">
                <span class="material-symbols-outlined text-[15px] text-on-surface-variant/40 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-all duration-200 select-none" title="Drag to reorder">drag_indicator</span>
                <button class="delete-widget-btn p-1 text-on-surface-variant hover:text-error hover:bg-error/5 rounded flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer" data-widget-id="${w.id}" title="Remove Widget">
                  <span class="material-symbols-outlined text-[15px]">delete</span>
                </button>
              </div>
            </div>
            
            <!-- KPI Value & Goal Badge -->
            <div class="flex items-baseline gap-2 mb-2">
              <span class="font-display font-bold text-xl text-on-surface">${metric}</span>
              <span class="text-[9px] font-bold ${indicatorClass} px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <span class="material-symbols-outlined text-[10px]" style="font-variation-settings: 'FILL' 1;">${indicatorTrend}</span> ${indicatorDiff}
              </span>
            </div>

            <!-- Bullet / Progress Chart Visualization -->
            <div class="py-2.5">
              <div class="flex items-center justify-between text-[8px] text-on-surface-variant font-bold mb-1">
                <span>${targetText}</span>
                <span>${actualText}</span>
              </div>
              <!-- Bar Container -->
              <div class="relative w-full h-3 bg-surface-variant rounded-full overflow-hidden border border-outline/30 shadow-inner">
                <!-- Target Marker Line -->
                <div class="absolute top-0 bottom-0 w-0.5 bg-on-surface-variant/50 z-20" style="left: 80%" title="Target Line (80% scale)"></div>
                <!-- Actual Progress Bar -->
                <div class="absolute top-0 bottom-0 bg-gradient-to-r ${barClass} rounded-full z-10" style="width: ${progressWidth}"></div>
              </div>
              <div class="flex justify-between items-center text-[7.5px] text-on-surface-variant/60 mt-1">
                <span>0%</span>
                <span style="margin-left: 50%">Target (100%)</span>
                <span>120%</span>
              </div>
            </div>
            
            <!-- Executive Commentary / Summary -->
            <div class="mt-2.5 pt-2.5 border-t border-outline/50 flex items-start gap-1.5">
              <span class="material-symbols-outlined text-primary text-[13px] mt-0.5" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
              <p class="text-[9px] text-on-surface-variant leading-relaxed">
                ${comment}
              </p>
            </div>
          `;
        }

        return `
          <div class="dashboard-card bg-white p-4 rounded-xl border border-outline shadow-sm flex flex-col justify-between group cursor-grab active:cursor-grabbing" id="${w.id}" draggable="true">
            ${cardContent}
          </div>
        `;
      }).join('');

      // Add delete click listeners (showing inline confirmation)
      grid.querySelectorAll(".delete-widget-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const widgetId = btn.getAttribute("data-widget-id");
          const actionContainer = document.getElementById(`action-container-${widgetId}`);
          
          if (actionContainer) {
            // Swap delete button for Cancel / Confirm options
            actionContainer.innerHTML = `
              <div class="flex items-center gap-1.5 pointer-events-auto">
                <button class="cancel-delete-btn text-[9px] font-bold text-on-surface-variant hover:bg-surface-variant/80 px-1.5 py-0.5 rounded transition-all cursor-pointer" data-widget-id="${widgetId}">Cancel</button>
                <button class="confirm-delete-btn text-[9px] font-bold text-error bg-error/10 hover:bg-error/15 px-1.5 py-0.5 rounded transition-all cursor-pointer" data-widget-id="${widgetId}">Delete</button>
              </div>
            `;
            
            // Trigger GSAP slide-in for the inline confirmation choices
            gsap.fromTo(actionContainer.firstElementChild, 
              { opacity: 0, x: 8 }, 
              { opacity: 1, x: 0, duration: 0.25, ease: "power1.out" }
            );

            // Add listeners to new cancel/confirm buttons
            const cancelBtn = actionContainer.querySelector(".cancel-delete-btn");
            const confirmBtn = actionContainer.querySelector(".confirm-delete-btn");
            
            if (cancelBtn) {
              cancelBtn.addEventListener("click", (ev) => {
                ev.stopPropagation();
                renderWidgets(); // Restore grid to original state (showing trash icon)
              });
            }
            
            if (confirmBtn) {
              confirmBtn.addEventListener("click", (ev) => {
                ev.stopPropagation();
                const card = document.getElementById(widgetId);
                if (card) {
                  gsap.to(card, {
                    scale: 0.8,
                    opacity: 0,
                    duration: 0.3,
                    ease: "power2.in",
                    onComplete: () => {
                      dashboardWidgets[activeDashboard] = dashboardWidgets[activeDashboard].filter(w => w.id !== widgetId);
                      localStorage.setItem("SmartBI_dashboard_widgets", JSON.stringify(dashboardWidgets));
                      renderWidgets();
                      showToast("Widget removed from workspace.", "success");
                    }
                  });
                }
              });
            }
          }
        });
      });

      // Initialize drag-and-drop on all elements including newly rendered cards
      initializeDragAndDrop();
    }
  };

  const swapNodes = (node1, node2) => {
    const parent1 = node1.parentNode;
    const parent2 = node2.parentNode;
    if (parent1 && parent2) {
      const next1 = node1.nextSibling;
      const next2 = node2.nextSibling;
      if (next1 === node2) {
        parent1.insertBefore(node2, node1);
        return;
      }
      if (next2 === node1) {
        parent2.insertBefore(node1, node2);
        return;
      }
      parent1.insertBefore(node2, next1);
      parent2.insertBefore(node1, next2);
    }
  };

  const initializeDragAndDrop = () => {
    const cards = document.querySelectorAll(".dashboard-card, .chart-panel, .insight-panel");
    cards.forEach(card => {
      // Allow cards to be draggable
      card.setAttribute("draggable", "true");
      
      // Prevent duplicate event listeners
      if (card.getAttribute("data-drag-bound") === "true") return;
      card.setAttribute("data-drag-bound", "true");

      // Hover micro-animations
      card.addEventListener("mouseenter", () => {
        gsap.to(card, {
          y: -4,
          borderColor: "rgba(124, 58, 237, 0.35)",
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
          duration: 0.3,
          ease: "power2.out"
        });
      });
      card.addEventListener("mouseleave", () => {
        gsap.to(card, {
          y: 0,
          borderColor: "rgba(226, 232, 240, 0.8)",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.02), 0 4px 12px rgba(15, 23, 42, 0.03)",
          duration: 0.3,
          ease: "power2.out"
        });
      });

      card.addEventListener("dragstart", (e) => {
        draggedElement = card;
        draggedWidgetId = card.id || null;
        e.dataTransfer.setData("text/plain", card.id || "");
        card.classList.add("opacity-40");
        e.dataTransfer.effectAllowed = "move";
        document.body.classList.add("dragging-active");
      });

      card.addEventListener("dragend", () => {
        card.classList.remove("opacity-40");
        document.body.classList.remove("dragging-active");
        cards.forEach(c => c.classList.remove("border-primary", "scale-[0.98]", "bg-primary/5"));
        draggedElement = null;
        draggedWidgetId = null;
      });

      card.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      });

      card.addEventListener("dragenter", (e) => {
        e.preventDefault();
        if (draggedElement && draggedElement !== card) {
          card.classList.add("border-primary", "scale-[0.98]", "bg-primary/5");
        }
      });

      card.addEventListener("dragleave", () => {
        card.classList.remove("border-primary", "scale-[0.98]", "bg-primary/5");
      });

      card.addEventListener("drop", (e) => {
        e.preventDefault();
        card.classList.remove("border-primary", "scale-[0.98]", "bg-primary/5");
        
        if (draggedElement && draggedElement !== card) {
          const activeDashboard = activeDashboardName;
          
          // Check if both are dynamic widgets inside `#dynamic-widgets-grid`
          const isDynamic1 = draggedElement.parentNode && draggedElement.parentNode.id === "dynamic-widgets-grid";
          const isDynamic2 = card.parentNode && card.parentNode.id === "dynamic-widgets-grid";
          
          if (isDynamic1 && isDynamic2) {
            const list = dashboardWidgets[activeDashboard];
            const draggedIdx = list.findIndex(w => w.id === draggedElement.id);
            const targetIdx = list.findIndex(w => w.id === card.id);
            
            if (draggedIdx > -1 && targetIdx > -1) {
              const temp = list[draggedIdx];
              list.splice(draggedIdx, 1);
              list.splice(targetIdx, 0, temp);
              localStorage.setItem("SmartBI_dashboard_widgets", JSON.stringify(dashboardWidgets));
            }
          }
          
          // Swap DOM nodes
          swapNodes(draggedElement, card);
          
          // Flash animation on swapped cards
          gsap.fromTo([card, draggedElement], 
            { outline: "2px solid rgba(124, 58, 237, 0.6)", scale: 0.98 },
            { outline: "2px solid rgba(124, 58, 237, 0)", scale: 1, duration: 0.8, ease: "power2.out" }
          );
        }
      });
    });
  };

  // --- Inline Renaming of Custom Widgets Section ---
  const widgetsTitle = document.getElementById("dynamic-widgets-title");
  const widgetsTitleBtn = document.getElementById("edit-widgets-title-btn");
  const widgetsTitleInput = document.getElementById("dynamic-widgets-title-input");

  if (widgetsTitle && widgetsTitleInput) {
    const startEditingTitle = () => {
      const activeDashboard = activeDashboardName;
      const currentVal = dashboardSectionNames[activeDashboard] || "Custom Widgets";
      
      widgetsTitle.classList.add("hidden");
      if (widgetsTitleBtn) widgetsTitleBtn.classList.add("hidden");
      
      widgetsTitleInput.classList.remove("hidden");
      widgetsTitleInput.value = currentVal;
      widgetsTitleInput.focus();
      widgetsTitleInput.select();
    };

    const finishEditingTitle = (save = true) => {
      const activeDashboard = activeDashboardName;
      if (save) {
        const newVal = widgetsTitleInput.value.trim();
        dashboardSectionNames[activeDashboard] = newVal || "Custom Widgets";
        localStorage.setItem("SmartBI_dashboard_section_names", JSON.stringify(dashboardSectionNames));
      }
      
      widgetsTitleInput.classList.add("hidden");
      widgetsTitle.classList.remove("hidden");
      if (widgetsTitleBtn) widgetsTitleBtn.classList.remove("hidden");
      
      // Update heading text
      widgetsTitle.innerText = dashboardSectionNames[activeDashboard];
    };

    widgetsTitle.addEventListener("click", startEditingTitle);
    if (widgetsTitleBtn) {
      widgetsTitleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        startEditingTitle();
      });
    }

    widgetsTitleInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        finishEditingTitle(true);
      } else if (e.key === "Escape") {
        finishEditingTitle(false);
      }
    });

    widgetsTitleInput.addEventListener("blur", () => {
      finishEditingTitle(true);
    });
  }

  // Mock data sets for different dashboards
  const mockDashboardData = {
    "Main Dashboard": {
      revenue: "$124,523", revenueTrend: "+12.5%",
      users: "8,234", usersTrend: "+18.2%",
      conversion: "3.24%", conversionTrend: "-0.4%",
      orders: "2,847", ordersTrend: "+23.1%"
    },
    "Operations Overview": {
      revenue: "$84,120", revenueTrend: "+6.2%",
      users: "4,125", usersTrend: "+10.1%",
      conversion: "4.82%", conversionTrend: "+1.2%",
      orders: "1,940", ordersTrend: "+14.3%"
    },
    "Financials": {
      revenue: "$245,190", revenueTrend: "+21.4%",
      users: "12,980", usersTrend: "+25.8%",
      conversion: "2.98%", conversionTrend: "-0.8%",
      orders: "4,320", ordersTrend: "+31.2%"
    },
    "Team Performance": {
      revenue: "$62,110", revenueTrend: "+3.1%",
      users: "3,200", usersTrend: "+4.5%",
      conversion: "6.12%", conversionTrend: "+2.4%",
      orders: "1,105", ordersTrend: "+5.9%"
    }
  };

  const dashboardOptions = document.querySelectorAll(".dashboard-option-btn");
  const activeLabel = document.getElementById("active-dashboard-label");
  const activeIcon = document.getElementById("active-dashboard-icon");

  if (dashboardOptions) {
    dashboardOptions.forEach(opt => {
      opt.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const selectedDashboard = opt.getAttribute("data-dashboard");
        activeDashboardName = selectedDashboard;

        // Update the dropdown toggle label & icon
        if (activeLabel) activeLabel.innerText = selectedDashboard;
        if (activeIcon) {
          const optIcon = opt.querySelector(".material-symbols-outlined");
          if (optIcon) {
            activeIcon.innerText = optIcon.innerText;
            if (optIcon.style.fontVariationSettings) {
              activeIcon.style.fontVariationSettings = optIcon.style.fontVariationSettings;
            } else {
              activeIcon.style.fontVariationSettings = "'FILL' 1";
            }
          }
        }

        // Visual indicator selected state in dropdown menu list
        dashboardOptions.forEach(o => {
          if (o === opt) {
            o.classList.add("text-primary", "font-bold");
            o.classList.remove("text-on-surface-variant", "hover:text-on-surface", "font-semibold");
            const icon = o.querySelector(".material-symbols-outlined");
            if (icon) icon.style.fontVariationSettings = "'FILL' 1";
          } else {
            o.classList.remove("text-primary", "font-bold");
            o.classList.add("text-on-surface-variant", "hover:text-on-surface", "font-semibold");
            const icon = o.querySelector(".material-symbols-outlined");
            if (icon) icon.style.fontVariationSettings = "'FILL' 0";
          }
        });

        // Close the dropdown menu
        closeAllDropdowns();

        // Trigger loading pulse transition on the cards
        const allMetricsCards = document.querySelectorAll(".metrics-grid .dashboard-card");
        gsap.to(allMetricsCards, {
          opacity: 0.4,
          filter: "blur(2px)",
          y: 4,
          duration: 0.3,
          stagger: 0.04,
          ease: "power2.out",
          onComplete: () => {
            // Update metric values in HTML based on selected dashboard data
            const data = mockDashboardData[selectedDashboard] || mockDashboardData["Main Dashboard"];
            
            const cardValues = document.querySelectorAll(".metrics-grid .dashboard-card h3");
            const cardTrends = document.querySelectorAll(".metrics-grid .dashboard-card span.font-bold");

            if (cardValues.length >= 4) {
              cardValues[0].innerText = data.revenue;
              cardValues[1].innerText = data.users;
              cardValues[2].innerText = data.conversion;
              cardValues[3].innerText = data.orders;
            }

            if (cardTrends.length >= 4) {
              cardTrends[0].innerHTML = `<span class="material-symbols-outlined text-[10px]">trending_up</span> ${data.revenueTrend}`;
              cardTrends[1].innerHTML = `<span class="material-symbols-outlined text-[10px]">trending_up</span> ${data.usersTrend}`;
              
              if (data.conversionTrend.startsWith("-")) {
                cardTrends[2].parentNode.className = "flex items-center gap-0.5 bg-error/15 text-error px-1.5 py-0.5 rounded-full text-[9px] font-bold";
                cardTrends[2].innerHTML = `<span class="material-symbols-outlined text-[10px]">trending_down</span> ${data.conversionTrend}`;
              } else {
                cardTrends[2].parentNode.className = "flex items-center gap-0.5 bg-success/15 text-success px-1.5 py-0.5 rounded-full text-[9px] font-bold";
                cardTrends[2].innerHTML = `<span class="material-symbols-outlined text-[10px]">trending_up</span> ${data.conversionTrend}`;
              }
              
              cardTrends[3].innerHTML = `<span class="material-symbols-outlined text-[10px]">trending_up</span> ${data.ordersTrend}`;
            }

            // Render the widgets for this dashboard
            renderWidgets();

            // Stagger reveal metrics cards back to normal
            gsap.to(allMetricsCards, {
              opacity: 1,
              filter: "blur(0px)",
              y: 0,
              duration: 0.5,
              stagger: 0.05,
              ease: "back.out(1.2)"
            });
          }
        });
      });
    });
  }

  // --- GSAP Entrance & Page Animations ---
  const introTl = gsap.timeline({ defaults: { ease: "power4.out" } });

  introTl
    .fromTo(sidebar, 
      { x: -100, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8 }
    )
    .fromTo(mainHeader, 
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6 },
      "-=0.4"
    )
    .fromTo(".gsap-fade-in", 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 },
      "-=0.3"
    )
    .fromTo(".chart-bar", 
      { scaleY: 0 },
      { scaleY: 1, duration: 1.2, transformOrigin: "bottom", ease: "elastic.out(1, 0.75)", stagger: 0.08 },
      "-=0.6"
    );

  // Initialize drag-and-drop globally on page load
  initializeDragAndDrop();

  const buttons = document.querySelectorAll("button, .nav-link");
  buttons.forEach(btn => {
    btn.addEventListener("mouseenter", () => {
      gsap.to(btn, { scale: 1.015, duration: 0.2, ease: "power1.out" });
    });
    btn.addEventListener("mouseleave", () => {
      gsap.to(btn, { scale: 1, duration: 0.2, ease: "power1.out" });
    });
    btn.addEventListener("mousedown", () => {
      gsap.to(btn, { scale: 0.98, duration: 0.1 });
    });
    btn.addEventListener("mouseup", () => {
      gsap.to(btn, { scale: 1.015, duration: 0.1 });
    });
  });

  // --- LocalStorage State Management (Chat History & Favorites) ---
  // Migrate old storage versions to match rebranded zero-tech queries
  if (localStorage.getItem("SmartBI_recent_queries") && localStorage.getItem("SmartBI_recent_queries").includes("database connections")) {
    localStorage.removeItem("SmartBI_recent_queries");
  }
  if (localStorage.getItem("SmartBI_fav_queries") && localStorage.getItem("SmartBI_fav_queries").includes("Revenue last month")) {
    localStorage.removeItem("SmartBI_fav_queries");
  }

  let recentQueries = JSON.parse(localStorage.getItem("SmartBI_recent_queries"));
  let favoriteQueries = JSON.parse(localStorage.getItem("SmartBI_fav_queries"));

  if (!recentQueries) {
    recentQueries = [
      "How did we do last month?",
      "Which product is underperforming?",
      "Predict next quarter's revenue",
      "Summarize my active data sources"
    ];
    localStorage.setItem("SmartBI_recent_queries", JSON.stringify(recentQueries));
  }
  if (!favoriteQueries) {
    favoriteQueries = [
      "How did we do last month?"
    ];
    localStorage.setItem("SmartBI_fav_queries", JSON.stringify(favoriteQueries));
  }

  const favoritesList = document.getElementById("favorites-list");
  const recentQueriesList = document.getElementById("recent-queries-list");
  const historyPanel = document.getElementById("history-panel");
  const historyToggle = document.getElementById("history-toggle");
  const historyCloseBtn = document.getElementById("history-close-btn");
  const clearHistoryBtn = document.getElementById("clear-history");

  const renderHistory = () => {
    if (favoritesList) {
      if (favoriteQueries.length === 0) {
        favoritesList.innerHTML = `<p class="text-[9.5px] text-on-surface-variant/60 italic px-1 py-0.5">No favorites saved yet.</p>`;
      } else {
        favoritesList.innerHTML = favoriteQueries.map(q => `
          <div class="group flex items-center justify-between py-1 px-1.5 hover:bg-primary-container/30 rounded transition-colors cursor-pointer" data-query="${q}">
            <span class="text-[10px] text-on-surface font-medium truncate flex-1">${q}</span>
            <span class="material-symbols-outlined text-[11px] text-yellow-500 flex-shrink-0 ml-1.5 opacity-90 select-none">star</span>
          </div>
        `).join('');
      }
    }

    if (recentQueriesList) {
      if (recentQueries.length === 0) {
        recentQueriesList.innerHTML = `<p class="text-[9.5px] text-on-surface-variant/60 italic px-1 py-0.5">No recent searches.</p>`;
      } else {
        recentQueriesList.innerHTML = recentQueries.map(q => {
          const isFav = favoriteQueries.includes(q);
          return `
            <div class="group flex items-center justify-between py-1 px-1.5 hover:bg-surface-variant/80 rounded transition-colors cursor-pointer" data-query="${q}">
              <span class="text-[10px] text-on-surface-variant hover:text-on-surface truncate flex-1">${q}</span>
              <span class="material-symbols-outlined text-[11px] text-on-surface-variant/40 group-hover:text-yellow-500 group-hover:opacity-100 flex-shrink-0 ml-1.5 transition-all select-none ${isFav ? 'text-yellow-500 opacity-100' : 'opacity-0'}" data-fav-toggle="${q}">star</span>
            </div>
          `;
        }).join('');
      }
    }

    // Attach click listeners to history items for immediate query loading and execution
    document.querySelectorAll("#history-panel [data-query]").forEach(item => {
      item.addEventListener("click", (e) => {
        if (e.target.hasAttribute("data-fav-toggle")) {
          e.stopPropagation();
          const queryToToggle = e.target.getAttribute("data-fav-toggle");
          toggleQueryFavorite(queryToToggle);
          return;
        }

        const query = item.getAttribute("data-query");
        if (queryInput) {
          queryInput.value = query;
          if (historyPanel && !historyPanel.classList.contains("hidden")) {
            toggleHistory();
          }
          handleAISubmit();
        }
      });
    });
  };

  const toggleQueryFavorite = (query) => {
    const idx = favoriteQueries.indexOf(query);
    if (idx > -1) {
      favoriteQueries.splice(idx, 1);
    } else {
      favoriteQueries.push(query);
    }
    localStorage.setItem("SmartBI_fav_queries", JSON.stringify(favoriteQueries));
    renderHistory();
    updateFavoriteButtonState(query);
  };

  const toggleHistory = () => {
    if (!historyPanel) return;
    const isHidden = historyPanel.classList.contains("hidden");
    if (isHidden) {
      historyPanel.classList.remove("hidden");
      gsap.fromTo(historyPanel, 
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }
      );
      renderHistory();
    } else {
      gsap.to(historyPanel, {
        opacity: 0,
        y: -10,
        duration: 0.2,
        onComplete: () => {
          historyPanel.classList.add("hidden");
        }
      });
    }
  };

  if (historyToggle) {
    historyToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleHistory();
    });
  }
  if (historyCloseBtn) {
    historyCloseBtn.addEventListener("click", () => {
      toggleHistory();
    });
  }
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", () => {
      recentQueries = [];
      localStorage.setItem("SmartBI_recent_queries", JSON.stringify(recentQueries));
      renderHistory();
    });
  }

  // Close history list on document outer clicks
  document.addEventListener("click", (e) => {
    if (historyPanel && !historyPanel.classList.contains("hidden") && !historyPanel.contains(e.target) && e.target !== historyToggle && !historyToggle.contains(e.target)) {
      toggleHistory();
    }
  });

  // --- AI Conversational Interaction ---
  const askBtn = document.getElementById("ask-ai-btn");
  const aiHero = document.getElementById("ai-hero");
  const resultsContainer = document.getElementById("ai-results");
  const loadingContainer = document.getElementById("ai-loading");

  let currentActiveQuery = "";

  const favToggleBtn = document.getElementById("favorite-toggle-btn");
  const favStarIcon = document.getElementById("favorite-star-icon");
  const favStarText = document.getElementById("favorite-star-text");

  const updateFavoriteButtonState = (query) => {
    if (!favStarIcon || !favStarText || !favToggleBtn) return;
    const isFav = favoriteQueries.includes(query);
    if (isFav) {
      favStarIcon.innerText = "star";
      favStarIcon.classList.add("text-yellow-500");
      favStarIcon.classList.remove("text-on-surface-variant/70");
      favStarText.innerText = "Favorited";
      favStarText.classList.add("text-yellow-600");
    } else {
      favStarIcon.innerText = "star_border";
      favStarIcon.classList.remove("text-yellow-500");
      favStarIcon.classList.add("text-on-surface-variant/70");
      favStarText.innerText = "Favorite";
      favStarText.classList.remove("text-yellow-600");
    }
  };

  if (favToggleBtn) {
    favToggleBtn.addEventListener("click", () => {
      if (currentActiveQuery) {
        toggleQueryFavorite(currentActiveQuery);
      }
    });
  }

  if (askBtn && queryInput) {
    const handleAISubmit = () => {
      const queryText = queryInput.value.trim();
      if (!queryText) return;

      const quietStatus = document.getElementById("ai-quiet-status");
      if (quietStatus) quietStatus.innerText = "";

      // Reset voice recording simulation if running
      if (isRecording) {
        if (voiceTimeout) clearTimeout(voiceTimeout);
        isRecording = false;
        if (voiceBtn) {
          voiceBtn.classList.remove("text-error", "animate-pulse");
          voiceBtn.style.borderColor = "";
        }
        queryInput.placeholder = "Type your request: I'll search, answer, or build it for you.";
      }

      currentActiveQuery = queryText;

      // Add to recent search array
      const existingIdx = recentQueries.indexOf(queryText);
      if (existingIdx > -1) {
        recentQueries.splice(existingIdx, 1);
      }
      recentQueries.unshift(queryText);
      if (recentQueries.length > 15) recentQueries.pop(); // Cap history list length
      localStorage.setItem("SmartBI_recent_queries", JSON.stringify(recentQueries));

      aiHero.classList.add("hidden");
      if (historyPanel) historyPanel.classList.add("hidden");
      loadingContainer.classList.remove("hidden");
      
      const pulseAnim = gsap.to(".loading-avatar", {
        scale: 1.15,
        repeat: -1,
        yoyo: true,
        duration: 0.8,
        ease: "sine.inOut"
      });

      setTimeout(() => {
        pulseAnim.kill();
        loadingContainer.classList.add("hidden");
        resultsContainer.classList.remove("hidden");

        updateFavoriteButtonState(queryText);

        const responseTextElement = document.getElementById("ai-response-text");
        if (queryText.toLowerCase().includes("revenue")) {
          responseTextElement.innerHTML = `Revenue last month reached <strong class="text-on-surface">$124,523</strong>, representing a <span class="text-success font-semibold">+12.5%</span> increase. This growth was mainly driven by email marketing conversions (+23.1% orders) and beats our target forecast by 8%.`;
        } else {
          responseTextElement.innerHTML = `Based on your request <i>"${queryText}"</i>, active users are currently at <strong class="text-on-surface">8,234</strong> (+18.2% MoM) and orders are up by <span class="text-success font-semibold">+23.1%</span>. Conversions are hovering at <span class="text-danger font-semibold">3.24%</span>, which is 0.2% below our optimization target.`;
        }

        gsap.fromTo(resultsContainer, 
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
        );
        
        gsap.fromTo(".ai-chip", 
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 0.4, stagger: 0.08, ease: "back.out(1.7)" }
        );

        // Auto-add placeholder widget directly to selected dashboard (alternating types)
        const activeDashboard = activeDashboardName;
        const widgetId = "widget_" + Date.now();
        
        const widgetsCount = dashboardWidgets[activeDashboard] ? dashboardWidgets[activeDashboard].length : 0;
        const widgetTypes = ["progress", "pie", "line"];
        const widgetType = widgetTypes[widgetsCount % 3];

        const newWidget = {
          id: widgetId,
          title: `Query: "${queryText}"`,
          type: widgetType
        };
        dashboardWidgets[activeDashboard].push(newWidget);
        localStorage.setItem("SmartBI_dashboard_widgets", JSON.stringify(dashboardWidgets));
        renderWidgets();
        showToast("Widget added to dashboard.", "success");

        // Show quiet feedback status
        const quietStatus = document.getElementById("ai-quiet-status");
        if (quietStatus) {
          quietStatus.innerText = `Added to ${activeDashboard}.`;
          gsap.fromTo(quietStatus, { opacity: 0, x: -5 }, { opacity: 1, x: 0, duration: 0.3, ease: "power1.out" });
        }

        // Entrance animation for new widget
        const newWidgetEl = document.getElementById(widgetId);
        if (newWidgetEl) {
          gsap.fromTo(newWidgetEl, 
            { opacity: 0, scale: 0.8, y: 15 },
            { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.5)" }
          );
        }
      }, 1600);
    };

    // Attach triggers
    window.handleAISubmit = handleAISubmit; // Make accessible globally for history triggers
    askBtn.addEventListener("click", handleAISubmit);
    queryInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleAISubmit();
      }
    });

    const suggestionCards = document.querySelectorAll(".suggestion-card");
    suggestionCards.forEach(card => {
      card.addEventListener("click", () => {
        const query = card.getAttribute("data-query");
        queryInput.value = query;
        gsap.fromTo(queryInput, { opacity: 0.5 }, { opacity: 1, duration: 0.2 });
        handleAISubmit();
      });
    });
  }

  window.resetAI = () => {
    resultsContainer.classList.add("hidden");
    aiHero.classList.remove("hidden");
    queryInput.value = "";

    // Clear quiet status
    const quietStatus = document.getElementById("ai-quiet-status");
    if (quietStatus) quietStatus.innerText = "";

    gsap.fromTo(aiHero, 
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.5 }
    );
  };

  // --- Dashboard Dynamic Filtering System ---
  const filterBtn = document.getElementById("add-filter-btn");
  const filterMenu = document.getElementById("filter-selector-menu");
  const activeFiltersContainer = document.getElementById("active-filters-container");
  
  // Cache original dashboard values
  const defaultValues = {
    revenue: "$124,523",
    users: "8,234",
    conversion: "3.24%",
    orders: "2,847"
  };

  // Preset filter subsets (Relevant for CEO decision-making)
  const filterSubsets = {
    Enterprise: { revenue: "$82,450", users: "1,820", conversion: "4.85%", orders: "950" },
    "Mid-Market": { revenue: "$30,950", users: "2,940", conversion: "3.10%", orders: "1,120" },
    SMB: { revenue: "$11,123", users: "3,474", conversion: "1.82%", orders: "777" },
    "North America": { revenue: "$76,523", users: "4,980", conversion: "3.45%", orders: "1,640" },
    EMEA: { revenue: "$34,200", users: "2,214", conversion: "3.02%", orders: "820" },
    APAC: { revenue: "$13,800", users: "1,040", conversion: "2.45%", orders: "387" }
  };

  if (filterBtn && filterMenu) {
    registerDropdown(filterBtn, filterMenu);
    
    // Wire filter preset options
    const filterOpts = document.querySelectorAll(".filter-opt-btn");
    filterOpts.forEach(opt => {
      opt.addEventListener("click", (e) => {
        e.stopPropagation();
        closeAllDropdowns();
        
        const filterType = opt.getAttribute("data-filter-type");
        const filterVal = opt.getAttribute("data-filter-val");
        
        applyDashboardFilter(filterType, filterVal);
      });
    });
  }

  const applyDashboardFilter = (type, val) => {
    // Check if filter is already active
    const existing = document.querySelector(`.filter-chip[data-value="${val}"]`);
    if (existing) return;
    
    // Clear other filter chips to simplify (one active filter at a time for this prototype)
    if (activeFiltersContainer) activeFiltersContainer.innerHTML = "";
    
    // Add chip
    const chip = document.createElement("div");
    chip.className = "filter-chip flex items-center gap-1 py-1 px-2.5 bg-primary/10 text-primary border border-primary/20 rounded-lg text-[9.5px] font-bold animate-bubble-reveal";
    chip.setAttribute("data-value", val);
    chip.innerHTML = `
      <span>${type}: ${val}</span>
      <button class="remove-filter-btn flex items-center justify-center cursor-pointer text-primary/60 hover:text-primary transition-colors ml-1">
        <span class="material-symbols-outlined text-[12px]">close</span>
      </button>
    `;
    
    activeFiltersContainer.appendChild(chip);
    
    // Bind click to close chip
    chip.querySelector(".remove-filter-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      removeDashboardFilter(chip);
    });
    
    // Trigger loading/re-aggregation animation
    const cardsToAnimate = document.querySelectorAll(".metrics-grid .dashboard-card");
    gsap.to(cardsToAnimate, {
      opacity: 0.4,
      filter: "blur(2px)",
      y: 4,
      duration: 0.3,
      stagger: 0.04,
      ease: "power2.out",
      onComplete: () => {
        // Load filter values
        const subset = filterSubsets[val] || defaultValues;
        
        const cardValues = document.querySelectorAll(".metrics-grid .dashboard-card h3");
        if (cardValues.length >= 4) {
          cardValues[0].innerText = subset.revenue;
          cardValues[1].innerText = subset.users;
          cardValues[2].innerText = subset.conversion;
          cardValues[3].innerText = subset.orders;
        }
        
        // Also mock update chart columns to reflect lower segment values
        gsap.to(".chart-bar", {
          scaleY: 0.6,
          duration: 0.5,
          ease: "power2.out"
        });
        
        // Restore opacity
        gsap.to(cardsToAnimate, {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          duration: 0.5,
          stagger: 0.05,
          ease: "back.out(1.2)"
        });
        
        showToast(`Filter applied: ${type} is "${val}"`, "success");
      }
    });
  };

  const removeDashboardFilter = (chipEl) => {
    gsap.to(chipEl, {
      scale: 0.8,
      opacity: 0,
      duration: 0.2,
      onComplete: () => {
        chipEl.remove();
        
        // Reset dashboard metrics back to default
        const cardsToAnimate = document.querySelectorAll(".metrics-grid .dashboard-card");
        gsap.to(cardsToAnimate, {
          opacity: 0.4,
          filter: "blur(2px)",
          y: 4,
          duration: 0.3,
          stagger: 0.04,
          ease: "power2.out",
          onComplete: () => {
            // Restore default values
            const activeDashboard = activeDashboardName;
            const data = mockDashboardData[activeDashboard] || mockDashboardData["Main Dashboard"];
            
            const cardValues = document.querySelectorAll(".metrics-grid .dashboard-card h3");
            if (cardValues.length >= 4) {
              cardValues[0].innerText = data.revenue;
              cardValues[1].innerText = data.users;
              cardValues[2].innerText = data.conversion;
              cardValues[3].innerText = data.orders;
            }
            
            // Restore chart columns
            gsap.to(".chart-bar", {
              scaleY: 1.0,
              duration: 0.6,
              ease: "elastic.out(1, 0.75)"
            });
            
            gsap.to(cardsToAnimate, {
              opacity: 1,
              filter: "blur(0px)",
              y: 0,
              duration: 0.5,
              stagger: 0.05,
              ease: "back.out(1.2)"
            });
            
            showToast("Filter removed. Showing all records.", "info");
          }
        });
      }
    });
  };

  // --- Calculated Metric Modal & Logic ---
  const calcBtn = document.getElementById("add-calculated-metric-btn");
  const calcModal = document.getElementById("calc-modal-overlay");
  const closeCalcModalBtn = document.getElementById("close-calc-modal");
  const cancelCalcBtn = document.getElementById("modal-calc-cancel");
  const calcForm = document.getElementById("calc-modal-form");
  const metricsGrid = document.querySelector(".metrics-grid");

  const openCalcModal = () => {
    if (!calcModal) return;
    calcModal.classList.remove("hidden");
    calcModal.classList.add("flex");
    
    gsap.fromTo(calcModal, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" });
    gsap.fromTo(
      calcModal.querySelector(".bg-white"),
      { scale: 0.93, opacity: 0, y: 15 },
      { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.2)" }
    );
  };

  const closeCalcModal = () => {
    if (!calcModal) return;
    
    gsap.to(calcModal.querySelector(".bg-white"), {
      scale: 0.95,
      opacity: 0,
      y: 10,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => {
        calcModal.classList.remove("flex");
        calcModal.classList.add("hidden");
      }
    });
    gsap.to(calcModal, { opacity: 0, duration: 0.25, ease: "power2.in" });
  };

  if (calcBtn) calcBtn.addEventListener("click", openCalcModal);
  if (closeCalcModalBtn) closeCalcModalBtn.addEventListener("click", closeCalcModal);
  if (cancelCalcBtn) cancelCalcBtn.addEventListener("click", closeCalcModal);
  
  if (calcModal) {
    calcModal.addEventListener("click", (e) => {
      if (e.target === calcModal) closeCalcModal();
    });
  }

  if (calcForm) {
    calcForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const pattern = document.getElementById("modal-calc-template").value;
      const metA = document.getElementById("modal-calc-met-a").value;
      const metB = document.getElementById("modal-calc-met-b").value;
      const name = document.getElementById("modal-calc-name").value.trim();
      
      if (!name) return;
      
      closeCalcModal();
      showToast("Calculating metric formulas...", "info");
      
      setTimeout(() => {
        // Read current metrics in HTML to run formula values
        const activeDashboard = activeDashboardName;
        const currentData = mockDashboardData[activeDashboard] || mockDashboardData["Main Dashboard"];
        
        // Parse numerical values
        const parseVal = (strVal) => {
          return parseFloat(strVal.replace(/[\$\,\%]/g, '')) || 1.0;
        };
        
        const valA = parseVal(currentData[metA]);
        const valB = parseVal(currentData[metB]);
        
        let calculatedVal = "";
        let calcFormulaText = "";
        
        if (pattern === "ratio") {
          calculatedVal = "$" + (valA / valB).toFixed(2);
          calcFormulaText = `${metA} / ${metB}`;
        } else if (pattern === "growth") {
          const diff = valA - valB;
          calculatedVal = ((diff / valB) * 100).toFixed(1) + "%";
          calcFormulaText = `(${metA} - ${metB}) / ${metB}`;
        } else if (pattern === "product") {
          calculatedVal = "$" + (valA * valB).toLocaleString(undefined, { maximumFractionDigits: 0 });
          calcFormulaText = `${metA} * ${metB}`;
        } else {
          calculatedVal = (valA + valB).toLocaleString(undefined, { maximumFractionDigits: 0 });
          calcFormulaText = `${metA} + ${metB}`;
        }
        
        // Append new card to Key Metrics grid
        if (metricsGrid) {
          const newCardId = "calc_card_" + Date.now();
          const card = document.createElement("div");
          card.id = newCardId;
          card.className = "dashboard-card bg-white p-4 rounded-xl border border-primary/20 shadow-sm flex flex-col justify-between relative group hover:border-primary/40 transition-all";
          
          card.innerHTML = `
            <div>
              <div class="flex items-center justify-between mb-2">
                <div class="w-7.5 h-7.5 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <span class="material-symbols-outlined text-[16px]">calculate</span>
                </div>
                <button class="delete-calc-card-btn opacity-0 group-hover:opacity-100 hover:text-error text-on-surface-variant/40 transition-all duration-200 cursor-pointer p-0.5 rounded hover:bg-error/5 flex items-center justify-center absolute top-4 right-4" title="Remove Calculated Metric">
                  <span class="material-symbols-outlined text-[14px]">delete</span>
                </button>
              </div>
              <p class="text-on-surface-variant font-medium text-[9.5px] uppercase tracking-wider mb-0.5 truncate pr-6" title="${name}">${name}</p>
              <h3 class="font-display font-bold text-lg text-primary">${calculatedVal}</h3>
            </div>
            <div class="mt-4 pt-2.5 border-t border-outline/50 flex items-start gap-1 font-mono text-[8.5px] text-on-surface-variant/60">
              <span class="font-semibold text-primary/80">Formula:</span> <span>${calcFormulaText}</span>
            </div>
          `;
          
          metricsGrid.appendChild(card);
          
          // Animate entrance
          gsap.fromTo(card, 
            { opacity: 0, scale: 0.8, y: 10 },
            { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.4)" }
          );
          
          // Reset form fields
          document.getElementById("modal-calc-name").value = "";
          
          showToast(`Calculated Metric "${name}" created successfully!`, "success");
          
          // Bind card deletion listener
          card.querySelector(".delete-calc-card-btn").addEventListener("click", (ev) => {
            ev.stopPropagation();
            gsap.to(card, {
              scale: 0.8,
              opacity: 0,
              duration: 0.35,
              ease: "power2.in",
              onComplete: () => {
                card.remove();
                showToast("Calculated metric removed.", "info");
              }
            });
          });
        }
      }, 1000);
    });
  }

  // Initial history render
  renderHistory();
});

