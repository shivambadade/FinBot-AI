from flask import Flask, render_template, request, jsonify
import nltk
import re
import humanize
import sqlite3  


def save_chat(user_message, bot_reply):

    connection = sqlite3.connect("finbot.db")

    cursor = connection.cursor()

    cursor.execute(

        """

        INSERT INTO chat_history (

            user_message,

            bot_reply

        )

        VALUES (?, ?)

        """,

        (user_message, bot_reply)

    )

    connection.commit()

    connection.close()

def get_chat_history():

    connection = sqlite3.connect("finbot.db")

    cursor = connection.cursor()

    cursor.execute("""

        SELECT user_message, bot_reply

        FROM chat_history

        ORDER BY id DESC

    """)

    chats = cursor.fetchall()

    connection.close()

    return chats


from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from Calculators.sip import calculate_sip
from Calculators.emi import calculate_emi
from Calculators.lumpsum import calculate_lumpsum
from Calculators.brokerage import calculate_brokerage

nltk.download('punkt')
nltk.download('stopwords')


app = Flask(__name__)

@app.route("/history")

def history():

    chats = get_chat_history()

    return jsonify({
        "history": chats
    })

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

Based on your SIP investment plan:

• Monthly Investment: ₹{humanize.intcomma(monthly_investment)}

• Estimated Future Value: ₹{humanize.intcomma(round(result['future_value']))}

• Total Investment: ₹{humanize.intcomma(round(result['total_investment']))}

• Estimated Returns: ₹{humanize.intcomma(round(result['estimated_returns']))}

This SIP could help build strong long-term wealth through disciplined monthly investing.
"""


        else:

            bot_reply = """

Please provide:
• Monthly investment
• Years
• Expected return rate
"""


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


            bot_reply = response = f"""

Based on your EMI calculation:

• Monthly EMI: ₹{result['monthly_emi']}

• Total Payment: ₹{result['total_payment']}

• Total Interest: ₹{result['total_interest']}

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

        numbers = re.findall(r'\d+\.?\d*', message)


        if len(numbers) >= 2:

            trade_amount = float(numbers[0])

            brokerage_rate = float(numbers[1])


            result = calculate_brokerage(

                trade_amount,

                brokerage_rate
            )


            bot_reply = f"""

Based on your brokerage calculation:

• Gross Profit: ₹{result['gross_profit']}

• Brokerage Charges: ₹{result['brokerage']}

• Net Profit: ₹{result['net_profit']}

"""


        else:

            bot_reply = """

Please provide:
• Trade amount
• Brokerage percentage
"""

# Lumpsum

    elif any(word in filtered_words for word in lumpsum_keywords):

        numbers = re.findall(r'\d+', message)


        if len(numbers) >= 3:

            investment = int(numbers[0])

            annual_rate = int(numbers[1])

            years = int(numbers[2])


            result = calculate_lumpsum(

                investment,

                annual_rate,

                years
            )


            bot_reply = f"""

Based on your lumpsum investment:

• Initial Investment: ₹{humanize.intcomma(round(investment))}

• Estimated Future Value: ₹{humanize.intcomma(round(result['future_value']))}

• Estimated Returns: ₹{humanize.intcomma(round(result['estimated_returns']))}

This investment could grow significantly over the long term with consistent annual returns.
"""


        else:

            bot_reply = """

Please provide:
• Investment amount
• Expected return rate
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

    save_chat(message, bot_reply)

    return jsonify({

        "reply": bot_reply
    })


@app.route("/calculate_sip", methods=["POST"])

def calculate_sip_api():

    data = request.get_json()


    amount = float(data["amount"])

    years = float(data["years"])

    annual_return = float(data["return_rate"])


    result = calculate_sip(

        amount,

        annual_return,

        years
    )


    return jsonify({

        "future_value": result["future_value"],

        "total_investment": result["total_investment"],

        "estimated_returns": result["estimated_returns"]
    })

@app.route("/calculate_emi", methods=["POST"])
def emi_route():

    data = request.get_json()

    loan_amount = float(data["loan"])
    annual_rate = float(data["rate"])
    years = float(data["years"])

    result = calculate_emi(
        loan_amount,
        annual_rate,
        years
    )

    return jsonify(result)

@app.route("/calculate_lumpsum", methods=["POST"])
def lumpsum_route():

    data = request.get_json()

    amount = float(data["amount"])
    rate = float(data["rate"])
    years = float(data["years"])

    result = calculate_lumpsum(
        amount,
        rate,
        years
    )

    return jsonify(result)

@app.route("/calculate_brokerage", methods=["POST"])
def brokerage_route():

    data = request.get_json()

    buy_price = float(data["buy_price"])
    sell_price = float(data["sell_price"])
    quantity = float(data["quantity"])
    brokerage_percent = float(data["brokerage_percent"])

    result = calculate_brokerage(
        buy_price,
        sell_price,
        quantity,
        brokerage_percent
    )

    return jsonify(result)

# RUN FLASK

app.run(debug=True)