# FinBot AI — Conversational Financial Assistant

## Overview

FinBot AI is a conversational fintech web application built using Flask, JavaScript, Python, and MySQL. The project combines financial calculators, chatbot interaction, graphical analytics, database integration, and AI-ready architecture into a single intelligent dashboard.

The application currently supports:
* **SIP Calculator**: Calculate Systematic Investment Plan returns.
* **EMI Calculator**: Calculate Equated Monthly Installments for loans.
* **Lumpsum Calculator**: Calculate compound interest on one-time investments.
* **Brokerage Calculator**: Calculate equity trading brokerage and net profit/loss.
* **Interactive Financial Graphs**: Powered by Chart.js for data visualization.
* **Conversational Chatbot Interface**: Preprocessing via NLTK and intent classification via machine learning (scikit-learn).
* **Dynamic Dashboard Navigation**: Clean, modern glassmorphic UI.
* **Database Integration**: MySQL backend for storing chat history and tracking calculation logs.

---

## Tech Stack
# FinBot AI — Conversational Financial Assistant

## Overview

FinBot AI is a conversational fintech web application built using Flask, Python, JavaScript and a MySQL backend. The app combines financial calculators, a conversational chatbot, and interactive visualizations into a single dashboard designed for exploration and simple financial planning.

The application currently includes:

- SIP Calculator — Calculate Systematic Investment Plan returns.
- EMI Calculator — Compute Equated Monthly Installments for loans.
- Lumpsum Calculator — Compute compound-growth for one-time investments.
- Brokerage Calculator — Compute brokerage, taxes and net profit/loss for equity trades.
- Interactive graphs powered by Chart.js.
- Conversational chatbot powered by NLTK preprocessing and a pre-trained scikit-learn intent model.
- MySQL integration for storing chat history and calculation logs.

---

## Tech Stack

### Frontend
- HTML5 & CSS3 (custom fintech theme)
- JavaScript (ES6+)
- Chart.js

### Backend
- Python 3
- Flask
- NLTK
- scikit-learn

### Database
- MySQL

---

## Project Structure

Below is the actual project structure detected in the workspace. Files and folders reflect the current repository layout.

```text
FinBot-AI/
├── .agents/
├── .env
├── .env.example
├── .git/
├── .gitignore
├── app.py
├── Calculators/
│   ├── brokerag e.py
│   ├── emi.py
│   ├── lumpsum.py
│   └── sip.py
├── database.py
├── ml/
│   ├── intent_model.pkl
│   ├── intents_dataset.csv
│   ├── recommendation_dataset.csv
│   ├── recommendation_encoder.pkl
│   ├── recommendation_model.pkl
│   ├── train_model.py
│   ├── train_recommendation_model.py
│   ├── type_encoder.pkl
│   └── vectorizer.pkl
├── mysql_test.py
├── README.md
├── requirements.txt
├── static/
│   ├── images/
│   ├── script.js
│   └── style.css
├── templates/
│   └── index.html
├── venv/
├── view_chats.py
└── __pycache__/
```

Note: There is a local `venv/` directory in the workspace — this is a local virtual environment and is typically excluded from source control.

---

## Setup Instructions

1. Clone the repository

```bash
git clone https://github.com/SHIVANGI-2006/FinBot-AI.git
cd FinBot-AI
```

2. Create and activate a virtual environment

```bash
python -m venv .venv
# Windows
.\venv\Scripts\Activate
# macOS / Linux
source .venv/bin/activate
```

3. Install dependencies

```bash
pip install -r requirements.txt
```

4. Database setup

Make sure MySQL is running and create a database and `chat_history` table. Example SQL:

```sql
CREATE DATABASE finbot_ai;
USE finbot_ai;

CREATE TABLE chat_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_message TEXT,
    bot_reply TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

5. Configure environment variables

Copy `.env.example` to `.env` and update database credentials and `SECRET_KEY` as needed.

6. Run the app

```bash
python app.py
```

Open `http://127.0.0.1:5000` in your browser.

---

## Usage Examples

Sample queries you can type in the chat or use via UI:

- "Calculate SIP: 5000 monthly for 10 years at 12%"
- "Calculate EMI: 500000 loan for 5 years at 8%"
- "Calculate lumpsum: 100000 at 12% for 10 years"
- "Brokerage: buy at 100, sell at 110, qty 100, brokerage 0.05%"

---

## Notes

- Calculator implementations reside in the `Calculators/` folder and are reused by the chat route and API endpoints.
- Pretrained models and training artifacts live in `ml/`.
- UI assets and logic are in `static/` and `templates/index.html`.
- No external market data APIs are currently integrated.

---

## Author

- **Shivangi Kushwaha**
