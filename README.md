# FinBot AI 

---

## Overview

FinBot AI is a Conversational Financial Chatbot developed using Flask, Python, NLP, and SQLite.

The application combines a fintech dashboard with an intelligent chatbot capable of handling financial calculations such as SIP, EMI, Lumpsum, and Brokerage calculations through natural language conversations.

The chatbot uses NLP preprocessing and intent detection to understand user queries and provide conversational financial responses.

---

## Features

- Conversational Financial Chatbot
- SIP Calculator
- EMI Calculator
- Lumpsum Calculator
- Brokerage Calculator
- NLP-based Intent Detection
- SQLite Database Integration
- Chat History Storage
- Interactive Fintech Dashboard UI
- Human-like Conversational Responses
- Modular Backend Architecture

---

## Tech Stack

- Python
- Flask
- HTML
- CSS
- JavaScript
- NLTK
- SQLite
- Git & GitHub

---

## Project Structure

Finance-Chatbot/

│── Calculators/
│   ├── sip.py
│   ├── emi.py
│   ├── lumpsum.py
│   └── brokerage.py
│
│── static/
│   ├── style.css
│   ├── script.js
│   └── images/
│
│── templates/
│   └── index.html
│
│── app.py
│── database.py
│── view_chats.py
│── requirements.txt
│── README.md
│── .gitignore
│── .env

---

## Installation & Setup

### Clone Repository

git clone https://github.com/SHIVANGI-2006/FinBot-AI

### Move Into Project Folder

cd FinBot-AI

### Install Dependencies

pip install -r requirements.txt

### Run Database Initialization

python database.py

### Run Flask Application

python app.py

---
## Example Queries

- Calculate SIP for 5000 monthly for 10 years at 12%
- Calculate EMI for 500000 loan for 5 years at 8%
- Calculate lumpsum for 100000 at 12% for 10 years
- Calculate brokerage for 100000 at 0.5%

---

## NLP Workflow

The chatbot performs:

1. Tokenization
2. Stopword Removal
3. Intent Detection
4. Conversational Response Generation

The detected intent is mapped to the appropriate financial calculator module.

---

## Database Integration

SQLite database is used to store:

- User Messages
- Chatbot Replies
- Conversation History

The chat history is stored in:

finbot.db

---

## Future Enhancements

- Graphical Financial Outputs
- Mobile Responsive Design
- Advanced NLP Models
- OpenAI API Integration
- Financial Recommendation System
- Investment Analytics Dashboard

---

## Developed by : 

Shivangi Kushwaha