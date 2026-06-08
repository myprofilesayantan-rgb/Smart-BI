/* Insights Page Logic & Animations (insights/insights.js) */

document.addEventListener("DOMContentLoaded", () => {
  // --- Sidebar Collapse Logic (responsive without media queries) ---
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("main-content");
  const mainHeader = document.getElementById("main-header");
  const toggleBtn = document.getElementById("sidebar-toggle");

  // Global query input references
  const queryInput = document.getElementById("ask-ai-input");
  const parentContainer = document.getElementById("input-container-parent");
  const welcomeSection = document.getElementById("insights-welcome");
  const suggestionsSection = document.getElementById("insights-suggestions");
  const chatStreamSection = document.getElementById("chat-stream-section");
  const chatStream = document.getElementById("chat-stream");
  const loadingContainer = document.getElementById("ai-loading");
  const welcomeContainer = document.getElementById("welcome-container");

  // Voice Mic Simulation State
  const voiceBtn = document.getElementById("voice-input-btn");
  let isRecording = false;
  let voiceTimeout = null;

  // Widget Alternation State Tracker (for cycling graph types in feed)
  let queryCount = 0;

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

  // --- Pinned Widgets Library (Left Panel) ---
  const renderWidgetsHistory = () => {
    const historyList = document.getElementById("widgets-history-list");
    const historyCount = document.getElementById("widgets-history-count");
    if (!historyList) return;

    const storedWidgets = localStorage.getItem("smarbi_dashboard_widgets");
    const dashboardWidgets = storedWidgets ? JSON.parse(storedWidgets) : {
      "Main Dashboard": [],
      "Operations Overview": [],
      "Financials": [],
      "Team Performance": []
    };

    // Flatten all widgets with their dashboard key
    const allWidgets = [];
    Object.keys(dashboardWidgets).forEach(dashName => {
      dashboardWidgets[dashName].forEach(w => {
        allWidgets.push({
          ...w,
          dashboard: dashName
        });
      });
    });

    if (historyCount) {
      historyCount.innerText = `${allWidgets.length} Active`;
    }

    if (allWidgets.length === 0) {
      historyList.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12 text-center">
          <span class="material-symbols-outlined text-on-surface-variant/30 text-[32px] mb-2">widgets</span>
          <p class="text-[10px] font-semibold text-on-surface-variant/60">No widgets pinned yet.</p>
          <p class="text-[8.5px] text-on-surface-variant/40 mt-1 max-w-[180px]">Pin exploration insights to populate your widget library history.</p>
        </div>
      `;
      return;
    }

    historyList.innerHTML = allWidgets.map(widget => {
      let chartHtml = "";
      
      const lowerTitle = widget.title.toLowerCase();
      const isProduct = lowerTitle.includes("product") || lowerTitle.includes("underperform") || lowerTitle.includes("csat");

      // 1. Progress Bar Chart Layout
      if (widget.type === "progress") {
        let metric = "$1.42M";
        let targetText = "Q2 Target: $1.31M";
        let actualText = "Actual: $1.42M";
        let progressWidth = "87%";
        let indicatorClass = "bg-success/15 text-success";
        let indicatorTrend = "trending_up";
        let indicatorDiff = "+8.4% vs Target";
        let barClass = "from-primary to-purple-500";
        let comment = "Q2 Board target achieved ahead of forecast. Expansion MRR from enterprise accounts contributed to +74% of the ARR upside.";

        if (isProduct) {
          metric = "82% CSAT";
          targetText = "Goal: 85% CSAT";
          actualText = "Actual: 82% CSAT";
          progressWidth = "72%";
          indicatorClass = "bg-error/15 text-error";
          indicatorTrend = "trending_down";
          indicatorDiff = "-3.5% vs Goal";
          barClass = "from-red-400 to-orange-500";
          comment = "Customer satisfaction dropped by 3.5%, primarily linked to recent Shopify Webhook latency spikes in high-volume regions.";
        }

        chartHtml = `
          <div class="flex items-baseline gap-2 mb-1.5">
            <span class="font-display font-bold text-[15px] text-on-surface">${metric}</span>
            <span class="text-[8px] font-bold ${indicatorClass} px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <span class="material-symbols-outlined text-[9px]" style="font-variation-settings: 'FILL' 1;">${indicatorTrend}</span> ${indicatorDiff}
            </span>
          </div>
          <div class="py-1">
            <div class="flex items-center justify-between text-[7.5px] text-on-surface-variant font-bold mb-1">
              <span>${targetText}</span>
              <span>${actualText}</span>
            </div>
            <div class="relative w-full h-2 bg-outline-variant rounded-full overflow-hidden border border-outline/30 shadow-inner">
              <div class="absolute top-0 bottom-0 bg-gradient-to-r ${barClass} rounded-full" style="width: ${progressWidth}"></div>
            </div>
            <div class="flex justify-between items-center text-[7px] text-on-surface-variant/50 mt-0.5">
              <span>0%</span>
              <span>Target (100%)</span>
              <span>120%</span>
            </div>
          </div>
          <p class="text-[8px] text-on-surface-variant/70 leading-relaxed italic border-t border-outline/30 pt-1.5 mt-1.5">
            <strong>AI Summary:</strong> ${comment}
          </p>
        `;
      } 
      // 2. Donut Pie Chart Layout
      else if (widget.type === "pie") {
        chartHtml = `
          <div class="flex items-baseline gap-2 mb-1.5">
            <span class="font-display font-bold text-[15px] text-on-surface">45% Direct</span>
            <span class="text-[8px] font-bold bg-success/15 text-success px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <span class="material-symbols-outlined text-[9px]" style="font-variation-settings: 'FILL' 1;">trending_up</span> +12.4% MoM
            </span>
          </div>
          <div class="py-2.5 flex items-center justify-center relative">
            <svg class="w-14 h-14 transform -rotate-90" viewBox="0 0 64 64">
              <circle r="15.915" cx="32" cy="32" fill="transparent" stroke="#7c3bed" stroke-width="31.83" stroke-dasharray="45 100" stroke-dashoffset="0" />
              <circle r="15.915" cx="32" cy="32" fill="transparent" stroke="#a855f7" stroke-width="31.83" stroke-dasharray="25 100" stroke-dashoffset="-45" />
              <circle r="15.915" cx="32" cy="32" fill="transparent" stroke="#3b82f6" stroke-width="31.83" stroke-dasharray="20 100" stroke-dashoffset="-70" />
              <circle r="15.915" cx="32" cy="32" fill="transparent" stroke="#ec4899" stroke-width="31.83" stroke-dasharray="10 100" stroke-dashoffset="-90" />
            </svg>
          </div>
          <div class="mt-1.5 pt-1.5 border-t border-outline/30 grid grid-cols-2 gap-1 text-[7.5px] font-semibold text-on-surface-variant font-body">
            <div class="flex items-center gap-0.5"><span class="w-1 h-1 rounded-full bg-primary flex-shrink-0"></span><span class="truncate">Direct (45%)</span></div>
            <div class="flex items-center gap-0.5"><span class="w-1 h-1 rounded-full bg-purple-500 flex-shrink-0"></span><span class="truncate">Social (25%)</span></div>
            <div class="flex items-center gap-0.5"><span class="w-1 h-1 rounded-full bg-blue-500 flex-shrink-0"></span><span class="truncate">Email (20%)</span></div>
            <div class="flex items-center gap-0.5"><span class="w-1 h-1 rounded-full bg-pink-500 flex-shrink-0"></span><span class="truncate">Referrals (10%)</span></div>
          </div>
          <p class="text-[8px] text-on-surface-variant/70 leading-relaxed italic border-t border-outline/30 pt-1.5 mt-1.5">
            <strong>AI Summary:</strong> Organic and Direct channels remain the largest sources of high-LTV traffic. Social campaigns grew by 25% but conversion lags.
          </p>
        `;
      } 
      // 3. Trend Line Graph Layout
      else {
        const lineId = "line_history_" + widget.id;
        chartHtml = `
          <div class="flex items-baseline gap-2 mb-1.5">
            <span class="font-display font-bold text-[15px] text-on-surface">+14.3% MoM</span>
            <span class="text-[8px] font-bold bg-success/15 text-success px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <span class="material-symbols-outlined text-[9px]" style="font-variation-settings: 'FILL' 1;">trending_up</span> ARR Target met
            </span>
          </div>
          <div class="py-1">
            <svg class="w-full h-12 overflow-visible" viewBox="0 0 100 30">
              <defs>
                <linearGradient id="line-grad-${lineId}" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#7c3bed" stop-opacity="0.25" />
                  <stop offset="100%" stop-color="#7c3bed" stop-opacity="0.0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="15" x2="100" y2="15" stroke="#cbd5e1" stroke-width="0.5" stroke-dasharray="2 2" />
              <path d="M 0 30 L 0 25 Q 25 10 50 18 T 100 8 L 100 30 Z" fill="url(#line-grad-${lineId})" />
              <path d="M 0 25 Q 25 10 50 18 T 100 8" fill="transparent" stroke="#7c3bed" stroke-width="1.2" />
              <circle cx="0" cy="25" r="0.8" fill="#7c3bed" stroke="#ffffff" stroke-width="0.2" />
              <circle cx="25" cy="11.5" r="0.8" fill="#7c3bed" stroke="#ffffff" stroke-width="0.2" />
              <circle cx="50" cy="18" r="0.8" fill="#7c3bed" stroke="#ffffff" stroke-width="0.2" />
              <circle cx="100" cy="8" r="0.8" fill="#7c3bed" stroke="#ffffff" stroke-width="0.2" />
            </svg>
            <div class="flex justify-between text-[6.5px] text-on-surface-variant/60 font-semibold px-1 mt-1 font-body">
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span>
            </div>
          </div>
          <p class="text-[8px] text-on-surface-variant/70 leading-relaxed italic border-t border-outline/30 pt-1.5 mt-1.5">
            <strong>AI Summary:</strong> ARR expansion tracks ahead of estimates. Expansion contracts from current enterprise clients drove 90% of growth.
          </p>
        `;
      }

      // Colors for dashboard badges
      const badgeColors = {
        "Main Dashboard": "bg-primary/10 text-primary",
        "Operations Overview": "bg-blue-500/10 text-blue-600",
        "Financials": "bg-success/10 text-success",
        "Team Performance": "bg-orange-500/10 text-orange-600"
      };
      const badgeClass = badgeColors[widget.dashboard] || "bg-outline text-on-surface-variant";

      return `
        <div class="group/history bg-white border border-outline/70 p-4 rounded-xl hover:shadow-md hover:border-primary/20 transition-all flex flex-col relative" id="history_item_${widget.id}">
          
          <!-- Date/Time Stamp Header -->
          <div class="flex items-center gap-1 mb-2 text-[8px] text-on-surface-variant/40 font-bold uppercase tracking-wider select-none pr-6">
            <span class="material-symbols-outlined text-[10px]" style="font-variation-settings: 'wght' 600;">schedule</span>
            <span>Pinned: ${widget.pinnedAt || 'Just now'}</span>
          </div>

          <div class="flex items-start justify-between gap-1.5 min-w-0 mb-3">
            <div class="min-w-0 flex-1">
              <span class="text-[7.5px] font-bold uppercase tracking-wider ${badgeClass} px-1.5 py-0.5 rounded-full inline-block mb-1.5">
                ${widget.dashboard}
              </span>
              <h5 class="text-[10.5px] font-bold text-on-surface uppercase tracking-wider leading-snug truncate pr-6" title="${widget.title}">${widget.title}</h5>
              <p class="text-[8.5px] text-on-surface-variant/60 mt-0.5">CEO Strategic KPI</p>
            </div>
            
            <button class="history-delete-btn opacity-0 group-hover/history:opacity-100 hover:text-error text-on-surface-variant/40 transition-all duration-200 cursor-pointer flex items-center justify-center p-1 rounded-md hover:bg-error/5 absolute top-3.5 right-3.5" data-widget-id="${widget.id}" data-dashboard="${widget.dashboard}" title="Remove Widget">
              <span class="material-symbols-outlined text-[15px]">delete</span>
            </button>
          </div>

          ${chartHtml}
        </div>
      `;
    }).join('');

    // Attach deletion handlers to widgets inside the history panel
    document.querySelectorAll(".history-delete-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const widgetId = btn.getAttribute("data-widget-id");
        const dashboardName = btn.getAttribute("data-dashboard");

        // Remove from memory
        const storedWidgets = localStorage.getItem("smarbi_dashboard_widgets");
        if (storedWidgets) {
          const widgetsDb = JSON.parse(storedWidgets);
          if (widgetsDb[dashboardName]) {
            widgetsDb[dashboardName] = widgetsDb[dashboardName].filter(w => w.id !== widgetId);
            localStorage.setItem("smarbi_dashboard_widgets", JSON.stringify(widgetsDb));
            
            // Re-render
            renderWidgetsHistory();
            
            // Trigger Deletion Toast
            showToast("Widget removed from workspace.", "success");
          }
        }
      });
    });
  };

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
  renderWidgetsHistory();

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

  // --- Popover Dropdowns Toggle Logic ---
  const registerDropdown = (triggerEl, menuEl) => {
    if (!triggerEl || !menuEl) return;
    
    triggerEl.addEventListener("click", (e) => {
      e.stopPropagation();
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
        menuEl.offsetHeight;
        menuEl.classList.remove("opacity-0");
        gsap.fromTo(menuEl, 
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }
        );
      }
    });
  };

  const closeAllDropdowns = (exceptMenu = null) => {
    const menus = [
      { el: document.getElementById("notifications-menu"), type: "hide" },
      { el: document.getElementById("profile-menu"), type: "hide" },
      { el: document.getElementById("chat-context-menu"), type: "hide" },
      { el: document.getElementById("history-panel"), type: "hide" }
    ];

    // Close any dynamically rendered pinning select dropdowns as well
    document.querySelectorAll(".pin-dropdown").forEach(dm => {
      if (dm !== exceptMenu && !dm.classList.contains("hidden")) {
        gsap.to(dm, {
          opacity: 0,
          y: -5,
          duration: 0.15,
          onComplete: () => {
            dm.classList.add("hidden");
          }
        });
      }
    });

    menus.forEach(m => {
      if (m.el && m.el !== exceptMenu && !m.el.classList.contains("hidden") && !m.el.classList.contains("opacity-0")) {
        gsap.to(m.el, {
          opacity: 0,
          y: -10,
          duration: 0.15,
          onComplete: () => {
            m.el.classList.add("opacity-0", "hidden");
          }
        });
      }
    });
  };

  registerDropdown(document.getElementById("notifications-toggle"), document.getElementById("notifications-menu"));
  registerDropdown(document.getElementById("profile-toggle"), document.getElementById("profile-menu"));
  registerDropdown(document.getElementById("chat-context-toggle"), document.getElementById("chat-context-menu"));

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
        queryInput.placeholder = "Ask anything about your business...";
      }
    }
  });

  // --- Voice Mic Simulation Interaction ---
  if (voiceBtn && queryInput) {
    voiceBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      isRecording = !isRecording;
      if (isRecording) {
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
            queryInput.placeholder = "Ask anything about your business...";
            gsap.fromTo(queryInput, { opacity: 0.5 }, { opacity: 1, duration: 0.3 });
          }
        }, 2200);
      } else {
        if (voiceTimeout) clearTimeout(voiceTimeout);
        voiceBtn.classList.remove("text-error", "animate-pulse");
        voiceBtn.style.borderColor = "";
        queryInput.placeholder = "Ask anything about your business...";
      }
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
    .fromTo("#input-container-parent", 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8 },
      "-=0.3"
    );

  // Buttons micro-animations
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
  let recentQueries = JSON.parse(localStorage.getItem("smarbi_recent_queries"));
  let favoriteQueries = JSON.parse(localStorage.getItem("smarbi_fav_queries"));

  if (!recentQueries) {
    recentQueries = [
      "How did we do last month?",
      "Which product is underperforming?",
      "Predict next quarter's revenue",
      "Summarize my active data sources"
    ];
    localStorage.setItem("smarbi_recent_queries", JSON.stringify(recentQueries));
  }
  if (!favoriteQueries) {
    favoriteQueries = [
      "How did we do last month?"
    ];
    localStorage.setItem("smarbi_fav_queries", JSON.stringify(favoriteQueries));
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

    // Attach click listeners to history items
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
    localStorage.setItem("smarbi_fav_queries", JSON.stringify(favoriteQueries));
    renderHistory();
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
      localStorage.setItem("smarbi_recent_queries", JSON.stringify(recentQueries));
      renderHistory();
    });
  }

  document.addEventListener("click", (e) => {
    if (historyPanel && !historyPanel.classList.contains("hidden") && !historyPanel.contains(e.target) && e.target !== historyToggle && !historyToggle.contains(e.target)) {
      toggleHistory();
    }
  });

  // --- AI Conversational Interaction (Insights Specific Flow) ---
  const askBtn = document.getElementById("ask-ai-btn");

  const handleAISubmit = () => {
    const queryText = queryInput.value.trim();
    if (!queryText) return;

    // Reset voice recording simulation if running
    if (isRecording) {
      if (voiceTimeout) clearTimeout(voiceTimeout);
      isRecording = false;
      if (voiceBtn) {
        voiceBtn.classList.remove("text-error", "animate-pulse");
        voiceBtn.style.borderColor = "";
      }
      queryInput.placeholder = "Ask anything about your business...";
    }

    // Add to recent search array
    const existingIdx = recentQueries.indexOf(queryText);
    if (existingIdx > -1) {
      recentQueries.splice(existingIdx, 1);
    }
    recentQueries.unshift(queryText);
    if (recentQueries.length > 15) recentQueries.pop();
    localStorage.setItem("smarbi_recent_queries", JSON.stringify(recentQueries));

    if (historyPanel) historyPanel.classList.add("hidden");

    // Welcoming flow layout shift transition (hide welcome container and show chat)
    const isFirstQuery = welcomeContainer && !welcomeContainer.classList.contains("hidden");
    if (isFirstQuery) {
      // Fade out welcome container
      gsap.to(welcomeContainer, {
        opacity: 0,
        y: -20,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => {
          welcomeContainer.classList.add("hidden");
          chatStreamSection.classList.remove("hidden");
          chatStreamSection.classList.add("flex");
        }
      });
    }

    // Append User Query Bubble
    const userBubble = document.createElement("div");
    userBubble.className = "chat-bubble-user px-4 py-2.5 max-w-[85%] shadow-sm gsap-bubble-reveal";
    userBubble.innerHTML = `
      <p class="text-[12px] font-medium leading-normal">${queryText}</p>
    `;
    chatStream.appendChild(userBubble);
    gsap.fromTo(userBubble, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });

    // Show loading state inside stream
    loadingContainer.classList.remove("hidden");
    const pulseAnim = gsap.to(".loading-avatar", {
      scale: 1.15,
      repeat: -1,
      yoyo: true,
      duration: 0.8,
      ease: "sine.inOut"
    });

    // Auto-scroll to loading indicator
    loadingContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });

    // Cycle through Strategic Progress, Donut, and Line graph
    const widgetTypes = ["progress", "pie", "line"];
    const widgetType = widgetTypes[queryCount % 3];
    queryCount++;

    setTimeout(() => {
      pulseAnim.kill();
      loadingContainer.classList.add("hidden");

      // AI Response Card Content Generation
      let responseText = "";
      let chartHtml = "";
      let cardTitle = `Query Insight: "${queryText}"`;

      if (queryText.toLowerCase().includes("revenue") || widgetType === "line") {
        responseText = `Revenue performance indicators show a solid upward trend. Enterprise cohort growth is tracking at <strong class="text-on-surface">+14.3% MoM</strong>, with strong campaign acquisition leading to a total ARR of $1.42M.`;
      } else if (widgetType === "pie") {
        responseText = `Traffic cohort distributions indicate direct traffic channels currently represent <strong class="text-on-surface">45%</strong> of checkout sessions. Social expansion is trending upward but conversions lag by 0.4%.`;
      } else {
        responseText = `Active user cohorts grew by <strong class="text-on-surface">18.2%</strong> this month. Checkouts remain steady, but checkout shipping webhook latencies represent a minor risk factor.`;
      }

      // 1. Progress Bar Chart Layout
      if (widgetType === "progress") {
        let metric = "$1.42M";
        let subtext = "ARR Target Achievement Metric";
        let targetText = "Q2 Target: $1.31M";
        let actualText = "Actual: $1.42M";
        let progressWidth = "87%";
        let indicatorClass = "bg-success/15 text-success";
        let indicatorTrend = "trending_up";
        let indicatorDiff = "+8.4% vs Target";
        let barClass = "from-primary to-purple-500";
        let comment = "Q2 Board target achieved 18 days ahead of forecast. Expansion MRR from enterprise accounts contributed to +74% of the ARR upside.";

        const lowerQuery = queryText.toLowerCase();
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
          comment = "Customer satisfaction dropped by 3.5% this month, primarily linked to recent Shopify Webhook latency spikes in high-volume regions.";
        }

        chartHtml = `
          <div class="flex items-baseline gap-2 mb-2">
            <span class="font-display font-bold text-xl text-on-surface">${metric}</span>
            <span class="text-[9px] font-bold ${indicatorClass} px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <span class="material-symbols-outlined text-[10px]" style="font-variation-settings: 'FILL' 1;">${indicatorTrend}</span> ${indicatorDiff}
            </span>
          </div>
          <div class="py-2.5">
            <div class="flex items-center justify-between text-[8px] text-on-surface-variant font-bold mb-1">
              <span>${targetText}</span>
              <span>${actualText}</span>
            </div>
            <div class="relative w-full h-3 bg-surface-variant rounded-full overflow-hidden border border-outline/30 shadow-inner">
              <div class="absolute top-0 bottom-0 w-0.5 bg-on-surface-variant/50 z-20" style="left: 80%" title="Target Line (80%)"></div>
              <div class="absolute top-0 bottom-0 bg-gradient-to-r ${barClass} rounded-full z-10" style="width: ${progressWidth}"></div>
            </div>
            <div class="flex justify-between items-center text-[7.5px] text-on-surface-variant/60 mt-1">
              <span>0%</span>
              <span style="margin-left: 50%">Target (100%)</span>
              <span>120%</span>
            </div>
          </div>
          <p class="text-[9px] text-on-surface-variant/80 leading-relaxed italic border-t border-outline/40 pt-2 mt-2"><strong>AI Summary:</strong> ${comment}</p>
        `;
      } 
      // 2. Donut Pie Chart Layout
      else if (widgetType === "pie") {
        chartHtml = `
          <div class="flex items-baseline gap-2 mb-2">
            <span class="font-display font-bold text-xl text-on-surface">45% Direct</span>
            <span class="text-[9px] font-bold bg-success/15 text-success px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <span class="material-symbols-outlined text-[10px]" style="font-variation-settings: 'FILL' 1;">trending_up</span> +12.4% MoM
            </span>
          </div>
          <div class="py-3 flex items-center justify-center relative">
            <svg class="w-20 h-20 transform -rotate-90" viewBox="0 0 64 64">
              <circle r="15.915" cx="32" cy="32" fill="transparent" stroke="#7c3bed" stroke-width="31.83" stroke-dasharray="45 100" stroke-dashoffset="0" />
              <circle r="15.915" cx="32" cy="32" fill="transparent" stroke="#a855f7" stroke-width="31.83" stroke-dasharray="25 100" stroke-dashoffset="-45" />
              <circle r="15.915" cx="32" cy="32" fill="transparent" stroke="#3b82f6" stroke-width="31.83" stroke-dasharray="20 100" stroke-dashoffset="-70" />
              <circle r="15.915" cx="32" cy="32" fill="transparent" stroke="#ec4899" stroke-width="31.83" stroke-dasharray="10 100" stroke-dashoffset="-90" />
            </svg>
          </div>
          <div class="mt-2 pt-2 border-t border-outline/50 grid grid-cols-2 gap-1.5 text-[8.5px] font-semibold text-on-surface-variant font-body">
            <div class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></span><span class="truncate">Direct (45%)</span></div>
            <div class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0"></span><span class="truncate">Social (25%)</span></div>
            <div class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></span><span class="truncate">Email (20%)</span></div>
            <div class="flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-pink-500 flex-shrink-0"></span><span class="truncate">Referrals (10%)</span></div>
          </div>
          <p class="text-[9px] text-on-surface-variant/80 leading-relaxed italic border-t border-outline/40 pt-2 mt-2"><strong>AI Summary:</strong> Organic and Direct channels remain the largest sources of high-LTV traffic. Social campaigns grew by 25% but have lower checkout conversion.</p>
        `;
      } 
      // 3. Trend Line Graph Layout
      else {
        const lineId = "line_" + Date.now();
        chartHtml = `
          <div class="flex items-baseline gap-2 mb-2">
            <span class="font-display font-bold text-xl text-on-surface">+14.3% MoM</span>
            <span class="text-[9px] font-bold bg-success/15 text-success px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <span class="material-symbols-outlined text-[10px]" style="font-variation-settings: 'FILL' 1;">trending_up</span> ARR Target met
            </span>
          </div>
          <div class="py-2">
            <svg class="w-full h-16 overflow-visible" viewBox="0 0 100 30">
              <defs>
                <linearGradient id="line-grad-${lineId}" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#7c3bed" stop-opacity="0.25" />
                  <stop offset="100%" stop-color="#7c3bed" stop-opacity="0.0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="15" x2="100" y2="15" stroke="#cbd5e1" stroke-width="0.75" stroke-dasharray="2 2" />
              <path d="M 0 30 L 0 25 Q 25 10 50 18 T 100 8 L 100 30 Z" fill="url(#line-grad-${lineId})" />
              <path d="M 0 25 Q 25 10 50 18 T 100 8" fill="transparent" stroke="#7c3bed" stroke-width="1.5" />
              <circle cx="0" cy="25" r="1" fill="#7c3bed" stroke="#ffffff" stroke-width="0.3" />
              <circle cx="25" cy="11.5" r="1" fill="#7c3bed" stroke="#ffffff" stroke-width="0.3" />
              <circle cx="50" cy="18" r="1" fill="#7c3bed" stroke="#ffffff" stroke-width="0.3" />
              <circle cx="100" cy="8" r="1" fill="#7c3bed" stroke="#ffffff" stroke-width="0.3" />
            </svg>
            <div class="flex justify-between text-[7px] text-on-surface-variant/60 font-semibold px-1 mt-1 font-body">
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr (Current)</span>
            </div>
          </div>
          <p class="text-[9px] text-on-surface-variant/80 leading-relaxed italic border-t border-outline/40 pt-2 mt-2"><strong>AI Summary:</strong> Compound monthly expansion continues to track ahead of estimates. Expansion contracts from current enterprise clients drove 90% of this month's growth.</p>
        `;
      }

      // Unique identifier for this dynamic response card
      const responseId = "response_" + Date.now();

      const aiBubble = document.createElement("div");
      aiBubble.className = "chat-bubble-ai p-4 max-w-[90%] md:max-w-[80%] border border-outline shadow-sm gsap-bubble-reveal flex flex-col gap-4";
      aiBubble.innerHTML = `
        <div class="flex items-start gap-2.5">
          <div class="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
            <span class="material-symbols-outlined text-[15px]" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
          </div>
          <div class="space-y-1.5 flex-1 min-w-0">
            <h4 class="text-[9px] font-bold uppercase tracking-wider text-primary">BI Brain Response</h4>
            <p class="text-[12px] leading-relaxed text-on-surface">${responseText}</p>
          </div>
        </div>

        <!-- Metric Visualization Card -->
        <div class="insights-card-hover bg-background p-4 rounded-xl border border-outline/60 flex flex-col justify-between">
          <div class="min-w-0 flex-1 mb-2">
            <span class="text-[8px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full uppercase tracking-wider">CEO Strategic KPI</span>
            <h4 class="text-[10.5px] font-bold text-on-surface uppercase tracking-wider mt-1 truncate" title="${cardTitle}">${cardTitle}</h4>
          </div>
          ${chartHtml}
        </div>

        <!-- Pin to Dashboard Action Bar -->
        <div class="flex items-center justify-between border-t border-outline/50 pt-3 flex-wrap gap-2" id="action-bar-${responseId}">
          <span class="text-[9.5px] text-on-surface-variant italic">Unpinned exploration result</span>
          
          <div class="relative">
            <button class="pin-trigger-btn flex items-center gap-1 py-1 px-3 border border-outline hover:border-primary hover:bg-primary/5 text-on-surface hover:text-primary transition-all text-[10px] font-bold rounded-lg cursor-pointer">
              <span class="material-symbols-outlined text-[14px]">push_pin</span>
              <span>Pin to →</span>
            </button>
            
            <!-- Dashboard selection popup -->
            <div class="pin-dropdown hidden absolute bottom-full right-0 mb-1.5 w-48 bg-white rounded-lg shadow-xl border border-outline z-50 py-1 flex flex-col">
              <span class="px-2.5 py-1 text-[8px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/60 pb-1 mb-1">Select Dashboard</span>
              <button class="pin-option-btn w-full text-left px-2.5 py-1 text-[10px] font-semibold hover:bg-primary-container hover:text-primary transition-colors cursor-pointer" data-dashboard="Main Dashboard">Main Dashboard</button>
              <button class="pin-option-btn w-full text-left px-2.5 py-1 text-[10px] font-semibold hover:bg-primary-container hover:text-primary transition-colors cursor-pointer" data-dashboard="Operations Overview">Operations Overview</button>
              <button class="pin-option-btn w-full text-left px-2.5 py-1 text-[10px] font-semibold hover:bg-primary-container hover:text-primary transition-colors cursor-pointer" data-dashboard="Financials">Financials</button>
              <button class="pin-option-btn w-full text-left px-2.5 py-1 text-[10px] font-semibold hover:bg-primary-container hover:text-primary transition-colors cursor-pointer" data-dashboard="Team Performance">Team Performance</button>
            </div>
          </div>
        </div>
      `;

      chatStream.appendChild(aiBubble);
      gsap.fromTo(aiBubble, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" });

      // Attach Pinning Dropdown Logic to this specific bubble
      const pinTrigger = aiBubble.querySelector(".pin-trigger-btn");
      const pinDropdown = aiBubble.querySelector(".pin-dropdown");
      const pinOptions = aiBubble.querySelectorAll(".pin-option-btn");

      if (pinTrigger && pinDropdown) {
        pinTrigger.addEventListener("click", (e) => {
          e.stopPropagation();
          closeAllDropdowns(pinDropdown);
          const isHidden = pinDropdown.classList.contains("hidden");
          if (isHidden) {
            pinDropdown.classList.remove("hidden");
            gsap.fromTo(pinDropdown, { opacity: 0, y: 5 }, { opacity: 1, y: 0, duration: 0.2, ease: "power1.out" });
          } else {
            gsap.to(pinDropdown, { opacity: 0, y: 5, duration: 0.15, onComplete: () => pinDropdown.classList.add("hidden") });
          }
        });

        // Trigger outer click registers properly
        document.addEventListener("click", (e) => {
          if (!pinDropdown.classList.contains("hidden") && !pinDropdown.contains(e.target) && e.target !== pinTrigger) {
            gsap.to(pinDropdown, { opacity: 0, y: 5, duration: 0.15, onComplete: () => pinDropdown.classList.add("hidden") });
          }
        });
      }

      pinOptions.forEach(opt => {
        opt.addEventListener("click", (e) => {
          e.stopPropagation();
          const dashboardName = opt.getAttribute("data-dashboard");
          
          // Add widget to localStorage database
          const storedWidgets = localStorage.getItem("smarbi_dashboard_widgets");
          const dashboardWidgets = storedWidgets ? JSON.parse(storedWidgets) : {
            "Main Dashboard": [],
            "Operations Overview": [],
            "Financials": [],
            "Team Performance": []
          };

          const newWidgetId = "widget_" + Date.now();
          const newWidget = {
            id: newWidgetId,
            title: `Insight: "${queryText}"`,
            type: widgetType,
            pinnedAt: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
          };

          if (!dashboardWidgets[dashboardName]) {
            dashboardWidgets[dashboardName] = [];
          }
          dashboardWidgets[dashboardName].push(newWidget);
          localStorage.setItem("smarbi_dashboard_widgets", JSON.stringify(dashboardWidgets));
          renderWidgetsHistory();

          // Hide select dropdown
          gsap.to(pinDropdown, {
            opacity: 0,
            y: 5,
            duration: 0.15,
            onComplete: () => {
              pinDropdown.classList.add("hidden");
            }
          });

          // Swap pinning buttons for confirmation details
          const actionBar = document.getElementById(`action-bar-${responseId}`);
          if (actionBar) {
            actionBar.innerHTML = `
              <span class="text-[9.5px] text-success font-semibold flex items-center gap-1 animate-pulse">
                <span class="material-symbols-outlined text-[14px]">check_circle</span>
                <span>Pinned to ${dashboardName}</span>
              </span>
              <a href="dashboard.html" class="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline">
                <span>View Dashboard</span>
                <span class="material-symbols-outlined text-[13px]">arrow_right_alt</span>
              </a>
            `;
            gsap.fromTo(actionBar, { opacity: 0.5 }, { opacity: 1, duration: 0.4 });
          }

          // Trigger Success Toaster Alert
          showToast(`Widget pinned to ${dashboardName}.`, 'success');
        });
      });

      // Clear search query
      queryInput.value = "";

      // Smooth scroll feed container to bottom
      setTimeout(() => {
        aiBubble.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 50);

    }, 1500);
  };

  // Triggers Setup
  if (askBtn && queryInput) {
    window.handleAISubmit = handleAISubmit;
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

});
