# FinBot AI — Conversational Financial Assistant

## Overview

FinBot AI is a conversational fintech web application built using Flask, JavaScript, and Python.
The project combines financial calculators, chatbot interaction, graphical analytics, and AI-ready architecture into a single intelligent dashboard.

The application currently supports:

* SIP Calculator
* EMI Calculator
* Lumpsum Calculator
* Brokerage Calculator
* Interactive financial graphs
* Conversational chatbot interface
* Dynamic dashboard navigation
* Backend API integration using Flask

The goal of the project is to create an AI-powered finance assistant capable of helping users calculate investments, analyze returns, and receive intelligent financial suggestions.

---

# Tech Stack

## Frontend

* HTML5
* CSS3
* JavaScript
* Chart.js

## Backend

* Python
* Flask

## Database

* SQLite

## Tools & Libraries

* NLTK
* Regex (re)
* JSON
* Fetch API
* Git & GitHub

---

# Project Structure

```bash
FINANCE-CHATBOT/
│
├── Calculators/
│   ├── sip.py
│   ├── emi.py
│   ├── lumpsum.py
│   ├── brokerage.py
│
├── static/
│   ├── script.js
│   ├── style.css
│   └── images/
│
├── templates/
│   └── index.html
│
├── app.py
├── database.py
├── finbot.db
├── requirements.txt
├── README.md
└── .env
```

---

# Setup Instructions

## 1. Clone Repository

```bash
git clone https://github.com/SHIVANGI-2006/FinBot-AI.git
```

---

## 2. Open Project Folder

```bash
cd FinBot-AI
```

---

## 3. Create Virtual Environment

```bash
python -m venv venv
```

---

## 4. Activate Virtual Environment

### Windows

```bash
venv\Scripts\activate
```

### Mac/Linux

```bash
source venv/bin/activate
```

---

## 5. Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 6. Run Flask Server

```bash
python app.py
```

---

# Backend Server

Flask backend runs at:

```bash
http://127.0.0.1:5000
```

---

# Frontend Access

Open browser and visit:

```bash
http://127.0.0.1:5000
```

The frontend is rendered using Flask templates.

---

# Example Questions for Chatbot

Users can interact with FinBot AI using conversational queries such as:

```text
Calculate SIP for 5000 monthly for 10 years at 12%

Calculate EMI for 500000 loan for 5 years at 8%

Calculate lumpsum for 100000 at 12% for 10 years

Calculate brokerage for 100000 at 0.5%
```

---

# Features Implemented

* Dynamic financial calculators
* Real-time graph generation
* Interactive dashboard UI
* Neon fintech theme
* Chatbot integration
* Backend API routes
* Responsive financial panels
* Financial result visualization

---

# Future Scope

Future versions of FinBot AI will include:

* AI-powered investment recommendations
* Machine Learning prediction models
* NLP-based intent detection
* Personalized finance insights
* User authentication system
* Chat history management
* Stock market API integration
* Real-time financial news
* Voice-enabled finance assistant
* Portfolio risk analysis
* Advanced analytics dashboard

---

## Developed by : 

Shivangi Kushwaha