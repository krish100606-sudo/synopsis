// FitTrack AI - Application Logic & Async Microservices Engine

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Application State
  const state = {
    user: {
      name: "Krish Gupta",
      rollNo: "20505 / 20510",
      email: "krish.gupta@dronacharya.info",
      realm: "FitTrackRealm",
      authenticated: true,
    },
    activities: [
      {
        id: "ACT-9041",
        type: "Running",
        duration: 45,
        calories: 520,
        heartRate: 156,
        intensity: "High",
        timestamp: "Today, 08:30 AM",
        status: "ACKNOWLEDGED",
        aiInsight: "Excellent Zone 4 effort. High metabolic burn detected. Hydrate with 500ml electrolytes and limit leg exertion for 24h to prevent strain.",
        aiCategory: "Safety & Recovery"
      },
      {
        id: "ACT-9040",
        type: "Weightlifting",
        duration: 60,
        calories: 380,
        heartRate: 132,
        intensity: "Medium",
        timestamp: "Yesterday, 06:15 PM",
        status: "ACKNOWLEDGED",
        aiInsight: "Hypertrophy threshold reached. Rest upper body muscles for 48h. Ensure 30g protein intake within 90 minutes post-workout.",
        aiCategory: "Nutrition & Muscle"
      },
      {
        id: "ACT-9039",
        type: "Cycling",
        duration: 30,
        calories: 290,
        heartRate: 140,
        intensity: "Medium",
        timestamp: "2 days ago",
        status: "ACKNOWLEDGED",
        aiInsight: "Cadence output stable. Great steady-state cardiovascular conditioning. Incorporate low-impact stretching before bed.",
        aiCategory: "Performance"
      },
      {
        id: "ACT-9038",
        type: "Yoga",
        duration: 40,
        calories: 140,
        heartRate: 98,
        intensity: "Low",
        timestamp: "3 days ago",
        status: "ACKNOWLEDGED",
        aiInsight: "Active recovery session successful. Parasympathetic nervous system activation observed. Ideal timing post heavy lifting.",
        aiCategory: "Recovery"
      }
    ],
    aiInsights: [
      {
        id: "INS-101",
        title: "High Heart Rate & Dehydration Warning",
        type: "Safety",
        pillClass: "ai-pill-safety",
        activityRef: "Running (45m, 156 bpm)",
        content: "Based on your avg heart rate of 156 bpm over 45 minutes, Gemini AI identified elevated strain. Ensure immediate intake of 500ml electrolyte solution to restore sodium balance.",
        timestamp: "Today 08:31 AM"
      },
      {
        id: "INS-102",
        title: "Protein Synthesis Window",
        type: "Nutrition",
        pillClass: "ai-pill-nutr",
        activityRef: "Weightlifting (60m, 380 kcal)",
        content: "Resistance training session logged. To optimize muscle protein synthesis, consume 30g of fast-digesting protein alongside complex carbohydrates within the next 45 minutes.",
        timestamp: "Yesterday 06:16 PM"
      },
      {
        id: "INS-103",
        title: "Optimal Cardiovascular Endurance",
        type: "Recommendation",
        pillClass: "ai-pill-rec",
        activityRef: "Cycling (30m)",
        content: "Aerobic threshold maintained cleanly in Zone 3. For your next session, increase intervals by 5 minutes to progressively overload stroke volume.",
        timestamp: "2 days ago"
      },
      {
        id: "INS-104",
        title: "Active Recovery & Cortisol Reduction",
        type: "Recovery",
        pillClass: "ai-pill-rec",
        activityRef: "Yoga (40m)",
        content: "Yoga session lowered systemic stress metrics. Maintain a 7.5 to 8 hour sleep schedule tonight to maximize growth hormone release.",
        timestamp: "3 days ago"
      }
    ],
    geminiApiKey: localStorage.getItem('fittrack_gemini_key') || '',
    activeFilter: 'all'
  };

  // --- NAVIGATION TABS ---
  const navButtons = document.querySelectorAll('.sidebar-nav .nav-item');
  const tabPages = document.querySelectorAll('.tab-page');

  function switchTab(tabId) {
    navButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });
    tabPages.forEach(page => {
      page.classList.toggle('active', page.id === tabId);
    });

    if (tabId === 'tab-dashboard') {
      renderActivityTable();
      renderLatestSpotlight();
    }
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  const btnQuickLog = document.getElementById('btn-quick-log');
  if (btnQuickLog) {
    btnQuickLog.addEventListener('click', () => switchTab('tab-activity-log'));
  }

  // --- MODALS ---
  const modalSynopsis = document.getElementById('modal-synopsis');
  const btnSynopsis = document.getElementById('btn-synopsis');
  const closeSynopsisModal = document.getElementById('close-synopsis-modal');
  const btnCloseSynopsisFooter = document.getElementById('btn-close-synopsis-footer');

  if (btnSynopsis) btnSynopsis.addEventListener('click', () => modalSynopsis.classList.add('active'));
  if (closeSynopsisModal) closeSynopsisModal.addEventListener('click', () => modalSynopsis.classList.remove('active'));
  if (btnCloseSynopsisFooter) btnCloseSynopsisFooter.addEventListener('click', () => modalSynopsis.classList.remove('active'));

  const modalApiKey = document.getElementById('modal-apikey');
  const btnKeycloak = document.getElementById('btn-keycloak');
  const btnToggleKeyModal = document.getElementById('btn-toggle-key-modal');
  const closeApiKeyModal = document.getElementById('close-apikey-modal');
  const btnSaveKey = document.getElementById('btn-save-key');
  const btnClearKey = document.getElementById('btn-clear-key');
  const geminiApiKeyInput = document.getElementById('gemini-api-key-input');

  if (geminiApiKeyInput) geminiApiKeyInput.value = state.geminiApiKey;

  if (btnToggleKeyModal) btnToggleKeyModal.addEventListener('click', () => modalApiKey.classList.add('active'));
  if (closeApiKeyModal) closeApiKeyModal.addEventListener('click', () => modalApiKey.classList.remove('active'));

  if (btnSaveKey) {
    btnSaveKey.addEventListener('click', () => {
      state.geminiApiKey = geminiApiKeyInput.value.trim();
      localStorage.setItem('fittrack_gemini_key', state.geminiApiKey);
      modalApiKey.classList.remove('active');
      appendLogLine(`[Gemini AI] Custom API key saved successfully (${state.geminiApiKey ? 'Key active' : 'Default Simulator'}).`, 'text-ai');
    });
  }

  if (btnClearKey) {
    btnClearKey.addEventListener('click', () => {
      state.geminiApiKey = '';
      geminiApiKeyInput.value = '';
      localStorage.removeItem('fittrack_gemini_key');
      modalApiKey.classList.remove('active');
      appendLogLine('[Gemini AI] Cleared custom API key. Reverted to built-in AI inference engine.', 'text-muted');
    });
  }

  if (btnKeycloak) {
    btnKeycloak.addEventListener('click', () => switchTab('tab-keycloak'));
  }

  // Refresh Token Button Simulation
  const btnRefreshToken = document.getElementById('btn-refresh-token');
  if (btnRefreshToken) {
    btnRefreshToken.addEventListener('click', () => {
      const expElem = document.getElementById('kc-token-exp');
      if (expElem) {
        expElem.textContent = "In 60 minutes (Token Refreshed)";
        expElem.className = "detail-val text-success";
        setTimeout(() => {
          expElem.className = "detail-val text-warning";
        }, 3000);
      }
    });
  }

  // --- ACTIVITY FILTER CHIPS ---
  const filterChips = document.querySelectorAll('.btn-chip');
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.activeFilter = chip.getAttribute('data-filter');
      renderActivityTable();
    });
  });

  // --- RENDER FUNCTIONS ---
  function renderActivityTable() {
    const tbody = document.getElementById('activity-table-body');
    if (!tbody) return;

    const filtered = state.activeFilter === 'all' 
      ? state.activities 
      : state.activities.filter(a => a.type === state.activeFilter);

    tbody.innerHTML = filtered.map(act => `
      <tr>
        <td><strong>${getActivityIcon(act.type)} ${act.type}</strong></td>
        <td>${act.duration} mins</td>
        <td><span class="text-warning">${act.calories} kcal</span></td>
        <td><span class="text-info">${act.heartRate} bpm</span></td>
        <td class="text-muted">${act.timestamp}</td>
        <td><span class="badge badge-success"><i data-lucide="check" class="icon-xs"></i> ${act.status}</span></td>
        <td><span class="text-ai" title="${act.aiInsight}">${act.aiCategory}</span></td>
        <td>
          <button class="btn btn-outline-sm btn-view-insight" data-id="${act.id}" style="padding: 0.2rem 0.5rem; font-size: 0.72rem;">
            View AI Note
          </button>
        </td>
      </tr>
    `).join('');

    if (window.lucide) window.lucide.createIcons();

    // Attach click listeners for View AI Note
    document.querySelectorAll('.btn-view-insight').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        const item = state.activities.find(a => a.id === id);
        if (item) {
          alert(`🤖 Gemini AI Coaching Note for ${item.type} (${item.timestamp}):\n\n"${item.aiInsight}"`);
        }
      });
    });

    updateKPIs();
  }

  function getActivityIcon(type) {
    switch (type) {
      case 'Running': return '🏃';
      case 'Weightlifting': return '🏋️';
      case 'Cycling': return '🚴';
      case 'HIIT': return '⚡';
      case 'Swimming': return '🏊';
      case 'Yoga': return '🧘';
      default: return '👟';
    }
  }

  function updateKPIs() {
    const totalCals = state.activities.reduce((sum, a) => sum + a.calories, 0);
    const totalMins = state.activities.reduce((sum, a) => sum + a.duration, 0);
    const totalCount = state.activities.length;

    const calsElem = document.getElementById('kpi-calories');
    const minsElem = document.getElementById('kpi-active-time');
    const countElem = document.getElementById('kpi-workouts');

    if (calsElem) calsElem.textContent = (3420 + totalCals).toLocaleString();
    if (minsElem) minsElem.textContent = (285 + totalMins).toLocaleString();
    if (countElem) countElem.textContent = (8 + totalCount).toString();
  }

  function renderLatestSpotlight() {
    const spotlight = document.getElementById('latest-ai-spotlight');
    if (!spotlight || state.aiInsights.length === 0) return;

    const latest = state.aiInsights[0];
    spotlight.innerHTML = `
      <div>
        <div style="font-weight: 700; font-size: 1.05rem; margin-bottom: 0.4rem;" class="gradient-text">
          ${latest.title}
        </div>
        <div class="spotlight-quote">
          "${latest.content}"
        </div>
      </div>
      <div class="spotlight-tags">
        <span class="tag">Ref: ${latest.activityRef}</span>
        <span class="tag" style="color: var(--accent-cyan);">Generated via Gemini API</span>
        <span class="tag">${latest.timestamp}</span>
      </div>
    `;
  }

  function renderAIInsightsGrid() {
    const container = document.getElementById('ai-cards-container');
    const badge = document.getElementById('insights-count-badge');
    if (badge) badge.textContent = state.aiInsights.length;

    if (!container) return;

    container.innerHTML = state.aiInsights.map(ins => `
      <div class="glass-card ai-card">
        <div class="ai-card-header">
          <h4 class="ai-card-title">${ins.title}</h4>
          <span class="ai-pill ${ins.pillClass}">${ins.type}</span>
        </div>
        <div class="ai-card-body">
          ${ins.content}
        </div>
        <div class="ai-card-footer">
          <span><i data-lucide="activity" class="icon-xs"></i> ${ins.activityRef}</span>
          <span>${ins.timestamp}</span>
        </div>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  }

  // --- LOGGING & RABBITMQ PIPELINE SIMULATION ---
  const activityForm = document.getElementById('activity-form');
  const btnSubmit = document.getElementById('btn-submit-activity');

  if (activityForm) {
    activityForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const type = document.getElementById('act-type').value;
      const duration = parseInt(document.getElementById('act-duration').value, 10);
      const calories = parseInt(document.getElementById('act-calories').value, 10);
      const heartRate = parseInt(document.getElementById('act-heartrate').value, 10);
      const intensity = document.getElementById('act-intensity').value;
      const notes = document.getElementById('act-notes').value;

      btnSubmit.disabled = true;
      btnSubmit.innerHTML = `<i data-lucide="loader-2" class="spin"></i> Ingesting & Enqueuing...`;
      if (window.lucide) window.lucide.createIcons();

      // Execute Step-by-Step Pipeline Animation
      await runPipelineSimulation({ type, duration, calories, heartRate, intensity, notes });

      btnSubmit.disabled = false;
      btnSubmit.innerHTML = `<i data-lucide="send"></i> Dispatch Activity to Gateway & Queue`;
      if (window.lucide) window.lucide.createIcons();
    });
  }

  async function runPipelineSimulation(data) {
    const steps = [
      document.getElementById('step-1'),
      document.getElementById('step-2'),
      document.getElementById('step-3'),
      document.getElementById('step-4'),
      document.getElementById('step-5')
    ];

    // Helper to activate step
    const activate = (idx) => {
      steps.forEach((s, i) => {
        if (s) s.classList.toggle('active', i === idx);
      });
    };

    const newId = `ACT-${Math.floor(1000 + Math.random() * 9000)}`;

    // Step 1: User App
    activate(0);
    appendLogLine(`[Frontend] User clicked Submit. Packaging activity JSON payload for ${data.type}...`, 'text-main');
    await delay(600);

    // Step 2: Gateway
    activate(1);
    appendLogLine(`[Spring Gateway:8080] POST /api/v1/activities - Validated Keycloak OAuth2 JWT Token for Krish Gupta (20510).`, 'text-info');
    await delay(700);

    // Step 3: Activity Service
    activate(2);
    appendLogLine(`[Activity Service] Saved activity ${newId} to PostgreSQL DB. Publishing AMQP event to 'fitness.exchange'...`, 'text-success');
    await delay(750);

    // Step 4: RabbitMQ Queue
    activate(3);
    appendLogLine(`[RabbitMQ Broker] Message pushed to queue 'fit.activity.queue'. RoutingKey: 'activity.created.${data.type.toLowerCase()}'. Payload Size: 412 B.`, 'text-warning');
    await delay(800);

    // Step 5: Gemini AI Service
    activate(4);
    appendLogLine(`[AI Service] RabbitMQ Listener picked up event ${newId}. Constructing Gemini AI prompt...`, 'text-ai');
    
    // Generate AI response (using live key if available, else local intelligent AI engine)
    const aiResult = await generateGeminiInsight(data);
    appendLogLine(`[Gemini API] Inference completed! Response: "${aiResult.insight.substring(0, 75)}..."`, 'text-ai');

    // Create Activity Record
    const newActivity = {
      id: newId,
      type: data.type,
      duration: data.duration,
      calories: data.calories,
      heartRate: data.heartRate,
      intensity: data.intensity,
      timestamp: "Just now",
      status: "ACKNOWLEDGED",
      aiInsight: aiResult.insight,
      aiCategory: aiResult.category
    };

    state.activities.unshift(newActivity);

    // Create AI Insight Card
    const newInsightCard = {
      id: `INS-${Math.floor(200 + Math.random() * 800)}`,
      title: aiResult.title,
      type: aiResult.category,
      pillClass: aiResult.pillClass,
      activityRef: `${data.type} (${data.duration}m, ${data.heartRate} bpm)`,
      content: aiResult.insight,
      timestamp: "Just now"
    };

    state.aiInsights.unshift(newInsightCard);

    // Update UI
    renderActivityTable();
    renderAIInsightsGrid();
    renderLatestSpotlight();

    await delay(400);
    steps.forEach(s => { if (s) s.classList.remove('active'); });
    appendLogLine(`[System] End-to-end pipeline execution complete for ${newId}. Saved to user dashboard.`, 'text-success');
  }

  async function generateGeminiInsight(data) {
    if (state.geminiApiKey) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${state.geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are FitTrack AI coach. Analyze this workout: Activity: ${data.type}, Duration: ${data.duration} minutes, Calories: ${data.calories} kcal, Avg Heart Rate: ${data.heartRate} bpm, Intensity: ${data.intensity}, User Notes: "${data.notes || 'None'}". Provide 2 concise bullet-style sentences of personalized safety advice, recovery advice, and performance recommendation.`
              }]
            }]
          })
        });
        const json = await response.json();
        if (json.candidates && json.candidates[0].content.parts[0].text) {
          const text = json.candidates[0].content.parts[0].text;
          return {
            title: `Gemini AI: ${data.type} Analysis`,
            category: "Safety & Performance",
            pillClass: "ai-pill-rec",
            insight: text.trim()
          };
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to built-in AI engine:', err);
      }
    }

    // Built-in intelligent rule-based AI engine fallback
    let title = `${data.type} Fitness Evaluation`;
    let category = "Performance";
    let pillClass = "ai-pill-rec";
    let insight = "";

    if (data.heartRate > 165) {
      category = "Safety Alert";
      pillClass = "ai-pill-safety";
      title = `High Strain Warning (${data.heartRate} BPM)`;
      insight = `Elevated heart rate detected during ${data.type}. Ensure a gradual cool-down period and hydrate immediately. Monitor for any signs of dizziness or heat fatigue.`;
    } else if (data.duration > 75) {
      category = "Endurance & Recovery";
      pillClass = "ai-pill-nutr";
      title = `Extended Session Recovery`;
      insight = `Long ${data.type} session logged (${data.duration} mins). Glycogen reserves depleted. Replenish with 40-50g carbohydrates within 2 hours.`;
    } else if (data.type === 'Weightlifting' || data.type === 'HIIT') {
      category = "Muscle Repair";
      pillClass = "ai-pill-nutr";
      title = `Hypertrophy & Protein Advice`;
      insight = `High muscle activation during ${data.type}. Allow 48 hours of rest for affected muscle groups and consume 25-35g protein to optimize repair.`;
    } else {
      category = "Cardio Health";
      pillClass = "ai-pill-rec";
      title = `Balanced Aerobic Load`;
      insight = `Solid ${data.type} execution (${data.calories} kcal burned). Your cardiovascular metrics indicate steady progression toward your fitness goals.`;
    }

    if (data.notes) {
      insight += ` Note: AI took into account your report of "${data.notes}".`;
    }

    return { title, category, pillClass, insight };
  }

  function appendLogLine(text, cssClass = 'text-main') {
    const logContainer = document.getElementById('pipeline-log');
    if (!logContainer) return;

    const time = new Date().toLocaleTimeString();
    const line = document.createElement('div');
    line.className = `log-line ${cssClass}`;
    line.innerHTML = `<span style="color: var(--text-dim);">[${time}]</span> ${text}`;
    logContainer.appendChild(line);
    logContainer.scrollTop = logContainer.scrollHeight;
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // --- CHART INITIALIZATION ---
  function initCharts() {
    const ctx = document.getElementById('weeklyActivityChart');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Calories Burned (kcal)',
            data: [420, 580, 310, 640, 480, 720, 520],
            backgroundColor: 'rgba(0, 242, 254, 0.7)',
            borderRadius: 6,
            hoverBackgroundColor: 'rgba(0, 242, 254, 0.95)'
          },
          {
            label: 'Active Minutes',
            data: [35, 50, 30, 60, 45, 75, 45],
            backgroundColor: 'rgba(139, 92, 246, 0.5)',
            borderRadius: 6,
            hoverBackgroundColor: 'rgba(139, 92, 246, 0.8)'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#94a3b8',
              font: { family: 'Inter', size: 12 }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8' }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8' }
          }
        }
      }
    });
  }

  // Initialize Data Views
  renderActivityTable();
  renderAIInsightsGrid();
  renderLatestSpotlight();
  initCharts();
});
