/**
 * RegionLearn-Bridge Application Controller
 * Handles UI interactions, audio visualizations, WhatsApp simulation,
 * interactive 12-slide masterclass deck, and sachet pricing scratch vouchers.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Navigation & Tabs
  const navTabs = document.querySelectorAll(".nav-tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");
  
  // Audio Visualizer Canvas
  const canvas = document.getElementById("audioVisualizerCanvas");
  let canvasCtx = canvas ? canvas.getContext("2d") : null;
  let animationFrameId = null;
  let isVisualizerActive = false;

  // Active Role State
  let activeRole = "student"; // 'student', 'parent', 'headmaster', 'evaluator'

  // Current Slide Index for Masterclass Deck
  let currentSlideIndex = 1;
  const totalSlides = 12;

  // Quiz State
  let currentQuizAnswers = {};

  // 1. Tab Switching Functionality
  navTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const targetTabId = tab.getAttribute("data-tab");
      
      // Update buttons
      navTabs.forEach(t => {
        t.classList.remove("border-indigo-600", "text-indigo-600", "bg-indigo-50");
        t.classList.add("border-transparent", "text-slate-600", "hover:text-slate-900");
      });
      tab.classList.add("border-indigo-600", "text-indigo-600", "bg-indigo-50");
      tab.classList.remove("border-transparent", "text-slate-600");

      // Update content
      tabContents.forEach(content => {
        content.classList.remove("active");
        if (content.id === targetTabId) {
          content.classList.add("active");
        }
      });

      // Special re-renders on tab view
      if (targetTabId === "tab-knowledge-graph") {
        renderKnowledgeGraph();
      } else if (targetTabId === "tab-deck") {
        renderPitchSlide(currentSlideIndex);
      }
    });
  });

  // 2. Audio Visualizer Simulation on HTML5 Canvas
  function startVisualizer() {
    if (!canvas || !canvasCtx) return;
    isVisualizerActive = true;
    let step = 0;

    function draw() {
      if (!isVisualizerActive) {
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      step++;
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;
      const bars = 36;
      const barWidth = width / bars;

      for (let i = 0; i < bars; i++) {
        // Generate pseudo audio wave frequencies
        const freq = Math.sin((step * 0.12) + (i * 0.35)) * 0.5 + 0.5;
        const barHeight = Math.max(4, freq * (height * 0.75));
        const x = i * barWidth;
        const y = centerY - (barHeight / 2);

        // Gradient color for bars
        const gradient = canvasCtx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, "#4f46e5");
        gradient.addColorStop(0.5, "#ec4899");
        gradient.addColorStop(1, "#f59e0b");

        canvasCtx.fillStyle = gradient;
        canvasCtx.beginPath();
        canvasCtx.roundRect(x + 2, y, barWidth - 4, barHeight, 3);
        canvasCtx.fill();
      }

      animationFrameId = requestAnimationFrame(draw);
    }

    draw();
  }

  function stopVisualizer() {
    isVisualizerActive = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    if (canvasCtx && canvas) {
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // 3. AI Voice Tutor Interactions
  const micRecordBtn = document.getElementById("micRecordBtn");
  const micIcon = document.getElementById("micIcon");
  const micStatusText = document.getElementById("micStatusText");
  const tutorChatFeed = document.getElementById("tutorChatFeed");
  const textQueryInput = document.getElementById("textQueryInput");
  const sendQueryBtn = document.getElementById("sendQueryBtn");
  const languageSelector = document.getElementById("languageSelector");

  // Sync Language
  if (languageSelector) {
    languageSelector.addEventListener("change", (e) => {
      window.regionLearnAI.setLanguage(e.target.value);
      addTutorSystemMessage(`Language switched to: ${e.target.options[e.target.selectedIndex].text}`);
    });
  }

  // Microphone toggle button
  if (micRecordBtn) {
    micRecordBtn.addEventListener("click", () => {
      if (window.regionLearnAI.isListening) {
        window.regionLearnAI.stopListening();
        setMicUI(false);
      } else {
        setMicUI(true);
        window.regionLearnAI.startListening(
          // onResult
          (transcript) => {
            setMicUI(false);
            handleUserQuery(transcript);
          },
          // onError
          (error) => {
            setMicUI(false);
            console.warn("Speech error:", error);
            if (error === "not-allowed" || error === "service-not-allowed") {
              addTutorSystemMessage("💡 Mic note: Browser restricts live microphone on local file:// links. You can type freely below, click the quick question buttons, or double-click 'start_server.bat' to enable live mic!");
            } else {
              addTutorSystemMessage("💡 Speech note: " + error + ". You can type your doubt or select a quick question below.");
            }
          },
          // onStateChange
          (isListening) => {
            setMicUI(isListening);
          }
        );
      }
    });
  }

  function setMicUI(active) {
    if (!micRecordBtn || !micStatusText) return;
    if (active) {
      micRecordBtn.classList.add("bg-red-600", "text-white", "animate-pulse");
      micRecordBtn.classList.remove("bg-indigo-600");
      micStatusText.textContent = "Listening to your dialect... speak now";
      micStatusText.classList.add("text-red-600", "font-semibold");
      startVisualizer();
    } else {
      micRecordBtn.classList.remove("bg-red-600", "text-white", "animate-pulse");
      micRecordBtn.classList.add("bg-indigo-600");
      micStatusText.textContent = "Tap microphone to speak or type in any dialect";
      micStatusText.classList.remove("text-red-600", "font-semibold");
      stopVisualizer();
    }
  }

  // Send typed query
  if (sendQueryBtn && textQueryInput) {
    sendQueryBtn.addEventListener("click", () => {
      const text = textQueryInput.value.trim();
      if (text) {
        handleUserQuery(text);
        textQueryInput.value = "";
      }
    });

    textQueryInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const text = textQueryInput.value.trim();
        if (text) {
          handleUserQuery(text);
          textQueryInput.value = "";
        }
      }
    });
  }

  // Quick preset query buttons
  const quickQueryPills = document.querySelectorAll(".quick-query-pill");
  quickQueryPills.forEach(pill => {
    pill.addEventListener("click", () => {
      const query = pill.getAttribute("data-query");
      handleUserQuery(query);
    });
  });

  // Handle incoming student question
  async function handleUserQuery(query) {
    // 1. Add user bubble to chat
    appendChatMessage("user", query);

    // 2. Show thinking indicator
    const thinkingId = appendChatThinking();

    // 3. AI Inference via Granite 8B Indic pipeline
    try {
      const response = await window.regionLearnAI.generateResponse(query);
      removeChatThinking(thinkingId);

      // 4. Append Tutor response bubble
      appendChatMessage("tutor", response.textResponse, {
        conceptTitle: response.conceptTitle,
        analogyName: response.analogyName,
        prerequisiteGap: response.prerequisiteGap,
        edgeCacheHit: response.edgeCacheHit
      });

      // 5. Automatically play voice narration if speech synthesis available
      startVisualizer();
      window.regionLearnAI.speakText(response.textResponse, null, () => {
        stopVisualizer();
      });

      // Update frugal counter in UI
      updateFrugalStatsUI();
    } catch (e) {
      removeChatThinking(thinkingId);
      appendChatMessage("tutor", "Fikar mat karo! Let's break this down step-by-step. Try asking about Ohm's Law, Photosynthesis, or Quadratic Equations.");
    }
  }

  function appendChatMessage(sender, text, metadata = null) {
    if (!tutorChatFeed) return;
    const msgDiv = document.createElement("div");
    msgDiv.className = `flex flex-col mb-4 ${sender === "user" ? "items-end" : "items-start"}`;

    if (sender === "user") {
      msgDiv.innerHTML = `
        <div class="chat-bubble-user max-w-lg px-4 py-3 text-sm font-medium">
          <div class="flex items-center gap-2 mb-1 opacity-80 text-xs">
            <svg class="w-3.5 h-3.5 inline text-indigo-200" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>
            <span>You (Student - Class 10)</span>
          </div>
          <p>${escapeHTML(text)}</p>
        </div>
      `;
    } else {
      let metaHTML = "";
      if (metadata) {
        metaHTML = `
          <div class="flex flex-wrap items-center gap-2 mb-2">
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
              🌾 ${metadata.analogyName || "Village Analogy"}
            </span>
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-800">
              IBM Granite 8B Indic
            </span>
            ${metadata.edgeCacheHit ? '<span class="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">⚡ 0-Cost Edge Cache</span>' : ''}
          </div>
        `;
      }

      msgDiv.innerHTML = `
        <div class="chat-bubble-tutor max-w-xl px-5 py-4 text-sm text-slate-800">
          <div class="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
            <div class="flex items-center gap-2 text-indigo-700 font-semibold text-xs">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>RegionLearn Voice Tutor</span>
            </div>
            <button class="speak-again-btn text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium bg-indigo-50 px-2 py-1 rounded" title="Listen again">
              🔊 Repeat Voice
            </button>
          </div>
          ${metaHTML}
          <div class="prose prose-sm max-w-none space-y-2 leading-relaxed">
            ${formatTutorResponse(text)}
          </div>
        </div>
      `;

      // Hook voice repeat button
      const speakBtn = msgDiv.querySelector(".speak-again-btn");
      if (speakBtn) {
        speakBtn.addEventListener("click", () => {
          startVisualizer();
          window.regionLearnAI.speakText(text, null, () => {
            stopVisualizer();
          });
        });
      }
    }

    tutorChatFeed.appendChild(msgDiv);
    tutorChatFeed.scrollTop = tutorChatFeed.scrollHeight;
  }

  function appendChatThinking() {
    const id = "thinking-" + Date.now();
    const div = document.createElement("div");
    div.id = id;
    div.className = "flex items-start mb-4";
    div.innerHTML = `
      <div class="chat-bubble-tutor px-4 py-3 text-xs text-slate-500 flex items-center gap-2">
        <div class="sound-wave">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
        <span>Granite Indic AI transcreating to village dialect...</span>
      </div>
    `;
    tutorChatFeed.appendChild(div);
    tutorChatFeed.scrollTop = tutorChatFeed.scrollHeight;
    return id;
  }

  function removeChatThinking(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  function addTutorSystemMessage(text) {
    if (!tutorChatFeed) return;
    const div = document.createElement("div");
    div.className = "flex justify-center my-2";
    div.innerHTML = `<span class="bg-slate-200 text-slate-700 text-xs px-3 py-1 rounded-full">${text}</span>`;
    tutorChatFeed.appendChild(div);
    tutorChatFeed.scrollTop = tutorChatFeed.scrollHeight;
  }

  function formatTutorResponse(text) {
    // Converts basic markdown bold and bullet points into styled HTML
    return text
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/• /g, '&bull; ');
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  function updateFrugalStatsUI() {
    const stats = window.regionLearnAI.sessionStats;
    const tokensEl = document.getElementById("statTokens");
    const dataEl = document.getElementById("statData");
    const costEl = document.getElementById("statCost");
    if (tokensEl) tokensEl.textContent = stats.tokensProcessed;
    if (dataEl) dataEl.textContent = stats.audioBytesTransferredKB.toFixed(1) + " KB";
    if (costEl) costEl.textContent = "₹" + stats.estimatedCostINR;
  }

  // 4. Dialect Transcreator Studio
  const conceptSelect = document.getElementById("conceptSelect");
  const dialectConceptLang = document.getElementById("dialectConceptLang");
  const conceptDisplayCard = document.getElementById("conceptDisplayCard");
  const playTranscreationAudio = document.getElementById("playTranscreationAudio");

  if (conceptSelect && conceptDisplayCard) {
    conceptSelect.addEventListener("change", renderSelectedConcept);
    if (dialectConceptLang) {
      dialectConceptLang.addEventListener("change", renderSelectedConcept);
    }
    // initial render
    renderSelectedConcept();
  }

  function renderSelectedConcept() {
    if (!conceptSelect) return;
    const conceptKey = conceptSelect.value;
    const lang = dialectConceptLang ? dialectConceptLang.value : "hi-IN";
    const repo = window.regionLearnAI.conceptRepository;
    const concept = repo[conceptKey];
    if (!concept) return;

    const transcreation = concept.transcreations[lang] || concept.transcreations["hi-IN"] || concept.transcreations["en-IN"];

    document.getElementById("conceptTitle").textContent = concept.title;
    document.getElementById("conceptSyllabusBadge").textContent = concept.boardSyllabus;
    document.getElementById("conceptSubject").textContent = concept.subject;
    document.getElementById("textbookDefText").textContent = concept.textbookDefinition;
    document.getElementById("ruralStuckReason").textContent = concept.ruralStuckReason;
    document.getElementById("prerequisiteGapText").textContent = concept.prerequisiteGap;

    document.getElementById("analogyTitle").textContent = transcreation.analogyName;
    document.getElementById("analogyExplanation").innerHTML = formatTutorResponse(transcreation.explanation);
    document.getElementById("socraticPromptText").textContent = transcreation.socraticPrompt;

    if (playTranscreationAudio) {
      playTranscreationAudio.onclick = () => {
        window.regionLearnAI.speakText(transcreation.explanation + " " + transcreation.socraticPrompt, lang);
      };
    }
  }

  // 5. Adaptive Diagnostic Quiz Engine
  const quizContainer = document.getElementById("diagnosticQuizContainer");
  const submitQuizBtn = document.getElementById("submitQuizBtn");
  const quizResultsCard = document.getElementById("quizResultsCard");

  function renderDiagnosticQuiz() {
    if (!quizContainer) return;
    quizContainer.innerHTML = "";
    const questions = window.regionLearnAI.diagnosticQuiz;

    questions.forEach((q, index) => {
      const qCard = document.createElement("div");
      qCard.className = "bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6";
      
      let optionsHTML = "";
      q.options.forEach((opt, optIdx) => {
        optionsHTML += `
          <label class="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors mb-2">
            <input type="radio" name="quiz_q_${q.id}" value="${optIdx}" class="mt-1 text-indigo-600 focus:ring-indigo-500">
            <span class="text-sm text-slate-700">${opt.text}</span>
          </label>
        `;
      });

      qCard.innerHTML = `
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded">
            Question ${index + 1} of ${questions.length} &bull; ${q.subject}
          </span>
          <span class="text-xs text-slate-500 font-medium">${q.topic}</span>
        </div>
        <h4 class="text-base font-semibold text-slate-900 mb-4">${q.questionText}</h4>
        <div class="options-group space-y-1">
          ${optionsHTML}
        </div>
      `;

      quizContainer.appendChild(qCard);
    });
  }

  renderDiagnosticQuiz();

  if (submitQuizBtn) {
    submitQuizBtn.addEventListener("click", () => {
      const questions = window.regionLearnAI.diagnosticQuiz;
      const answers = {};
      let allAnswered = true;

      questions.forEach(q => {
        const selected = document.querySelector(`input[name="quiz_q_${q.id}"]:checked`);
        if (selected) {
          answers[q.id] = parseInt(selected.value);
        } else {
          allAnswered = false;
        }
      });

      if (!allAnswered) {
        alert("Please answer all diagnostic questions so the AI can map your foundational prerequisite gaps!");
        return;
      }

      // Evaluate with AI engine
      const results = window.regionLearnAI.evaluateQuizSubmission(answers);

      // Render Results Card
      if (quizResultsCard) {
        quizResultsCard.classList.remove("hidden");
        document.getElementById("quizScoreText").textContent = `${results.score} / ${results.totalQuestions} (${results.percentage}%)`;
        document.getElementById("learningGapGainText").textContent = `+${results.projectedClosureGain - results.percentage}% Gain`;

        const gapsList = document.getElementById("detectedGapsList");
        gapsList.innerHTML = "";

        if (results.detectedGaps.length === 0) {
          gapsList.innerHTML = `<div class="p-4 bg-emerald-50 text-emerald-800 rounded-lg text-sm font-semibold">🎉 Exceptional mastery! No foundational prerequisite gaps detected in Grade 7-9 prerequisites.</div>`;
        } else {
          results.detectedGaps.forEach(gap => {
            const item = document.createElement("div");
            item.className = "p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-slate-800 mb-3";
            item.innerHTML = `
              <div class="flex items-center justify-between mb-1">
                <span class="font-bold text-red-700 flex items-center gap-1">
                  ⚠️ Root Cause Diagnosed: ${gap.diagnosedGap}
                </span>
                <span class="text-xs bg-red-200 text-red-900 font-semibold px-2 py-0.5 rounded">Action Required</span>
              </div>
              <p class="text-xs text-slate-600 mb-2">Subject: ${gap.topic}</p>
              <div class="bg-white p-3 rounded border border-red-100 text-xs text-slate-700">
                <strong>Granite Indic AI Remedy:</strong> ${gap.remedialAdvice}
              </div>
            `;
            gapsList.appendChild(item);
          });
        }

        // Scroll to results
        quizResultsCard.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  // 6. Interactive Knowledge Graph Render
  function renderKnowledgeGraph() {
    const container = document.getElementById("knowledgeGraphCanvas");
    if (!container) return;
    const nodes = window.regionLearnAI.knowledgeGraphNodes;

    let svgHTML = `
      <svg class="w-full h-96 bg-slate-900 rounded-xl" viewBox="0 0 800 380" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#4f46e5" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.8"/>
          </linearGradient>
        </defs>

        <!-- Connecting Lines / Prerequisite Trees -->
        <path d="M 120 80 Q 250 140 400 190" stroke="url(#edgeGrad)" stroke-width="2" stroke-dasharray="4,4" fill="none"/>
        <path d="M 120 180 Q 260 180 400 190" stroke="url(#edgeGrad)" stroke-width="2" fill="none"/>
        <path d="M 120 280 Q 250 240 400 190" stroke="url(#edgeGrad)" stroke-width="2" fill="none"/>
        <path d="M 400 190 Q 520 120 660 100" stroke="#10b981" stroke-width="3" fill="none"/>
        <path d="M 400 190 Q 520 250 660 260" stroke="#f59e0b" stroke-width="3" fill="none"/>

        <!-- Root Prerequisite Nodes (Grade 7 & 8) -->
        <g class="graph-node" onclick="showNodeDetail('fractions_reciprocal')">
          <circle cx="120" cy="80" r="32" fill="#ef4444" stroke="#fca5a5" stroke-width="3"/>
          <text x="120" y="85" font-size="11" font-weight="bold" fill="white" text-anchor="middle">Grade 7</text>
          <text x="120" y="125" font-size="11" fill="#cbd5e1" text-anchor="middle">Fractions & Reciprocals</text>
        </g>

        <g class="graph-node" onclick="showNodeDetail('negative_integers_arithmetic')">
          <circle cx="120" cy="180" r="32" fill="#ef4444" stroke="#fca5a5" stroke-width="3"/>
          <text x="120" y="185" font-size="11" font-weight="bold" fill="white" text-anchor="middle">Grade 7</text>
          <text x="120" y="225" font-size="11" fill="#cbd5e1" text-anchor="middle">Integer Signs (+/-)</text>
        </g>

        <g class="graph-node" onclick="showNodeDetail('chemical_reactivity')">
          <circle cx="120" cy="280" r="32" fill="#10b981" stroke="#6ee7b7" stroke-width="3"/>
          <text x="120" y="285" font-size="11" font-weight="bold" fill="white" text-anchor="middle">Grade 8</text>
          <text x="120" y="325" font-size="11" fill="#cbd5e1" text-anchor="middle">Atoms & Mass</text>
        </g>

        <!-- Bridge & Middle Concepts -->
        <g class="graph-node" onclick="showNodeDetail('ohm_law_parallel')">
          <circle cx="400" cy="190" r="38" fill="#4f46e5" stroke="#a5b4fc" stroke-width="3"/>
          <text x="400" y="195" font-size="12" font-weight="bold" fill="white" text-anchor="middle">Ohm's Law</text>
          <text x="400" y="240" font-size="12" fill="#e0e7ff" text-anchor="middle">Electric Circuits</text>
        </g>

        <!-- Target Grade 10 Board Exam Competencies -->
        <g class="graph-node" onclick="showNodeDetail('quadratic_factoring')">
          <circle cx="660" cy="100" r="35" fill="#f59e0b" stroke="#fde68a" stroke-width="3"/>
          <text x="660" y="105" font-size="11" font-weight="bold" fill="white" text-anchor="middle">Grade 10</text>
          <text x="660" y="150" font-size="11" fill="#fde68a" text-anchor="middle">Quadratic Board Qs</text>
        </g>

        <g class="graph-node" onclick="showNodeDetail('refraction_lenses')">
          <circle cx="660" cy="260" r="35" fill="#10b981" stroke="#6ee7b7" stroke-width="3"/>
          <text x="660" y="265" font-size="11" font-weight="bold" fill="white" text-anchor="middle">Grade 10</text>
          <text x="660" y="310" font-size="11" fill="#a7f3d0" text-anchor="middle">Optics & Eye Defects</text>
        </g>
      </svg>
    `;

    container.innerHTML = svgHTML;
  }

  window.showNodeDetail = function(nodeId) {
    const node = window.regionLearnAI.knowledgeGraphNodes.find(n => n.id === nodeId);
    if (!node) return;
    const detailBox = document.getElementById("nodeDetailPopup");
    if (!detailBox) return;

    detailBox.classList.remove("hidden");
    document.getElementById("popupNodeTitle").textContent = node.label + " (" + node.grade + ")";
    document.getElementById("popupNodeStatus").textContent = "Status: " + node.status.toUpperCase();
    document.getElementById("popupNodeStatus").className = `text-xs font-bold px-2.5 py-1 rounded ${
      node.status === "gap-detected" ? "bg-red-100 text-red-800" :
      node.status === "mastered" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
    }`;

    document.getElementById("popupNodeAdvice").textContent = 
      node.status === "gap-detected" 
        ? "⚠️ 55% of rural learners who fail Ohm's Law or Quadratic equations actually stumble here due to lack of 1-on-1 remedial practice in Grade 7. RegionLearn-Bridge automatically serves 60-second village voice analogies to plug this prerequisite gap."
        : "✅ Concept diagnosed as solid. Ready for past 10-year State Board examination questions!";
  };

  // 7. WhatsApp 2G Mode Simulator
  const waSendBtn = document.getElementById("waSendBtn");
  const waVoiceSimBtn = document.getElementById("waVoiceSimBtn");
  const waInput = document.getElementById("waInput");
  const waMessagesContainer = document.getElementById("waMessagesContainer");

  if (waSendBtn && waInput) {
    waSendBtn.addEventListener("click", () => {
      const msg = waInput.value.trim();
      if (msg) {
        sendWAMessage(msg);
        waInput.value = "";
      }
    });
  }

  if (waVoiceSimBtn) {
    waVoiceSimBtn.addEventListener("click", () => {
      sendWAVoiceNote("Sir, Bihar Board exam aa raha hai, Chemistry me balancing equation samajh nahi aati!");
    });
  }

  function sendWAMessage(text) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userBubble = document.createElement("div");
    userBubble.className = "flex justify-end mb-2";
    userBubble.innerHTML = `
      <div class="wa-outgoing p-2.5 text-xs text-slate-800 max-w-xs">
        <p>${escapeHTML(text)}</p>
        <span class="text-[10px] text-slate-500 float-right mt-1 ml-2">${time} ✓✓</span>
      </div>
    `;
    waMessagesContainer.appendChild(userBubble);
    waMessagesContainer.scrollTop = waMessagesContainer.scrollHeight;

    // Simulate WhatsApp Bot response
    setTimeout(async () => {
      const botResponse = await window.regionLearnAI.generateResponse(text);
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const botBubble = document.createElement("div");
      botBubble.className = "flex justify-start mb-2";
      botBubble.innerHTML = `
        <div class="wa-incoming p-2.5 text-xs text-slate-800 max-w-xs">
          <div class="font-bold text-indigo-700 text-[11px] mb-1">RegionLearn 2G Voice Bot</div>
          <p class="leading-relaxed">${escapeHTML(botResponse.textResponse)}</p>
          <div class="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span class="text-[10px] text-emerald-600 font-semibold">2G Data: 42 KB used</span>
            <span class="text-[10px] text-slate-400">${replyTime}</span>
          </div>
        </div>
      `;
      waMessagesContainer.appendChild(botBubble);
      waMessagesContainer.scrollTop = waMessagesContainer.scrollHeight;
    }, 800);
  }

  function sendWAVoiceNote(transcriptText) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userVoice = document.createElement("div");
    userVoice.className = "flex justify-end mb-2";
    userVoice.innerHTML = `
      <div class="wa-outgoing p-3 text-xs text-slate-800 max-w-xs flex items-center gap-2">
        <button class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">▶</button>
        <div class="flex-1">
          <div class="w-24 h-1.5 bg-emerald-400 rounded-full mb-1"></div>
          <span class="text-[10px] text-slate-500">Voice Note (0:14) &bull; 18 KB</span>
        </div>
        <span class="text-[10px] text-slate-500">${time} ✓✓</span>
      </div>
    `;
    waMessagesContainer.appendChild(userVoice);
    waMessagesContainer.scrollTop = waMessagesContainer.scrollHeight;

    setTimeout(() => {
      const botVoice = document.createElement("div");
      botVoice.className = "flex justify-start mb-2";
      botVoice.innerHTML = `
        <div class="wa-incoming p-3 text-xs text-slate-800 max-w-xs">
          <div class="flex items-center gap-2 mb-2">
            <button class="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">▶</button>
            <div class="flex-1">
              <div class="w-28 h-1.5 bg-indigo-300 rounded-full mb-1"></div>
              <span class="text-[10px] text-indigo-700 font-semibold">Granite Indic Audio Solution (0:48)</span>
            </div>
          </div>
          <p class="text-[11px] text-slate-600">"Chemical balancing ko gaon ki tarazu (balance scale) samjho! Dono taraf parmanu barabar hone chahiye..."</p>
          <span class="text-[10px] text-emerald-600 font-semibold block mt-1">Payload: 49 KB &bull; WhatsApp Free Tier</span>
        </div>
      `;
      waMessagesContainer.appendChild(botVoice);
      waMessagesContainer.scrollTop = waMessagesContainer.scrollHeight;
    }, 1000);
  }

  // 8. Interactive 12-Slide Masterclass Pitch Deck
  const deckSlidesData = [
    {
      number: 1,
      title: "RegionLearn Bridge",
      subtitle: "A mobile-first vernacular AI tutoring platform delivering personalized remedial STEM learning to rural secondary students.",
      tags: ["UN SDG 4: Quality Education", "IBM SkillsBuild Masterclass 5", "Powered by IBM Granite Indic"],
      layout: "executive-title",
      contentHTML: `
        <div class="text-center py-10 px-6 max-w-3xl mx-auto">
          <div class="flex items-center justify-center gap-3 mb-6">
            <span class="px-3 py-1 rounded-full text-xs font-bold badge-sdg">UN SDG 4</span>
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white">IBM SkillsBuild Masterclass 5</span>
            <span class="px-3 py-1 rounded-full text-xs font-bold badge-granite">IBM Granite 8B Indic</span>
          </div>
          <h1 class="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            RegionLearn Bridge
          </h1>
          <p class="text-xl text-indigo-200 font-light mb-8">
            Bridging the Rural Secondary Learning Crisis with Frugal Vernacular Voice AI
          </p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-left mt-8">
            <div class="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
              <div class="text-amber-400 text-2xl font-bold mb-1">1:45+ PTR</div>
              <div class="text-xs text-slate-300">Acute rural teacher deficit with zero 1-on-1 personalized remedial time.</div>
            </div>
            <div class="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
              <div class="text-emerald-400 text-2xl font-bold mb-1">₹49–₹99/mo</div>
              <div class="text-xs text-slate-300">Frugal sachet pricing democratizing private tutoring for working-class parents.</div>
            </div>
            <div class="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
              <div class="text-cyan-400 text-2xl font-bold mb-1">&lt;10 MB/Day</div>
              <div class="text-xs text-slate-300">Ultra-light edge caching designed specifically for rural 2G/3G family phones.</div>
            </div>
          </div>
        </div>
      `
    },
    {
      number: 2,
      title: "The Rural Secondary Learning Crisis",
      subtitle: "Grade 9 & 10 vernacular students face an insurmountable triple barrier before their board exams.",
      layout: "three-cards",
      contentHTML: `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div class="bg-white text-slate-900 rounded-xl p-6 shadow-xl border-t-4 border-red-500">
            <div class="w-12 h-12 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-xl mb-4">1:45+</div>
            <h3 class="text-lg font-bold mb-2">Teacher Deficit</h3>
            <p class="text-sm text-slate-600 leading-relaxed">
              Overburdened rural classrooms where one single teacher instructs 50-70 students across multiple grades simultaneously. Zero personalized 1-on-1 remedial help for struggling learners.
            </p>
          </div>
          <div class="bg-white text-slate-900 rounded-xl p-6 shadow-xl border-t-4 border-amber-500">
            <div class="w-12 h-12 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xl mb-4">85%</div>
            <h3 class="text-lg font-bold mb-2">Language Barrier</h3>
            <p class="text-sm text-slate-600 leading-relaxed">
              High-quality STEM EdTech is overwhelmingly in English or academic formal Hindi. Rural learners think and reason best in their spoken mother tongue dialects and everyday village metaphors.
            </p>
          </div>
          <div class="bg-white text-slate-900 rounded-xl p-6 shadow-xl border-t-4 border-purple-500">
            <div class="w-12 h-12 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xl mb-4">55%</div>
            <h3 class="text-lg font-bold mb-2">Hidden Foundational Gaps</h3>
            <p class="text-sm text-slate-600 leading-relaxed">
              55% of state board failures in Grade 10 stem from undetected prerequisite gaps from Grades 6-8 (like basic fraction division or integer signs), trapping students in rote memorization.
            </p>
          </div>
        </div>
      `
    },
    {
      number: 3,
      title: "RegionLearn Bridge: 3 Core Pillars",
      subtitle: "An end-to-end pedagogical scaffolding engine purpose-built for rural India.",
      layout: "three-pillars",
      contentHTML: `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div class="p-6 rounded-xl bg-slate-800/90 border border-indigo-500/30 hover:border-indigo-500 transition-all">
            <div class="text-3xl mb-3">🎙️</div>
            <h3 class="text-lg font-bold text-white mb-2">24/7 Vernacular AI Voice Tutor</h3>
            <p class="text-xs text-slate-300 leading-relaxed mb-4">
              Conversational 1-on-1 tutoring agent speaking regional dialects and explaining concepts step-by-step with infinite patience. Never judges, repeats endlessly, and accepts natural voice notes.
            </p>
            <span class="text-[11px] text-indigo-400 font-semibold">&bull; Powered by Quantized Indic LLMs</span>
          </div>
          <div class="p-6 rounded-xl bg-slate-800/90 border border-amber-500/30 hover:border-amber-500 transition-all">
            <div class="text-3xl mb-3">🌾</div>
            <h3 class="text-lg font-bold text-white mb-2">Dialect Transcreation Engine</h3>
            <p class="text-xs text-slate-300 leading-relaxed mb-4">
              Dynamically deconstructs complex STEM definitions into intuitive mother-tongue explanations using relatable village analogies (Chulha kitchens, canal irrigation, bullock carts, pickle making).
            </p>
            <span class="text-[11px] text-amber-400 font-semibold">&bull; Proprietary Dialect Corpus</span>
          </div>
          <div class="p-6 rounded-xl bg-slate-800/90 border border-emerald-500/30 hover:border-emerald-500 transition-all">
            <div class="text-3xl mb-3">🧩</div>
            <h3 class="text-lg font-bold text-white mb-2">Adaptive Diagnostic Quiz Engine</h3>
            <p class="text-xs text-slate-300 leading-relaxed mb-4">
              Generates dynamic micro-assessments, pinpoints underlying prerequisite gaps, and automatically serves 60-second remedial voice lessons to permanently close foundational leaks.
            </p>
            <span class="text-[11px] text-emerald-400 font-semibold">&bull; Longitudinal Failure Flywheel</span>
          </div>
        </div>
      `
    },
    {
      number: 4,
      title: "How the Application Works",
      subtitle: "Full-width System Architecture Diagram illustrating the 5-step speech-to-speech AI pipeline.",
      layout: "architecture",
      contentHTML: `
        <div class="p-6 max-w-4xl mx-auto">
          <div class="grid grid-cols-5 gap-3 text-center mb-6">
            <div class="bg-indigo-950 p-4 rounded-xl border border-indigo-700">
              <div class="text-xl mb-1">🗣️</div>
              <div class="text-xs font-bold text-indigo-300">Step 1</div>
              <div class="text-[11px] text-slate-200 mt-1 font-semibold">Spoken Dialect Audio</div>
              <div class="text-[10px] text-slate-400 mt-1">2G voice note / Web mic (<50KB)</div>
            </div>
            <div class="bg-indigo-950 p-4 rounded-xl border border-indigo-700">
              <div class="text-xl mb-1">🔄</div>
              <div class="text-xs font-bold text-indigo-300">Step 2</div>
              <div class="text-[11px] text-slate-200 mt-1 font-semibold">Bhashini ASR Pipeline</div>
              <div class="text-[10px] text-slate-400 mt-1">Regional speech-to-text normalization</div>
            </div>
            <div class="bg-blue-900 p-4 rounded-xl border-2 border-cyan-400 shadow-lg">
              <div class="text-xl mb-1">🧠</div>
              <div class="text-xs font-bold text-cyan-300">Step 3</div>
              <div class="text-[11px] text-white mt-1 font-bold">IBM Granite 8B Indic</div>
              <div class="text-[10px] text-cyan-200 mt-1">Socratic pedagogy & reasoning</div>
            </div>
            <div class="bg-indigo-950 p-4 rounded-xl border border-indigo-700">
              <div class="text-xl mb-1">🌾</div>
              <div class="text-xs font-bold text-indigo-300">Step 4</div>
              <div class="text-[11px] text-slate-200 mt-1 font-semibold">Analogy Knowledge Graph</div>
              <div class="text-[10px] text-slate-400 mt-1">Maps STEM to village culture</div>
            </div>
            <div class="bg-indigo-950 p-4 rounded-xl border border-indigo-700">
              <div class="text-xl mb-1">🔊</div>
              <div class="text-xs font-bold text-indigo-300">Step 5</div>
              <div class="text-[11px] text-slate-200 mt-1 font-semibold">Vernacular TTS Audio</div>
              <div class="text-[10px] text-slate-400 mt-1">Warm, patient mother-tongue speech</div>
            </div>
          </div>
          <div class="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-center justify-between">
            <span>⚡ <strong>Ultra-Low Latency Pipeline</strong>: Median response under 1.8 seconds on 3G connections.</span>
            <span class="text-emerald-400 font-bold">Frugal Compute: &lt;₹0.02 / query</span>
          </div>
        </div>
      `
    },
    {
      number: 5,
      title: "Inside the Application",
      subtitle: "3-Module UI Mockup Graphic showing Voice Tutor chat, Knowledge Graph, and WhatsApp 2G bot.",
      layout: "ui-mockups",
      contentHTML: `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div class="p-4 rounded-xl bg-slate-800 border border-slate-700">
            <h4 class="text-sm font-bold text-indigo-300 mb-2 flex items-center gap-2">
              <span>📱</span> Module 1: Voice Tutor Chat
            </h4>
            <div class="bg-slate-900 rounded p-3 text-xs text-slate-300 space-y-2 mb-2 font-mono">
              <div class="text-cyan-400">&gt; Student: "Ohm's law kyu zaroori hai?"</div>
              <div class="text-emerald-400">&gt; Granite AI: "Jaise nahar me paani ka dabav..."</div>
            </div>
            <p class="text-[11px] text-slate-400">Zero typing required. Students simply tap the microphone to talk.</p>
          </div>
          <div class="p-4 rounded-xl bg-slate-800 border border-slate-700">
            <h4 class="text-sm font-bold text-amber-300 mb-2 flex items-center gap-2">
              <span>🕸️</span> Module 2: Knowledge Graph
            </h4>
            <div class="bg-slate-900 rounded p-3 text-xs text-slate-300 space-y-1 mb-2">
              <div class="flex justify-between"><span>Grade 7 Fractions:</span> <span class="text-red-400">Hidden Gap</span></div>
              <div class="flex justify-between"><span>Grade 10 Parallel:</span> <span class="text-amber-400">Blocked</span></div>
            </div>
            <p class="text-[11px] text-slate-400">Visual diagnosis of root-cause prerequisite failures before board exams.</p>
          </div>
          <div class="p-4 rounded-xl bg-slate-800 border border-slate-700">
            <h4 class="text-sm font-bold text-emerald-300 mb-2 flex items-center gap-2">
              <span>💬</span> Module 3: WhatsApp 2G Bot
            </h4>
            <div class="bg-slate-900 rounded p-3 text-xs text-slate-300 space-y-1 mb-2 font-mono">
              <div>🎙️ Voice Note (14s, 18 KB)</div>
              <div class="text-emerald-300">✓✓ Audio remedy returned in 2s</div>
            </div>
            <p class="text-[11px] text-slate-400">Accessible on any basic family smartphone with zero app installation.</p>
          </div>
        </div>
      `
    },
    {
      number: 6,
      title: "Unique Value Proposition",
      subtitle: "Duolingo + Khan Academy powered by an AI tutor in your mother tongue for rural students.",
      layout: "quotes",
      contentHTML: `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <div class="p-6 rounded-xl bg-slate-800/90 border border-indigo-500/40 relative">
            <span class="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-2">Student Voice (#User)</span>
            <p class="text-sm text-slate-200 italic leading-relaxed mb-4">
              "Now, I can just talk to my phone in my own mother tongue. My AI tutor never judges me, explains every step using examples from my daily life, and patiently practices with me until I actually understand. For the first time, Math and Science don't scare me."
            </p>
            <div class="text-xs text-slate-400 font-semibold">— Chhotu (Grade 10 State-Board Student, UP Rural)</div>
          </div>
          <div class="p-6 rounded-xl bg-slate-800/90 border border-amber-500/40 relative">
            <span class="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2">Parent Voice (#Customer)</span>
            <p class="text-sm text-slate-200 italic leading-relaxed mb-4">
              "For less than ₹50 to ₹99 a month, my child has a dedicated private teacher right on our family phone who speaks our language. I see them studying excitedly every evening instead of crying over textbooks, and their school marks have visibly improved."
            </p>
            <div class="text-xs text-slate-400 font-semibold">— Ramesh (Small Farmer & Parent of Class 10 Student)</div>
          </div>
        </div>
      `
    },
    {
      number: 7,
      title: "\"Frugal AI\" Architecture",
      subtitle: "3 technical pillars delivering 1-on-1 tutoring at < ₹11.50/student/month compute cost.",
      layout: "frugal-tech",
      contentHTML: `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div class="p-5 rounded-xl bg-slate-800 border border-cyan-500/30">
            <div class="text-cyan-400 text-2xl font-bold mb-2">IBM Granite 8B Indic</div>
            <p class="text-xs text-slate-300 leading-relaxed mb-3">
              Distilled and 4-bit quantized lightweight Indic model optimized for low-compute pedagogical dialogue, running efficiently without expensive GPU overhead.
            </p>
            <span class="text-[11px] text-cyan-400 font-bold">&bull; &lt;₹10/student/month tokens</span>
          </div>
          <div class="p-5 rounded-xl bg-slate-800 border border-indigo-500/30">
            <div class="text-indigo-400 text-2xl font-bold mb-2">Bhashini Speech Pipeline</div>
            <p class="text-xs text-slate-300 leading-relaxed mb-3">
              High-efficiency Indian language speech-to-text and text-to-speech models calibrated for rural dialects and acoustic noise cancellation.
            </p>
            <span class="text-[11px] text-indigo-400 font-bold">&bull; Compressed Opus audio codecs</span>
          </div>
          <div class="p-5 rounded-xl bg-slate-800 border border-emerald-500/30">
            <div class="text-emerald-400 text-2xl font-bold mb-2">Low-Data Edge Caching</div>
            <p class="text-xs text-slate-300 leading-relaxed mb-3">
              Pre-caching 90% of state-board core syllabus concepts on device or village kiosks, guaranteeing less than 10MB data consumed per student per day.
            </p>
            <span class="text-[11px] text-emerald-400 font-bold">&bull; ~₹1.50/mo cloud hosting</span>
          </div>
        </div>
      `
    },
    {
      number: 8,
      title: "Verified Impact & Learning Gains",
      subtitle: "High-resolution data chart comparing baseline vs post-pilot score gains across subjects.",
      layout: "impact-chart",
      contentHTML: `
        <div class="p-6 max-w-3xl mx-auto">
          <div class="space-y-4 mb-6">
            <div>
              <div class="flex justify-between text-xs text-slate-300 mb-1 font-semibold">
                <span>Class 10 Science (Physics & Chemistry)</span>
                <span>Baseline 41% ➔ Post-Pilot 78% (+37%)</span>
              </div>
              <div class="w-full bg-slate-800 rounded-full h-4 overflow-hidden flex">
                <div class="bg-red-500 h-4" style="width: 41%"></div>
                <div class="bg-emerald-500 h-4" style="width: 37%"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-xs text-slate-300 mb-1 font-semibold">
                <span>Class 10 Mathematics (Algebra & Geometry)</span>
                <span>Baseline 36% ➔ Post-Pilot 72% (+36%)</span>
              </div>
              <div class="w-full bg-slate-800 rounded-full h-4 overflow-hidden flex">
                <div class="bg-red-500 h-4" style="width: 36%"></div>
                <div class="bg-emerald-500 h-4" style="width: 36%"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-xs text-slate-300 mb-1 font-semibold">
                <span>Prerequisite Remedial Closure Rate</span>
                <span>84% of diagnosed foundational leaks sealed within 14 days</span>
              </div>
              <div class="w-full bg-slate-800 rounded-full h-4 overflow-hidden flex">
                <div class="bg-indigo-500 h-4" style="width: 84%"></div>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-4 text-center">
            <div class="p-3 bg-slate-800 rounded-lg"><div class="text-xl font-bold text-emerald-400">88%</div><div class="text-[10px] text-slate-400">Weekly Active Learners (WAL)</div></div>
            <div class="p-3 bg-slate-800 rounded-lg"><div class="text-xl font-bold text-cyan-400">74%</div><div class="text-[10px] text-slate-400">D90 Cohort Retention</div></div>
            <div class="p-3 bg-slate-800 rounded-lg"><div class="text-xl font-bold text-amber-400">92%</div><div class="text-[10px] text-slate-400">Vernacular Query Accuracy</div></div>
          </div>
        </div>
      `
    },
    {
      number: 9,
      title: "Business Model & Sachet Pricing",
      subtitle: "Pricing breakdown: ₹49–₹99/month consumer pass, ₹11.50/month variable compute cost, 75%+ Gross Margin.",
      layout: "business-model",
      contentHTML: `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div class="p-5 rounded-xl bg-slate-800 border border-slate-700">
            <div class="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Monthly Academic Pass</div>
            <div class="text-3xl font-extrabold text-white mb-2">₹99 <span class="text-xs font-normal text-slate-400">/ month</span></div>
            <p class="text-xs text-slate-300 leading-relaxed mb-4">Unlimited 24/7 vernacular voice tutoring, past 10-year board paper solver, and WhatsApp bot access.</p>
            <div class="text-[11px] text-emerald-400 font-semibold">Replaces ₹450/mo crowded tuitions</div>
          </div>
          <div class="p-5 rounded-xl bg-slate-800 border-2 border-indigo-500 relative">
            <span class="absolute -top-3 right-4 bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">POPULAR</span>
            <div class="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Annual Board Exam Pass</div>
            <div class="text-3xl font-extrabold text-white mb-2">₹399 <span class="text-xs font-normal text-slate-400">/ year</span></div>
            <p class="text-xs text-slate-300 leading-relaxed mb-4">Complete 10-month academic year coverage with full mock tests and state board certificate preparation.</p>
            <div class="text-[11px] text-emerald-400 font-semibold">Equivalent to ₹33/month</div>
          </div>
          <div class="p-5 rounded-xl bg-slate-800 border border-slate-700">
            <div class="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Unit Economics Proof</div>
            <div class="space-y-2 text-xs text-slate-300 mt-2">
              <div class="flex justify-between"><span>Revenue / Student:</span> <span class="font-bold text-white">₹99.00</span></div>
              <div class="flex justify-between text-red-400"><span>Granite AI Compute:</span> <span>-₹9.50</span></div>
              <div class="flex justify-between text-red-400"><span>Cloud & Audio Sync:</span> <span>-₹2.00</span></div>
              <div class="pt-2 border-t border-slate-700 flex justify-between font-bold text-emerald-400 text-sm">
                <span>Gross Margin:</span> <span>₹87.50 (88.3%)</span>
              </div>
            </div>
          </div>
        </div>
      `
    },
    {
      number: 10,
      title: "Zero-CAC Grassroots Distribution",
      subtitle: "3 channel cards: School Headmaster tie-ups, WhatsApp peer referral loops, Village CSC kiosks.",
      layout: "distribution",
      contentHTML: `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div class="p-5 rounded-xl bg-slate-800 border border-slate-700">
            <div class="text-2xl mb-2">🏫</div>
            <h4 class="text-sm font-bold text-white mb-2">School Headmaster Tie-Ups</h4>
            <p class="text-xs text-slate-300 leading-relaxed mb-3">
              Direct onboarding through respected rural school principals like Headmaster Anil Verma. One single school partnership immediately onboards 300+ students with 100% community trust.
            </p>
            <span class="text-[11px] text-indigo-400 font-semibold">&bull; High-trust institutional anchor</span>
          </div>
          <div class="p-5 rounded-xl bg-slate-800 border border-slate-700">
            <div class="text-2xl mb-2">📲</div>
            <h4 class="text-sm font-bold text-white mb-2">WhatsApp Peer Referral Loops</h4>
            <p class="text-xs text-slate-300 leading-relaxed mb-3">
              Students get 3 free voice doubts daily. To unlock more doubts, they share the WhatsApp bot with 3 classmates, triggering an organic K-factor referral loop of 1.4 across village youth.
            </p>
            <span class="text-[11px] text-emerald-400 font-semibold">&bull; Viral word-of-mouth</span>
          </div>
          <div class="p-5 rounded-xl bg-slate-800 border border-slate-700">
            <div class="text-2xl mb-2">🏪</div>
            <h4 class="text-sm font-bold text-white mb-2">Village CSC Kiosks & Recharge Shops</h4>
            <p class="text-xs text-slate-300 leading-relaxed mb-3">
              Common Service Centres (CSCs) and corner mobile recharge shops sell physical ₹99 scratch card vouchers for cash, completely bypassing credit card/UPI hurdles for rural families.
            </p>
            <span class="text-[11px] text-amber-400 font-semibold">&bull; Cash-to-digital bridge</span>
          </div>
        </div>
      `
    },
    {
      number: 11,
      title: "Validated Feasibility Ramp",
      subtitle: "3-phase milestone cards: 90-Day Pilot (2,500 trials) ➔ Year 1 (10,000 payers) ➔ Year 3 ($10M ARR scale).",
      layout: "ramp",
      contentHTML: `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          <div class="p-5 rounded-xl bg-slate-800 border border-indigo-500/40">
            <span class="text-xs font-bold text-indigo-400">PHASE 1: 90-DAY PILOT</span>
            <div class="text-2xl font-bold text-white mt-1 mb-2">2,500 Learners</div>
            <p class="text-xs text-slate-300 leading-relaxed mb-3">
              5 rural clusters across UP & Bihar. Headmaster Anil Verma pilot deployment. Baseline vs post-pilot assessment calibration.
            </p>
            <div class="text-[11px] text-slate-400 font-medium">Outcome: 88% WAL, 84% gap closure</div>
          </div>
          <div class="p-5 rounded-xl bg-slate-800 border-2 border-indigo-500">
            <span class="text-xs font-bold text-emerald-400">PHASE 2: YEAR 1 SCALE</span>
            <div class="text-2xl font-bold text-white mt-1 mb-2">10,000 Paying Users</div>
            <p class="text-xs text-slate-300 leading-relaxed mb-3">
              Generating ₹9.9 Lakhs/month recurring revenue. 120 village CSC kiosks active. 4 regional languages (Hindi, Telugu, Marathi, Tamil).
            </p>
            <div class="text-[11px] text-emerald-400 font-bold">Outcome: Self-sustaining operational profit</div>
          </div>
          <div class="p-5 rounded-xl bg-slate-800 border border-cyan-500/40">
            <span class="text-xs font-bold text-cyan-400">PHASE 3: YEAR 3 PAN-INDIA</span>
            <div class="text-2xl font-bold text-white mt-1 mb-2">$10M ARR Scale</div>
            <p class="text-xs text-slate-300 leading-relaxed mb-3">
              State school board MoUs, 2.5 Million active students across 12 states. Integration with IBM SkillsBuild rural CSR centers.
            </p>
            <div class="text-[11px] text-cyan-400 font-bold">Outcome: Pan-India national tutoring standard</div>
          </div>
        </div>
      `
    },
    {
      number: 12,
      title: "Defensive Moats & Mission",
      subtitle: "4 unfair advantages + deep UN SDG 4.1 & 4.4 alignment.",
      layout: "defensive-moats",
      contentHTML: `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <div class="p-5 rounded-xl bg-slate-800/90 border border-slate-700">
            <h4 class="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span class="text-indigo-400">🛡️</span> 4 Unfair Advantages
            </h4>
            <div class="space-y-2.5 text-xs text-slate-300">
              <div class="p-2 rounded bg-slate-900/60 border border-slate-800">
                <strong>1. Proprietary Dialect Corpus:</strong> Curated library of 10,000+ localized rural analogies and speech idioms impossible to scrape from the open web.
              </div>
              <div class="p-2 rounded bg-slate-900/60 border border-slate-800">
                <strong>2. Cost Asymmetry:</strong> 10x lower inference cost via quantized IBM Granite 8B vs generic US-based LLM APIs.
              </div>
              <div class="p-2 rounded bg-slate-900/60 border border-slate-800">
                <strong>3. Teacher Lock-In:</strong> Headmasters rely on our automatic homework diagnostic reports every morning.
              </div>
              <div class="p-2 rounded bg-slate-900/60 border border-slate-800">
                <strong>4. Data Flywheel:</strong> State-board concept failure patterns refine diagnostic accuracy with every query.
              </div>
            </div>
          </div>
          <div class="p-5 rounded-xl bg-slate-800/90 border border-emerald-500/40 flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-2 mb-3">
                <span class="px-2.5 py-1 rounded badge-sdg text-xs font-bold">UN SDG 4</span>
                <span class="text-sm font-bold text-white">Global Impact Alignment</span>
              </div>
              <p class="text-xs text-slate-300 leading-relaxed mb-4">
                Target 4.1: Ensuring all girls and boys complete free, equitable, and quality secondary education leading to relevant learning outcomes.
              </p>
              <p class="text-xs text-slate-300 leading-relaxed mb-4">
                Target 4.4: Substantially increasing the number of youth who have relevant technical and STEM skills for decent jobs and entrepreneurship.
              </p>
            </div>
            <div class="p-3 rounded-lg bg-emerald-950/60 border border-emerald-700 text-xs text-emerald-300 font-semibold">
              "No child in rural India should fail their board exams simply because nobody was there to explain science in their mother tongue."
            </div>
          </div>
        </div>
      `
    }
  ];

  function renderPitchSlide(index) {
    const slide = deckSlidesData[index - 1];
    if (!slide) return;

    document.getElementById("slideTitleText").textContent = slide.title;
    document.getElementById("slideSubtitleText").textContent = slide.subtitle;
    document.getElementById("currentSlideNum").textContent = slide.number;
    document.getElementById("slideMainContent").innerHTML = slide.contentHTML;
  }

  const prevSlideBtn = document.getElementById("prevSlideBtn");
  const nextSlideBtn = document.getElementById("nextSlideBtn");

  if (prevSlideBtn && nextSlideBtn) {
    prevSlideBtn.addEventListener("click", () => {
      if (currentSlideIndex > 1) {
        currentSlideIndex--;
        renderPitchSlide(currentSlideIndex);
      }
    });

    nextSlideBtn.addEventListener("click", () => {
      if (currentSlideIndex < totalSlides) {
        currentSlideIndex++;
        renderPitchSlide(currentSlideIndex);
      }
    });
  }

  // 9. Sachet Scratch Card Voucher Simulator
  const scratchOverlay = document.getElementById("scratchOverlay");
  const voucherCodeDisplay = document.getElementById("voucherCodeDisplay");
  const applyVoucherBtn = document.getElementById("applyVoucherBtn");
  const voucherStatusAlert = document.getElementById("voucherStatusAlert");

  if (scratchOverlay) {
    scratchOverlay.addEventListener("click", () => {
      scratchOverlay.classList.add("scratched");
      if (voucherCodeDisplay) {
        voucherCodeDisplay.textContent = "CODE: REGION-99-RURAL";
      }
    });
  }

  if (applyVoucherBtn && voucherStatusAlert) {
    applyVoucherBtn.addEventListener("click", () => {
      voucherStatusAlert.classList.remove("hidden");
      voucherStatusAlert.innerHTML = `
        <div class="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
          <span>✅</span>
          <span>Voucher 'REGION-99-RURAL' Activated! Unlimited 30-Day Vernacular Voice Tutoring & Board Solver unlocked.</span>
        </div>
      `;
    });
  }

  // 10. Role Switcher Header Logic
  const roleButtons = document.querySelectorAll(".role-switch-btn");
  const rolePerspectiveBanner = document.getElementById("rolePerspectiveBanner");

  roleButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      activeRole = btn.getAttribute("data-role");
      roleButtons.forEach(b => {
        b.classList.remove("bg-indigo-600", "text-white");
        b.classList.add("bg-white", "text-slate-600");
      });
      btn.classList.add("bg-indigo-600", "text-white");
      btn.classList.remove("bg-white", "text-slate-600");

      updatePerspectiveBanner();
    });
  });

  function updatePerspectiveBanner() {
    if (!rolePerspectiveBanner) return;
    const perspectives = {
      student: "Viewing as <strong>Aakash (Grade 10 Student)</strong>: 'I can ask anything in my mother tongue without fear of being scolded.'",
      parent: "Viewing as <strong>Ramesh (Farmer / Parent)</strong>: 'Affordable private tutor on our family phone for ₹99/mo instead of ₹450 crowded tuition.'",
      headmaster: "Viewing as <strong>Headmaster Anil Verma</strong>: 'Solves our 1:45 teacher deficit by closing foundational homework gaps before class starts.'",
      evaluator: "Viewing as <strong>IBM SkillsBuild Evaluator</strong>: 'Validating Frugal AI unit economics (< ₹11.50/mo), IBM Granite 8B Indic inference, and SDG 4 alignment.'"
    };
    rolePerspectiveBanner.innerHTML = perspectives[activeRole] || perspectives.student;
  }

  // 11. 1-Click PowerPoint PPTX Generator via PptxGenJS
  const downloadPptxBtn = document.getElementById("downloadPptxBtn");
  if (downloadPptxBtn) {
    downloadPptxBtn.addEventListener("click", () => {
      if (typeof PptxGenJS === "undefined") {
        alert("PptxGenJS library is loading. Please check your internet connection.");
        return;
      }

      downloadPptxBtn.disabled = true;
      downloadPptxBtn.innerHTML = "<span>⏳</span> Generating .PPTX...";

      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_16x9';

      const C_NAVY = '0F172A';
      const C_CARD = '1E293B';
      const C_INDIGO = '4F46E5';
      const C_AMBER = 'F59E0B';
      const C_EMERALD = '10B981';
      const C_CYAN = '06B6D4';
      const C_WHITE = 'FFFFFF';
      const C_SLATE = 'CBD5E1';
      const C_RED = 'C5192D';

      function addBaseSlide(title, subtitle, slideNum) {
        const slide = pptx.addSlide();
        slide.background = { color: C_NAVY };

        slide.addText(title, {
          x: 0.8, y: 0.4, w: 10.5, h: 0.6,
          fontSize: 22, bold: true, color: C_WHITE
        });
        slide.addText(subtitle, {
          x: 0.8, y: 0.95, w: 10.5, h: 0.4,
          fontSize: 12, color: C_SLATE
        });
        slide.addText(`${slideNum} / 12`, {
          x: 11.5, y: 0.4, w: 1.2, h: 0.4,
          fontSize: 11, bold: true, color: C_AMBER, align: 'right'
        });
        return slide;
      }

      // Slide 1: Title Card
      const s1 = pptx.addSlide();
      s1.background = { color: C_NAVY };
      s1.addText("★ UN SDG 4: QUALITY EDUCATION  |  IBM SKILLSBUILD MASTERCLASS 5  |  IBM GRANITE 8B INDIC", {
        x: 1.0, y: 1.2, w: 11.3, h: 0.5, fontSize: 12, bold: true, color: C_AMBER
      });
      s1.addText("RegionLearn Bridge", {
        x: 1.0, y: 1.8, w: 11.3, h: 1.2, fontSize: 46, bold: true, color: C_WHITE
      });
      s1.addText("Bridging the Rural Secondary Learning Crisis with Frugal Vernacular Voice AI", {
        x: 1.0, y: 3.0, w: 11.3, h: 0.6, fontSize: 18, color: C_CYAN
      });
      const s1_cards = [
        { title: "1:45+ PTR", desc: "Acute rural teacher deficit with zero 1-on-1 personalized remedial time.", color: C_AMBER },
        { title: "₹49 - ₹99/mo", desc: "Frugal sachet pricing democratizing private tutoring for rural parents.", color: C_EMERALD },
        { title: "< 10 MB / Day", desc: "Ultra-light edge caching designed specifically for rural 2G/3G family phones.", color: C_CYAN }
      ];
      s1_cards.forEach((c, idx) => {
        const xPos = 1.0 + idx * 3.9;
        s1.addShape(pptx.ShapeType.roundRect, {
          x: xPos, y: 4.5, w: 3.6, h: 2.1, fill: { color: C_CARD }, line: { color: c.color, width: 2 }
        });
        s1.addText(c.title, { x: xPos + 0.2, y: 4.7, w: 3.2, h: 0.6, fontSize: 22, bold: true, color: c.color });
        s1.addText(c.desc, { x: xPos + 0.2, y: 5.3, w: 3.2, h: 1.1, fontSize: 11, color: C_SLATE });
      });

      // Slide 2: Crisis
      const s2 = addBaseSlide("The Rural Secondary Learning Crisis", "3 Staggering Structural Barriers Facing Rural Students Before Board Exams", 2);
      const s2_cards = [
        { title: "1. Teacher Deficit", sub: "1:45+ PTR Ratio", body: "Overburdened rural classrooms where single teachers teach 50-70 students across multiple grades. Zero personalized 1-on-1 remedial help for struggling learners.", color: C_RED },
        { title: "2. Language Barrier", sub: "85% STEM in English", body: "High-quality STEM learning is overwhelmingly in English; rural students comprehend and reason best in their spoken vernacular mother tongue dialects.", color: C_AMBER },
        { title: "3. Hidden Gaps", sub: "55% Failure Rate", body: "Lack of continuous diagnostic feedback traps students in rote memorization. 55% of state board failures stem from undetected Grade 6-8 prerequisite gaps.", color: C_CYAN }
      ];
      s2_cards.forEach((c, idx) => {
        const xPos = 0.8 + idx * 3.95;
        s2.addShape(pptx.ShapeType.roundRect, { x: xPos, y: 1.8, w: 3.7, h: 4.9, fill: { color: C_CARD }, line: { color: c.color, width: 2 } });
        s2.addText(c.title, { x: xPos + 0.25, y: 2.0, w: 3.2, h: 0.5, fontSize: 18, bold: true, color: c.color });
        s2.addText(c.sub, { x: xPos + 0.25, y: 2.5, w: 3.2, h: 0.4, fontSize: 13, bold: true, color: C_WHITE });
        s2.addText(c.body, { x: xPos + 0.25, y: 3.1, w: 3.2, h: 3.2, fontSize: 11, color: C_SLATE });
      });

      // Slide 3: 3 Pillars
      const s3 = addBaseSlide("RegionLearn Bridge: 3 Core Pillars", "An End-to-End Pedagogical Scaffolding Engine Purpose-Built for Rural India", 3);
      const s3_cards = [
        { title: "24/7 AI Voice Tutor", sub: "Conversational 1-on-1", body: "Conversational tutoring agent speaking regional dialects and explaining concepts step-by-step with infinite patience. Never judges, repeats endlessly, accepts 2G voice notes.", color: C_INDIGO },
        { title: "Dialect Transcreator", sub: "Relatable Village Analogies", body: "Dynamically deconstructs complex STEM definitions into intuitive mother-tongue explanations using everyday village analogies (Chulha stoves, farm irrigation, bullock carts).", color: C_AMBER },
        { title: "Diagnostic Quiz Engine", sub: "Prerequisite Gap Flywheel", body: "Generates dynamic micro-assessments, pinpoints underlying prerequisite gaps from earlier grades, and automatically serves 60-second remedial voice lessons.", color: C_EMERALD }
      ];
      s3_cards.forEach((c, idx) => {
        const xPos = 0.8 + idx * 3.95;
        s3.addShape(pptx.ShapeType.roundRect, { x: xPos, y: 1.8, w: 3.7, h: 4.9, fill: { color: C_CARD }, line: { color: c.color, width: 2 } });
        s3.addText(c.title, { x: xPos + 0.25, y: 2.0, w: 3.2, h: 0.5, fontSize: 18, bold: true, color: c.color });
        s3.addText(c.sub, { x: xPos + 0.25, y: 2.5, w: 3.2, h: 0.4, fontSize: 13, bold: true, color: C_WHITE });
        s3.addText(c.body, { x: xPos + 0.25, y: 3.1, w: 3.2, h: 3.2, fontSize: 11, color: C_SLATE });
      });

      // Slide 4: Architecture
      const s4 = addBaseSlide("How the Application Works", "Full-width System Architecture Diagram: 5-Step Speech-to-Speech AI Pipeline", 4);
      const s4_steps = [
        { st: "Step 1", title: "Spoken Dialect Audio", desc: "2G Voice Note / Web Mic (<50KB Opus)", color: C_CYAN },
        { st: "Step 2", title: "Bhashini ASR Pipeline", desc: "Phonetic normalization & Indic STT", color: C_CYAN },
        { st: "Step 3", title: "IBM Granite 8B Indic", desc: "Quantized Socratic reasoning core", color: C_AMBER },
        { st: "Step 4", title: "Analogy Knowledge Graph", desc: "Village cultural metaphor mapping", color: C_EMERALD },
        { st: "Step 5", title: "Vernacular TTS Audio", desc: "Measured mother-tongue speech in 1.8s", color: C_INDIGO }
      ];
      s4_steps.forEach((s, idx) => {
        const xPos = 0.8 + idx * 2.38;
        s4.addShape(pptx.ShapeType.roundRect, { x: xPos, y: 2.1, w: 2.2, h: 3.5, fill: { color: C_CARD }, line: { color: s.color, width: 2 } });
        s4.addText(s.st, { x: xPos + 0.15, y: 2.3, w: 1.9, h: 0.4, fontSize: 12, bold: true, color: s.color });
        s4.addText(s.title, { x: xPos + 0.15, y: 2.7, w: 1.9, h: 0.7, fontSize: 13, bold: true, color: C_WHITE });
        s4.addText(s.desc, { x: xPos + 0.15, y: 3.5, w: 1.9, h: 1.8, fontSize: 10, color: C_SLATE });
      });
      s4.addShape(pptx.ShapeType.rect, { x: 0.8, y: 6.0, w: 11.7, h: 0.7, fill: { color: C_CARD }, line: { color: C_EMERALD, width: 1.5 } });
      s4.addText("⚡ Ultra-Low Latency Pipeline: Median response under 1.8 seconds on 2G/3G connections | Frugal compute: < ₹0.02 / query", {
        x: 1.0, y: 6.15, w: 11.3, h: 0.4, fontSize: 11, bold: true, color: C_EMERALD
      });

      // Slide 5: Inside the App
      const s5 = addBaseSlide("Inside the Application", "3-Module Product Experience Across Devices & Intermittent Connectivity", 5);
      const s5_modules = [
        { title: "Module 1: Voice Tutor Chat", sub: "Zero-Typing Speech UI", body: "Students tap one microphone button to ask questions in Hindi, Telugu, Marathi, or Hinglish. AI responds with audio waveforms and Socratic checkpoints.", color: C_INDIGO },
        { title: "Module 2: Knowledge Graph", sub: "Prerequisite Map", body: "Visual node tree pinpointing hidden Grade 6-8 foundation leaks (e.g. fractions or negative signs) before board exams.", color: C_AMBER },
        { title: "Module 3: WhatsApp 2G Bot", sub: "Zero-App Download", body: "Delivers 1-on-1 tutoring via 15-second WhatsApp voice notes (<50KB), pre-cached locally at village CSC kiosks for offline study.", color: C_EMERALD }
      ];
      s5_modules.forEach((c, idx) => {
        const xPos = 0.8 + idx * 3.95;
        s5.addShape(pptx.ShapeType.roundRect, { x: xPos, y: 1.8, w: 3.7, h: 4.9, fill: { color: C_CARD }, line: { color: c.color, width: 2 } });
        s5.addText(c.title, { x: xPos + 0.25, y: 2.0, w: 3.2, h: 0.5, fontSize: 18, bold: true, color: c.color });
        s5.addText(c.sub, { x: xPos + 0.25, y: 2.5, w: 3.2, h: 0.4, fontSize: 13, bold: true, color: C_WHITE });
        s5.addText(c.body, { x: xPos + 0.25, y: 3.1, w: 3.2, h: 3.2, fontSize: 11, color: C_SLATE });
      });

      // Slide 6: UVP Quotes
      const s6 = addBaseSlide("Unique Value Proposition", "\"Duolingo + Khan Academy Powered by an AI Tutor in Your Mother Tongue\"", 6);
      const s6_quotes = [
        { role: "Student Voice (#User)", quote: "\"Now, I can just talk to my phone in my own mother tongue. My AI tutor never judges me, explains every step using examples from my daily life, and patiently practices with me until I actually understand. For the first time, Math and Science don't scare me.\"", author: "- Chhotu, Grade 10 State-Board Student", color: C_INDIGO },
        { role: "Parent Voice (#Customer)", quote: "\"For less than ₹50 to ₹99 a month, my child has a dedicated private teacher right on our family phone who speaks our language. I see them studying excitedly every evening instead of crying over textbooks, and their school marks have visibly improved.\"", author: "- Ramesh, Farmer & Grade 10 Parent", color: C_AMBER }
      ];
      s6_quotes.forEach((q, idx) => {
        const xPos = 0.8 + idx * 5.95;
        s6.addShape(pptx.ShapeType.roundRect, { x: xPos, y: 1.8, w: 5.7, h: 4.9, fill: { color: C_CARD }, line: { color: q.color, width: 2 } });
        s6.addText(q.role, { x: xPos + 0.3, y: 2.1, w: 5.1, h: 0.5, fontSize: 18, bold: true, color: q.color });
        s6.addText(q.quote, { x: xPos + 0.3, y: 2.7, w: 5.1, h: 2.8, fontSize: 13, italic: true, color: C_WHITE });
        s6.addText(q.author, { x: xPos + 0.3, y: 5.8, w: 5.1, h: 0.5, fontSize: 12, bold: true, color: C_SLATE });
      });

      // Slide 7: Frugal AI
      const s7 = addBaseSlide("\"Frugal AI\" Architecture", "3 Technical Pillars Delivering 1-on-1 Tutoring at < ₹11.50/student/month", 7);
      const s7_pillars = [
        { title: "IBM Granite 8B Indic", sub: "Distilled & 4-Bit Quantized", body: "Optimized specifically for low-compute pedagogical dialogue. Delivers high accuracy in vernacular STEM explanations without expensive GPU server overhead (< ₹9.50/mo tokens).", color: C_CYAN },
        { title: "Bhashini Speech Pipeline", sub: "Acoustic Dialect Codecs", body: "Calibrated for rural dialects and high ambient background noise. Uses compressed Opus audio packets to minimize bandwidth consumption (< 50KB/query).", color: C_INDIGO },
        { title: "Low-Data Edge Caching", sub: "< 10 MB / Day Footprint", body: "Pre-caches 90% of state-board syllabus concepts locally on device or at village CSC kiosks, guaranteeing negligible daily data expenditure for families.", color: C_EMERALD }
      ];
      s7_pillars.forEach((c, idx) => {
        const xPos = 0.8 + idx * 3.95;
        s7.addShape(pptx.ShapeType.roundRect, { x: xPos, y: 1.8, w: 3.7, h: 4.9, fill: { color: C_CARD }, line: { color: c.color, width: 2 } });
        s7.addText(c.title, { x: xPos + 0.25, y: 2.0, w: 3.2, h: 0.5, fontSize: 18, bold: true, color: c.color });
        s7.addText(c.sub, { x: xPos + 0.25, y: 2.5, w: 3.2, h: 0.4, fontSize: 13, bold: true, color: C_WHITE });
        s7.addText(c.body, { x: xPos + 0.25, y: 3.1, w: 3.2, h: 3.2, fontSize: 11, color: C_SLATE });
      });

      // Slide 8: Gains
      const s8 = addBaseSlide("Verified Impact & Learning Gains", "High-Resolution Data Chart: Baseline vs Post-Pilot Score Improvements", 8);
      s8.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 1.8, w: 6.8, h: 4.9, fill: { color: C_CARD }, line: { color: C_INDIGO, width: 1.5 } });
      s8.addText("Subject Performance Improvements", { x: 1.1, y: 2.0, w: 6.2, h: 0.5, fontSize: 18, bold: true, color: C_WHITE });
      s8.addText("Class 10 Science (Physics & Chem):\nBaseline 41%  ➔  Post-Pilot 78%  (+37% Gain)\n\nClass 10 Mathematics (Algebra):\nBaseline 36%  ➔  Post-Pilot 72%  (+36% Gain)\n\nPrerequisite Gap Closure Rate:\n84% of foundational leaks closed within 14 days", {
        x: 1.1, y: 2.7, w: 6.2, h: 3.7, fontSize: 13, color: C_CYAN
      });
      const s8_metrics = [
        { val: "88%", lbl: "Weekly Active Learners (WAL)", color: C_EMERALD },
        { val: "74%", lbl: "Day 90 (D90) Cohort Retention", color: C_CYAN },
        { val: "92%", lbl: "Vernacular Query Accuracy", color: C_AMBER }
      ];
      s8_metrics.forEach((m, idx) => {
        const yPos = 1.8 + idx * 1.68;
        s8.addShape(pptx.ShapeType.roundRect, { x: 7.9, y: yPos, w: 4.6, h: 1.5, fill: { color: C_CARD }, line: { color: m.color, width: 1.5 } });
        s8.addText(m.val, { x: 8.1, y: yPos + 0.15, w: 4.2, h: 0.6, fontSize: 26, bold: true, color: m.color });
        s8.addText(m.lbl, { x: 8.1, y: yPos + 0.75, w: 4.2, h: 0.5, fontSize: 12, color: C_SLATE });
      });

      // Slide 9: Business Model
      const s9 = addBaseSlide("Business Model & Sachet Pricing", "Democratizing Tutoring with 75%+ Gross Margin Unit Economics", 9);
      const s9_pricing = [
        { title: "Consumer Pass", price: "₹49 / 14 days", desc: "Bi-weekly trial pass for unit tests. Unlimited vernacular voice doubts & WhatsApp 2G bot access.", color: C_CYAN },
        { title: "Monthly Academic Pass", price: "₹99 / month", desc: "POPULAR: Unlimited 24/7 vernacular voice tutoring, past 10-year board paper solver, and diagnostic reports.\n\nUnit Economics:\n• Revenue: ₹99.00\n• AI Compute: -₹9.50\n• Cloud Sync: -₹2.00\n• Gross Margin: ₹87.50 (88.3%)", color: C_AMBER },
        { title: "Annual Board Exam Pass", price: "₹399 / year", desc: "Equivalent to ₹33/month: Complete 10-month pass with 15 mock state-board examinations.", color: C_EMERALD }
      ];
      s9_pricing.forEach((c, idx) => {
        const xPos = 0.8 + idx * 3.95;
        s9.addShape(pptx.ShapeType.roundRect, { x: xPos, y: 1.8, w: 3.7, h: 4.9, fill: { color: C_CARD }, line: { color: c.color, width: 2 } });
        s9.addText(c.title, { x: xPos + 0.25, y: 2.0, w: 3.2, h: 0.5, fontSize: 16, bold: true, color: c.color });
        s9.addText(c.price, { x: xPos + 0.25, y: 2.5, w: 3.2, h: 0.5, fontSize: 22, bold: true, color: C_WHITE });
        s9.addText(c.desc, { x: xPos + 0.25, y: 3.1, w: 3.2, h: 3.3, fontSize: 11, color: C_SLATE });
      });

      // Slide 10: Distribution
      const s10 = addBaseSlide("Zero-CAC Grassroots Distribution", "3 Hyper-Local Rural Distribution Channels Reaching 10,000+ Learners", 10);
      const s10_channels = [
        { title: "School Headmasters", sub: "High-Trust Anchor", body: "Direct onboarding through rural school principals like Headmaster Anil Verma. One single school tie-up immediately onboards 300+ students with 100% community trust.", color: C_INDIGO },
        { title: "WhatsApp Peer Loops", sub: "Viral K-Factor (1.4)", body: "Students receive 3 free daily voice doubts. To unlock more doubts, they share the WhatsApp bot with 3 classmates, triggering an organic viral referral loop across village youth.", color: C_EMERALD },
        { title: "Village CSC Kiosks", sub: "Cash-to-Digital Bridge", body: "Village Common Service Centres (CSCs) and corner mobile recharge shops sell physical ₹99 scratch-card vouchers for cash, bypassing credit card/UPI hurdles.", color: C_AMBER }
      ];
      s10_channels.forEach((c, idx) => {
        const xPos = 0.8 + idx * 3.95;
        s10.addShape(pptx.ShapeType.roundRect, { x: xPos, y: 1.8, w: 3.7, h: 4.9, fill: { color: C_CARD }, line: { color: c.color, width: 2 } });
        s10.addText(c.title, { x: xPos + 0.25, y: 2.0, w: 3.2, h: 0.5, fontSize: 18, bold: true, color: c.color });
        s10.addText(c.sub, { x: xPos + 0.25, y: 2.5, w: 3.2, h: 0.4, fontSize: 13, bold: true, color: C_WHITE });
        s10.addText(c.body, { x: xPos + 0.25, y: 3.1, w: 3.2, h: 3.2, fontSize: 11, color: C_SLATE });
      });

      // Slide 11: Feasibility Ramp
      const s11 = addBaseSlide("Validated Feasibility Ramp", "3-Phase Milestone Roadmap: 90-Day Pilot ➔ Year 1 ➔ Year 3 Scale", 11);
      const s11_phases = [
        { title: "Phase 1: 90-Day Pilot", sub: "2,500 Learners", body: "5 rural clusters across UP & Bihar. Headmaster Anil Verma pilot deployment. Calibration of pre/post diagnostic learning gains. 88% WAL achieved.", color: C_CYAN },
        { title: "Phase 2: Year 1 Scale", sub: "10,000 Paying Users", body: "Generating ₹9.9 Lakhs/month recurring revenue. 120 village CSC kiosks active. 4 regional languages supported. Cash-flow positive operations.", color: C_EMERALD },
        { title: "Phase 3: Year 3 Pan-India", sub: "$10M ARR Scale", body: "Official State School Board MoUs. 2.5 Million active secondary students across 12 states. Integrated into IBM SkillsBuild rural CSR centers.", color: C_AMBER }
      ];
      s11_phases.forEach((c, idx) => {
        const xPos = 0.8 + idx * 3.95;
        s11.addShape(pptx.ShapeType.roundRect, { x: xPos, y: 1.8, w: 3.7, h: 4.9, fill: { color: C_CARD }, line: { color: c.color, width: 2 } });
        s11.addText(c.title, { x: xPos + 0.25, y: 2.0, w: 3.2, h: 0.5, fontSize: 18, bold: true, color: c.color });
        s11.addText(c.sub, { x: xPos + 0.25, y: 2.5, w: 3.2, h: 0.4, fontSize: 16, bold: true, color: C_WHITE });
        s11.addText(c.body, { x: xPos + 0.25, y: 3.1, w: 3.2, h: 3.2, fontSize: 11, color: C_SLATE });
      });

      // Slide 12: Moats & SDG 4
      const s12 = addBaseSlide("Defensive Moats & Mission", "4 Unfair Advantages and Deep UN SDG 4 Global Alignment", 12);
      s12.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 1.8, w: 5.7, h: 4.9, fill: { color: C_CARD }, line: { color: C_INDIGO, width: 1.5 } });
      s12.addText("4 Unfair Advantages (Defensive Moats)", { x: 1.0, y: 2.0, w: 5.3, h: 0.5, fontSize: 18, bold: true, color: C_AMBER });
      s12.addText("1. Proprietary Dialect Corpus:\n10,000+ curated rural analogies & idioms impossible to scrape from web.\n\n2. Cost Asymmetry:\n10x lower inference cost via quantized IBM Granite 8B vs generic US LLM APIs.\n\n3. Teacher Lock-In:\nHeadmasters rely on automated morning homework diagnostic gap summaries.\n\n4. Longitudinal Data Flywheel:\nState-board concept failure patterns continuously sharpen remediation.", {
        x: 1.0, y: 2.6, w: 5.3, h: 3.9, fontSize: 11, color: C_SLATE
      });

      s12.addShape(pptx.ShapeType.roundRect, { x: 6.8, y: 1.8, w: 5.7, h: 4.9, fill: { color: C_CARD }, line: { color: C_EMERALD, width: 1.5 } });
      s12.addText("UN SDG 4: Quality Education Alignment", { x: 7.0, y: 2.0, w: 5.3, h: 0.5, fontSize: 18, bold: true, color: C_EMERALD });
      s12.addText("• Target 4.1:\nEnsuring all girls and boys complete free, equitable, and quality secondary education leading to relevant learning outcomes.\n\n• Target 4.4:\nSubstantially increasing the number of youth who have relevant technical and STEM skills for decent jobs and entrepreneurship.\n\n• Core Social Mission:\nNo child in rural India should fail their board exams simply because nobody was there to explain science in their mother tongue.", {
        x: 7.0, y: 2.6, w: 5.3, h: 3.9, fontSize: 11, color: C_SLATE
      });

      // Trigger Download
      pptx.writeFile({ fileName: "RegionLearn-Bridge-Pitch-Deck.pptx" }).then(() => {
        downloadPptxBtn.disabled = false;
        downloadPptxBtn.innerHTML = "<span>✅</span> Downloaded!";
        setTimeout(() => {
          downloadPptxBtn.innerHTML = "<span>📥</span> Download .PPTX";
        }, 3000);
      }).catch(err => {
        downloadPptxBtn.disabled = false;
        downloadPptxBtn.innerHTML = "<span>📥</span> Download .PPTX";
        console.error("PPTX error:", err);
      });
    });
  }
});
