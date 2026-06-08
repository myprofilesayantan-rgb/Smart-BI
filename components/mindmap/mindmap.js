/**
 * mindmap.js — Interactive Mind Map Component Logic
 * Styled and animated in compliance with Smart BI Design Tokens.
 * Business-user friendly descriptions and metadata.
 * Written in ES5 for maximum compatibility.
 */

console.log('SmartBI_MindMap.js script loading...');

window.SmartBI_MindMap = {
  // Node Details Registry mapped from Smart BI Validation Summary PDF
  nodesData: {
    'root': {
      title: 'Smart BI Core Engine',
      category: 'root',
      desc: 'The brain of Smart BI. It reads your questions, understands what you want, gets the right numbers from your data, and displays them as beautiful, easy-to-read charts.',
      extra: 'System Status: Active & Ready\nProcessing Speed: Instant\nData Connection: Connected'
    },
    'onb-root': {
      title: 'Onboarding',
      category: 'onboarding',
      desc: 'The complete onboarding flow — from connecting raw data sources to generating a fully personalized dashboard with auto-detected KPIs and verified metrics.',
      extra: 'Steps: 5 (Upload → Schema → KPI → Verify → Dashboard)\nUser Effort: Minimal\nAutomation Level: High'
    },
    'onb-upload': {
      title: 'Data Upload',
      category: 'onboarding',
      desc: 'Zero-Selection Ingestion: Simply upload a file or connect a live data source. Smart BI accepts CSV, Excel, direct database connections, and REST API endpoints.',
      extra: 'Supported: CSV, Excel, PostgreSQL, MySQL, REST API\nMax File Size: 500 MB\nAuto-detect: Encoding, Delimiters, Headers'
    },
    'onb-csv': {
      title: 'CSV',
      category: 'onboarding',
      desc: 'Upload comma-separated value files. Smart BI auto-detects delimiters, encoding, and header rows to parse your data instantly.',
      extra: 'Format: .csv\nDelimiters: comma, tab, pipe (auto-detected)'
    },
    'onb-excel': {
      title: 'Excel',
      category: 'onboarding',
      desc: 'Upload .xlsx or .xls workbooks. Smart BI reads all sheets, identifies data tables, and ignores formatting artifacts like merged cells or summary rows.',
      extra: 'Format: .xlsx, .xls\nMulti-sheet: Supported\nNamed Ranges: Auto-detected'
    },
    'onb-database': {
      title: 'Database',
      category: 'onboarding',
      desc: 'Connect directly to SQL databases (PostgreSQL, MySQL, SQL Server). Smart BI reads your schema, tables, and relationships without requiring manual joins.',
      extra: 'Supported: PostgreSQL, MySQL, SQL Server, Snowflake\nConnection: SSL encrypted\nSchema Read: Automatic'
    },
    'onb-api': {
      title: 'API',
      category: 'onboarding',
      desc: 'Connect to any REST API endpoint. Smart BI maps JSON response fields to table columns and schedules periodic data refreshes.',
      extra: 'Protocol: REST / JSON\nAuth: API Key, OAuth 2.0, Bearer Token\nRefresh: Configurable interval'
    },
    'onb-schema': {
      title: 'Schema Detection',
      category: 'onboarding',
      desc: 'Automatic schema parsing: Smart BI scans your uploaded data to identify column types (dimension vs. measure), data types, and relationships between tables.',
      extra: 'Detected Types: String, Numeric, Date, Boolean\nRelationships: Foreign key inference\nConfidence: 95%+'
    },
    'onb-kpi': {
      title: 'KPI Inference',
      category: 'onboarding',
      desc: 'Smart BI auto-generates business metrics from your data columns — identifying standard KPIs like Revenue, Growth Rate, and Conversion without manual formula setup.',
      extra: 'Auto-generated: Revenue, Profit Margin, Growth %\nCustom: User-defined formulas supported\nDictionary: 200+ built-in business terms'
    },
    'onb-verify': {
      title: 'Passive Verification',
      category: 'onboarding',
      desc: 'Before going live, Smart BI passively verifies detected schemas and inferred KPIs by cross-checking column distributions, null rates, and outlier patterns.',
      extra: 'Checks: Null %, Outlier detection, Type consistency\nResult: Confidence score per metric\nAction: Auto-flag low-confidence items'
    },
    'onb-dashboard': {
      title: 'Dashboard Creation',
      category: 'onboarding',
      desc: 'The final onboarding step: Smart BI assembles a personalized dashboard with the verified KPIs, choosing optimal chart types based on data shape and user role.',
      extra: 'Charts: Auto-selected (bar, line, KPI card)\nLayout: Role-based (CEO vs. Manager)\nReady: Instant after verification'
    },
    'conv-root': {
      title: 'Daily Conversation Flow',
      category: 'conversation',
      desc: 'The natural language interface that processes customer queries. It uses advanced NLP to understand intent, map metrics, and route queries to the correct logic flow.',
      extra: 'NLP Engine: Custom Transformer\nContext Window: Dynamic\nIntent Classification: Multiclass'
    },
    'conv-question': {
      title: 'User Question',
      category: 'conversation',
      desc: 'The entry point of the Daily Conversation loop. The user inputs their question in plain natural language (e.g., "Why did my conversion rate drop last week?").',
      extra: 'Input Type: Text / Voice\nLanguage Support: English (Global)\nMax Length: 200 characters'
    },
    'conv-clear': {
      title: 'Subject Clear?',
      category: 'conversation',
      desc: 'Decision Point: The NLP engine determines whether the query contains clear, unambiguous metrics, dimensions, and date ranges needed to fetch data.',
      extra: 'Confidence Threshold: 85%\nInput features checked: Metrics, Dimensions, Filters'
    },
    'conv-yes': {
      title: 'Intent Resolution: Clear',
      category: 'flow-a',
      desc: 'Branch selected when the question contains all necessary parameters to resolve directly. The engine routes the request to Flow A for direct query execution.',
      extra: 'Routing Rule: confidence >= 0.85\nResponse Time: Under 200ms'
    },
    'conv-flow-a': {
      title: 'Flow A: Direct Query Route',
      category: 'flow-a',
      desc: 'A pipeline designed for unambiguous queries. It retrieves the required metrics, compares them with business goals, predicts future values, and outputs the final response.',
      extra: 'Steps: Retrieval → Comparison → Prediction → Answer\nUser Interaction: None (Fully Automated)'
    },
    'conv-retrieval': {
      title: 'Retrieval',
      category: 'flow-a',
      desc: 'Query Execution: The system translates the parsed natural language parameters into database queries (SQL/NoSQL) and pulls the relevant data records.',
      extra: 'Data Pull: Live connection\nLatency: 50-100ms'
    },
    'conv-comparison': {
      title: 'Comparison',
      category: 'flow-a',
      desc: 'Performance Benchmarking: Evaluates retrieved data values against preset threshold targets, historical ranges, and seasonal trends.',
      extra: 'Metric Types: Revenue vs Goal, Month-over-Month growth'
    },
    'conv-prediction': {
      title: 'Prediction',
      category: 'flow-a',
      desc: 'Statistical Forecasting: Applies predictive algorithms to project future metric trends based on historical patterns.',
      extra: 'Algorithm: ETS / ARIMA\nConfidence Interval: 90%'
    },
    'conv-answer-a': {
      title: 'Answer',
      category: 'flow-a',
      desc: 'Response Generation: Assembles the final answer in natural text accompanied by optimized visual charts, ready for user review.',
      extra: 'Output: Dynamic text summary + Interactive Chart'
    },
    'conv-no': {
      title: 'Intent Resolution: Ambiguous',
      category: 'flow-b',
      desc: 'Branch selected when the user\'s query is missing critical details or contains multiple interpretations. The engine routes the request to Flow B.',
      extra: 'Routing Rule: confidence < 0.85\nCommon cause: Vague keywords (e.g. "my metrics")'
    },
    'conv-flow-b': {
      title: 'Flow B: Ambiguous Disambiguation Route',
      category: 'flow-b',
      desc: 'A pipeline designed to clarify user intent. It detects ambiguity, asks a targeted follow-up question, maps the user\'s feedback to KPIs, and returns the verified answer.',
      extra: 'Steps: Detect Ambiguity → Ask One Question → KPI Mapping → Answer'
    },
    'conv-ambiguity': {
      title: 'Detect Ambiguity',
      category: 'flow-b',
      desc: 'Ambiguity Analysis: Pinpoints exactly what information is missing from the query (e.g., whether "Revenue" refers to "Gross" or "Net" revenue).',
      extra: 'Ambiguity Type: Metric overload / Missing filter'
    },
    'conv-ask': {
      title: 'Ask One Question',
      category: 'flow-b',
      desc: 'Clarifying Prompt: Generates a single, direct multiple-choice question to help the user specify their request without manual search effort.',
      extra: 'Example: "Did you mean Gross Revenue or Net Revenue?"\nUI Component: Interactive button prompt'
    },
    'conv-kpi-map': {
      title: 'KPI Mapping',
      category: 'flow-b',
      desc: 'Resolution: Maps the user\'s selected answer to the corresponding metric calculation and updates the query parameters.',
      extra: 'Action: Resolves ambiguity\nMetric updated: Verified formula selection'
    },
    'conv-answer-b': {
      title: 'Answer',
      category: 'flow-b',
      desc: 'Final Presentation: Generates the verified data response and registers the feedback to continuously train the NLP engine.',
      extra: 'Feedback Loop: Save user preference to model weights'
    },
    'role-root': {
      title: 'Role Access Control',
      category: 'role',
      desc: 'The security and customization layer. It manages user credentials, custom role definitions, data row/column visibility matrices, and client onboarding configurations.',
      extra: 'Auth Protocol: OAuth2 / OIDC\nRow-Level Security: Active\nColumn Masking: Enabled'
    },
    'role-admin': {
      title: 'Admin Setup',
      category: 'role',
      desc: 'The administrator console where organization-wide defaults, security levels, integration credentials, and global thresholds are configured.',
      extra: 'Features: Audit Logs, Global Variables, API Token Rotation'
    },
    'role-create': {
      title: 'Role Creation',
      category: 'role',
      desc: 'The interface to define custom user personas and map permissions. Roles specify exactly what metric categories and tables a user group can interact with.',
      extra: 'Default Roles: CEO, Sales, HR\nCustom Persona Limit: Unlimited'
    },
    'role-ceo': {
      title: 'CEO Profile',
      category: 'role',
      desc: 'Persona mapping for executive leadership. Provides unfiltered high-level executive dashboard summaries, operational KPIs, and company profit tracking.',
      extra: 'Access Level: Unrestricted Global\nDefault View: Profit & Growth Strategy Dashboard'
    },
    'role-sales': {
      title: 'Sales Profile',
      category: 'role',
      desc: 'Persona mapping for sales teams. Focuses on revenue tracking, customer acquisition costs (CAC), regional target completions, and sales pipelines.',
      extra: 'Access Level: Department Restricted\nMasked columns: Client PII (emails, phone numbers)'
    },
    'role-hr': {
      title: 'HR Profile',
      category: 'role',
      desc: 'Persona mapping for human resources. Displays headcounts, employee satisfaction scores, hiring velocity, and department budgets.',
      extra: 'Access Level: Department Restricted\nMasked columns: Employee salary details (unless Admin)'
    },
    'role-custom': {
      title: 'Custom Profile',
      category: 'role',
      desc: 'Create custom granular profiles for external contractors, data analysts, or audit teams, restricting access to specific table columns or subsets.',
      extra: 'Granularity: Table / Row / Column level restrictions'
    },
    'role-visibility': {
      title: 'Data Visibility',
      category: 'role',
      desc: 'Rule Engine: Dynamically filters query results based on the active user profile. Restricts unauthorized dimensions and hashes sensitive columns on-the-fly.',
      extra: 'Method: Dynamic SQL rewriting / WHERE clause insertion\nEncryption: SHA-256 masking'
    },
    'role-onboard': {
      title: 'User Onboarding',
      category: 'role',
      desc: 'The invitation flow for adding team members. Sends invitations, handles OAuth registration, and automatically assigns a workspace and default role.',
      extra: 'Methods: Email Invite, SSO sync (Active Directory)'
    },
    'target-root': {
      title: 'Target Layer',
      category: 'target',
      desc: 'The configuration engine for tracking performance goals. It allows users to set, save, confirm, roll-over, and dynamically update seasonal targets for business metrics.',
      extra: 'Update Mode: Realtime\nPersistence: SQL Database\nNotification Trigger: Target Miss'
    },
    'target-create': {
      title: 'Create Target',
      category: 'target',
      desc: 'The interface to define new performance goals. Users specify target values, metric bindings, regions, and dates.',
      extra: 'Metric Binding: Any active dictionary metric\nTarget Value: Numeric / Percentage'
    },
    'target-store': {
      title: 'Store Target',
      category: 'target',
      desc: 'Saves targets securely in the database. Establishes audit histories so past adjustments can be easily reviewed.',
      extra: 'Storage: Encrypted tables\nHistory: Active audit logs'
    },
    'target-confirm': {
      title: 'Period Confirmation',
      category: 'target',
      desc: 'Confirms targets for a specific fiscal period (e.g. Q3 2026), locking them against unauthorized accidental edits.',
      extra: 'Approval: Manager/Admin required\nPeriod units: Monthly, Quarterly, Fiscal Year'
    },
    'target-carry': {
      title: 'Carry Forward',
      category: 'target',
      desc: 'Roll-over targets: Option to automatically carry unmet goals forward or adjust next period\'s targets based on current surplus/deficit.',
      extra: 'Roll-over logic: Carry Deficit (optional), Carry Surplus (optional)'
    },
    'target-update': {
      title: 'Update Anytime',
      category: 'target',
      desc: 'Flexibility controls: Authorized users can adjust targets mid-period to adapt to sudden market changes or seasonal anomalies.',
      extra: 'Access requirement: Admin or authorized Manager\nChange logs: Recorded'
    },
    'onb-1': {
      title: '1. Connect Your Data',
      category: 'onboarding',
      desc: 'Zero-Selection Ingestion: Simply upload an Excel sheet, CSV, or link your database. Smart BI automatically reads your tables without requiring you to link fields or write code.',
      extra: 'Supported Formats: Excel, CSV, Google Sheets, Databases\nUser Setup Effort: None'
    },
    'onb-2': {
      title: '2. Auto-Generate Metrics',
      category: 'onboarding',
      desc: 'The system automatically scans your data columns to find categories (like "Country" or "Date") and numbers (like "Sales" or "Profit"), creating standard business metrics for you automatically.',
      extra: 'Found Categories: Country, Date, Segment\nFound Numbers: Sales, Profit, Cost'
    },
    'onb-3': {
      title: '3. Problem: Too Many Metrics',
      category: 'onboarding',
      desc: 'Information Overload: If you connect a very large database with thousands of tables, the AI gets overwhelmed and generates hundreds of useless metrics, making it hard to find what you actually need.',
      extra: 'Alert: Too many raw tables detected\nResult: Messy search results and clutter'
    },
    'onb-4': {
      title: '4. Fix: Custom Views by Role',
      category: 'onboarding',
      desc: 'Smart Curation: To avoid clutter, Smart BI customizes the metrics you see based on your job. A CEO sees high-level dashboard metrics, while a Sales Manager sees sales-specific targets.',
      extra: 'CEO Workspace: 10 key metrics\nSales Workspace: 8 sales metrics'
    },
    'onb-5': {
      title: '5. Fix: Smart Business Dictionary',
      category: 'onboarding',
      desc: 'Metric Store: Smart BI has a built-in business dictionary. It already knows the calculations for complex business terms (like Customer Lifetime Value or Retention), so you don\'t have to explain them.',
      extra: 'Built-in Formulas: Customer Lifetime Value (LTV), Customer Acquisition Cost (CAC), Net Retention'
    },
    'flowa-1': {
      title: '1. Ask a Specific Question',
      category: 'flow-a',
      desc: 'Direct Search: You type a clear, direct question into the search bar, like: "Show me Profit Margin by Region" or "What was our Revenue?".',
      extra: 'Your Search: "Profit Margin by Region"\nMatch Quality: 100% (Direct Match)'
    },
    'flowa-2': {
      title: '2. Check Against Goals',
      category: 'flow-a',
      desc: 'Smart Evaluation: Smart BI fetches your numbers and immediately checks them against your set goals to tell you how you did: "Revenue was 42L, which missed the 50L target by 16%".',
      extra: 'Actual Performance: 42L\nTarget Goal: 50L\nResult: Missed target by 16%'
    },
    'flowa-3': {
      title: '3. Problem: Seasonal Goal Mismatch',
      category: 'flow-a',
      desc: 'Unfair Comparisons: Using the same flat target all year round doesn\'t work. For example, comparing sales in slow months (like January) with peak holiday seasons (like December) leads to false alerts.',
      extra: 'Alert: Dynamic comparison failed\nProblem: Flat target carried into December spike'
    },
    'flowa-4': {
      title: '4. Fix: Dynamic Seasonal Goals',
      category: 'flow-a',
      desc: 'Target Binding: Smart BI binds your goals to specific times, regions, and segments, automatically adjusting targets for seasonal fluctuations to keep comparisons fair.',
      extra: 'Active Goal: Dynamic December Goal\nStatus: Adjusted for holiday spikes'
    },
    'flowb-1': {
      title: '1. Ask a Vague Question',
      category: 'flow-b',
      desc: 'Ambiguity Flag: You ask a vague question, like: "Show me customer churn". Since "churn" can mean multiple things (number of lost customers vs. lost money), the system pauses to ask.',
      extra: 'Your Search: "customer churn"\nStatus: Paused for clarification'
    },
    'flowb-2': {
      title: '2. Simple Clarification Ask',
      category: 'flow-b',
      desc: 'Single Clarifying Question: Instead of failing or displaying wrong numbers, the system asks you a simple question to clarify: "Would you like to see lost customer count or lost revenue percentage?".',
      extra: 'Question: "How would you like to calculate churn?"\nOptions: [Revenue Churn %], [Account Churn Count]'
    },
    'flowb-3': {
      title: '3. Problem: Missing Details',
      category: 'flow-b',
      desc: 'Vague Queries: If you ask a very vague question like "Are we on track?", a single simple question isn\'t enough because the system doesn\'t know what metric, region, or timeframe you want.',
      extra: 'Alert: Too many missing details\nMissing parameters: Metric, Timeframe, Region'
    },
    'flowb-4': {
      title: '4. Fix: Smart Follow-Up Questions',
      category: 'flow-b',
      desc: 'Progressive Clarification: Smart BI asks you simple compound follow-up questions to help you narrow down exactly what you mean step-by-step: "Sales or Margin? This month or the whole year?".',
      extra: 'System Follow-up: "Which metric and timeframe do you mean?"\nStatus: Resolved'
    },
    'flowb-5': {
      title: '5. Fix: Sidebar Search & Checklist',
      category: 'flow-b',
      desc: 'The Hybrid UX Model: If you prefer not to type, Smart BI opens a side panel with a checklist and search bar, letting you visually select metrics and filters like in a standard app.',
      extra: 'Model: Chat + Visual Checklist\nTrigger: Sidebar Open\nState: Ready'
    },
    'flowb-5-1': {
      title: '5.1. Easy Visual Selection',
      category: 'flow-b',
      desc: 'Recognition over Recall: Seeing a list of metrics in the sidebar is much easier than trying to remember exact database names. The checklist lets you browse and select metrics quickly.',
      extra: 'Benefit: Lower cognitive load\nMethod: Click to select'
    },
    'flowb-5-2': {
      title: '5.2. Instant Filter Actions',
      category: 'flow-b',
      desc: 'Seamless Disambiguation: Checking a box or clicking a filter pill immediately updates your query behind the scenes, ensuring the chart shows exactly what you clicked.',
      extra: 'Action: Checked "Technology Segment"\nResult: Chart updated instantly'
    }
  },

  timeouts: [],
  currentSimulationBtn: null,

  init: function() {
    console.log('SmartBI_MindMap.init() called');
    this.bindNodes();
    this.bindToggles();
    this.bindSimulationToolbar();
    
    // Select root node by default
    this.selectNode('root');
  },

  // Highlight a single node and display its details in the sidebar
  selectNode: function(nodeId) {
    console.log('selectNode() triggering for ID:', nodeId);
    var nodeElement = document.querySelector('[data-node-id="' + nodeId + '"]');
    if (!nodeElement) {
      console.warn('Could not find HTML element matching selector: [data-node-id="' + nodeId + '"]');
      return;
    }

    // Remove active state from all nodes
    var nodes = document.querySelectorAll('.mindmap-node');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].classList.remove('active-selected');
    }

    // Add active state to selected node
    nodeElement.classList.add('active-selected');

    // Update Details Panel
    var data = this.nodesData[nodeId];
    if (!data) {
      console.warn('No metadata record in nodesData for ID:', nodeId);
      return;
    }

    var panelTitle = document.getElementById('panel-title');
    var panelBadge = document.getElementById('panel-badge');
    var panelDesc  = document.getElementById('panel-desc');
    var panelExtra = document.getElementById('panel-extra');

    if (panelTitle) {
      panelTitle.textContent = data.title;
      console.log('Updated panel title:', data.title);
    }
    if (panelBadge) {
      panelBadge.className = 'mindmap-details-badge badge-' + data.category.replace('-child', '');
      // Clean up display text for categories
      if (data.category === 'root') {
        panelBadge.textContent = 'Core System';
      } else if (data.category === 'onboarding') {
        panelBadge.textContent = 'Zero-Selection Onboarding';
      } else if (data.category === 'flow-a') {
        panelBadge.textContent = 'Flow A: Specific Query';
      } else if (data.category === 'flow-b') {
        panelBadge.textContent = 'Flow B: Ambiguous Query';
      } else if (data.category === 'conversation') {
        panelBadge.textContent = 'Daily Conversation';
      } else if (data.category === 'role') {
        panelBadge.textContent = 'Role Access & Control';
      } else if (data.category === 'target') {
        panelBadge.textContent = 'Target Goal Settings';
      } else {
        panelBadge.textContent = data.category;
      }
    }
    if (panelDesc) panelDesc.textContent = data.desc;
    if (panelExtra) panelExtra.textContent = data.extra;
  },

  bindNodes: function() {
    console.log('Binding click handlers to .mindmap-node elements');
    var nodes = document.querySelectorAll('.mindmap-node');
    for (var i = 0; i < nodes.length; i++) {
      (function(node) {
        var nodeId = node.getAttribute('data-node-id');
        node.addEventListener('click', function(e) {
          console.log('Clicked node element with ID:', nodeId);
          window.SmartBI_MindMap.selectNode(nodeId);
        });
      })(nodes[i]);
    }
  },

  bindToggles: function() {
    console.log('Binding toggle handlers to .mindmap-toggle-btn elements');
    var buttons = document.querySelectorAll('.mindmap-toggle-btn');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent triggering node selection click
        var btn = e.currentTarget;
        var group = btn.closest('.mindmap-node-group');
        var children = group ? group.querySelector('.mindmap-children') : null;
        
        if (children) {
          var isCollapsed = children.classList.toggle('collapsed');
          btn.classList.toggle('is-collapsed', isCollapsed);
          btn.textContent = isCollapsed ? '+' : '−';
          console.log('Toggled collapse state. Collapsed:', isCollapsed);
        }
      });
    }
  },

  clearSimulation: function() {
    console.log('Clearing all active simulation play states');
    // Clear all timeouts
    for (var i = 0; i < this.timeouts.length; i++) {
      clearTimeout(this.timeouts[i]);
    }
    this.timeouts = [];

    // Remove simulation highlight class from all nodes
    var nodes = document.querySelectorAll('.mindmap-node');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].classList.remove('simulation-highlight');
    }

    // Reset toolbar buttons
    var buttons = document.querySelectorAll('.mindmap-btn');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].classList.remove('active-playing');
    }

    this.currentSimulationBtn = null;
  },

  // Play progressive flow simulation highlighting nodes sequentially
  playSimulation: function(flowType, buttonClass) {
    console.log('playSimulation() triggered for:', flowType);
    this.clearSimulation();

    var button = document.querySelector('.' + buttonClass);
    if (button) {
      button.classList.add('active-playing');
      this.currentSimulationBtn = button;
    }

    // Expand all branches involved in the flow first
    var children = document.querySelectorAll('.mindmap-children');
    for (var i = 0; i < children.length; i++) {
      children[i].classList.remove('collapsed');
    }
    var buttons = document.querySelectorAll('.mindmap-toggle-btn');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].classList.remove('is-collapsed');
      buttons[i].textContent = '−';
    }

    // Define sequences of node IDs for each flow
    var sequence = [];
    if (flowType === 'onboarding') {
      sequence = ['onb-1', 'onb-2', 'onb-3', 'onb-4', 'onb-5'];
    } else if (flowType === 'flow-a') {
      sequence = ['flowa-1', 'flowa-2', 'flowa-3', 'flowa-4'];
    } else if (flowType === 'flow-b') {
      sequence = ['flowb-1', 'flowb-2', 'flowb-3', 'flowb-4', 'flowb-5', 'flowb-5-1', 'flowb-5-2'];
    }

    var self = this;
    // Sequentially highlight nodes
    for (var idx = 0; idx < sequence.length; idx++) {
      (function(nodeId, index) {
        var delay = index * 1500; // 1.5s interval per node

        var t = setTimeout(function() {
          // Remove highlight from previous nodes
          var nodes = document.querySelectorAll('.mindmap-node');
          for (var i = 0; i < nodes.length; i++) {
            nodes[i].classList.remove('simulation-highlight');
          }

          // Add highlight to current node
          var node = document.querySelector('[data-node-id="' + nodeId + '"]');
          if (node) {
            node.classList.add('simulation-highlight');
            window.SmartBI_MindMap.selectNode(nodeId);
            node.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
          }

          // If last node is reached, reset toolbar button after a delay
          if (index === sequence.length - 1) {
            var resetT = setTimeout(function() {
              node.classList.remove('simulation-highlight');
              if (self.currentSimulationBtn) {
                self.currentSimulationBtn.classList.remove('active-playing');
              }
            }, 2000);
            self.timeouts.push(resetT);
          }
        }, delay);

        self.timeouts.push(t);
      })(sequence[idx], idx);
    }
  },

  bindSimulationToolbar: function() {
    console.log('Binding click handlers to simulation toolbar buttons');
    var btnOnboarding = document.querySelector('.play-onboarding');
    var btnFlowA      = document.querySelector('.play-flow-a');
    var btnFlowB      = document.querySelector('.play-flow-b');

    if (btnOnboarding) {
      btnOnboarding.addEventListener('click', function() {
        window.SmartBI_MindMap.playSimulation('onboarding', 'play-onboarding');
      });
    }

    if (btnFlowA) {
      btnFlowA.addEventListener('click', function() {
        window.SmartBI_MindMap.playSimulation('flow-a', 'play-flow-a');
      });
    }

    if (btnFlowB) {
      btnFlowB.addEventListener('click', function() {
        window.SmartBI_MindMap.playSimulation('flow-b', 'play-flow-b');
      });
    }
  }
};

console.log('SmartBI_MindMap.js script fully loaded.');
