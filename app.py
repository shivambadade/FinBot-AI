from flask import Flask, render_template, request, jsonify
import nltk

from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

nltk.download('punkt')
nltk.download('stopwords')


app = Flask(__name__)

@app.route('/')
def home():

    return render_template("index.html")

# CHATBOT API

@app.route('/chat', methods=['POST'])

def chat():

    user_message = request.json['message']
    message = user_message.lower()


    words = word_tokenize(message)

    stop_words = set(stopwords.words('english'))

    filtered_words = []


    for word in words:

        if word not in stop_words:

            filtered_words.append(word)


    print(filtered_words)

    # KEYWORDS

    sip_keywords = [

        "sip",
        "investment",
        "monthly",
        "returns"
    ]

    emi_keywords = [

        "emi",
        "loan",
        "interest"
    ]

    brokerage_keywords = [

        "brokerage",
        "trading",
        "stocks"
    ]

    lumpsum_keywords = [

        "lumpsum",
        "deposit"
    ]

    greeting_keywords = [

        "hello",
        "hi",
        "hey"
    ]


    # INTENT DETECTION

    if any(word in filtered_words for word in sip_keywords):

        bot_reply = """
Sure! I can help you with SIP calculations.

Please provide:
• Monthly investment amount
• Expected annual return
• Investment duration
"""


    elif any(word in filtered_words for word in emi_keywords):

        bot_reply = """
Sure! I can help you with EMI calculations.

Please provide:
• Loan amount
• Interest rate
• Loan duration
"""


    elif any(word in filtered_words for word in brokerage_keywords):

        bot_reply = """
Sure! I can help you with Brokerage calculations.

Please provide:
• Trading amount
• Quantity
• Buy/Sell details
"""


    elif any(word in filtered_words for word in lumpsum_keywords):

        bot_reply = """
Sure! I can help you with Lumpsum calculations.

Please provide:
• Investment amount
• Expected annual return
• Investment duration
"""


    elif any(word in filtered_words for word in greeting_keywords):

        bot_reply = "Hello! I'm FinBot AI."


    else:

        bot_reply = """
Sorry, I could not understand your request.

You can ask about:
• SIP
• EMI
• Lumpsum
• Brokerage
"""


    return jsonify({

        "reply": bot_reply
    })


# RUN FLASK

app.run(debug=True)