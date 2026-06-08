/* Data Sources Page Logic & Simulation (data_sources/data_sources.js) */

document.addEventListener("DOMContentLoaded", () => {
  // --- Sidebar Collapse Logic ---
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("main-content");
  const mainHeader = document.getElementById("main-header");
  const toggleBtn = document.getElementById("sidebar-toggle");

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

  // --- Popover Dropdowns Toggle Logic (Visual Consistency) ---
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
        menuEl.offsetHeight; // Reflow
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
      { el: document.getElementById("notifications-menu") },
      { el: document.getElementById("profile-menu") }
    ];

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

  // Global outer-click closes dropdowns
  document.addEventListener("click", () => {
    closeAllDropdowns();
  });

  // --- Toast Notification System ---
  const showToast = (message, type = 'success') => {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast-card flex items-start gap-2.5 py-2 px-3.5 bg-white/95 backdrop-blur-md border border-outline rounded-xl shadow-lg transition-all duration-300 transform -translate-y-10 opacity-0 min-w-[200px]";
    
    const icon = type === 'success' ? 'check_circle' : (type === 'error' ? 'error' : 'info');
    const iconColor = type === 'success' ? 'text-success' : (type === 'error' ? 'text-error' : 'text-primary');

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

  // --- Sync Now Action Simulation (PostgreSQL) ---
  const syncBtn = document.querySelector(".db-sync-btn");
  const lastSyncTimeEl = document.getElementById("db-sync-time");
  const summaryLastSyncEl = document.getElementById("summary-last-sync");
  const syncHistoryBody = document.getElementById("sync-history-body");

  if (syncBtn) {
    syncBtn.addEventListener("click", () => {
      if (syncBtn.classList.contains("pointer-events-none")) return;

      const syncIcon = syncBtn.querySelector(".sync-icon");
      
      // Disable button & animate spinner
      syncBtn.classList.add("pointer-events-none", "opacity-75");
      if (syncIcon) syncIcon.classList.add("animate-spin");
      
      showToast("Sync started: Scanning production_db indexes...", "info");

      setTimeout(() => {
        // Update UI timestamps
        if (lastSyncTimeEl) lastSyncTimeEl.innerText = "Just now";
        if (summaryLastSyncEl) summaryLastSyncEl.innerText = "Just now";
        
        // Re-enable button & remove animation
        syncBtn.classList.remove("pointer-events-none", "opacity-75");
        if (syncIcon) syncIcon.classList.remove("animate-spin");

        showToast("Database sync completed! +3,842 rows updated.", "success");

        // Prepend new row to sync logs history
        if (syncHistoryBody) {
          const newRow = document.createElement("tr");
          newRow.className = "bg-primary-container/10 border-b border-outline/30";
          newRow.innerHTML = `
            <td class="px-5 py-4 font-medium text-on-surface">Just now</td>
            <td class="px-5 py-4 text-on-surface font-semibold">production_db</td>
            <td class="px-5 py-4 text-on-surface-variant">Manual Sync</td>
            <td class="px-5 py-4">
              <span class="px-2.5 py-0.5 bg-success-container/70 text-success rounded-full text-[9.5px] font-bold">Success</span>
            </td>
            <td class="px-5 py-4 text-right font-semibold text-primary">+3,842 rows</td>
          `;
          syncHistoryBody.insertBefore(newRow, syncHistoryBody.firstChild);
          
          // Animate new row entry
          gsap.from(newRow, {
            backgroundColor: "rgba(124, 58, 237, 0.15)",
            duration: 0.6,
            ease: "power2.out"
          });
        }
      }, 2500);
    });
  }

  // --- File Upload Version Simulation ---
  const fileUploadBtn = document.querySelector(".file-upload-new-btn");
  if (fileUploadBtn) {
    fileUploadBtn.addEventListener("click", () => {
      // Simulate choosing a file and uploading it
      showToast("Select new file version...", "info");
      
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = ".csv,.xlsx,.xls,.json";
      
      fileInput.addEventListener("change", () => {
        if (fileInput.files.length > 0) {
          const fileName = fileInput.files[0].name;
          showToast(`Uploading ${fileName}...`, "info");
          
          setTimeout(() => {
            showToast(`${fileName} successfully imported into workspace!`, "success");
            
            // Add row to sync logs
            if (syncHistoryBody) {
              const newRow = document.createElement("tr");
              newRow.className = "bg-primary-container/10 border-b border-outline/30";
              newRow.innerHTML = `
                <td class="px-5 py-4 font-medium text-on-surface">Just now</td>
                <td class="px-5 py-4 text-on-surface font-semibold truncate max-w-[150px]" title="${fileName}">${fileName}</td>
                <td class="px-5 py-4 text-on-surface-variant">File Upload</td>
                <td class="px-5 py-4">
                  <span class="px-2.5 py-0.5 bg-success-container/70 text-success rounded-full text-[9.5px] font-bold">Success</span>
                </td>
                <td class="px-5 py-4 text-right font-semibold text-primary">Imported</td>
              `;
              syncHistoryBody.insertBefore(newRow, syncHistoryBody.firstChild);
            }
          }, 1500);
        }
      });
      
      fileInput.click();
    });
  }

  // --- File Clear Simulation ---
  const fileClearBtn = document.querySelector(".file-clear-btn");
  if (fileClearBtn) {
    fileClearBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear this file data? All custom metrics calculated from this file will be archived.")) {
        showToast("Deleting spreadsheet dataset...", "info");
        setTimeout(() => {
          showToast("File data cleared.", "success");
        }, 800);
      }
    });
  }

  // --- Modal Config Toggles (PostgreSQL Credentials) ---
  const dbModal = document.getElementById("db-modal-overlay");
  const manageBtn = document.querySelector(".db-manage-btn");
  const addConnectorBtn = document.getElementById("add-connector-btn");
  
  const closeModalBtn = document.getElementById("close-db-modal");
  const cancelModalBtn = document.getElementById("modal-cancel-btn");
  const saveModalBtn = document.getElementById("modal-save-btn");
  const testConnBtn = document.getElementById("modal-test-btn");
  const modalForm = document.getElementById("db-modal-form");

  const openModal = () => {
    if (!dbModal) return;
    dbModal.classList.remove("hidden");
    dbModal.classList.add("flex");
    
    // Zoom/scale animation using GSAP
    gsap.fromTo(dbModal, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" });
    gsap.fromTo(
      dbModal.querySelector(".bg-white"),
      { scale: 0.93, opacity: 0, y: 15 },
      { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.2)" }
    );
  };

  const closeModal = () => {
    if (!dbModal) return;
    
    gsap.to(dbModal.querySelector(".bg-white"), {
      scale: 0.95,
      opacity: 0,
      y: 10,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => {
        dbModal.classList.remove("flex");
        dbModal.classList.add("hidden");
      }
    });
    gsap.to(dbModal, { opacity: 0, duration: 0.25, ease: "power2.in" });
  };

  if (manageBtn) manageBtn.addEventListener("click", openModal);
  if (addConnectorBtn) addConnectorBtn.addEventListener("click", openModal);
  
  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener("click", closeModal);

  // Close modal when clicking on backdrop
  if (dbModal) {
    dbModal.addEventListener("click", (e) => {
      if (e.target === dbModal) closeModal();
    });
  }

  // Test Connection Action Simulation
  if (testConnBtn) {
    testConnBtn.addEventListener("click", () => {
      testConnBtn.innerText = "Testing...";
      testConnBtn.classList.add("pointer-events-none", "opacity-85");
      
      showToast("Contacting Host db.example.com...", "info");
      
      setTimeout(() => {
        testConnBtn.innerText = "Test Connection";
        testConnBtn.classList.remove("pointer-events-none", "opacity-85");
        
        showToast("Connection Successful! PostgreSQL 15.2 detected.", "success");
      }, 1800);
    });
  }

  // Save Modal Configuration
  if (modalForm) {
    modalForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const dbHost = document.getElementById("modal-db-host").value;
      const dbName = document.getElementById("modal-db-name").value;
      
      showToast("Saving secure connection credentials...", "info");
      
      setTimeout(() => {
        showToast("Connection settings updated successfully!", "success");
        closeModal();
      }, 1000);
    });
  }

  // --- Available Connectors Click Actions ---
  const connectors = document.querySelectorAll(".connector-card");
  connectors.forEach(card => {
    card.addEventListener("click", () => {
      const name = card.querySelector("h4").innerText;
      showToast(`${name} integration connector is coming soon!`, "info");
    });
  });

  // --- AI Chat Data Companion Logic ---
  const chatFeed = document.getElementById("ai-chat-feed");
  const chatInput = document.getElementById("ai-chat-input");
  const chatSendBtn = document.getElementById("ai-chat-send-btn");
  const clearChatBtn = document.getElementById("clear-ai-chat-btn");
  const suggestedBtns = document.querySelectorAll(".suggested-prompt-btn");

  const updateSendButton = () => {
    if (!chatInput || !chatSendBtn) return;
    if (chatInput.value.trim().length > 0) {
      chatSendBtn.removeAttribute("disabled");
    } else {
      chatSendBtn.setAttribute("disabled", "true");
    }
  };

  if (chatInput) {
    chatInput.addEventListener("input", updateSendButton);
    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        triggerChatResponse();
      }
    });
  }

  const triggerChatResponse = () => {
    const query = chatInput.value.trim();
    if (query.length === 0) return;

    // Clear input
    chatInput.value = "";
    updateSendButton();

    // Append User message
    appendChatMessage(query, "user");
    
    // Scroll to bottom
    scrollToChatBottom();

    // Simulated typing state
    setTimeout(() => {
      appendChatMessage("typing...", "ai-typing");
      scrollToChatBottom();

      setTimeout(() => {
        // Remove typing bubble
        const typingBubble = document.getElementById("ai-typing-bubble");
        if (typingBubble) typingBubble.remove();

        // Generate response based on query keywords
        let reply = "";
        const lowerQ = query.toLowerCase();
        
        // SQL query pivots (developer queries)
        if (lowerQ.includes("select ") || lowerQ.includes("join") || lowerQ.includes("where") || lowerQ.includes("group by") || lowerQ.includes("sql query") || lowerQ.includes("write sql")) {
          reply = "I am scoped exclusively to connections, sync health, and credentials on this page. For writing SQL queries or building metrics, please head over to the Query Builder or Insights tab!";
        }
        // Sync failure / Last sync question
        else if (lowerQ.includes("fail") || lowerQ.includes("last sync") || lowerQ.includes("june 7") || lowerQ.includes("error")) {
          reply = "The June 7, 01:10 PM sync on <strong>production_db</strong> failed with an <strong>Auth Timeout</strong>. This usually means the database credentials have expired or the host rejected the connection. Try refreshing credentials under the Credentials button, then trigger a manual sync.";
        }
        // Salesforce Connection setup
        else if (lowerQ.includes("salesforce")) {
          reply = "To connect Salesforce, scroll down to the 'Available Connectors' catalog, locate <strong>Salesforce</strong>, and click it. You will be prompted to log in and authorize SMarBI to read your CRM records.";
        }
        // Shopify Connection setup
        else if (lowerQ.includes("shopify")) {
          reply = "To connect Shopify, scroll down to the 'Available Connectors' catalog, click <strong>Shopify</strong>, and insert your storefront URL. You will then authenticate via Shopify's secure app credential gate.";
        }
        // Stripe Connection setup
        else if (lowerQ.includes("stripe")) {
          reply = "The Stripe connector securely pulls transactional logs to automatically build ARR, Churn, and MRR metrics. Click <strong>Stripe</strong> in the catalog below to launch the OAuth connect wizard.";
        }
        // Auth Timeout explanation
        else if (lowerQ.includes("auth timeout") || lowerQ.includes("timeout")) {
          reply = "An <strong>Auth Timeout</strong> indicates that our connection request was rejected due to invalid, expired, or rotated credentials. You can fix this by clicking the 'Credentials' button on the PostgreSQL card, verifying the password, and saving the updated credentials.";
        }
        // Interactive Host Setting Pre-fill
        else if (lowerQ.includes("change host") || lowerQ.includes("set host") || lowerQ.includes("update host")) {
          // Extract hostname if possible
          let hostName = "staging-db.example.com";
          const match = query.match(/(?:to\s+)([a-zA-Z0-9\.\-\_]+)/i);
          if (match && match[1]) {
            hostName = match[1];
          }
          
          reply = `I've updated the Host URL in your settings to <code>${hostName}</code> and opened the connection credentials for your review.`;
          
          // Pre-fill and open modal
          const hostInput = document.getElementById("modal-db-host");
          if (hostInput) {
            hostInput.value = hostName;
            // Flash color highlight
            gsap.fromTo(hostInput.parentElement, { borderColor: "#7c3bed", borderWidth: "2px" }, { borderColor: "#e2e8f0", borderWidth: "1px", duration: 1.5 });
          }
          
          setTimeout(() => {
            openModal();
          }, 800);
        }
        // Interactive Sync Frequency Pre-fill
        else if (lowerQ.includes("frequency") || lowerQ.includes("interval") || lowerQ.includes("sync every")) {
          let freqVal = "24h";
          let freqText = "Every 24 hours (Daily)";
          
          if (lowerQ.includes("1 hour") || lowerQ.includes("1h") || lowerQ.includes("hourly")) {
            freqVal = "1h";
            freqText = "Every 1 hour";
          } else if (lowerQ.includes("6 hours") || lowerQ.includes("6h")) {
            freqVal = "6h";
            freqText = "Every 6 hours";
          } else if (lowerQ.includes("12 hours") || lowerQ.includes("12h")) {
            freqVal = "12h";
            freqText = "Every 12 hours";
          } else if (lowerQ.includes("manual")) {
            freqVal = "manual";
            freqText = "Manual Trigger Only";
          }
          
          reply = `I've updated the Synchronization Interval to <code>${freqText}</code> in your credentials form.`;
          
          const freqSelect = document.getElementById("modal-db-frequency");
          if (freqSelect) {
            freqSelect.value = freqVal;
            gsap.fromTo(freqSelect, { borderColor: "#7c3bed", borderWidth: "2px" }, { borderColor: "#e2e8f0", borderWidth: "1px", duration: 1.5 });
          }
          
          setTimeout(() => {
            openModal();
          }, 800);
        }
        // Interactive Sync Run Trigger
        else if (lowerQ.includes("run sync") || lowerQ.includes("trigger sync") || lowerQ.includes("retry sync") || lowerQ.includes("sync database")) {
          reply = "Understood. Starting manual synchronization sequence for <code>production_db</code> now...";
          
          setTimeout(() => {
            if (syncBtn) {
              syncBtn.click();
            }
          }, 600);
        }
        // Interactive File Clear Trigger
        else if (lowerQ.includes("clear file") || lowerQ.includes("delete csv") || lowerQ.includes("clear transactions")) {
          reply = "Initiating clear sequence for spreadsheet dataset. Please confirm the deletion prompt.";
          
          setTimeout(() => {
            if (fileClearBtn) {
              fileClearBtn.click();
            }
          }, 600);
        }
        // Default general fallback
        else {
          reply = "I can help you troubleshoot database sync errors, update connection credentials, or explain how to connect SaaS integrations (like Stripe or Salesforce). Let me know if you want to update settings or run a database sync!";
        }

        appendChatMessage(reply, "ai");
        scrollToChatBottom();
      }, 1500);

    }, 450);
  };

  const appendChatMessage = (message, sender) => {
    if (!chatFeed) return;

    const bubble = document.createElement("div");
    
    if (sender === "user") {
      bubble.className = "flex justify-end w-full";
      bubble.innerHTML = `
        <div class="bg-primary-container text-primary rounded-xl rounded-br-[2px] p-3 border border-primary/15 text-[11px] font-medium leading-relaxed max-w-[85%] font-body shadow-sm">
          ${message}
        </div>
      `;
    } else if (sender === "ai-typing") {
      bubble.id = "ai-typing-bubble";
      bubble.className = "flex gap-2.5 items-start";
      bubble.innerHTML = `
        <div class="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
          <span class="material-symbols-outlined text-[15px]" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
        </div>
        <div class="bg-white rounded-xl rounded-bl-[2px] p-3 border border-outline shadow-sm text-[11px] leading-relaxed text-on-surface-variant font-medium animate-pulse">
          Connection Assistant is writing...
        </div>
      `;
    } else {
      bubble.className = "flex gap-2.5 items-start";
      bubble.innerHTML = `
        <div class="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
          <span class="material-symbols-outlined text-[15px]" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
        </div>
        <div class="bg-white rounded-xl rounded-bl-[2px] p-3 border border-outline shadow-sm text-[11px] leading-relaxed text-on-surface max-w-[85%] font-body">
          <div class="space-y-1">
            <h4 class="text-[9px] font-bold uppercase tracking-wider text-primary">Connection Assistant</h4>
            <p class="text-[11px] leading-relaxed text-on-surface font-normal">${message}</p>
          </div>
        </div>
      `;
    }

    chatFeed.appendChild(bubble);
  };

  const scrollToChatBottom = () => {
    if (chatFeed) {
      chatFeed.scrollTop = chatFeed.scrollHeight;
    }
  };

  if (chatSendBtn) {
    chatSendBtn.addEventListener("click", triggerChatResponse);
  }

  // Clear chat trigger
  if (clearChatBtn) {
    clearChatBtn.addEventListener("click", () => {
      if (chatFeed) {
        chatFeed.innerHTML = `
          <!-- Initial AI Message -->
          <div class="flex gap-2.5 items-start">
            <div class="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
              <span class="material-symbols-outlined text-[15px]" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
            </div>
            <div class="bg-white rounded-xl rounded-tl-none p-3 border border-outline shadow-sm text-xs leading-relaxed text-on-surface max-w-[85%] font-body">
              <div class="space-y-1">
                <h4 class="text-[9px] font-bold uppercase tracking-wider text-primary">Connection Assistant</h4>
                <p class="text-[11px] leading-relaxed text-on-surface">Ask me about your active connections, sync errors, credentials, or how to add a new data source. I'm scoped to this page.</p>
              </div>
            </div>
          </div>
        `;
        showToast("Conversation cleared.", "info");
      }
    });
  }

  // Suggested Prompts Click Trigger
  suggestedBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      if (chatInput) {
        chatInput.value = btn.innerText.trim();
        updateSendButton();
        triggerChatResponse();
      }
    });
  });
});
