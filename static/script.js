function hideAllSections(){
    document.getElementById("dashboard-home").style.display = "none";
    document.getElementById("chat-box").style.display = "none";
    document.querySelector(".input-area").style.display = "none";
    document.getElementById("dynamic-panel").innerHTML = "";
    document.getElementById("main-content").innerHTML = "";
}

let sipChart;
let lumpsumChart;
let emiChart;
let brokerageChart;

function formatINR(value){
    const number = Number(value || 0);
    return "₹" + number.toLocaleString("en-IN");
}

function validateInput(id, min = 0, allowZero = true, max = Infinity) {
    const input = document.getElementById(id);
    if (!input) return true;
    const val = Number(input.value);
    const isInvalid = input.value.trim() === "" || isNaN(val) || val < min || val > max || (!allowZero && val === 0);
    if (isInvalid) {
        input.style.borderColor = "rgba(255, 93, 108, 0.6)";
        input.style.boxShadow = "0 0 0 4px rgba(255, 93, 108, 0.15)";
        return false;
    } else {
        input.style.borderColor = "transparent";
        input.style.boxShadow = "none";
        return true;
    }
}

function setLumpsumQuickAmount(amount){
    const input = document.getElementById("lump-amount");
    if(input){
        input.value = amount;
    }
    document.querySelectorAll("[data-lump-chip]").forEach(chip => {
        chip.classList.toggle("active", chip.dataset.value === String(amount));
    });
}

function resetChipGroup(selector, activeValue){
    document.querySelectorAll(selector).forEach(chip => {
        chip.classList.toggle(
            "active",
            activeValue !== undefined && chip.dataset.value === String(activeValue)
        );
    });
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
    const description = document.querySelector(".sip-result-card .description");

    if(futureValue) futureValue.innerText = "₹0";
    if(invested) invested.innerText = "₹0";
    if(returns) returns.innerText = "₹0";
    if(description) description.innerText = "After 0 years at 0% p.a.";

    if(sipChart){
        sipChart.destroy();
        sipChart = null;
    }
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
    const description = document.querySelector(".calc-summary .description");

    if(futureValue) futureValue.innerText = "₹0";
    if(invested) invested.innerText = "₹0";
    if(returns) returns.innerText = "₹0";
    if(description) description.innerText = "Estimated future investment value.";

    if(lumpsumChart){
        lumpsumChart.destroy();
        lumpsumChart = null;
    }
}

async function sendMessage() {
    let input = document.getElementById("user-input");
    let message = input.value;
    if(message.trim() === "") {
        return;
    }

    let chatBox = document.getElementById("chat-box");

    chatBox.innerHTML += `
        <div style="text-align:right; margin-top:15px;">
            <div style="background:#f0b61d; display:inline-block; padding:15px; border-radius:15px; color:#1b1200; max-width:70%; font-weight:700;">
                ${message}
            </div>
        </div>
    `;

    let response = await fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: message
        })
    });

    let data = await response.json();

    chatBox.innerHTML += `
        <div style="margin-top:15px;">
            <div class="bot-message">
                ${data.reply.replace(/\n/g, "<br>")}
            </div>
        </div>
    `;

    input.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;
}

document.getElementById("user-input").addEventListener("keypress", function(event) {
    if(event.key === "Enter") {
        sendMessage();
    }
});

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

function setActiveTab(tabId){
    const tabs = document.querySelectorAll(".menu-item");
    tabs.forEach(tab => {
        tab.classList.remove("active");
    });
    document.getElementById(tabId).classList.add("active");
}

async function openHistory() {
    setActiveTab("history-tab");
    hideAllSections();
    const panel = document.getElementById("dynamic-panel");
    const response = await fetch("/history");
    const data = await response.json();

    let html = `
        <h1 style="color:white; margin-bottom:20px;">
            Chat History
        </h1>
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
                <p style="margin: 0; font-size: 14px;">Your past conversations with FinBot AI will be saved here.</p>
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
                <button class="calculate-btn" onclick="toggleThemeMode()">
                    Dark Theme
                </button>
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

// Lumpsum Panel Setup
function openLumpsumPanel(){
    setActiveTab("lumpsum-tab");
    document.getElementById("dashboard-home").style.display = "none";
    document.getElementById("main-content").innerHTML = "";
    document.getElementById("chat-box").style.display = "none";
    document.querySelector(".input-area").style.display = "none";

    const panel = document.getElementById("dynamic-panel");

    panel.innerHTML = `
        <div class="sip-panel lumpsum-page">
            <div class="calc-hero">
                <button class="calc-icon-btn" onclick="openDashboard()" aria-label="Back to dashboard">\u2190</button>
                <div class="calc-brand">
                    <img src="/static/images/bot.png" alt="FinBot logo">
                    <div class="calc-title">
                        <h1>Lumpsum Calculator</h1>
                        <p>Calculate one-time investment growth.</p>
                    </div>
                </div>
                <div style="width: 44px; height: 44px; flex-shrink: 0;"></div>
            </div>

            <div class="sip-grid">
                <div class="sip-input-card calc-form">
                    <div class="calc-field">
                        <div class="calc-field-header">
                            <div class="calc-label">
                                <span class="icon">\u20B9</span>
                                Investment Amount
                            </div>
                            <div class="calc-max">Max \u20B950 Cr</div>
                        </div>

                        <div class="calc-input">
                            <input
                                type="number"
                                id="lump-amount"
                                placeholder="Enter investment amount"
                                autocomplete="off"
                                spellcheck="false"
                                oninput="setLumpsumQuickAmount(this.value || '')"
                            >
                            <span class="calc-suffix">\u20B9</span>
                        </div>

                        <div class="calc-range">\u20B91 L · \u20B91,00,000</div>

                        <div class="chip-row">
                            <button class="chip" type="button" data-lump-chip data-value="5000" onclick="setLumpsumQuickAmount(5000)">5K</button>
                            <button class="chip" type="button" data-lump-chip data-value="10000" onclick="setLumpsumQuickAmount(10000)">10K</button>
                            <button class="chip" type="button" data-lump-chip data-value="25000" onclick="setLumpsumQuickAmount(25000)">25K</button>
                            <button class="chip" type="button" data-lump-chip data-value="50000" onclick="setLumpsumQuickAmount(50000)">50K</button>
                            <button class="chip" type="button" data-lump-chip data-value="100000" onclick="setLumpsumQuickAmount(100000)">1L</button>
                            <button class="chip" type="button" data-lump-chip data-value="500000" onclick="setLumpsumQuickAmount(500000)">5L</button>
                            <button class="chip" type="button" data-lump-chip data-value="1000000" onclick="setLumpsumQuickAmount(1000000)">10L</button>
                            <button class="chip" type="button" data-lump-chip data-value="10000000" onclick="setLumpsumQuickAmount(10000000)">1Cr</button>
                        </div>
                    </div>

                    <div class="calc-field">
                        <div class="calc-field-header">
                            <div class="calc-label">
                                <span class="icon">\u231B</span>
                                Tenure
                            </div>
                            <div class="calc-max">Max 50 years</div>
                        </div>

                        <div class="calc-input">
                            <input
                                type="number"
                                id="lump-years"
                                placeholder="Enter investment years"
                                autocomplete="off"
                                spellcheck="false"
                            >
                            <span class="calc-suffix">yrs</span>
                        </div>

                        <div class="chip-row">
                            <button class="chip" type="button" onclick="document.getElementById('lump-years').value = 3">3Y</button>
                            <button class="chip" type="button" onclick="document.getElementById('lump-years').value = 5">5Y</button>
                            <button class="chip" type="button" onclick="document.getElementById('lump-years').value = 10">10Y</button>
                            <button class="chip" type="button" onclick="document.getElementById('lump-years').value = 15">15Y</button>
                            <button class="chip" type="button" onclick="document.getElementById('lump-years').value = 20">20Y</button>
                            <button class="chip" type="button" onclick="document.getElementById('lump-years').value = 25">25Y</button>
                        </div>
                    </div>

                    <div class="calc-field">
                        <div class="calc-field-header">
                            <div class="calc-label">
                                <span class="icon">\u2197</span>
                                Expected CAGR
                            </div>
                            <div class="calc-max">Max 30%</div>
                        </div>

                        <div class="calc-input">
                            <input
                                type="number"
                                id="lump-rate"
                                placeholder="Enter annual return"
                                autocomplete="off"
                                spellcheck="false"
                            >
                            <span class="calc-suffix">%</span>
                        </div>

                        <div class="chip-row">
                            <button class="chip" type="button" onclick="document.getElementById('lump-rate').value = 8">8%</button>
                            <button class="chip" type="button" onclick="document.getElementById('lump-rate').value = 10">10%</button>
                            <button class="chip" type="button" onclick="document.getElementById('lump-rate').value = 12">12%</button>
                            <button class="chip" type="button" onclick="document.getElementById('lump-rate').value = 15">15%</button>
                            <button class="chip" type="button" onclick="document.getElementById('lump-rate').value = 18">18%</button>
                        </div>
                    </div>

                    <button class="calculate-btn" onclick="calculateLumpsum()">Calculate Lumpsum</button>
                </div>

                <div class="sip-result-card calc-summary">
                    <div class="eyebrow">Maturity Value</div>
                    <div class="value" id="lump-future">\u20B90</div>
                    <p class="description">Estimated future investment value.</p>

                    <div class="detail-list">
                        <div class="detail-row">
                            <span class="label">Principal</span>
                            <span class="amount positive" id="lump-invested">\u20B90</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Wealth gained</span>
                            <span class="amount positive" id="lump-returns">\u20B90</span>
                        </div>
                    </div>

                    <div class="calc-chart">
                        <canvas id="lumpsumChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;
    resetLumpsumState();
}

async function calculateLumpsum(){
    const amountVal = validateInput("lump-amount", 0, false, 500000000); // Max 50 Cr
    const yearsVal = validateInput("lump-years", 0, false, 50); // Max 50 Years
    const rateVal = validateInput("lump-rate", 0, true, 30); // Max 30%
    if (!amountVal || !yearsVal || !rateVal) return;

    const amount = document.getElementById("lump-amount").value;
    const rate = document.getElementById("lump-rate").value;
    const years = document.getElementById("lump-years").value;

    const response = await fetch("/calculate_lumpsum", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            amount: amount,
            rate: rate,
            years: years
        })
    });

    const data = await response.json();

    document.getElementById("lump-future").innerText = formatINR(data.future_value);
    document.getElementById("lump-invested").innerText = formatINR(data.invested_amount);
    document.getElementById("lump-returns").innerText = formatINR(data.estimated_returns);

    const ctx = document.getElementById("lumpsumChart");
    if(lumpsumChart){
        lumpsumChart.destroy();
    }

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
                legend: {
                    labels: {
                        color: "white"
                    }
                }
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

    const userMessage = `Lumpsum Calculation: ₹${amount} invested for ${years} years at ${rate}%`;
    const botReply = `Estimated Future Value: ₹${data.future_value}`;

    fetch("/save-calculation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_message: userMessage, bot_reply: botReply })
    });
}

function setMoneyField(id, value, options = {}){
    const config = typeof options === "string" ? { tone: options } : options;
    const tone = config.tone || "auto";
    const showMinus = Boolean(config.showMinus);

    const el = document.getElementById(id);
    if(!el) return;

    const numeric = Number(value || 0);
    const isNegative = numeric < 0;
    const formatted = formatINR(Math.abs(numeric));
    const prefix = numeric === 0 ? "" : (showMinus || isNegative ? "-" : "");
    el.innerText = `${prefix}${formatted}`;

    const positiveTone = tone === "positive" || (tone === "auto" && !isNegative);
    const negativeTone = tone === "negative" || (tone === "auto" && isNegative);

    el.classList.toggle("positive", positiveTone);
    el.classList.toggle("negative", negativeTone);
}

function resetEmiState(){
    const loan = document.getElementById("emi-loan");
    const rate = document.getElementById("emi-rate");
    const years = document.getElementById("emi-years");

    if(loan) loan.value = "";
    if(rate) rate.value = "";
    if(years) years.value = "";

    document.querySelectorAll("[data-emi-chip]").forEach(chip => chip.classList.remove("active"));
    document.querySelectorAll("[data-emi-rate-chip]").forEach(chip => chip.classList.remove("active"));
    document.querySelectorAll("[data-emi-years-chip]").forEach(chip => chip.classList.remove("active"));

    setMoneyField("emi-result", 0, { tone: "positive" });
    setMoneyField("emi-principal", 0, { tone: "positive" });
    setMoneyField("emi-interest", 0, { tone: "negative" });
    setMoneyField("emi-total", 0, { tone: "positive" });

    const caption = document.getElementById("emi-caption");
    if(caption) caption.innerText = "Estimated monthly loan payment.";

    if(emiChart){
        emiChart.destroy();
        emiChart = null;
    }
}

function setEmiQuickLoan(amount){
    const input = document.getElementById("emi-loan");
    if(input) input.value = amount;
    document.querySelectorAll("[data-emi-chip]").forEach(chip => {
        chip.classList.toggle("active", chip.dataset.value === String(amount));
    });
}

function setEmiQuickRate(rate){
    const input = document.getElementById("emi-rate");
    if(input) input.value = rate;
    document.querySelectorAll("[data-emi-rate-chip]").forEach(chip => {
        chip.classList.toggle("active", chip.dataset.value === String(rate));
    });
}

function setEmiQuickYears(years){
    const input = document.getElementById("emi-years");
    if(input) input.value = years;
    document.querySelectorAll("[data-emi-years-chip]").forEach(chip => {
        chip.classList.toggle("active", chip.dataset.value === String(years));
    });
}

function openEMIPanel(){
    setActiveTab("emi-tab");
    document.getElementById("dashboard-home").style.display = "none";
    document.getElementById("main-content").innerHTML = "";
    document.getElementById("chat-box").style.display = "none";
    document.querySelector(".input-area").style.display = "none";

    const panel = document.getElementById("dynamic-panel");

    panel.innerHTML = `
        <div class="sip-panel emi-page">
            <div class="calc-hero">
                <button class="calc-icon-btn" onclick="openDashboard()" aria-label="Back to dashboard">\u2190</button>
                <div class="calc-brand">
                    <img src="/static/images/bot.png" alt="FinBot logo">
                    <div class="calc-title">
                        <h1>EMI Calculator</h1>
                        <p>Check monthly EMI and total interest before choosing a loan tenure.</p>
                    </div>
                </div>
                <div style="width: 44px; height: 44px; flex-shrink: 0;"></div>
            </div>

            <div class="calc-grid">
                <div class="sip-input-card calc-form">
                    <div class="calc-field">
                        <div class="calc-field-header">
                            <div class="calc-label">
                                <span class="icon">\u20B9</span>
                                Loan amount
                            </div>
                            <div class="calc-max">Max \u20B950 Cr</div>
                        </div>

                        <div class="calc-input">
                            <input
                                type="number"
                                id="emi-loan"
                                placeholder="Enter loan amount"
                                autocomplete="off"
                                spellcheck="false"
                                oninput="setEmiQuickLoan(this.value || '')"
                            >
                            <span class="calc-suffix">\u20B9</span>
                        </div>

                        <div class="calc-range">\u20B915 L · \u20B915,00,000</div>

                        <div class="mini-chip-row">
                            <button class="mini-chip" type="button" data-emi-chip data-value="5000" onclick="setEmiQuickLoan(5000)">5K</button>
                            <button class="mini-chip" type="button" data-emi-chip data-value="10000" onclick="setEmiQuickLoan(10000)">10K</button>
                            <button class="mini-chip" type="button" data-emi-chip data-value="25000" onclick="setEmiQuickLoan(25000)">25K</button>
                            <button class="mini-chip" type="button" data-emi-chip data-value="50000" onclick="setEmiQuickLoan(50000)">50K</button>
                            <button class="mini-chip" type="button" data-emi-chip data-value="100000" onclick="setEmiQuickLoan(100000)">1L</button>
                            <button class="mini-chip" type="button" data-emi-chip data-value="500000" onclick="setEmiQuickLoan(500000)">5L</button>
                            <button class="mini-chip" type="button" data-emi-chip data-value="1000000" onclick="setEmiQuickLoan(1000000)">10L</button>
                            <button class="mini-chip" type="button" data-emi-chip data-value="10000000" onclick="setEmiQuickLoan(10000000)">1Cr</button>
                        </div>
                    </div>

                    <div class="calc-field">
                        <div class="calc-field-header">
                            <div class="calc-label">
                                <span class="icon">\u2197</span>
                                Interest rate (annual)
                            </div>
                            <div class="calc-max">Max 25%</div>
                        </div>

                        <div class="calc-input">
                            <input
                                type="number"
                                id="emi-rate"
                                placeholder="Enter annual interest"
                                autocomplete="off"
                                spellcheck="false"
                                oninput="setEmiQuickRate(this.value || '')"
                            >
                            <span class="calc-suffix">%</span>
                        </div>

                        <div class="mini-chip-row">
                            <button class="mini-chip" type="button" data-emi-rate-chip data-value="8" onclick="setEmiQuickRate(8)">8%</button>
                            <button class="mini-chip" type="button" data-emi-rate-chip data-value="10" onclick="setEmiQuickRate(10)">10%</button>
                            <button class="mini-chip" type="button" data-emi-rate-chip data-value="12" onclick="setEmiQuickRate(12)">12%</button>
                            <button class="mini-chip" type="button" data-emi-rate-chip data-value="15" onclick="setEmiQuickRate(15)">15%</button>
                        </div>
                    </div>

                    <div class="calc-field">
                        <div class="calc-field-header">
                            <div class="calc-label">
                                <span class="icon">\u231B</span>
                                Tenure
                            </div>
                            <div class="calc-max">Max 50 years</div>
                        </div>

                        <div class="calc-input">
                            <input
                                type="number"
                                id="emi-years"
                                placeholder="Enter loan years"
                                autocomplete="off"
                                spellcheck="false"
                                oninput="setEmiQuickYears(this.value || '')"
                            >
                            <span class="calc-suffix">yrs</span>
                        </div>

                        <div class="mini-chip-row">
                            <button class="mini-chip" type="button" data-emi-years-chip data-value="3" onclick="setEmiQuickYears(3)">3Y</button>
                            <button class="mini-chip" type="button" data-emi-years-chip data-value="5" onclick="setEmiQuickYears(5)">5Y</button>
                            <button class="mini-chip" type="button" data-emi-years-chip data-value="10" onclick="setEmiQuickYears(10)">10Y</button>
                            <button class="mini-chip" type="button" data-emi-years-chip data-value="15" onclick="setEmiQuickYears(15)">15Y</button>
                            <button class="mini-chip" type="button" data-emi-years-chip data-value="20" onclick="setEmiQuickYears(20)">20Y</button>
                            <button class="mini-chip" type="button" data-emi-years-chip data-value="25" onclick="setEmiQuickYears(25)">25Y</button>
                        </div>
                    </div>

                    <button class="calculate-btn" onclick="calculateEMI()">Calculate EMI</button>
                </div>

                <div class="sip-result-card calc-summary">
                    <div class="eyebrow">Monthly EMI</div>
                    <div class="value" id="emi-result">\u20B90</div>
                    <p class="description" id="emi-caption">Estimated monthly loan payment.</p>

                    <div class="detail-list">
                        <div class="detail-row">
                            <span class="label">Principal</span>
                            <span class="amount positive" id="emi-principal">\u20B90</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Total interest</span>
                            <span class="amount negative" id="emi-interest">\u20B90</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Total repayment</span>
                            <span class="amount positive" id="emi-total">\u20B90</span>
                        </div>
                    </div>

                    <div class="calc-chart">
                        <canvas id="emiChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;
    resetEmiState();
}

async function calculateEMI(){
    const loanVal = validateInput("emi-loan", 0, false, 500000000); // Max 50 Cr
    const yearsVal = validateInput("emi-years", 0, false, 50); // Max 50 Years
    const rateVal = validateInput("emi-rate", 0, true, 25); // Max 25%
    if (!loanVal || !yearsVal || !rateVal) return;

    const loan = Number(document.getElementById("emi-loan").value || 0);
    const rate = Number(document.getElementById("emi-rate").value || 0);
    const years = Number(document.getElementById("emi-years").value || 0);

    const response = await fetch("/calculate_emi", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            loan: loan,
            rate: rate,
            years: years
        })
    });

    const data = await response.json();

    setMoneyField("emi-result", data.monthly_emi, { tone: "positive" });
    setMoneyField("emi-principal", loan, { tone: "positive" });
    setMoneyField("emi-interest", data.total_interest, { tone: "negative" });
    setMoneyField("emi-total", data.total_payment, { tone: "positive" });

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
                legend: {
                    labels: { color: "white" }
                }
            }
        }
    });

    const userMessage = `EMI Calculation: ₹${loan} loan for ${years} years at ${rate}%`;
    const botReply = `Monthly EMI: ₹${data.monthly_emi}`;

    fetch("/save-calculation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_message: userMessage, bot_reply: botReply })
    });
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

    document.querySelectorAll("[data-brokerage-chip]").forEach(chip => chip.classList.remove("active"));

    setMoneyField("net-profit", 0, { tone: "positive" });
    setMoneyField("gross-profit", 0, { tone: "positive" });
    setMoneyField("total-charges", 0, { tone: "negative", showMinus: true });
    setMoneyField("brokerage-stt", 0, { tone: "negative", showMinus: true });
    setMoneyField("brokerage-gst", 0, { tone: "negative", showMinus: true });

    const caption = document.getElementById("brokerage-caption");
    if(caption) caption.innerText = "Illustrative intraday/delivery charges.";

    if(brokerageChart){
        brokerageChart.destroy();
        brokerageChart = null;
    }
}

function setBrokerageQuickQuantity(quantity){
    const input = document.getElementById("quantity");
    if(input) input.value = quantity;
    document.querySelectorAll("[data-brokerage-chip]").forEach(chip => {
        chip.classList.toggle("active", chip.dataset.value === String(quantity));
    });
}

function openBrokeragePanel(){
    setActiveTab("brokerage-tab");
    document.getElementById("dashboard-home").style.display = "none";
    document.getElementById("main-content").innerHTML = "";
    document.getElementById("chat-box").style.display = "none";
    document.querySelector(".input-area").style.display = "none";

    const panel = document.getElementById("dynamic-panel");

    panel.innerHTML = `
        <div class="sip-panel brokerage-page">
            <div class="calc-hero">
                <button class="calc-icon-btn" onclick="openDashboard()" aria-label="Back to dashboard">\u2190</button>
                <div class="calc-brand">
                    <img src="/static/images/bot.png" alt="FinBot logo">
                    <div class="calc-title">
                        <h1>Brokerage Calculator</h1>
                        <p>Illustrative intraday/delivery charges (brokerage cap, STT, GST). Verify with your broker.</p>
                    </div>
                </div>
                <div style="width: 44px; height: 44px; flex-shrink: 0;"></div>
            </div>

            <div class="calc-grid">
                <div class="sip-input-card calc-form">
                    <div class="calc-field">
                        <div class="calc-field-header">
                            <div class="calc-label">
                                <span class="icon">\u2193</span>
                                Buy price
                            </div>
                            <div class="calc-max">Max \u20B95 L / share</div>
                        </div>

                        <div class="calc-input">
                            <input
                                type="number"
                                id="buy-price"
                                placeholder="Enter buy price"
                                autocomplete="off"
                                spellcheck="false"
                            >
                            <span class="calc-suffix">\u20B9</span>
                        </div>
                    </div>

                    <div class="calc-field">
                        <div class="calc-field-header">
                            <div class="calc-label">
                                <span class="icon">\u2191</span>
                                Sell price
                            </div>
                            <div class="calc-max">Max \u20B95 L / share</div>
                        </div>

                        <div class="calc-input">
                            <input
                                type="number"
                                id="sell-price"
                                placeholder="Enter sell price"
                                autocomplete="off"
                                spellcheck="false"
                            >
                            <span class="calc-suffix">\u20B9</span>
                        </div>
                    </div>

                    <div class="calc-field">
                        <div class="calc-field-header">
                            <div class="calc-label">
                                <span class="icon">\u2460</span>
                                Quantity
                            </div>
                            <div class="calc-max">Max 1,00,000 qty</div>
                        </div>

                        <div class="calc-input">
                            <input
                                type="number"
                                id="quantity"
                                placeholder="Enter quantity"
                                autocomplete="off"
                                spellcheck="false"
                                oninput="setBrokerageQuickQuantity(this.value || '')"
                            >
                            <span class="calc-suffix">qty</span>
                        </div>

                        <div class="mini-chip-row">
                            <button class="mini-chip" type="button" data-brokerage-chip data-value="10" onclick="setBrokerageQuickQuantity(10)">10</button>
                            <button class="mini-chip" type="button" data-brokerage-chip data-value="50" onclick="setBrokerageQuickQuantity(50)">50</button>
                            <button class="mini-chip" type="button" data-brokerage-chip data-value="100" onclick="setBrokerageQuickQuantity(100)">100</button>
                            <button class="mini-chip" type="button" data-brokerage-chip data-value="500" onclick="setBrokerageQuickQuantity(500)">500</button>
                            <button class="mini-chip" type="button" data-brokerage-chip data-value="1000" onclick="setBrokerageQuickQuantity(1000)">1K</button>
                        </div>
                    </div>

                    <div class="calc-field">
                        <div class="calc-field-header">
                            <div class="calc-label">
                                <span class="icon">\u2197</span>
                                Brokerage (%)
                            </div>
                            <div class="calc-max">Auto cap via broker plan</div>
                        </div>

                        <div class="calc-input">
                            <input
                                type="number"
                                id="brokerage-percent"
                                placeholder="Enter brokerage percent"
                                autocomplete="off"
                                spellcheck="false"
                            >
                            <span class="calc-suffix">%</span>
                        </div>
                    </div>

                    <button class="calculate-btn" onclick="calculateBrokerage()">Calculate Brokerage</button>
                </div>

                <div class="sip-result-card calc-summary">
                    <div class="eyebrow">Net P&L</div>
                    <div class="value" id="net-profit">\u20B90</div>
                    <p class="description" id="brokerage-caption">Illustrative intraday/delivery charges.</p>

                    <div class="detail-list">
                        <div class="detail-row">
                            <span class="label">Gross P&L</span>
                            <span class="amount positive" id="gross-profit">\u20B90</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Brokerage</span>
                            <span class="amount negative" id="brokerage-charge">-\u20B90</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">STT</span>
                            <span class="amount negative" id="brokerage-stt">-\u20B90</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">GST</span>
                            <span class="amount negative" id="brokerage-gst">-\u20B90</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Total charges</span>
                            <span class="amount negative" id="total-charges">-\u20B90</span>
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
        </div>
    `;
    resetBrokerageState();
}

async function calculateBrokerage(){
    const buyVal = validateInput("buy-price", 0, false, 500000); // Max 5L
    const sellVal = validateInput("sell-price", 0, false, 500000); // Max 5L
    const quantityVal = validateInput("quantity", 0, false, 100000); // Max 1L
    const brokerageVal = validateInput("brokerage-percent", 0, true, 100);
    if (!buyVal || !sellVal || !quantityVal || !brokerageVal) return;

    const buyPrice = Number(document.getElementById("buy-price").value || 0);
    const sellPrice = Number(document.getElementById("sell-price").value || 0);
    const quantity = Number(document.getElementById("quantity").value || 0);
    const brokeragePercent = Number(document.getElementById("brokerage-percent").value || 0);

    const response = await fetch("/calculate_brokerage", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            buy_price: buyPrice,
            sell_price: sellPrice,
            quantity: quantity,
            brokerage_percent: brokeragePercent
        })
    });

    const data = await response.json();
    const turnover = (buyPrice * quantity) + (sellPrice * quantity);
    const netPositive = Number(data.net_profit || 0) >= 0;

    setMoneyField("net-profit", data.net_profit, { tone: netPositive ? "positive" : "negative" });
    setMoneyField("gross-profit", data.gross_profit, { tone: Number(data.gross_profit || 0) >= 0 ? "positive" : "negative" });
    setMoneyField("brokerage-charge", data.brokerage, { tone: "negative", showMinus: true });
    setMoneyField("brokerage-stt", data.stt, { tone: "negative", showMinus: true });
    setMoneyField("brokerage-gst", data.gst, { tone: "negative", showMinus: true });
    setMoneyField("total-charges", data.total_charges, { tone: "negative", showMinus: true });

    const caption = document.getElementById("brokerage-caption");
    if(caption) caption.innerText = `${quantity} shares · turnover ${formatINR(turnover)}`;

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
                backgroundColor: ["#17d07a", "#f0b61d"],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { color: "white" }
                }
            }
        }
    });

    const userMessage = `Brokerage Calculation: Buy ₹${buyPrice}, Sell ₹${sellPrice}, Quantity ${quantity}, Brokerage ${brokeragePercent}%`;
    const botReply = `Net Profit: ₹${data.net_profit}`;

    fetch("/save-calculation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_message: userMessage, bot_reply: botReply })
    });
}

function setSipQuickAmount(amount){
    const input = document.getElementById("sip-amount");
    if(input) input.value = amount;
    document.querySelectorAll("[data-sip-chip]").forEach(chip => {
        chip.classList.toggle("active", chip.dataset.value === String(amount));
    });
}

function setSipQuickYears(years){
    const input = document.getElementById("sip-years");
    if(input) input.value = years;
    document.querySelectorAll("[data-sip-years-chip]").forEach(chip => {
        chip.classList.toggle("active", chip.dataset.value === String(years));
    });
}

function setSipQuickReturn(rate){
    const input = document.getElementById("sip-return");
    if(input) input.value = rate;
    document.querySelectorAll("[data-sip-return-chip]").forEach(chip => {
        chip.classList.toggle("active", chip.dataset.value === String(rate));
    });
}

function openSIPPanel(){
    setActiveTab("sip-tab");
    document.getElementById("dashboard-home").style.display = "none";
    document.getElementById("main-content").innerHTML = "";
    document.getElementById("chat-box").style.display = "none";
    document.querySelector(".input-area").style.display = "none";

    const panel = document.getElementById("dynamic-panel");

    panel.innerHTML = `
        <div class="sip-panel sip-page">
            <div class="calc-hero">
                <button class="calc-icon-btn" onclick="openDashboard()" aria-label="Back to dashboard">\u2190</button>
                <div class="calc-brand">
                    <img src="/static/images/bot.png" alt="FinBot logo">
                    <div class="calc-title">
                        <h1>SIP Calculator</h1>
                        <p>Plan your future wealth with monthly investing.</p>
                    </div>
                </div>
                <div style="width: 44px; height: 44px; flex-shrink: 0;"></div>
            </div>

            <div class="sip-grid">
                <div class="sip-input-card calc-form">
                    <div class="calc-field">
                        <div class="calc-field-header">
                            <div class="calc-label">
                                <span class="icon">\u20B9</span>
                                Monthly SIP
                            </div>
                            <div class="calc-max">Max \u20B91 Cr / month</div>
                        </div>

                        <div class="calc-input">
                            <input
                                type="number"
                                id="sip-amount"
                                placeholder="Enter monthly investment"
                                autocomplete="off"
                                spellcheck="false"
                                oninput="setSipQuickAmount(this.value || '')"
                            >
                            <span class="calc-suffix">\u20B9</span>
                        </div>

                        <div class="calc-range">\u20B9500</div>

                        <div class="chip-row">
                            <button class="chip" type="button" data-sip-chip data-value="5000" onclick="setSipQuickAmount(5000)">5K</button>
                            <button class="chip" type="button" data-sip-chip data-value="10000" onclick="setSipQuickAmount(10000)">10K</button>
                            <button class="chip" type="button" data-sip-chip data-value="25000" onclick="setSipQuickAmount(25000)">25K</button>
                            <button class="chip" type="button" data-sip-chip data-value="50000" onclick="setSipQuickAmount(50000)">50K</button>
                            <button class="chip" type="button" data-sip-chip data-value="100000" onclick="setSipQuickAmount(100000)">1L</button>
                            <button class="chip" type="button" data-sip-chip data-value="500000" onclick="setSipQuickAmount(500000)">5L</button>
                            <button class="chip" type="button" data-sip-chip data-value="1000000" onclick="setSipQuickAmount(1000000)">10L</button>
                            <button class="chip" type="button" data-sip-chip data-value="10000000" onclick="setSipQuickAmount(10000000)">1Cr</button>
                        </div>
                    </div>

                    <div class="calc-field">
                        <div class="calc-field-header">
                            <div class="calc-label">
                                <span class="icon">\u231B</span>
                                Tenure
                            </div>
                            <div class="calc-max">Max 50 years</div>
                        </div>

                        <div class="calc-input">
                            <input
                                type="number"
                                id="sip-years"
                                placeholder="Enter investment years"
                                autocomplete="off"
                                spellcheck="false"
                            >
                            <span class="calc-suffix">yrs</span>
                        </div>

                        <div class="chip-row">
                            <button class="chip" type="button" data-sip-years-chip data-value="3" onclick="setSipQuickYears(3)">3Y</button>
                            <button class="chip" type="button" data-sip-years-chip data-value="5" onclick="setSipQuickYears(5)">5Y</button>
                            <button class="chip" type="button" data-sip-years-chip data-value="10" onclick="setSipQuickYears(10)">10Y</button>
                            <button class="chip" type="button" data-sip-years-chip data-value="15" onclick="setSipQuickYears(15)">15Y</button>
                            <button class="chip" type="button" data-sip-years-chip data-value="20" onclick="setSipQuickYears(20)">20Y</button>
                            <button class="chip" type="button" data-sip-years-chip data-value="25" onclick="setSipQuickYears(25)">25Y</button>
                        </div>
                    </div>

                    <div class="calc-field">
                        <div class="calc-field-header">
                            <div class="calc-label">
                                <span class="icon">\u2197</span>
                                Expected return (annual)
                            </div>
                            <div class="calc-max">Max 30%</div>
                        </div>

                        <div class="calc-input">
                            <input
                                type="number"
                                id="sip-return"
                                placeholder="Enter annual return"
                                autocomplete="off"
                                spellcheck="false"
                            >
                            <span class="calc-suffix">%</span>
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
                    <div class="value" id="future-value">\u20B90</div>
                    <p class="description">After 0 years at 0% p.a.</p>

                    <div class="detail-list">
                        <div class="detail-row">
                            <span class="label">Total invested</span>
                            <span class="amount positive" id="total-invested">\u20B90</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Estimated gains</span>
                            <span class="amount positive" id="estimated-returns">\u20B90</span>
                        </div>
                    </div>

                    <div class="calc-chart">
                        <canvas id="sipChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;
    resetSIPState();
}

async function calculateSIP(){
    const amountVal = validateInput("sip-amount", 0, false, 10000000); // Max 1 Cr
    const yearsVal = validateInput("sip-years", 0, false, 50); // Max 50 Years
    const returnVal = validateInput("sip-return", 0, true, 30); // Max 30%
    if (!amountVal || !yearsVal || !returnVal) return;

    const amount = document.getElementById("sip-amount").value;
    const years = document.getElementById("sip-years").value;
    const returnRate = document.getElementById("sip-return").value;

    const response = await fetch("/calculate_sip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amount, years: years, return_rate: returnRate })
    });

    const data = await response.json();

    document.getElementById("future-value").innerText = formatINR(data.future_value);
    document.getElementById("total-invested").innerText = formatINR(data.total_investment);
    document.getElementById("estimated-returns").innerText = formatINR(data.estimated_returns);
    document.querySelector(".sip-result-card .description").innerText = `After ${years} years at ${returnRate}% p.a.`;

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
                legend: {
                    labels: { color: "white" }
                }
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

    const userMessage = `SIP Calculation: ₹${amount} monthly for ${years} years at ${returnRate}%`;
    const botReply = `Estimated Future Value: ₹${data.future_value}`;

    fetch("/save-calculation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_message: userMessage, bot_reply: botReply })
    });
}

// Check stored theme on load
document.addEventListener("DOMContentLoaded", () => {
    const stored = localStorage.getItem("theme-mode");
    if (stored === "light") {
        document.body.classList.add("light-theme");
    }
});
