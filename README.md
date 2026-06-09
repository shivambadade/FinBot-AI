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

### Frontend
* HTML5 & CSS3 (Neon Fintech Theme)
* JavaScript (ES6+)
* Chart.js (Data Visualization)

### Backend
* Python 3
* Flask (Web Framework)
* NLTK (Natural Language Toolkit)
* Scikit-Learn (Intent Classification)

### Database
* MySQL

---

## Project Structure

```text
FinBot-AI/
├── Calculators/
│   ├── sip.py
│   ├── emi.py
│   ├── lumpsum.py
│   └── brokerage.py
├── ml/
│   ├── intent_model.pkl
│   └── vectorizer.pkl
├── static/
│   ├── script.js
│   ├── style.css
│   └── images/
├── templates/
│   └── index.html
├── .env.example
├── .gitignore
├── app.py
├── database.py
├── mysql_test.py
├── view_chats.py
├── requirements.txt
└── README.md
```

---

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/SHIVANGI-2006/FinBot-AI.git
cd FinBot-AI
```

### 2. Create and Activate Virtual Environment
```bash
# Create environment
python -m venv .venv

# Activate on Windows
.venv\Scripts\activate

# Activate on Mac/Linux
source .venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Database Setup
Ensure you have MySQL running. Create the database and table:

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

### 5. Environment Variables
Create a `.env` file in the root directory using the template below:

```env
FLASK_ENV=development
SECRET_KEY=your_secret_key_here
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=finbot_ai
```

### 6. Run the Application
```bash
python app.py
```
Open your browser and navigate to `http://127.0.0.1:5000`.

---

## Chatbot Interaction Examples

You can interact with the chatbot in the UI using natural queries:
* *"Calculate SIP for 5000 monthly for 10 years at 12%"*
* *"Calculate EMI for 500000 loan for 5 years at 8%"*
* *"Calculate lumpsum for 100000 at 12% for 10 years"*
* *"Calculate brokerage for 100000 buy and 110000 sell with 100 shares at 0.05%"*

---

## Future Scope

* AI-powered personalized investment recommendations.
* Real-time stock market API integrations.
* User authentication and personalized portfolios.
* Categorized chat history & exports.
* Voice-enabled finance assistant.

---

## Developed By
* **Shivangi Kushwaha**
