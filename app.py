from flask import Flask, render_template, request, jsonify
import nltk
import re


from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from Calculators.sip import calculate_sip
from Calculators.emi import calculate_emi

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


    # SIP

    if any(word in filtered_words for word in sip_keywords):

        numbers = re.findall(r'\d+', message)


        if len(numbers) >= 3:

            monthly_investment = int(numbers[0])

            years = int(numbers[1])

            annual_rate = int(numbers[2])


            result = calculate_sip(

                monthly_investment,

                annual_rate,

                years
            )


            bot_reply = f"""

Future Value: ₹{result['future_value']}

Total Investment: ₹{result['total_investment']}

Estimated Returns: ₹{result['estimated_returns']}
"""


        else:

            bot_reply = """

Please provide:
• Monthly investment
• Years
• Expected return rate
"""


# EMI

    # EMI

    elif any(word in filtered_words for word in emi_keywords):

        numbers = re.findall(r'\d+', message)


        if len(numbers) >= 3:

            loan_amount = int(numbers[0])

            years = int(numbers[1])

            annual_rate = int(numbers[2])


            result = calculate_emi(

                loan_amount,

                annual_rate,

                years
            )


            bot_reply = f"""

Monthly EMI: ₹{result['monthly_emi']}

Total Payment: ₹{result['total_payment']}

Total Interest: ₹{result['total_interest']}
"""


        else:

            bot_reply = """

Please provide:
• Loan amount
• Years
• Interest rate
"""

# Brokerage

    elif any(word in filtered_words for word in brokerage_keywords):

        bot_reply = """
Sure! I can help you with Brokerage calculations.

Please provide:
• Trading amount
• Quantity
• Buy/Sell details
"""

# Lumpsum

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