let sipChart;

async function sendMessage() {

    let input = document.getElementById("user-input");

    let message = input.value;

    if(message.trim() === "") {

        return;
    }


    let chatBox = document.getElementById("chat-box");


    // SHOW USER MESSAGE

    chatBox.innerHTML += `

        <div style="
            text-align:right;
            margin-top:15px;
        ">

            <div style="
                background:#22c55e;
                display:inline-block;
                padding:15px;
                border-radius:15px;
                color:white;
                max-width:70%;
            ">

                ${message}

            </div>

        </div>
    `;



    // SEND MESSAGE TO FLASK

    let response = await fetch('/chat', {

        method: 'POST',

        headers: {

            'Content-Type': 'application/json'
        },

        body: JSON.stringify({

            message: message
        })
    });



    // RECEIVE RESPONSE

    let data = await response.json();



    // SHOW BOT MESSAGE

    chatBox.innerHTML += `

        <div style="
            margin-top:15px;
        ">

            <div style="
                background:#1e293b;
                display:inline-block;
                padding:15px;
                border-radius:15px;
                color:white;
                max-width:70%;
            ">

                ${data.reply.replace(/\n/g, "<br>")}

            </div>

        </div>
    `;


    input.value = "";

    chatBox.scrollTop = chatBox.scrollHeight;
}



/* ENTER KEY SUPPORT */

document.getElementById("user-input")

.addEventListener("keypress", function(event) {

    if(event.key === "Enter") {

        sendMessage();
    }
});


function openSIPPanel(){

    setActiveTab("sip-tab");

    document.getElementById(
    "dashboard-home"
    ).style.display = "none";

    document.getElementById(
    "main-content"
    ).innerHTML = "";

    document.getElementById("chat-box").style.display = "none";

    document.querySelector(".input-area").style.display = "none";

    const panel = document.getElementById("dynamic-panel");


    panel.innerHTML = `

    <div class="sip-panel">

        <div class="sip-top">

            <h1>SIP Calculator</h1>

            <p>
                Plan your future wealth with monthly investing.
            </p>

        </div>


        <div class="sip-grid">


            <div class="sip-input-card">

                <h3>Monthly SIP Amount</h3>

                <input
                    type="number"
                    id="sip-amount"
                    placeholder="Enter monthly investment"
                >


                <h3>Investment Tenure (Years)</h3>

                <input
                    type="number"
                    id="sip-years"
                    placeholder="Enter number of years"
                >


                <h3>Expected Return (%)</h3>

                <input
                    type="number"
                    id="sip-return"
                    placeholder="Enter annual return"
                >


                <button
                    class="calculate-btn"
                    onclick="calculateSIP()"
                >

                    Calculate SIP

                </button>

            </div>



            <div class="sip-result-card">

                <h2>Projected Wealth</h2>

                <h1 id="future-value">

                    ₹0

                </h1>


                <p>
                    Estimated future value of your SIP investment.
                </p>


                <div class="result-boxes">


                    <div class="result-box">

                        <h4>Total Invested</h4>

                        <p id="total-invested">

                            ₹0

                        </p>

                    </div>



                    <div class="result-box">

                        <h4>Estimated Returns</h4>

                        <p id="estimated-returns">

                            ₹0

                        </p>

                    </div>

                </div>

                <canvas id="sipChart"></canvas>

            </div>

        </div>

    </div>

    `;
}

// SIP CALCULATION LOGIC ...

async function calculateSIP(){

    const amount =
        document.getElementById("sip-amount").value;

    const years =
        document.getElementById("sip-years").value;

    const returnRate =
        document.getElementById("sip-return").value;


    const response = await fetch("/calculate_sip", {

        method: "POST",

        headers: {

            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            amount: amount,

            years: years,

            return_rate: returnRate
        })
    });



    const data = await response.json();



    document.getElementById(
        "future-value"
    ).innerText =
        "₹" + Number(
            data.future_value
        ).toLocaleString("en-IN");



    document.getElementById(
        "total-invested"
    ).innerText =
        "₹" + Number(
            data.total_investment
        ).toLocaleString("en-IN");



    document.getElementById(
        "estimated-returns"
    ).innerText =
        "₹" + Number(
            data.estimated_returns
        ).toLocaleString("en-IN");



    const ctx = document.getElementById("sipChart");

if(sipChart){

    sipChart.destroy();
}

let yearlyData = [];

let investedData = [];

let labels = [];

for(let i = 1; i <= years; i++){

    let yearlyInvestment =
        amount * 12 * i;

    let yearlyValue =
        yearlyInvestment *
        Math.pow(
            (1 + returnRate / 100),
            i
        );

    labels.push("Year " + i);

    investedData.push(
        yearlyInvestment.toFixed(0)
    );

    yearlyData.push(
        yearlyValue.toFixed(0)
    );
}

sipChart = new Chart(ctx, {

    type: "line",

    data: {

        labels: labels,

        datasets: [

            {

                label: "Invested Amount",

                data: investedData,

                borderColor: "#3b82f6",

                backgroundColor:
                    "rgba(59,130,246,0.1)",

                tension: 0.4,

                fill: true,

                borderWidth: 3,

                pointRadius: 4
            },

            {

                label: "Future Value",

                data: yearlyData,

                borderColor: "#00ff88",

                backgroundColor:
                    "rgba(0,255,136,0.15)",

                tension: 0.4,

                fill: true,

                borderWidth: 4,

                pointRadius: 5
            }
        ]
    },

    options: {

        responsive: true,

        plugins: {

            legend: {

                labels: {

                    color: "white"
                }
            }
        },

        scales: {

            x: {

                ticks: {

                    color: "white"
                },

                grid: {

                    color:
                        "rgba(255,255,255,0.08)"
                }
            },

            y: {

                ticks: {

                    color: "white"
                },

                grid: {

                    color:
                        "rgba(255,255,255,0.08)"
                }
            }
        }
        
        
    }
});

// SAVE SIP CALCULATION TO DATABASE

const userMessage =
`SIP Calculation: ₹${amount} monthly for ${years} years at ${returnRate}%`;

const botReply =
`Estimated Future Value: ₹${data.future_value}`;

fetch("/save-calculation", {

    method: "POST",

    headers: {

        "Content-Type": "application/json"

    },

    body: JSON.stringify({

        user_message: userMessage,

        bot_reply: botReply

    })

});

}

function openDashboard(){

    setActiveTab("dashboard-tab");

    document.getElementById(
        "dashboard-home"
    ).style.display = "block";


    document.getElementById(
        "chat-box"
    ).style.display = "block";


    document.querySelector(
        ".input-area"
    ).style.display = "flex";


    document.getElementById(
        "dynamic-panel"
    ).innerHTML = "";


    document.getElementById(
        "chat-box"
    ).innerHTML = `

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

function openEMIPanel(){

    setActiveTab("emi-tab");

    document.getElementById(
        "dashboard-home"
    ).style.display = "none";

    document.getElementById(
    "main-content"
    ).innerHTML = "";

    const panel =
    document.getElementById(
        "dynamic-panel"
    );

    panel.innerHTML = `

    <div class="sip-panel">

        <div class="sip-top">

            <h1>EMI Calculator</h1>

            <p>
                Calculate monthly loan payments easily.
            </p>

        </div>

        <div class="sip-grid">

            <div class="sip-input-card">

                <h3>Loan Amount</h3>

                <input
                    type="number"
                    id="emi-loan"
                    placeholder="Enter loan amount"
                >

                <h3>Interest Rate (%)</h3>

                <input
                    type="number"
                    id="emi-rate"
                    placeholder="Enter annual interest"
                >

                <h3>Loan Tenure (Years)</h3>

                <input
                    type="number"
                    id="emi-years"
                    placeholder="Enter loan years"
                >

                <button
                    class="calculate-btn"
                    onclick="calculateEMI()"
                >
                    Calculate EMI
                </button>

            </div>

            <div class="sip-result-card">

                <h2>Monthly EMI</h2>

                <h1 id="emi-result">
                    ₹0
                </h1>

                <p>
                    Estimated monthly loan payment.
                </p>

                <div class="result-boxes">

                    <div class="result-box">

                        <h4>Total Payment</h4>

                        <p id="total-payment">
                            ₹0
                        </p>

                    </div>

                    <div class="result-box">

                        <h4>Total Interest</h4>

                        <p id="total-interest">
                            ₹0
                        </p>

                    </div>

                </div>

                <canvas id="emiChart"></canvas>

            </div>

        </div>

    </div>

    `;
}

let emiChart;

async function calculateEMI(){

    const loan =
    document.getElementById(
        "emi-loan"
    ).value;

    const rate =
    document.getElementById(
        "emi-rate"
    ).value;

    const years =
    document.getElementById(
        "emi-years"
    ).value;

    const response = await fetch(
        "/calculate_emi",
        {
            method: "POST",

            headers: {
                "Content-Type":
                "application/json"
            },

            body: JSON.stringify({

                loan: loan,
                rate: rate,
                years: years

            })
        }
    );

    const data = await response.json();

    console.log(data);

    document.getElementById(
        "emi-result"
    ).innerText =
    "₹" +
    Number(data.monthly_emi)
    .toLocaleString("en-IN");

    document.getElementById(    
        "total-payment"
    ).innerText =
    "₹" +
    Number(data.total_payment)
    .toLocaleString("en-IN");

    document.getElementById(
        "total-interest"
    ).innerText =
    "₹" +
    Number(data.total_interest)
    .toLocaleString("en-IN");

    const ctx =
    document.getElementById(
        "emiChart"
    );

    if(emiChart){
        emiChart.destroy();
    }

    emiChart = new Chart(ctx, {

        type: "doughnut",

        data: {

            labels: [
                "Principal",
                "Interest"
            ],

            datasets: [{

                data: [
                    loan,
                    data.total_interest
                ],

                backgroundColor: [
                    "#00f7ff",
                    "#8b5cf6"
                ],

                borderWidth: 2

            }]
        },

        options: {

            plugins: {

                legend: {

                    labels: {

                        color: "white",

                        font: {
                            size: 14
                        }

                    }
                }
            }
        }
    });

    // SAVE EMI CALCULATION TO DATABASE

const userMessage =
`EMI Calculation: ₹${loan} loan for ${years} years at ${rate}%`;

const botReply =
`Monthly EMI: ₹${data.monthly_emi}`;

fetch("/save-calculation", {

    method: "POST",

    headers: {

        "Content-Type": "application/json"

    },

    body: JSON.stringify({

        user_message: userMessage,

        bot_reply: botReply

    })

});

}

function openLumpsumPanel(){

    setActiveTab("lumpsum-tab");

    document.getElementById(
        "dashboard-home"
    ).style.display = "none";

    const panel =
    document.getElementById(
        "dynamic-panel"
    );

    panel.innerHTML = `

    <div class="sip-panel">

        <div class="sip-top">

            <h1>Lumpsum Calculator</h1>

            <p>
                Calculate one-time investment growth.
            </p>

        </div>

        <div class="sip-grid">

            <div class="sip-input-card">

                <h3>Investment Amount</h3>

                <input
                    type="number"
                    id="lump-amount"
                    placeholder="Enter investment amount"
                >

                <h3>Expected Return (%)</h3>

                <input
                    type="number"
                    id="lump-rate"
                    placeholder="Enter annual return"
                >

                <h3>Investment Years</h3>

                <input
                    type="number"
                    id="lump-years"
                    placeholder="Enter investment years"
                >

                <button
                    class="calculate-btn"
                    onclick="calculateLumpsum()"
                >
                    Calculate Lumpsum
                </button>

            </div>

            <div class="sip-result-card">

                <h2>Future Value</h2>

                <h1 id="lump-future">
                    ₹0
                </h1>

                <p>
                    Estimated future investment value.
                </p>

                <div class="result-boxes">

                    <div class="result-box">

                        <h4>Invested Amount</h4>

                        <p id="lump-invested">
                            ₹0
                        </p>

                    </div>

                    <div class="result-box">

                        <h4>Total Returns</h4>

                        <p id="lump-returns">
                            ₹0
                        </p>

                    </div>

                </div>

                <canvas id="lumpsumChart"></canvas>

            </div>

        </div>

    </div>

    `;
}

let lumpsumChart;

async function calculateLumpsum(){

    const amount =
    document.getElementById(
        "lump-amount"
    ).value;

    const rate =
    document.getElementById(
        "lump-rate"
    ).value;

    const years =
    document.getElementById(
        "lump-years"
    ).value;

    const response = await fetch(
        "/calculate_lumpsum",
        {

            method: "POST",

            headers: {

                "Content-Type":
                "application/json"

            },

            body: JSON.stringify({

                amount: amount,
                rate: rate,
                years: years

            })

        }
    );

    const data =
    await response.json();

    document.getElementById(
        "lump-future"
    ).innerText =
    "₹" +
    Number(data.future_value)
    .toLocaleString("en-IN");

    document.getElementById(
        "lump-invested"
    ).innerText =
    "₹" +
    Number(data.invested_amount)
    .toLocaleString("en-IN");

    document.getElementById(
        "lump-returns"
    ).innerText =
    "₹" +
    Number(data.estimated_returns)
    .toLocaleString("en-IN");

    const ctx =
    document.getElementById(
        "lumpsumChart"
    );

    if(lumpsumChart){
        lumpsumChart.destroy();
    }

    lumpsumChart = new Chart(ctx, {

        type: "bar",

        data: {

            labels: [

                "Invested",

                "Returns",

                "Future Value"

            ],

            datasets: [{

                label:
                "Lumpsum Growth",

                data: [

                    data.invested_amount,

                    data.estimated_returns,

                    data.future_value

                ],

                backgroundColor: [

                    "#00f7ff",

                    "#8b5cf6",

                    "#00ff88"

                ],

                borderRadius: 10

            }]
        },

        options: {

            plugins: {

                legend: {

                    labels: {

                        color: "white"

                    }
                }
            },

            scales: {

                x: {

                    ticks: {

                        color: "white"
                    },

                    grid: {

                        color:
                        "rgba(255,255,255,0.1)"
                    }
                },

                y: {

                    ticks: {

                        color: "white"
                    },

                    grid: {

                        color:
                        "rgba(255,255,255,0.1)"
                    }
                }
            }
        }
    });

    // SAVE LUMPSUM CALCULATION TO DATABASE

const userMessage =
`Lumpsum Calculation: ₹${amount} invested for ${years} years at ${rate}%`;

const botReply =
`Estimated Future Value: ₹${data.future_value}`;

fetch("/save-calculation", {

    method: "POST",

    headers: {

        "Content-Type": "application/json"

    },

    body: JSON.stringify({

        user_message: userMessage,

        bot_reply: botReply

    })

});

}

function openBrokeragePanel(){

    setActiveTab("brokerage-tab");

    document.getElementById(
        "dashboard-home"
    ).style.display = "none";

    const panel =
    document.getElementById(
        "dynamic-panel"
    );

    panel.innerHTML = `

    <div class="sip-panel">

        <div class="sip-top">

            <h1>Brokerage Calculator</h1>

            <p>
                Analyze stock trading charges and profit.
            </p>

        </div>

        <div class="sip-grid">

            <div class="sip-input-card">

                <h3>Buy Price</h3>

                <input
                    type="number"
                    id="buy-price"
                    placeholder="Enter buy price"
                >

                <h3>Sell Price</h3>

                <input
                    type="number"
                    id="sell-price"
                    placeholder="Enter sell price"
                >

                <h3>Quantity</h3>

                <input
                    type="number"
                    id="quantity"
                    placeholder="Enter quantity"
                >

                <h3>Brokerage (%)</h3>

                <input
                    type="number"
                    id="brokerage-percent"
                    placeholder="Enter brokerage percent"
                >

                <button
                    class="calculate-btn"
                    onclick="calculateBrokerage()"
                >
                    Calculate Brokerage
                </button>

            </div>

            <div class="sip-result-card">

                <h2>Net Profit</h2>

                <h1 id="net-profit">
                    ₹0
                </h1>

                <p>
                    Estimated trading profit after charges.
                </p>

                <div class="result-boxes">

                    <div class="result-box">

                        <h4>Total Charges</h4>

                        <p id="total-charges">
                            ₹0
                        </p>

                    </div>

                    <div class="result-box">

                        <h4>Gross Profit</h4>

                        <p id="gross-profit">
                            ₹0
                        </p>

                    </div>

                </div>

                <canvas id="brokerageChart"></canvas>

            </div>

        </div>

    </div>

    `;
}

let brokerageChart;

async function calculateBrokerage(){

    const buyPrice =
    document.getElementById(
        "buy-price"
    ).value;

    const sellPrice =
    document.getElementById(
        "sell-price"
    ).value;

    const quantity =
    document.getElementById(
        "quantity"
    ).value;

    const brokeragePercent =
    document.getElementById(
        "brokerage-percent"
    ).value;

    const response = await fetch(
        "/calculate_brokerage",
        {

            method: "POST",

            headers: {

                "Content-Type":
                "application/json"

            },

            body: JSON.stringify({

                buy_price: buyPrice,

                sell_price: sellPrice,

                quantity: quantity,

                brokerage_percent:
                brokeragePercent

            })

        }
    );

    const data =
    await response.json();

    document.getElementById(
        "net-profit"
    ).innerText =
    "₹" +
    Number(data.net_profit)
    .toLocaleString("en-IN");

    document.getElementById(
        "gross-profit"
    ).innerText =
    "₹" +
    Number(data.gross_profit)
    .toLocaleString("en-IN");

    document.getElementById(
        "total-charges"
    ).innerText =
    "₹" +
    Number(data.brokerage)
    .toLocaleString("en-IN");

    const ctx =
    document.getElementById(
        "brokerageChart"
    );

    if(brokerageChart){
        brokerageChart.destroy();
    }

    brokerageChart = new Chart(ctx, {

        type: "pie",

        data: {

            labels: [

                "Net Profit",

                "Brokerage Charges"

            ],

            datasets: [{

                data: [

                    data.net_profit,

                    data.brokerage

                ],

                backgroundColor: [

                    "#00ff88",

                    "#ff4d6d"

                ],

                borderWidth: 2

            }]
        },

        options: {

            plugins: {

                legend: {

                    labels: {

                        color: "white",

                        font: {
                            size: 14
                        }

                    }
                }
            }
        }
    });

    // SAVE BROKERAGE CALCULATION TO DATABASE

const userMessage =
`Brokerage Calculation: Buy ₹${buyPrice}, Sell ₹${sellPrice}, Quantity ${quantity}, Brokerage ${brokeragePercent}%`;

const botReply =
`Net Profit: ₹${data.net_profit}`;

fetch("/save-calculation", {

    method: "POST",

    headers: {

        "Content-Type": "application/json"

    },

    body: JSON.stringify({

        user_message: userMessage,

        bot_reply: botReply

    })

});

}

function setActiveTab(tabId){

    const tabs =
        document.querySelectorAll(
            ".menu-item"
        );

    tabs.forEach(tab => {
        tab.classList.remove("active");
    });

    document.getElementById(
        tabId
    ).classList.add("active");

}



function openHistoryPanel(){

    setActiveTab("history-tab");

    document.getElementById(
        "dashboard-home"
    ).style.display = "none";

    document.getElementById(
        "main-content"
    ).innerHTML = "";

    const panel =
        document.getElementById(
            "dynamic-panel"
        );

    panel.innerHTML = `

        <div class="history-panel">

            <h1>Chat History</h1>

            <p>
                Your previous conversations
                will appear here.
            </p>

            <div class="history-box">

                <p>No chat history yet.</p>

            </div>

        </div>

    `;

}

async function openHistory() {

    const panel =
    document.getElementById(
        "dynamic-panel"
    );

    document.getElementById(
        "dashboard-home"
    ).style.display = "none";

    const response =
    await fetch("/history");

    const data =
    await response.json();

    let html = `

        <h1 style="
            color:white;
            margin-bottom:20px;
        ">
            Chat History
        </h1>

    `;

    data.history.forEach(chat => {

        html += `

            <div style="
                background:#16213e;
                padding:20px;
                border-radius:15px;
                margin-bottom:20px;
                color:white;
            ">

                <h3>You:</h3>

                <p>${chat[0]}</p>

                <br>

                <h3>FinBot AI:</h3>

                <p>${chat[1]}</p>

            </div>

        `;

    });

    panel.innerHTML = html;
}

function openSettingsPanel(){

    setActiveTab("settings-tab");

    document.getElementById(
        "dashboard-home"
    ).style.display = "none";

    document.getElementById(
        "main-content"
    ).innerHTML = "";

    const panel =
        document.getElementById(
            "dynamic-panel"
        );

    panel.innerHTML = `

        <div class="settings-panel">

            <h1>Settings</h1>

            <p>
                Customize your FinBot AI
                dashboard settings.
            </p>

            <div class="settings-box">

                <p>Theme Mode</p>

                <button class="calculate-btn">
                    Dark Theme
                </button>

            </div>

        </div>

    `;

}
