// Global Chart.js instances
let sipChart;
let lumpsumChart;
let emiChart;
let brokerageChart;

// Global state to track previous values for counting animations
const prevValues = {
    sip: { future: 0, invested: 0, returns: 0 },
    emi: { result: 0, principal: 0, interest: 0, total: 0 },
    lump: { future: 0, invested: 0, returns: 0 },
    brokerage: { net: 0, gross: 0, charge: 0, stt: 0, gst: 0, total: 0 }
};

let calculatorAssistantMessage = "";

function renderCalculatorAssistant() {
    return `
        <div id="calculator-assistant-launch" class="calculator-assistant-launch" hidden>
            <button type="button" class="open-assistant-btn" onclick="toggleCalculatorAssistant()">
                <span aria-hidden="true">🤖</span> Open FinBot Assistant
            </button>
        </div>
        <section id="calculator-assistant" class="calculator-assistant" hidden aria-label="FinBot calculator assistant">
            <div class="calculator-assistant-header">
                <div>
                    <span class="assistant-status">● Online</span>
                    <h2>FinBot Assistant</h2>
                    <p>Ask a follow-up question about this calculation.</p>
                </div>
                <button type="button" class="assistant-close-btn" onclick="closeCalculatorAssistant()" aria-label="Close FinBot Assistant">×</button>
            </div>
            <div id="calculator-chat-box" class="assistant-chat-box" aria-live="polite"></div>
            <div class="input-area assistant-input-area">
                <input type="text" id="calculator-user-input" placeholder="Ask FinBot about this result..." autocomplete="off">
                <button type="button" onclick="sendCalculatorMessage()">Send</button>
            </div>
        </section>
    `;
}

function prepareCalculatorAssistant(message) {
    calculatorAssistantMessage = message;
    const launch = document.getElementById("calculator-assistant-launch");
    const assistant = document.getElementById("calculator-assistant");
    const chatBox = document.getElementById("calculator-chat-box");
    if (launch) launch.hidden = false;
    if (assistant) assistant.hidden = true;
    if (chatBox) chatBox.innerHTML = "";
}

function toggleCalculatorAssistant() {
    const assistant = document.getElementById("calculator-assistant");
    const chatBox = document.getElementById("calculator-chat-box");
    if (!assistant || !chatBox || !calculatorAssistantMessage) return;

    if (!assistant.hidden) {
        closeCalculatorAssistant();
        return;
    }

    assistant.hidden = false;
    assistant.classList.add("assistant-active");
    assistant.classList.remove("assistant-closing");

    if (!chatBox.children.length) {
        appendChatMessage(chatBox, "bot", calculatorAssistantMessage);
    }

    assistant.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => document.getElementById("calculator-user-input")?.focus(), 350);
}

function closeCalculatorAssistant() {
    const assistant = document.getElementById("calculator-assistant");
    if (!assistant) return;

    assistant.classList.remove("assistant-active");
    assistant.classList.add("assistant-closing");

    window.setTimeout(() => {
        assistant.hidden = true;
        assistant.classList.remove("assistant-closing");
    }, 240);
}

/**
 * Parses user alphanumeric strings (e.g. "5k", "10L", "1Cr", "1.5Cr") to raw float numbers.
 */
function parseHumanInput(inputStr) {
    if (typeof inputStr !== 'string') inputStr = String(inputStr || '');
    let clean = inputStr.trim().replace(/,/g, '').toLowerCase();
    if (!clean) return 0;
    
    let match = clean.match(/^([0-9.]+)\s*(k|l|cr|m|b)?$/);
    if (!match) return parseFloat(clean) || 0;
    
    let val = parseFloat(match[1]);
    let unit = match[2];
    
    switch (unit) {
        case 'k': return val * 1000;
        case 'l': return val * 100000;
        case 'cr': return val * 10000000;
        case 'm': return val * 1000000;
        case 'b': return val * 1000000000;
        default: return val;
    }
}

/**
 * Formats values into Indian shorthand groupings (K, L, Cr, etc.)
 */
function formatIndianNumber(value) {
    const num = Math.abs(Number(value || 0));
    if (num === 0) return "0";
    
    if (num < 1000) return num.toFixed(2).replace(/\.00$/, "");
    if (num < 100000) return (num / 1000).toFixed(2).replace(/\.00$/, "") + " K";
    if (num < 10000000) return (num / 100000).toFixed(2).replace(/\.00$/, "") + " L";
    
    // Crore values
    const cr = num / 10000000;
    if (cr < 1000) return cr.toFixed(2).replace(/\.00$/, "") + " Cr";
    if (cr < 100000) return (cr / 1000).toFixed(2).replace(/\.00$/, "") + " Thousand Cr";
    if (cr < 10000000) return (cr / 100000).toFixed(2).replace(/\.00$/, "") + " Lakh Cr";
    return (cr / 10000000).toFixed(2).replace(/\.00$/, "") + " Quadrillion";
}

/**
 * Formats a number with Indian currency styling.
 * @param {number} value
 * @param {boolean} full - If true, displays the fully uncompressed format (e.g. ₹15,00,000.00). If false, shorthand (e.g. ₹15L).
 */
function formatCurrency(value, full = false) {
    const numeric = Number(value || 0);
    const isNegative = numeric < 0;
    const absValue = Math.abs(numeric);
    
    if (full) {
        return (isNegative ? "-" : "") + "₹" + absValue.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    } else {
        return (isNegative ? "-" : "") + "₹" + formatIndianNumber(absValue);
    }
}

/**
 * Count animation helper that updates innerText from a starting value to an ending value.
 */
function animateValue(elementId, start, end, duration = 800) {
    const obj = document.getElementById(elementId);
    if (!obj) return;
    
    const startVal = Number(start || 0);
    const endVal = Number(end || 0);
    if (startVal === endVal) {
        obj.innerText = formatCurrency(endVal, true);
        return;
    }
    
    const range = endVal - startVal;
    let startTimestamp = null;
    
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const currentVal = startVal + progress * range;
        
        obj.innerText = formatCurrency(currentVal, true);
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    
    window.requestAnimationFrame(step);
}

/* Typing indicator helpers: show and remove a small animated dot indicator */
function showTypingIndicator(container) {
    if (!container) return null;
    const wrapper = document.createElement('div');
    wrapper.className = 'typing-indicator chat-message';
    wrapper.setAttribute('aria-hidden', 'true');
    wrapper.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
    container.appendChild(wrapper);
    container.scrollTop = container.scrollHeight;
    return wrapper;
}

function removeTypingIndicator(el) {
    try { if (el && el.parentNode) el.parentNode.removeChild(el); } catch(e){}
}

/**
 * Sets up dynamic validation listeners on an input field.
 * Handles parsing, validation highlight state, label updates, and auto-capping alerts.
 */
function bindSmartInput(id, min, allowZero, max, isCurrency = true) {
    const input = document.getElementById(id);
    if (!input) return;
    
    const labelEl = document.getElementById(id + "-label");
    const alertEl = document.getElementById(id + "-alert");
    
    const handleInput = () => {
        const raw = input.value.trim();
        if (raw === "") {
            if (labelEl) labelEl.innerText = "";
            if (alertEl) alertEl.style.display = "none";
            input.style.borderColor = "transparent";
            input.style.boxShadow = "none";
            return;
        }
        
        let val = parseHumanInput(raw);
        let isCapped = val > max;
        let finalVal = isCapped ? max : val;
        
        const isInvalid = isNaN(finalVal) || finalVal < min || (!allowZero && finalVal === 0);
        
        if (labelEl) {
            if (!isInvalid && finalVal > 0) {
                labelEl.innerText = isCurrency ? formatCurrency(finalVal, true) : finalVal.toLocaleString("en-IN");
            } else {
                labelEl.innerText = "";
            }
        }
        
        if (alertEl) {
            if (isCapped) {
                alertEl.innerText = `Capped to max: ${isCurrency ? formatCurrency(max) : max.toLocaleString("en-IN")}`;
                alertEl.style.display = "block";
            } else {
                alertEl.innerText = "";
                alertEl.style.display = "none";
            }
        }
        
        if (isInvalid) {
            input.style.borderColor = "rgba(255, 93, 108, 0.6)";
            input.style.boxShadow = "0 0 0 4px rgba(255, 93, 108, 0.15)";
        } else {
            input.style.borderColor = "transparent";
            input.style.boxShadow = "none";
        }
    };
    
    const handleBlur = () => {
        let val = parseHumanInput(input.value);
        if (isNaN(val) || val <= 0) return;
        
        if (val > max) {
            val = max;
        }
        
        input.value = val;
        handleInput(); // sync visual states
    };
    
    input.addEventListener("input", handleInput);
    input.addEventListener("blur", handleBlur);
    input.addEventListener("change", handleBlur);
    
    // Initial sync
    handleInput();
}

/**
 * Form validator that runs on click of "Calculate". Auto-caps any overflow inputs,
 * validates formats, and returns values if correct.
 */
function validateFormAndGetValues(configs) {
    let allValid = true;
    const values = {};
    
    for (const config of configs) {
        const { id, min, allowZero, max } = config;
        const input = document.getElementById(id);
        if (!input) continue;
        
        let val = parseHumanInput(input.value);
        if (val > max) {
            val = max;
            input.value = max;
            // update alerts
            const alertEl = document.getElementById(id + "-alert");
            if (alertEl) {
                alertEl.innerText = `Capped to max: ${formatCurrency(max)}`;
                alertEl.style.display = "block";
            }
        }
        
        const isInvalid = input.value.trim() === "" || isNaN(val) || val < min || (!allowZero && val === 0);
        
        if (isInvalid) {
            input.style.borderColor = "rgba(255, 93, 108, 0.6)";
            input.style.boxShadow = "0 0 0 4px rgba(255, 93, 108, 0.15)";
            allValid = false;
        } else {
            input.style.borderColor = "transparent";
            input.style.boxShadow = "none";
            values[id] = val;
        }
    }
    
    return allValid ? values : null;
}

// Side-bar section helpers
function hideAllSections(){
    document.getElementById("dashboard-home").style.display = "none";
    document.getElementById("chat-box").style.display = "none";
    document.querySelector(".input-area").style.display = "none";
    document.getElementById("dynamic-panel").innerHTML = "";
    document.getElementById("main-content").innerHTML = "";
    const headerContainer = document.getElementById("topbar-header-container");
    if (headerContainer) {
        headerContainer.innerHTML = "";
    }
}

function renderCalculatorHeader(title, subtitle) {
    const headerContainer = document.getElementById("topbar-header-container");
    if (!headerContainer) return;
    
    headerContainer.innerHTML = `
        <div class="calc-header-reusable">
            <div class="calc-header-top-row">
                <button class="calc-icon-btn" onclick="openDashboard()" aria-label="Back to dashboard">\u2190</button>
                <img src="/static/images/bot.png" alt="Calculator Icon" class="calc-header-logo">
            </div>
            <div class="calc-header-title-group">
                <h1>${title}</h1>
                <p>${subtitle}</p>
            </div>
        </div>
    `;
}

function setActiveTab(tabId){
    const tabs = document.querySelectorAll(".menu-item");
    tabs.forEach(tab => tab.classList.remove("active"));
    document.getElementById(tabId).classList.add("active");
}

function openDashboard(){
    setActiveTab("dashboard-tab");
    hideAllSections();
    document.getElementById("dashboard-home").style.display = "block";
    document.getElementById("chat-box").style.display = "block";
    document.querySelector(".input-area").style.display = "flex";
    document.getElementById("dynamic-panel").innerHTML = "";
    document.getElementById("chat-box").innerHTML = `
        <div class="bot-message">
            👋 Hello! I'm FinBot AI.
            <br><br>
            You can:
            <br>
            • Calculate SIP
            <br>
            • Calculate EMI
            <br>
            • Check Brokerage
            <br>
            • Ask Finance Questions
        </div>
    `;
}

async function openHistory() {
    setActiveTab("history-tab");
    hideAllSections();
    const panel = document.getElementById("dynamic-panel");
    const response = await fetch("/history");
    const data = await response.json();

    let html = `
        <h1 style="color:white; margin-bottom:20px;">Chat History</h1>
    `;

    if (!data.history || data.history.length === 0) {
        html += `
            <div style="
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid var(--stroke);
                padding: 40px 20px;
                border-radius: 20px;
                text-align: center;
                color: var(--muted);
                max-width: 1000px;
            ">
                <div style="font-size: 48px; margin-bottom: 16px;">💬</div>
                <h3 style="margin: 0 0 8px; color: var(--text);">No Chat History Yet</h3>
                <p style="margin: 0; font-size: 14px;">Your past calculations will be displayed here.</p>
            </div>
        `;
    } else {
        data.history.forEach(chat => {
            html += `
                <div style="
                    background:#16213e;
                    padding:20px;
                    border-radius:15px;
                    margin-bottom:20px;
                    color:white;
                    max-width: 1000px;
                ">
                    <h3>You:</h3>
                    <p>${chat[0]}</p>
                    <br>
                    <h3>FinBot AI:</h3>
                    <p>${chat[1]}</p>
                </div>
            `;
        });
    }

    panel.innerHTML = html;
}

function openSettingsPanel(){
    setActiveTab("settings-tab");
    hideAllSections();
    const panel = document.getElementById("dynamic-panel");

    panel.innerHTML = `
        <div class="settings-panel">
            <h1>Settings</h1>
            <p>Customize your FinBot AI dashboard settings.</p>
            <div class="settings-box">
                <p>Theme Mode</p>
                <button class="calculate-btn" onclick="toggleThemeMode()">Dark Theme</button>
            </div>
        </div>
    `;
    updateThemeUI();
}

function toggleThemeMode() {
    const isLight = document.body.classList.toggle("light-theme");
    localStorage.setItem("theme-mode", isLight ? "light" : "dark");
    updateThemeUI();
}

function updateThemeUI() {
    const isLight = document.body.classList.contains("light-theme");
    const btn = document.querySelector(".settings-box button");
    if (btn) {
        btn.innerText = isLight ? "Light Theme" : "Dark Theme";
    }
}

// Global quick selector helper
function resetChipGroup(selector, activeValue){
    document.querySelectorAll(selector).forEach(chip => {
        chip.classList.toggle(
            "active",
            activeValue !== undefined && chip.dataset.value === String(activeValue)
        );
    });
}

// ----------------------------------------------------
// 1. SIP Calculator
// ----------------------------------------------------
function setSipQuickAmount(amount){
    const input = document.getElementById("sip-amount");
    if(input){
        input.value = amount;
        input.dispatchEvent(new Event("input"));
        input.dispatchEvent(new Event("change"));
    }
    resetChipGroup("[data-sip-chip]", amount);
}

function setSipQuickYears(years){
    const input = document.getElementById("sip-years");
    if(input){
        input.value = years;
        input.dispatchEvent(new Event("input"));
        input.dispatchEvent(new Event("change"));
    }
    resetChipGroup("[data-sip-years-chip]", years);
}

function setSipQuickReturn(rate){
    const input = document.getElementById("sip-return");
    if(input){
        input.value = rate;
        input.dispatchEvent(new Event("input"));
        input.dispatchEvent(new Event("change"));
    }
    resetChipGroup("[data-sip-return-chip]", rate);
}

function resetSIPState(){
    const amountInput = document.getElementById("sip-amount");
    const yearsInput = document.getElementById("sip-years");
    const returnInput = document.getElementById("sip-return");

    if(amountInput) amountInput.value = "";
    if(yearsInput) yearsInput.value = "";
    if(returnInput) returnInput.value = "";

    resetChipGroup("[data-sip-chip]");
    resetChipGroup("[data-sip-years-chip]");
    resetChipGroup("[data-sip-return-chip]");

    const futureValue = document.getElementById("future-value");
    const invested = document.getElementById("total-invested");
    const returns = document.getElementById("estimated-returns");

    if(futureValue) {
        futureValue.innerText = "₹0";
        futureValue.removeAttribute("title");
    }
    if(invested) {
        invested.innerText = "₹0";
        invested.removeAttribute("title");
    }
    if(returns) {
        returns.innerText = "₹0";
        returns.removeAttribute("title");
    }

    const desc = document.querySelector(".sip-result-card .description");
    if(desc) desc.innerText = "After 0 years at 0% p.a.";

    prevValues.sip = { future: 0, invested: 0, returns: 0 };

    if(sipChart){
        sipChart.destroy();
        sipChart = null;
    }
}

function openSIPPanel(){
    setActiveTab("sip-tab");
    document.getElementById("dashboard-home").style.display = "none";
    document.getElementById("main-content").innerHTML = "";
    document.getElementById("chat-box").style.display = "none";
    document.querySelector(".input-area").style.display = "none";

    const panel = document.getElementById("dynamic-panel");
    renderCalculatorHeader("SIP Calculator", "Plan your future wealth with monthly investing.");

    panel.innerHTML = `
        <div class="sip-panel sip-page">
            <div class="sip-grid">
                <div class="sip-input-card calc-form">
                    <div class="calc-field">
                        <div class="calc-field-header">
                            <label for="sip-amount" class="calc-label">
                                <span class="icon">\u20B9</span>
                                Monthly SIP
                            </label>
                            <div class="calc-max">Max \u20B91 Cr / month</div>
                        </div>
                        <div class="calc-input">
                            <input
                                type="text"
                                inputmode="decimal"
                                id="sip-amount"
                                placeholder="Enter monthly investment"
                                autocomplete="off"
                                spellcheck="false"
                            >
                            <span class="calc-suffix">\u20B9</span>
                        </div>
                        <div class="input-info-row">
                            <div id="sip-amount-label" class="input-subtitle"></div>
                            <div id="sip-amount-alert" class="input-alert"></div>
                        </div>
                        <div class="chip-row">
                            <button class="chip" type="button" data-sip-chip data-value="5000" onclick="setSipQuickAmount(5000)">5K</button>
                            <button class="chip" type="button" data-sip-chip data-value="10000" onclick="setSipQuickAmount(10000)">10K</button>
                            <button class="chip" type="button" data-sip-chip data-value="25000" onclick="setSipQuickAmount(25000)">25K</button>
                            <button class="chip" type="button" data-sip-chip data-value="50000" onclick="setSipQuickAmount(50000)">50K</button>
                            <button class="chip" type="button" data-sip-chip data-value="100000" onclick="setSipQuickAmount(100000)">1L</button>
                            <button class="chip" type="button" data-sip-chip data-value="1000000" onclick="setSipQuickAmount(1000000)">10L</button>
                        </div>
                    </div>

                    <div class="calc-field">
                        <div class="calc-field-header">
                            <label for="sip-years" class="calc-label">
                                <span class="icon">\u231B</span>
                                Tenure
                            </label>
                            <div class="calc-max">Max 50 years</div>
                        </div>
                        <div class="calc-input">
                            <input
                                type="text"
                                inputmode="decimal"
                                id="sip-years"
                                placeholder="Enter investment years"
                                autocomplete="off"
                                spellcheck="false"
                            >
                            <span class="calc-suffix">yrs</span>
                        </div>
                        <div class="input-info-row">
                            <div id="sip-years-label" class="input-subtitle"></div>
                            <div id="sip-years-alert" class="input-alert"></div>
                        </div>
                        <div class="chip-row">
                            <button class="chip" type="button" data-sip-years-chip data-value="3" onclick="setSipQuickYears(3)">3Y</button>
                            <button class="chip" type="button" data-sip-years-chip data-value="5" onclick="setSipQuickYears(5)">5Y</button>
                            <button class="chip" type="button" data-sip-years-chip data-value="10" onclick="setSipQuickYears(10)">10Y</button>
                            <button class="chip" type="button" data-sip-years-chip data-value="20" onclick="setSipQuickYears(20)">20Y</button>
                            <button class="chip" type="button" data-sip-years-chip data-value="30" onclick="setSipQuickYears(30)">30Y</button>
                        </div>
                    </div>

                    <div class="calc-field">
                        <div class="calc-field-header">
                            <label for="sip-return" class="calc-label">
                                <span class="icon">\u2197</span>
                                Expected Return
                            </label>
                            <div class="calc-max">Max 30%</div>
                        </div>
                        <div class="calc-input">
                            <input
                                type="text"
                                inputmode="decimal"
                                id="sip-return"
                                placeholder="Enter annual return"
                                autocomplete="off"
                                spellcheck="false"
                            >
                            <span class="calc-suffix">%</span>
                        </div>
                        <div class="input-info-row">
                            <div id="sip-return-label" class="input-subtitle"></div>
                            <div id="sip-return-alert" class="input-alert"></div>
                        </div>
                        <div class="chip-row">
                            <button class="chip" type="button" data-sip-return-chip data-value="8" onclick="setSipQuickReturn(8)">8%</button>
                            <button class="chip" type="button" data-sip-return-chip data-value="10" onclick="setSipQuickReturn(10)">10%</button>
                            <button class="chip" type="button" data-sip-return-chip data-value="12" onclick="setSipQuickReturn(12)">12%</button>
                            <button class="chip" type="button" data-sip-return-chip data-value="15" onclick="setSipQuickReturn(15)">15%</button>
                            <button class="chip" type="button" data-sip-return-chip data-value="18" onclick="setSipQuickReturn(18)">18%</button>
                        </div>
                    </div>

                    <button class="calculate-btn" onclick="calculateSIP()">Calculate SIP</button>
                </div>

                <div class="sip-result-card calc-summary">
                    <div class="eyebrow">Projected Corpus</div>
                    <div class="value" id="future-value">₹0</div>
                    <p class="description">After 0 years at 0% p.a.</p>

                    <div class="detail-list">
                        <div class="detail-row">
                            <span class="label">Total Invested</span>
                            <span class="amount positive" id="total-invested">₹0</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Estimated Gains</span>
                            <span class="amount positive" id="estimated-returns">₹0</span>
                        </div>
                    </div>

                    <div class="calc-chart">
                        <canvas id="sipChart"></canvas>
                    </div>
                </div>
            </div>
            ${renderCalculatorAssistant()}
        </div>
    `;

    bindSmartInput("sip-amount", 500, false, 10000000); // Max 1 Cr
    bindSmartInput("sip-years", 1, false, 50, false); // Max 50 yrs (non-currency)
    bindSmartInput("sip-return", 0, true, 30, false); // Max 30% (non-currency)

    resetSIPState();
}

async function calculateSIP(){
    const form = validateFormAndGetValues([
        { id: "sip-amount", min: 500, allowZero: false, max: 10000000 },
        { id: "sip-years", min: 1, allowZero: false, max: 50 },
        { id: "sip-return", min: 0, allowZero: true, max: 30 }
    ]);
    if (!form) return;

    const amount = form["sip-amount"];
    const years = form["sip-years"];
    const returnRate = form["sip-return"];

    const requestPayload = { amount, years, return_rate: returnRate };
    console.log("[SIP] Sending calculation request:", requestPayload);

    const response = await fetch("/calculate_sip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload)
    });

    const data = await response.json();
    console.log("[SIP] /calculate_sip response:", data);

    animateValue("future-value", prevValues.sip.future, data.future_value);
    animateValue("total-invested", prevValues.sip.invested, data.total_investment);
    animateValue("estimated-returns", prevValues.sip.returns, data.estimated_returns);

    const fVal = document.getElementById("future-value");
    if(fVal) fVal.setAttribute("title", formatCurrency(data.future_value, true));
    const tVal = document.getElementById("total-invested");
    if(tVal) tVal.setAttribute("title", formatCurrency(data.total_investment, true));
    const eVal = document.getElementById("estimated-returns");
    if(eVal) eVal.setAttribute("title", formatCurrency(data.estimated_returns, true));

    prevValues.sip = {
        future: data.future_value,
        invested: data.total_investment,
        returns: data.estimated_returns
    };

    const desc = document.querySelector(".sip-result-card .description");
    if(desc) desc.innerText = `After ${years} years at ${returnRate}% p.a.`;

    const ctx = document.getElementById("sipChart");
    if(sipChart) sipChart.destroy();

    const labels = [];
    const investedData = [];
    const yearlyData = [];

    for(let i = 1; i <= Number(years); i++){
        const yearlyInvestment = Number(amount) * 12 * i;
        const yearlyValue = yearlyInvestment * Math.pow((1 + Number(returnRate) / 100), i);

        labels.push(`Year ${i}`);
        investedData.push(yearlyInvestment.toFixed(0));
        yearlyData.push(yearlyValue.toFixed(0));
    }

    sipChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Invested Amount",
                    data: investedData,
                    borderColor: "#f0b61d",
                    backgroundColor: "rgba(240,182,29,0.12)",
                    tension: 0.38,
                    fill: true,
                    borderWidth: 3,
                    pointRadius: 3
                },
                {
                    label: "Future Value",
                    data: yearlyData,
                    borderColor: "#17d07a",
                    backgroundColor: "rgba(23,208,122,0.12)",
                    tension: 0.38,
                    fill: true,
                    borderWidth: 4,
                    pointRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: "white" } }
            },
            scales: {
                x: {
                    ticks: { color: "white" },
                    grid: { color: "rgba(255,255,255,0.08)" }
                },
                y: {
                    ticks: { color: "white" },
                    grid: { color: "rgba(255,255,255,0.08)" }
                }
            }
        }
    });

    const sipRisk = returnRate <= 8 ? "Low to Moderate" : returnRate <= 15 ? "Moderate" : "High";
    prepareCalculatorAssistant(`Based on your SIP analysis:

Recommendation:
${data.recommendation || "Long-Term Equity Growth"}

Risk:
${sipRisk}

Pro Tip:
Continue investing consistently for long-term wealth creation. Consider increasing your SIP as your income grows.`);


    fetch("/save-calculation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            user_message: `SIP Calculation: ${formatCurrency(amount, true)} monthly for ${years} years at ${returnRate}%`,
            bot_reply: `Projected Corpus: ${formatCurrency(data.future_value, true)}`
        })
    });
}

// ----------------------------------------------------
// 2. Lumpsum Calculator
// ----------------------------------------------------
function setLumpsumQuickAmount(amount){
    const input = document.getElementById("lump-amount");
    if(input){
        input.value = amount;
        input.dispatchEvent(new Event("input"));
        input.dispatchEvent(new Event("change"));
    }
    resetChipGroup("[data-lump-chip]", amount);
}

function resetLumpsumState(){
    const amountInput = document.getElementById("lump-amount");
    const yearsInput = document.getElementById("lump-years");
    const rateInput = document.getElementById("lump-rate");

    if(amountInput) amountInput.value = "";
    if(yearsInput) yearsInput.value = "";
    if(rateInput) rateInput.value = "";

    resetChipGroup("[data-lump-chip]");

    const futureValue = document.getElementById("lump-future");
    const invested = document.getElementById("lump-invested");
    const returns = document.getElementById("lump-returns");

    if(futureValue) {
        futureValue.innerText = "₹0";
        futureValue.removeAttribute("title");
    }
    if(invested) {
        invested.innerText = "₹0";
        invested.removeAttribute("title");
    }
    if(returns) {
        returns.innerText = "₹0";
        returns.removeAttribute("title");
    }

    prevValues.lump = { future: 0, invested: 0, returns: 0 };

    if(lumpsumChart){
        lumpsumChart.destroy();
        lumpsumChart = null;
    }
}

function openLumpsumPanel(){
    setActiveTab("lumpsum-tab");
    document.getElementById("dashboard-home").style.display = "none";
    document.getElementById("main-content").innerHTML = "";
    document.getElementById("chat-box").style.display = "none";
    document.querySelector(".input-area").style.display = "none";

    const panel = document.getElementById("dynamic-panel");
    renderCalculatorHeader("Lumpsum Calculator", "Calculate one-time investment growth.");

    panel.innerHTML = `
        <div class="sip-panel lumpsum-page">
            <div class="sip-grid">
                <div class="sip-input-card calc-form">
                    <div class="calc-field">
                        <div class="calc-field-header">
                            <label for="lump-amount" class="calc-label">
                                <span class="icon">\u20B9</span>
                                Investment Amount
                            </label>
                            <div class="calc-max">Max \u20B950 Cr</div>
                        </div>
                        <div class="calc-input">
                            <input
                                type="text"
                                inputmode="decimal"
                                id="lump-amount"
                                placeholder="Enter investment amount"
                                autocomplete="off"
                                spellcheck="false"
                            >
                            <span class="calc-suffix">\u20B9</span>
                        </div>
                        <div class="input-info-row">
                            <div id="lump-amount-label" class="input-subtitle"></div>
                            <div id="lump-amount-alert" class="input-alert"></div>
                        </div>
                        <div class="chip-row">
                            <button class="chip" type="button" data-lump-chip data-value="10000" onclick="setLumpsumQuickAmount(10000)">10K</button>
                            <button class="chip" type="button" data-lump-chip data-value="50000" onclick="setLumpsumQuickAmount(50000)">50K</button>
                            <button class="chip" type="button" data-lump-chip data-value="100000" onclick="setLumpsumQuickAmount(100000)">1L</button>
                            <button class="chip" type="button" data-lump-chip data-value="500000" onclick="setLumpsumQuickAmount(500000)">5L</button>
                            <button class="chip" type="button" data-lump-chip data-value="1000000" onclick="setLumpsumQuickAmount(1000000)">10L</button>
                            <button class="chip" type="button" data-lump-chip data-value="10000000" onclick="setLumpsumQuickAmount(10000000)">1Cr</button>
                        </div>
                    </div>

                    <div class="calc-field">
                        <div class="calc-field-header">
                            <label for="lump-years" class="calc-label">
                                <span class="icon">\u231B</span>
                                Tenure
                            </label>
                            <div class="calc-max">Max 50 years</div>
                        </div>
                        <div class="calc-input">
                            <input
                                type="text"
                                inputmode="decimal"
                                id="lump-years"
                                placeholder="Enter investment years"
                                autocomplete="off"
                                spellcheck="false"
                            >
                            <span class="calc-suffix">yrs</span>
                        </div>
                        <div class="input-info-row">
                            <div id="lump-years-label" class="input-subtitle"></div>
                            <div id="lump-years-alert" class="input-alert"></div>
                        </div>
                    </div>

                    <div class="calc-field">
                        <div class="calc-field-header">
                            <label for="lump-rate" class="calc-label">
                                <span class="icon">\u2197</span>
                                Expected CAGR
                            </label>
                            <div class="calc-max">Max 30%</div>
                        </div>
                        <div class="calc-input">
                            <input
                                type="text"
                                inputmode="decimal"
                                id="lump-rate"
                                placeholder="Enter annual return"
                                autocomplete="off"
                                spellcheck="false"
                            >
                            <span class="calc-suffix">%</span>
                        </div>
                        <div class="input-info-row">
                            <div id="lump-rate-label" class="input-subtitle"></div>
                            <div id="lump-rate-alert" class="input-alert"></div>
                        </div>
                    </div>

                    <button class="calculate-btn" onclick="calculateLumpsum()">Calculate Lumpsum</button>
                </div>

                <div class="sip-result-card calc-summary">
                    <div class="eyebrow">Maturity Value</div>
                    <div class="value" id="lump-future">₹0</div>
                    <p class="description">Estimated future investment value.</p>

                    <div class="detail-list">
                        <div class="detail-row">
                            <span class="label">Principal</span>
                            <span class="amount positive" id="lump-invested">₹0</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Wealth Gained</span>
                            <span class="amount positive" id="lump-returns">₹0</span>
                        </div>
                    </div>

                    <div class="calc-chart">
                        <canvas id="lumpsumChart"></canvas>
                    </div>
                </div>
            </div>
            ${renderCalculatorAssistant()}
        </div>
    `;

    bindSmartInput("lump-amount", 100, false, 500000000); // Max 50 Cr
    bindSmartInput("lump-years", 1, false, 50, false); // Max 50 yrs
    bindSmartInput("lump-rate", 0, true, 30, false); // Max 30%

    resetLumpsumState();
}

async function calculateLumpsum(){
    const form = validateFormAndGetValues([
        { id: "lump-amount", min: 100, allowZero: false, max: 500000000 },
        { id: "lump-years", min: 1, allowZero: false, max: 50 },
        { id: "lump-rate", min: 0, allowZero: true, max: 30 }
    ]);
    if (!form) return;

    const amount = form["lump-amount"];
    const rate = form["lump-rate"];
    const years = form["lump-years"];

let recommendation, risk, tip;

if(rate <= 10){
    recommendation = "Conservative";
    risk = "4/10";
    tip = "Capital preservation focused.";
}
else if(rate <= 15){
    recommendation = "Moderate Growth";
    risk = "7/10";
    tip = "Balanced growth strategy.";
}
else{
    recommendation = "Aggressive Growth";
    risk = "9/10";
    tip = "Suitable for long-term wealth creation.";
}

    const response = await fetch("/calculate_lumpsum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, rate, years })
    });

    const data = await response.json();
    recommendation = data.recommendation || recommendation;
    console.log("Lumpsum Response:", data);

    animateValue("lump-future", prevValues.lump.future, data.future_value);
    animateValue("lump-invested", prevValues.lump.invested, data.invested_amount);
    animateValue("lump-returns", prevValues.lump.returns, data.estimated_returns);

    const fVal = document.getElementById("lump-future");
    if(fVal) fVal.setAttribute("title", formatCurrency(data.future_value, true));
    const iVal = document.getElementById("lump-invested");
    if(iVal) iVal.setAttribute("title", formatCurrency(data.invested_amount, true));
    const rVal = document.getElementById("lump-returns");
    if(rVal) rVal.setAttribute("title", formatCurrency(data.estimated_returns, true));

    prevValues.lump = {
        future: data.future_value,
        invested: data.invested_amount,
        returns: data.estimated_returns
    };

    const ctx = document.getElementById("lumpsumChart");
    if(lumpsumChart) lumpsumChart.destroy();

    lumpsumChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Principal", "Wealth Gained", "Future Value"],
            datasets: [{
                label: "Lumpsum Growth",
                data: [
                    data.invested_amount,
                    data.estimated_returns,
                    data.future_value
                ],
                backgroundColor: ["#f0b61d", "#17d07a", "#6ea8ff"],
                borderRadius: 14
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: "white" } }
            },
            scales: {
                x: {
                    ticks: { color: "white" },
                    grid: { color: "rgba(255,255,255,0.08)" }
                },
                y: {
                    ticks: { color: "white" },
                    grid: { color: "rgba(255,255,255,0.08)" }
                }
            }
        }
    });

    prepareCalculatorAssistant(`Based on your lumpsum analysis:

Recommendation:
${recommendation}

Risk:
${risk}

Pro Tip:
${tip} Stay invested for the full tenure and review your asset allocation periodically.`);

    fetch("/save-calculation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            user_message: `Lumpsum Calculation: ${formatCurrency(amount, true)} invested for ${years} years at ${rate}%`,
            bot_reply: `Future Value: ${formatCurrency(data.future_value, true)}`
        })
    });
}

// ----------------------------------------------------
// 3. EMI Calculator
// ----------------------------------------------------
function setEmiQuickLoan(amount){
    const input = document.getElementById("emi-loan");
    if(input){
        input.value = amount;
        input.dispatchEvent(new Event("input"));
        input.dispatchEvent(new Event("change"));
    }
    resetChipGroup("[data-emi-chip]", amount);
}

function setEmiQuickRate(rate){
    const input = document.getElementById("emi-rate");
    if(input){
        input.value = rate;
        input.dispatchEvent(new Event("input"));
        input.dispatchEvent(new Event("change"));
    }
    resetChipGroup("[data-emi-rate-chip]", rate);
}

function setEmiQuickYears(years){
    const input = document.getElementById("emi-years");
    if(input){
        input.value = years;
        input.dispatchEvent(new Event("input"));
        input.dispatchEvent(new Event("change"));
    }
    resetChipGroup("[data-emi-years-chip]", years);
}

function resetEmiState(){
    const loan = document.getElementById("emi-loan");
    const rate = document.getElementById("emi-rate");
    const years = document.getElementById("emi-years");

    if(loan) loan.value = "";
    if(rate) rate.value = "";
    if(years) years.value = "";

    resetChipGroup("[data-emi-chip]");
    resetChipGroup("[data-emi-rate-chip]");
    resetChipGroup("[data-emi-years-chip]");

    const result = document.getElementById("emi-result");
    const principal = document.getElementById("emi-principal");
    const interest = document.getElementById("emi-interest");
    const total = document.getElementById("emi-total");

    if(result) { result.innerText = "₹0"; result.removeAttribute("title"); }
    if(principal) { principal.innerText = "₹0"; principal.removeAttribute("title"); }
    if(interest) { interest.innerText = "₹0"; interest.removeAttribute("title"); }
    if(total) { total.innerText = "₹0"; total.removeAttribute("title"); }

    const caption = document.getElementById("emi-caption");
    if(caption) caption.innerText = "Estimated monthly loan payment.";

    prevValues.emi = { result: 0, principal: 0, interest: 0, total: 0 };

    if(emiChart){
        emiChart.destroy();
        emiChart = null;
    }
}

function openEMIPanel(){
    setActiveTab("emi-tab");
    document.getElementById("dashboard-home").style.display = "none";
    document.getElementById("main-content").innerHTML = "";
    document.getElementById("chat-box").style.display = "none";
    document.querySelector(".input-area").style.display = "none";

    const panel = document.getElementById("dynamic-panel");
    renderCalculatorHeader("EMI Calculator", "Check monthly EMI and total interest before choosing a loan tenure.");

    panel.innerHTML = `
        <div class="sip-panel emi-page">
            <div class="calc-grid">
                <div class="sip-input-card calc-form">
                    <div class="calc-field">
                        <div class="calc-field-header">
                            <label for="emi-loan" class="calc-label">
                                <span class="icon">\u20B9</span>
                                Loan Amount
                            </label>
                            <div class="calc-max">Max \u20B950 Cr</div>
                        </div>
                        <div class="calc-input">
                            <input
                                type="text"
                                inputmode="decimal"
                                id="emi-loan"
                                placeholder="Enter loan amount"
                                autocomplete="off"
                                spellcheck="false"
                            >
                            <span class="calc-suffix">\u20B9</span>
                        </div>
                        <div class="input-info-row">
                            <div id="emi-loan-label" class="input-subtitle"></div>
                            <div id="emi-loan-alert" class="input-alert"></div>
                        </div>
                        <div class="chip-row">
                            <button class="chip" type="button" data-emi-chip data-value="100000" onclick="setEmiQuickLoan(100000)">1L</button>
                            <button class="chip" type="button" data-emi-chip data-value="500000" onclick="setEmiQuickLoan(500000)">5L</button>
                            <button class="chip" type="button" data-emi-chip data-value="1000000" onclick="setEmiQuickLoan(1000000)">10L</button>
                            <button class="chip" type="button" data-emi-chip data-value="5000000" onclick="setEmiQuickLoan(5000000)">50L</button>
                            <button class="chip" type="button" data-emi-chip data-value="10000000" onclick="setEmiQuickLoan(10000000)">1Cr</button>
                        </div>
                    </div>

                    <div class="calc-field">
                        <div class="calc-field-header">
                            <label for="emi-rate" class="calc-label">
                                <span class="icon">\u2197</span>
                                Interest Rate
                            </label>
                            <div class="calc-max">Max 25%</div>
                        </div>
                        <div class="calc-input">
                            <input
                                type="text"
                                inputmode="decimal"
                                id="emi-rate"
                                placeholder="Enter annual interest"
                                autocomplete="off"
                                spellcheck="false"
                            >
                            <span class="calc-suffix">%</span>
                        </div>
                        <div class="input-info-row">
                            <div id="emi-rate-label" class="input-subtitle"></div>
                            <div id="emi-rate-alert" class="input-alert"></div>
                        </div>
                        <div class="chip-row">
                            <button class="chip" type="button" data-emi-rate-chip data-value="8" onclick="setEmiQuickRate(8)">8%</button>
                            <button class="chip" type="button" data-emi-rate-chip data-value="10" onclick="setEmiQuickRate(10)">10%</button>
                            <button class="chip" type="button" data-emi-rate-chip data-value="12" onclick="setEmiQuickRate(12)">12%</button>
                            <button class="chip" type="button" data-emi-rate-chip data-value="15" onclick="setEmiQuickRate(15)">15%</button>
                        </div>
                    </div>

                    <div class="calc-field">
                        <div class="calc-field-header">
                            <label for="emi-years" class="calc-label">
                                <span class="icon">\u231B</span>
                                Tenure
                            </label>
                            <div class="calc-max">Max 50 years</div>
                        </div>
                        <div class="calc-input">
                            <input
                                type="text"
                                inputmode="decimal"
                                id="emi-years"
                                placeholder="Enter loan years"
                                autocomplete="off"
                                spellcheck="false"
                            >
                            <span class="calc-suffix">yrs</span>
                        </div>
                        <div class="input-info-row">
                            <div id="emi-years-label" class="input-subtitle"></div>
                            <div id="emi-years-alert" class="input-alert"></div>
                        </div>
                        <div class="chip-row">
                            <button class="chip" type="button" data-emi-years-chip data-value="5" onclick="setEmiQuickYears(5)">5Y</button>
                            <button class="chip" type="button" data-emi-years-chip data-value="10" onclick="setEmiQuickYears(10)">10Y</button>
                            <button class="chip" type="button" data-emi-years-chip data-value="15" onclick="setEmiQuickYears(15)">15Y</button>
                            <button class="chip" type="button" data-emi-years-chip data-value="20" onclick="setEmiQuickYears(20)">20Y</button>
                            <button class="chip" type="button" data-emi-years-chip data-value="25" onclick="setEmiQuickYears(25)">25Y</button>
                        </div>
                    </div>

                    <button class="calculate-btn" onclick="calculateEMI()">Calculate EMI</button>
                </div>

                <div class="sip-result-card calc-summary">
                    <div class="eyebrow">Monthly EMI</div>
                    <div class="value" id="emi-result">₹0</div>
                    <p class="description" id="emi-caption">Estimated monthly loan payment.</p>

                    <div class="detail-list">
                        <div class="detail-row">
                            <span class="label">Principal</span>
                            <span class="amount positive" id="emi-principal">₹0</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Total Interest</span>
                            <span class="amount negative" id="emi-interest">₹0</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Total Repayment</span>
                            <span class="amount positive" id="emi-total">₹0</span>
                        </div>
                    </div>

                    <div class="calc-chart">
                        <canvas id="emiChart"></canvas>
                    </div>
                </div>
            </div>
            ${renderCalculatorAssistant()}
        </div>
    `;

    bindSmartInput("emi-loan", 1000, false, 500000000); // Max 50 Cr
    bindSmartInput("emi-years", 1, false, 50, false); // Max 50 yrs
    bindSmartInput("emi-rate", 0, true, 25, false); // Max 25%

    resetEmiState();
}

async function calculateEMI(){
    const form = validateFormAndGetValues([
        { id: "emi-loan", min: 1000, allowZero: false, max: 500000000 },
        { id: "emi-years", min: 1, allowZero: false, max: 50 },
        { id: "emi-rate", min: 0, allowZero: true, max: 25 }
    ]);
    if (!form) return;

    const loan = form["emi-loan"];
    const rate = form["emi-rate"];
    const years = form["emi-years"];

 let recommendation, risk, tip;

if(rate <= 8){
    recommendation = "Affordable Loan";
    risk = "Low";
    tip = "Good interest rate.";
}
else if(rate <= 12){
    recommendation = "Moderate Loan";
    risk = "Medium";
    tip = "Consider partial prepayment.";
}
else{
    recommendation = "Expensive Loan";
    risk = "High";
    tip = "Compare lenders before borrowing.";
}

    const response = await fetch("/calculate_emi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loan, rate, years })
    });

    const data = await response.json();
    recommendation = data.recommendation || recommendation;
    console.log("EMI Response:", data);

    animateValue("emi-result", prevValues.emi.result, data.monthly_emi);
    animateValue("emi-principal", prevValues.emi.principal, loan);
    animateValue("emi-interest", prevValues.emi.interest, data.total_interest);
    animateValue("emi-total", prevValues.emi.total, data.total_payment);

    const rVal = document.getElementById("emi-result");
    if(rVal) rVal.setAttribute("title", formatCurrency(data.monthly_emi, true));
    const pVal = document.getElementById("emi-principal");
    if(pVal) pVal.setAttribute("title", formatCurrency(loan, true));
    const iVal = document.getElementById("emi-interest");
    if(iVal) iVal.setAttribute("title", formatCurrency(data.total_interest, true));
    const tVal = document.getElementById("emi-total");
    if(tVal) tVal.setAttribute("title", formatCurrency(data.total_payment, true));

    prevValues.emi = {
        result: data.monthly_emi,
        principal: loan,
        interest: data.total_interest,
        total: data.total_payment
    };

    const caption = document.getElementById("emi-caption");
    if(caption) caption.innerText = `${years} year loan · ${rate}% p.a.`;

    const ctx = document.getElementById("emiChart");
    if(emiChart) emiChart.destroy();

    emiChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Principal", "Interest"],
            datasets: [{
                data: [loan, data.total_interest],
                backgroundColor: ["#17d07a", "#f0b61d"],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: "white" } }
            }
        }
    });

    prepareCalculatorAssistant(`Based on your EMI analysis:

Recommendation:
${recommendation}

Risk:
${risk}

Pro Tip:
${tip} Keep total monthly EMIs within a comfortable share of your take-home income.`);

    fetch("/save-calculation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            user_message: `EMI Calculation: ${formatCurrency(loan, true)} for ${years} years at ${rate}%`,
            bot_reply: `Monthly EMI: ${formatCurrency(data.monthly_emi, true)}`
        })
    });
}

// ----------------------------------------------------
// 4. Brokerage Calculator
// ----------------------------------------------------
function setBrokerageQuickQuantity(quantity){
    const input = document.getElementById("quantity");
    if(input){
        input.value = quantity;
        input.dispatchEvent(new Event("input"));
        input.dispatchEvent(new Event("change"));
    }
    resetChipGroup("[data-brokerage-chip]", quantity);
}

function resetBrokerageState(){
    const buy = document.getElementById("buy-price");
    const sell = document.getElementById("sell-price");
    const quantity = document.getElementById("quantity");
    const brokeragePercent = document.getElementById("brokerage-percent");

    if(buy) buy.value = "";
    if(sell) sell.value = "";
    if(quantity) quantity.value = "";
    if(brokeragePercent) brokeragePercent.value = "";

    resetChipGroup("[data-brokerage-chip]");

    const net = document.getElementById("net-profit");
    const gross = document.getElementById("gross-profit");
    const charge = document.getElementById("brokerage-charge");
    const stt = document.getElementById("brokerage-stt");
    const gst = document.getElementById("brokerage-gst");
    const total = document.getElementById("total-charges");

    if(net) { net.innerText = "₹0"; net.removeAttribute("title"); }
    if(gross) { gross.innerText = "₹0"; gross.removeAttribute("title"); }
    if(charge) { charge.innerText = "₹0"; charge.removeAttribute("title"); }
    if(stt) { stt.innerText = "₹0"; stt.removeAttribute("title"); }
    if(gst) { gst.innerText = "₹0"; gst.removeAttribute("title"); }
    if(total) { total.innerText = "₹0"; total.removeAttribute("title"); }

    const caption = document.getElementById("brokerage-caption");
    if(caption) caption.innerText = "Illustrative intraday/delivery charges.";

    prevValues.brokerage = { net: 0, gross: 0, charge: 0, stt: 0, gst: 0, total: 0 };

    if(brokerageChart){
        brokerageChart.destroy();
        brokerageChart = null;
    }
}

function openBrokeragePanel(){
    setActiveTab("brokerage-tab");
    document.getElementById("dashboard-home").style.display = "none";
    document.getElementById("main-content").innerHTML = "";
    document.getElementById("chat-box").style.display = "none";
    document.querySelector(".input-area").style.display = "none";

    const panel = document.getElementById("dynamic-panel");
    renderCalculatorHeader("Brokerage Calculator", "Illustrative intraday/delivery charges (brokerage cap, STT, GST). Verify with your broker.");

    panel.innerHTML = `
        <div class="sip-panel brokerage-page">
            <div class="calc-grid">
                <div class="sip-input-card calc-form">
                    <div class="calc-field">
                        <div class="calc-field-header">
                            <label for="buy-price" class="calc-label">
                                <span class="icon">\u2193</span>
                                Buy Price
                            </label>
                            <div class="calc-max">Max \u20B95 L / share</div>
                        </div>
                        <div class="calc-input">
                            <input
                                type="text"
                                inputmode="decimal"
                                id="buy-price"
                                placeholder="Enter buy price"
                                autocomplete="off"
                                spellcheck="false"
                            >
                            <span class="calc-suffix">\u20B9</span>
                        </div>
                        <div class="input-info-row">
                            <div id="buy-price-label" class="input-subtitle"></div>
                            <div id="buy-price-alert" class="input-alert"></div>
                        </div>
                    </div>

                    <div class="calc-field">
                        <div class="calc-field-header">
                            <label for="sell-price" class="calc-label">
                                <span class="icon">\u2191</span>
                                Sell Price
                            </label>
                            <div class="calc-max">Max \u20B95 L / share</div>
                        </div>
                        <div class="calc-input">
                            <input
                                type="text"
                                inputmode="decimal"
                                id="sell-price"
                                placeholder="Enter sell price"
                                autocomplete="off"
                                spellcheck="false"
                            >
                            <span class="calc-suffix">\u20B9</span>
                        </div>
                        <div class="input-info-row">
                            <div id="sell-price-label" class="input-subtitle"></div>
                            <div id="sell-price-alert" class="input-alert"></div>
                        </div>
                    </div>

                    <div class="calc-field">
                        <div class="calc-field-header">
                            <label for="quantity" class="calc-label">
                                <span class="icon">\u2460</span>
                                Quantity
                            </label>
                            <div class="calc-max">Max 1,00,000 qty</div>
                        </div>
                        <div class="calc-input">
                            <input
                                type="text"
                                inputmode="decimal"
                                id="quantity"
                                placeholder="Enter quantity"
                                autocomplete="off"
                                spellcheck="false"
                            >
                            <span class="calc-suffix">qty</span>
                        </div>
                        <div class="input-info-row">
                            <div id="quantity-label" class="input-subtitle"></div>
                            <div id="quantity-alert" class="input-alert"></div>
                        </div>
                        <div class="chip-row">
                            <button class="chip" type="button" data-brokerage-chip data-value="10" onclick="setBrokerageQuickQuantity(10)">10</button>
                            <button class="chip" type="button" data-brokerage-chip data-value="50" onclick="setBrokerageQuickQuantity(50)">50</button>
                            <button class="chip" type="button" data-brokerage-chip data-value="100" onclick="setBrokerageQuickQuantity(100)">100</button>
                            <button class="chip" type="button" data-brokerage-chip data-value="500" onclick="setBrokerageQuickQuantity(500)">500</button>
                            <button class="chip" type="button" data-brokerage-chip data-value="1000" onclick="setBrokerageQuickQuantity(1000)">1K</button>
                        </div>
                    </div>

                    <div class="calc-field">
                        <div class="calc-field-header">
                            <label for="brokerage-percent" class="calc-label">
                                <span class="icon">\u2197</span>
                                Brokerage (%)
                            </label>
                            <div class="calc-max">Max 10%</div>
                        </div>
                        <div class="calc-input">
                            <input
                                type="text"
                                inputmode="decimal"
                                id="brokerage-percent"
                                placeholder="Enter brokerage percent"
                                autocomplete="off"
                                spellcheck="false"
                            >
                            <span class="calc-suffix">%</span>
                        </div>
                        <div class="input-info-row">
                            <div id="brokerage-percent-label" class="input-subtitle"></div>
                            <div id="brokerage-percent-alert" class="input-alert"></div>
                        </div>
                    </div>

                    <button class="calculate-btn" onclick="calculateBrokerage()">Calculate Brokerage</button>
                </div>

                <div class="sip-result-card calc-summary">
                    <div class="eyebrow">Net P&L</div>
                    <div class="value" id="net-profit">₹0</div>
                    <p class="description" id="brokerage-caption">Illustrative intraday/delivery charges.</p>

                    <div class="detail-list">
                        <div class="detail-row">
                            <span class="label">Gross P&L</span>
                            <span class="amount positive" id="gross-profit">₹0</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Brokerage</span>
                            <span class="amount negative" id="brokerage-charge">₹0</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">STT</span>
                            <span class="amount negative" id="brokerage-stt">₹0</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">GST</span>
                            <span class="amount negative" id="brokerage-gst">₹0</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Total Charges</span>
                            <span class="amount negative" id="total-charges">₹0</span>
                        </div>
                    </div>

                    <div class="calc-chart">
                        <canvas id="brokerageChart"></canvas>
                    </div>

                    <div class="calc-note">
                        Brokerage figures here are illustrative and depend on your broker's plan, exchange fees, and tax treatment.
                    </div>
                </div>
            </div>
            ${renderCalculatorAssistant()}
        </div>
    `;

    bindSmartInput("buy-price", 1, false, 500000); // Max 5L
    bindSmartInput("sell-price", 1, false, 500000); // Max 5L
    bindSmartInput("quantity", 1, false, 100000, false); // Max 1L
    bindSmartInput("brokerage-percent", 0, true, 10, false); // Max 10%

    resetBrokerageState();
}

function getBrokerageInsightDetails(recommendationKey, netPositive){
    const insights = {
        moderate_trading: {
            risk: "Medium",
            tip: "Monitor trading frequency and brokerage costs before scaling trades."
        },
        cost_optimized_trading: {
            risk: "Low to Medium",
            tip: "Keep comparing broker plans because lower charges can improve net returns."
        },
        active_trading_strategy: {
            risk: "High",
            tip: "Use clear entry, exit, and stop-loss rules for active trading."
        },
        high_volume_trading: {
            risk: "High",
            tip: "Track total charges closely because high volume can reduce profits quickly."
        },
        professional_trading: {
            risk: "Advanced",
            tip: "Use disciplined risk management and review execution costs regularly."
        }
    };

    return insights[recommendationKey] || {
        risk: netPositive ? "Medium" : "High",
        tip: netPositive
            ? "Trade generated positive net returns after charges."
            : "Review brokerage costs, entry price, and exit price before repeating this trade."
    };
}

async function calculateBrokerage(){
    const form = validateFormAndGetValues([
        { id: "buy-price", min: 1, allowZero: false, max: 500000 },
        { id: "sell-price", min: 1, allowZero: false, max: 500000 },
        { id: "quantity", min: 1, allowZero: false, max: 100000 },
        { id: "brokerage-percent", min: 0, allowZero: true, max: 10 }
    ]);
    if (!form) return;

    const buyPrice = form["buy-price"];
    const sellPrice = form["sell-price"];
    const quantity = form["quantity"];
    const brokeragePercent = form["brokerage-percent"];

    const response = await fetch("/calculate_brokerage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buy_price: buyPrice, sell_price: sellPrice, quantity, brokerage_percent: brokeragePercent })
    });

    const data = await response.json();
    console.log("Brokerage Response:", data);

    const turnover = (buyPrice * quantity) + (sellPrice * quantity);
    const netPositive = Number(data.net_profit || 0) >= 0;
    const recommendation = data.recommendation || "Recommendation unavailable";
    const insightDetails = getBrokerageInsightDetails(
        data.recommendation_key,
        netPositive
    );

    animateValue("net-profit", prevValues.brokerage.net, data.net_profit);
    animateValue("gross-profit", prevValues.brokerage.gross, data.gross_profit);
    animateValue("brokerage-charge", prevValues.brokerage.charge, data.brokerage);
    animateValue("brokerage-stt", prevValues.brokerage.stt, data.stt);
    animateValue("brokerage-gst", prevValues.brokerage.gst, data.gst);
    animateValue("total-charges", prevValues.brokerage.total, data.total_charges);

    const netProfitEl = document.getElementById("net-profit");
    if(netProfitEl){
        netProfitEl.classList.toggle("positive", netPositive);
        netProfitEl.classList.toggle("negative", !netPositive);
        netProfitEl.setAttribute("title", formatCurrency(data.net_profit, true));
    }
    const grossProfitEl = document.getElementById("gross-profit");
    if(grossProfitEl){
        grossProfitEl.classList.toggle("positive", Number(data.gross_profit || 0) >= 0);
        grossProfitEl.classList.toggle("negative", Number(data.gross_profit || 0) < 0);
        grossProfitEl.setAttribute("title", formatCurrency(data.gross_profit, true));
    }
    
    const elements = ["brokerage-charge", "brokerage-stt", "brokerage-gst", "total-charges"];
    const vals = [data.brokerage, data.stt, data.gst, data.total_charges];
    elements.forEach((id, idx) => {
        const el = document.getElementById(id);
        if(el) el.setAttribute("title", formatCurrency(vals[idx], true));
    });

    prevValues.brokerage = {
        net: data.net_profit,
        gross: data.gross_profit,
        charge: data.brokerage,
        stt: data.stt,
        gst: data.gst,
        total: data.total_charges
    };

    const caption = document.getElementById("brokerage-caption");
    if(caption) caption.innerText = `${quantity} shares · turnover ${formatCurrency(turnover)}`;

    const ctx = document.getElementById("brokerageChart");
    if(brokerageChart) brokerageChart.destroy();

    brokerageChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Net P&L", "Charges"],
            datasets: [{
                data: [
                    Math.abs(Number(data.net_profit || 0)),
                    Number(data.total_charges || 0)
                ],
                backgroundColor: [netPositive ? "#17d07a" : "#ff5d6c", "#f0b61d"],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: "white" } }
            }
        }
    });

    prepareCalculatorAssistant(`Based on your brokerage analysis:

Recommendation:
${recommendation}

Risk:
${insightDetails.risk}

Pro Tip:
${insightDetails.tip}`);

    fetch("/save-calculation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            user_message: `Brokerage: Buy ${formatCurrency(buyPrice, true)} · Sell ${formatCurrency(sellPrice, true)} · Qty ${quantity} · Brokerage ${brokeragePercent}%`,
            bot_reply: `Net P&L: ${formatCurrency(data.net_profit, true)}`
        })
    });
}

function appendChatMessage(chatBox, type, text) {
    if (!chatBox || !text) return;
    const messageEl = document.createElement("div");
    messageEl.className = `${type}-message`;
    // add enter animation class
    messageEl.classList.add('chat-message');
    messageEl.textContent = text;
    chatBox.appendChild(messageEl);
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageEl;
}

async function sendCalculatorMessage() {
    const input = document.getElementById("calculator-user-input");
    if (!input) return;

    const message = input.value.trim();
    if (!message) return;

    const chatBox = document.getElementById("calculator-chat-box");
    appendChatMessage(chatBox, "user", message);
    input.value = "";
    // show typing indicator while waiting for response
    const typing = showTypingIndicator(chatBox);
    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        removeTypingIndicator(typing);
        appendChatMessage(chatBox, "bot", data.reply || "Sorry, I could not process your message.");
    } catch (error) {
        console.error("Error sending calculator message:", error);
        removeTypingIndicator(typing);
        appendChatMessage(chatBox, "bot", "Sorry, there was an error processing your message.");
    }
}

// Send message function for chatbot
async function sendMessage() {
    const input = document.getElementById("user-input");
    if (!input) return;

    const message = input.value.trim();
    if (!message) return;

    const chatBox = document.getElementById("chat-box");
    appendChatMessage(chatBox, "user", message);
    input.value = "";
    // show typing indicator while waiting for response
    const typing = showTypingIndicator(chatBox);
    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        removeTypingIndicator(typing);
        appendChatMessage(chatBox, "bot", data.reply || "Sorry, I could not process your message.");
    } catch (error) {
        console.error("Error:", error);
        removeTypingIndicator(typing);
        appendChatMessage(chatBox, "bot", "❌ Error connecting to the server. Please try again.");
    }
}

// Page initialization and keyboard support
document.addEventListener("DOMContentLoaded", () => {
    const stored = localStorage.getItem("theme-mode");
    if (stored === "light") {
        document.body.classList.add("light-theme");
    }

    const userInput = document.getElementById("user-input");
    if (userInput) {
        userInput.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                sendMessage();
            }
        });
    }

    const calculatorInput = document.getElementById("calculator-user-input");
    if (calculatorInput) {
        calculatorInput.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                sendCalculatorMessage();
            }
        });
    }

    // Support Enter key for dynamically inserted calculator assistant input
    document.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && document.activeElement?.id === "calculator-user-input") {
            event.preventDefault();
            sendCalculatorMessage();
        }
    });
});
