# FinBot AI — Conversational Financial Assistant

## Overview

FinBot AI is a conversational fintech web application built using Flask, JavaScript, Python, and MySQL. The project combines financial calculators, chatbot interaction, graphical analytics, database integration, and AI-ready architecture into a single intelligent dashboard.

The application currently supports:

* SIP Calculator
* EMI Calculator
* Lumpsum Calculator
* Brokerage Calculator
* Interactive financial graphs
* Conversational chatbot interface
* Dynamic dashboard navigation
* Backend API integration using Flask
* MySQL database integration
* Chat history storage system
* Financial calculation history tracking

The goal of the project is to create an AI-powered financial assistant capable of helping users calculate investments, analyze returns, store financial interactions, and provide intelligent financial suggestions.

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

* MySQL
* MySQL Workbench

## Tools & Libraries

* NLTK
* Regex (re)
* JSON
* Fetch API
* mysql-connector-python
* python-dotenv
* Git & GitHub

---

# Project Structure

```text
FINANCE-CHATBOT/
│
├── Calculators/
│   ├── sip.py
│   ├── emi.py
│   ├── lumpsum.py
│   └── brokerage.py
│
├── static/
│   ├── script.js
│   ├── style.css
│   └── images/
│
├── templates/
│   └── index.html
│
├── venv/
│
├── .env
├── .env.example
├── .gitignore
│
├── app.py
├── database.py
├── mysql_test.py
├── view_chats.py
├── requirements.txt
└── README.md
```
---

# Setup Instructions

## 1. Clone Repository

git clone https://github.com/SHIVANGI-2006/FinBot-AI.git

---

## 2. Open Project Folder

cd FinBot-AI

---

## 3. Create Virtual Environment

python -m venv venv

---

## 4. Activate Virtual Environment

### Windows

venv\Scripts\activate

### Mac/Linux

source venv/bin/activate

---

## 5. Install Dependencies

pip install -r requirements.txt

---

# MySQL Database Setup

## 1. Open MySQL Workbench

Create a new database:

CREATE DATABASE finbot_ai;

---

## 2. Use Database

USE finbot_ai;

---

## 3. Create Chat History Table

CREATE TABLE chat_history (

```
id INT AUTO_INCREMENT PRIMARY KEY,

user_message TEXT,

bot_reply TEXT
```

);

---

## 4. Configure Database Credentials

Update MySQL credentials inside:

database.py

---

# Environment Variables

Create a `.env` file using `.env.example`

Example:

FLASK_ENV=development

SECRET_KEY=your_secret_key_here

MYSQL_HOST=localhost

MYSQL_USER=root

MYSQL_PASSWORD=your_mysql_password

MYSQL_DATABASE=finbot_ai

---

# Run Flask Server

python app.py

---

# Backend Server

Flask backend runs at:

http://127.0.0.1:5000

---

# Frontend Access

Open browser and visit:

http://127.0.0.1:5000

The frontend is rendered using Flask templates.

---

# Example Questions for Chatbot

Users can interact with FinBot AI using conversational queries such as:

* Calculate SIP for 5000 monthly for 10 years at 12%
* Calculate EMI for 500000 loan for 5 years at 8%
* Calculate lumpsum for 100000 at 12% for 10 years
* Calculate brokerage for 100000 at 0.5%

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
* MySQL database integration
* Chat history storage
* Financial calculation tracking
* Virtual environment setup
* Modular calculator architecture

---

# Future Scope

Future versions of FinBot AI will include:

* AI-powered investment recommendations
* Machine Learning prediction models
* NLP-based intent detection
* Personalized finance insights
* User authentication system
* Categorized chat history
* Stock market API integration
* Real-time financial news
* Voice-enabled finance assistant
* Portfolio risk analysis
* Advanced analytics dashboard
* Cloud deployment using Render

---

# Developed By

Shivangi Kushwaha
