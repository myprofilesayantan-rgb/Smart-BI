/**
 * discover.js — Traditional Dashboard Simulation (The Problem Section)
 *
 * Animates the Legacy BI mockup: database connection, SQL compilation,
 * cursor interactions, KPI selection, context menu, and timeout error loop.
 */

window.SmartBI_Discover = {
  init() {
    this.initDashboardLoop();
  },

  initDashboardLoop() {
    const mockup        = document.querySelector('.legacy-bi-mockup');
    const formulaEditor = document.querySelector('.tb-formula-editor');
    const closeBtn      = document.querySelector('.tb-fe-close');
    const tablesList    = document.querySelector('.tb-tables-list');
    const cursor        = document.getElementById('tb-sim-cursor');
    const kpis          = document.querySelectorAll('.tb-list-item.meas');
    const churnKpi      = Array.from(kpis).find(k => k.textContent.includes('Churn Rate'));

    const consoleBox    = document.getElementById('tb-console-error-box');
    const consoleText   = document.getElementById('tb-console-text-msg');
    const progressFill  = document.getElementById('tb-console-progress-fill');
    const sqlBlock      = document.getElementById('tb-console-sql-block');
    const colsPill      = document.querySelector('.tb-axis-shelf .green-pill');
    const xAxisTitle    = document.querySelector('.tb-chart-x-axis-title');
    const bars          = document.querySelectorAll('.tb-bar');

    const contextMenu   = document.getElementById('tb-context-menu');
    const menuSum       = document.getElementById('tb-menu-sum');
    const menuAvg       = document.getElementById('tb-menu-avg');

    const salesWidths   = [63, 83, 47, 92, 15, 92, 30, 30, 73, 15, 15, 100, 15, 100, 63, 15, 100, 15, 17, 37, 47, 47];
    const churnWidths   = [18, 35, 12, 45, 8, 52, 22, 19, 38, 5, 12, 60, 15, 55, 30, 8, 48, 10, 14, 25, 20, 28];
    const avgChurnWidths = [24, 42, 18, 55, 12, 50, 28, 26, 40, 10, 15, 62, 20, 58, 32, 14, 52, 12, 18, 30, 22, 35];

    const salesSql     = `SELECT c.country, r.region, SUM(o.sales) AS revenue, \n(SUM(o.profit) - SUM(o.cac)) / COUNT(DISTINCT o.customer_id) AS net_ltv \nFROM orders o JOIN customers c ON o.customer_id = c.id \nGROUP BY c.country, r.region;`;
    const churnSumSql  = `SELECT c.country, r.region, SUM(o.churn_rate) AS sum_churn, \nCOUNT(DISTINCT o.customer_id) AS total_customers \nFROM orders o JOIN customers c ON o.customer_id = c.id \nGROUP BY c.country, r.region;`;
    const churnAvgSql  = `SELECT c.country, r.region, AVG(o.churn_rate) AS avg_churn, \nCOUNT(DISTINCT o.customer_id) AS total_customers \nFROM orders o JOIN customers c ON o.customer_id = c.id \nGROUP BY c.country, r.region;`;

    if (!mockup || !consoleText || !progressFill || !cursor) return;

    let loopTimeout1 = null, loopTimeout2 = null, loopTimeout3 = null,
        loopTimeout4 = null, loopTimeout5 = null, scrollTimeout = null;

    const clearActiveTimeouts = () => {
      clearTimeout(loopTimeout1); clearTimeout(loopTimeout2);
      clearTimeout(loopTimeout3); clearTimeout(loopTimeout4);
      clearTimeout(loopTimeout5); clearTimeout(scrollTimeout);
    };

    const getRelativeCoords = (elem) => {
      const mockupRect = mockup.getBoundingClientRect();
      const elemRect   = elem.getBoundingClientRect();
      return {
        x: elemRect.left - mockupRect.left + elemRect.width / 2,
        y: elemRect.top  - mockupRect.top  + elemRect.height / 2
      };
    };

    const runSimulation = () => {
      clearActiveTimeouts();

      // Step 1: Initialize states
      formulaEditor.classList.remove('is-closed');
      colsPill.textContent  = 'SUM(Sales)';
      xAxisTitle.textContent = 'Sales (Millions)';
      if (churnKpi)    churnKpi.classList.remove('active');
      if (sqlBlock)    sqlBlock.innerHTML = `<code>${salesSql}</code>`;
      if (contextMenu) contextMenu.style.display = 'none';
      if (menuSum) { menuSum.classList.add('active-check'); menuSum.classList.remove('hovered'); }
      if (menuAvg) { menuAvg.classList.remove('active-check'); menuAvg.classList.remove('hovered'); }

      bars.forEach((bar, idx) => { bar.style.width = `${salesWidths[idx % salesWidths.length]}%`; });
      if (tablesList) tablesList.scrollTop = 0;

      cursor.style.opacity = '0';
      gsap.set(cursor, { x: 250, y: 350 });

      // Animate DB console connection
      consoleBox.classList.remove('has-error');
      consoleText.className    = 'tb-console-text';
      consoleText.textContent  = 'Connecting to analytical-replica-01.aws...';
      progressFill.style.width           = '20%';
      progressFill.style.backgroundColor = '#38BDF8';

      // Step 2: DB updates & cursor close popup
      loopTimeout1 = setTimeout(() => {
        consoleText.textContent = 'Compiling query schema & compiling logic filters...';
        progressFill.style.width = '45%';

        const isMobile = window.innerWidth <= 580 || !closeBtn || closeBtn.offsetHeight === 0;

        if (!isMobile) {
          cursor.style.opacity = '1';
          const closeCoords = getRelativeCoords(closeBtn);
          gsap.to(cursor, {
            x: closeCoords.x, y: closeCoords.y, duration: 1.2, ease: 'power2.out',
            onComplete: () => {
              cursor.classList.add('clicking');
              setTimeout(() => {
                cursor.classList.remove('clicking');
                formulaEditor.classList.add('is-closed');
                cursor.style.opacity = '0';
              }, 150);
            }
          });
        } else {
          setTimeout(() => { formulaEditor.classList.add('is-closed'); }, 600);
        }
      }, 1500);

      // Step 3: SQL logs + scroll/click KPIs
      loopTimeout2 = setTimeout(() => {
        consoleText.textContent = 'Executing SQL: SELECT country, SUM(sales) FROM orders... [2.4M rows]';
        progressFill.style.width = '65%';

        const isMobile = window.innerWidth <= 580 || !churnKpi || churnKpi.offsetHeight === 0;

        if (!isMobile) {
          cursor.style.opacity = '1';
          const scrollOffset = churnKpi.getBoundingClientRect().top - tablesList.getBoundingClientRect().top + tablesList.scrollTop - 30;
          tablesList.scrollTo({ top: scrollOffset, behavior: 'smooth' });

          scrollTimeout = setTimeout(() => {
            const churnCoords = getRelativeCoords(churnKpi);
            gsap.to(cursor, {
              x: churnCoords.x, y: churnCoords.y, duration: 0.8, ease: 'power2.out',
              onComplete: () => {
                cursor.classList.add('clicking');
                setTimeout(() => {
                  cursor.classList.remove('clicking');
                  churnKpi.classList.add('active');
                  colsPill.textContent   = 'SUM(Churn Rate)';
                  xAxisTitle.textContent = 'Churn Rate (Sum)';
                  if (sqlBlock) sqlBlock.innerHTML = `<code>${churnSumSql}</code>`;
                  bars.forEach((bar, idx) => {
                    gsap.to(bar, { width: `${churnWidths[idx % churnWidths.length]}%`, duration: 0.6, ease: 'power2.out' });
                  });
                  cursor.style.opacity = '0';
                  triggerPillMenuInteraction();
                }, 150);
              }
            });
          }, 800);
        } else {
          colsPill.textContent   = 'SUM(Churn Rate)';
          xAxisTitle.textContent = 'Churn Rate (Sum)';
          if (sqlBlock) sqlBlock.innerHTML = `<code>${churnSumSql}</code>`;
          bars.forEach((bar, idx) => {
            gsap.to(bar, { width: `${churnWidths[idx % churnWidths.length]}%`, duration: 0.8, ease: 'power2.out' });
          });
          triggerConsoleTimeoutMobile();
        }
      }, 4500);

      const triggerPillMenuInteraction = () => {
        loopTimeout3 = setTimeout(() => {
          consoleText.textContent  = 'Aggregating dataset query logs...';
          progressFill.style.width = '75%';
          cursor.style.opacity     = '1';
          const pillCoords = getRelativeCoords(colsPill);
          gsap.to(cursor, {
            x: pillCoords.x, y: pillCoords.y, duration: 0.9, ease: 'power2.out',
            onComplete: () => {
              cursor.classList.add('clicking');
              setTimeout(() => {
                cursor.classList.remove('clicking');
                contextMenu.style.left    = `${pillCoords.x - 30}px`;
                contextMenu.style.top     = `${pillCoords.y + 12}px`;
                contextMenu.style.display = 'flex';
                triggerMenuSelection();
              }, 150);
            }
          });
        }, 2200);
      };

      const triggerMenuSelection = () => {
        loopTimeout4 = setTimeout(() => {
          const avgItemCoords = getRelativeCoords(menuAvg);
          gsap.to(cursor, {
            x: avgItemCoords.x, y: avgItemCoords.y, duration: 0.7, ease: 'power1.out',
            onComplete: () => {
              menuAvg.classList.add('hovered');
              setTimeout(() => {
                cursor.classList.add('clicking');
                setTimeout(() => {
                  cursor.classList.remove('clicking');
                  menuAvg.classList.remove('hovered');
                  menuSum.classList.remove('active-check');
                  menuAvg.classList.add('active-check');
                  contextMenu.style.display = 'none';
                  cursor.style.opacity      = '0';
                  colsPill.textContent   = 'AVG(Churn Rate)';
                  xAxisTitle.textContent = 'Churn Rate (%)';
                  if (sqlBlock) sqlBlock.innerHTML = `<code>${churnAvgSql}</code>`;
                  bars.forEach((bar, idx) => {
                    gsap.to(bar, { width: `${avgChurnWidths[idx % avgChurnWidths.length]}%`, duration: 0.8, ease: 'power2.out' });
                  });
                  triggerConsoleTimeout();
                }, 150);
              }, 250);
            }
          });
        }, 1200);
      };

      const triggerConsoleTimeout = () => {
        consoleText.textContent  = 'Executing SQL: SELECT country, AVG(churn_rate) FROM orders GROUP BY... [2.4M rows]';
        progressFill.style.width = '85%';
        loopTimeout5 = setTimeout(() => {
          consoleText.textContent            = 'SQL Error: Analytical connection pool limit exceeded (120s timeout). Query terminated.';
          consoleText.className              = 'tb-console-text console-error-text';
          progressFill.style.width           = '100%';
          progressFill.style.backgroundColor = '#EF4444';
          consoleBox.classList.add('has-error');
          loopTimeout5 = setTimeout(() => { runSimulation(); }, 5000);
        }, 2200);
      };

      const triggerConsoleTimeoutMobile = () => {
        loopTimeout5 = setTimeout(() => {
          consoleText.textContent            = 'SQL Error: Analytical connection pool limit exceeded (120s timeout). Query terminated.';
          consoleText.className              = 'tb-console-text console-error-text';
          progressFill.style.width           = '100%';
          progressFill.style.backgroundColor = '#EF4444';
          consoleBox.classList.add('has-error');
          loopTimeout5 = setTimeout(() => { runSimulation(); }, 5000);
        }, 2000);
      };
    };

    runSimulation();
  }
};
