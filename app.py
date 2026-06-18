import sys
import os
import subprocess
import numpy as np

# Auto-execute inside the virtual environment if running globally
if sys.prefix == sys.base_prefix:
    venv_python = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".venv", "Scripts", "python.exe")
    if os.path.exists(venv_python):
        print(f"[*] Re-executing app.py within virtual environment: {venv_python}")
        result = subprocess.run([venv_python] + sys.argv, shell=False)
        sys.exit(result.returncode)

import warnings
# Silence scikit-learn version mismatch warnings during unpickling
warnings.filterwarnings("ignore", category=UserWarning, message=".*Trying to unpickle estimator.*")

from flask import Flask, render_template, request, jsonify
import nltk
import re
import humanize
import pickle

from database import save_chat, get_chat_history
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from Calculators.sip import calculate_sip
from Calculators.emi import calculate_emi
from Calculators.lumpsum import calculate_lumpsum
from Calculators.brokerage import calculate_brokerage
from nltk.stem import PorterStemmer

# Add compatibility layer for loading pickle files saved with numpy 2.x inside numpy 1.x environments
import sys
import types
import numpy
if not hasattr(numpy, '_core'):
    import numpy.core as _core
    _core_pkg = types.ModuleType("numpy._core")
    _core_pkg.__path__ = []  # makes it a package
    sys.modules["numpy._core"] = _core_pkg
    for attr_name in dir(_core):
        attr_val = getattr(_core, attr_name)
        setattr(_core_pkg, attr_name, attr_val)
        if isinstance(attr_val, types.ModuleType):
            sys.modules[f"numpy._core.{attr_name}"] = attr_val

# Check if NLTK resources are already available before attempting download
for resource, path in [('punkt_tab', 'tokenizers/punkt_tab'), ('stopwords', 'corpora/stopwords')]:
    try:
        nltk.data.find(path)
    except LookupError:
        try:
            nltk.download(resource, quiet=True)
        except Exception as e:
            print(f"Warning: Could not download NLTK resource '{resource}': {e}")

# LOAD NLP MODEL

with open("ml/intent_model.pkl", "rb") as model_file:
    model = pickle.load(model_file)

with open("ml/vectorizer.pkl", "rb") as vectorizer_file:
    vectorizer = pickle.load(vectorizer_file)

# LOAD RECOMMENDATION MODEL AND ENCODERS

with open("ml/recommendation_model.pkl", "rb") as rec_model_file:
    recommendation_model = pickle.load(rec_model_file)

with open("ml/type_encoder.pkl", "rb") as type_enc_file:
    type_encoder = pickle.load(type_enc_file)

with open("ml/recommendation_encoder.pkl", "rb") as rec_enc_file:
    recommendation_encoder = pickle.load(rec_enc_file)

RECOMMENDATION_LABELS = {
    "long_term_equity": "Long-Term Equity Growth",
    "aggressive_wealth": "Aggressive Wealth Creation",
    "balanced_growth": "Balanced Growth Strategy",
    "moderate_growth": "Moderate Growth Strategy",
    "equity_growth": "Equity Growth Strategy",
    "aggressive_growth": "Aggressive Growth Strategy",
    "low_risk": "Conservative Investment Strategy",
    "balanced_fund": "Balanced Fund Strategy",
    "diversified_growth": "Diversified Growth Strategy",
    "wealth_creation": "Wealth Creation Strategy",
    "long_term_diversified": "Long-Term Diversified Growth",
    "manageable_debt": "Manageable Debt Strategy",
    "balanced_emi": "Balanced EMI Strategy",
    "debt_planning": "Debt Planning Strategy",
    "debt_caution": "Debt Caution Strategy",
    "high_debt_risk": "High Debt Risk",
    "moderate_trading": "Moderate Trading Strategy",
    "cost_optimized_trading": "Cost Optimized Trading Strategy",
    "active_trading_strategy": "Active Trading Strategy",
    "high_volume_trading": "High Volume Trading",
    "professional_trading": "Professional Trading Strategy"
}

def format_recommendation_label(recommendation):
    formatted_recommendation = RECOMMENDATION_LABELS.get(
        recommendation,
        recommendation.replace("_", " ").title()
    )

    print("Raw Recommendation:", recommendation)
    print("Formatted Recommendation:", formatted_recommendation)

    return formatted_recommendation

stemmer = PorterStemmer()

stop_words = set(stopwords.words("english"))

# Preprocessing function for user input

def preprocess_text(text):

    text = text.lower()

    words = word_tokenize(text)



    filtered_words = []



    for word in words:

        if word.isalnum() and word not in stop_words:

            stemmed_word = stemmer.stem(word)

            filtered_words.append(stemmed_word)



    return " ".join(filtered_words)


app = Flask(__name__)

@app.route("/save-calculation", methods=["POST"])

def save_calculation():

    data = request.json

    user_message = data["user_message"]

    bot_reply = data["bot_reply"]

    try:
        save_chat(user_message, bot_reply)
        return jsonify({
            "status": "success"
        })
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({
            "status": "success"
        })


@app.route("/history")

def history():

    try:
        chats = get_chat_history()
        return {
            "history": chats
        }
    except Exception as e:
        print(f"Database error: {e}")
        return {
            "history": []
        }


def get_ml_recommendation(

    amount,

    years,

    investment_type

):

    # ENCODE TYPE

    encoded_type = type_encoder.transform(

        [investment_type]

    )[0]



    # CREATE INPUT ARRAY

    features = np.array([

        [

            amount,

            years,

            encoded_type

        ]

    ])



    # PREDICT RECOMMENDATION

    prediction = recommendation_model.predict(

        features

    )[0]



    # DECODE PREDICTION

    recommendation = recommendation_encoder.inverse_transform(

        [prediction]

    )[0]



    return recommendation

def format_recommendation_text(

    recommendation

):

    recommendations = {

        "low_risk":

        """

• Low-risk investment strategies may help preserve financial stability.

• Conservative mutual funds or debt-oriented investments may be suitable.

""",



        "balanced_growth":

        """

• Balanced investment strategies may help combine growth and stability.

• Diversified mutual funds are commonly preferred for moderate-risk investing.

""",



        "moderate_growth":

        """

• Moderate growth investment strategies may help generate stable long-term returns.

• Diversified SIP investing may help reduce market volatility risks.

""",



        "equity_growth":

        """

• Equity-oriented investments may provide stronger long-term growth potential.

• Long-term SIP investing may help benefit from market compounding.

""",



        "aggressive_growth":

        """

• Aggressive growth strategies may suit long-term investors with higher risk tolerance.

• Equity diversification can help manage market volatility.

""",



        "long_term_equity":

        """

• Long-term equity investing is often associated with wealth creation strategies.

• Consistent investing over longer durations may improve compounding benefits.

""",



        "diversified_growth":

        """

• Diversified investment allocation may help reduce concentration risk.

• Hybrid and diversified funds may improve portfolio balance.

""",



        "wealth_creation":

        """

• Long-term disciplined investing may support wealth creation objectives.

• Diversified portfolios are generally preferred for long investment horizons.

""",



        "aggressive_wealth":

        """

• High-value long-term investments may benefit from diversified equity allocation.

• Strategic portfolio balancing may help optimize long-term wealth growth.

""",



        "manageable_debt":

        """

• Current EMI obligations appear financially manageable.

• Maintaining repayment discipline may improve financial stability.

""",



        "balanced_emi":

        """

• Balanced EMI planning may help maintain healthy monthly cash flow.

• Avoid excessive borrowing beyond repayment capacity.

""",



        "debt_planning":

        """

• EMI obligations should be balanced carefully with savings and investments.

• Financial planning may help reduce long-term debt pressure.

""",



        "debt_caution":

        """

• High debt obligations may increase financial pressure over time.

• Consider maintaining emergency savings and controlled borrowing.

""",



        "high_debt_risk":

        """

• Very high long-term debt exposure may create financial risk.

• Careful repayment planning and debt reduction strategies are recommended.

""",



        "moderate_trading":

        """

• Monitoring trading frequency and brokerage costs may improve returns.

""",



        "cost_optimized_trading":

        """

• Lower brokerage costs may improve long-term trading efficiency.

""",



        "active_trading_strategy":

        """

• Active trading strategies require careful cost and risk management.

""",



        "high_volume_trading":

        """

• High-volume trading may require disciplined portfolio and brokerage management.

""",



        "professional_trading":

        """

• Professional trading strategies should include disciplined risk management practices.

"""

    }



    return recommendations.get(

        recommendation,

        "Financial planning recommendations are currently unavailable."

    )

@app.route('/')
def home():

    return render_template("index.html")

# CHATBOT API

@app.route('/chat', methods=['POST'])

def chat():

    user_message = request.json['message']
    message = user_message.lower()

    # NLP INTENT DETECTION
    processed_message = preprocess_text(message)
    message_vector = vectorizer.transform([processed_message])
    intent = model.predict(message_vector)[0]
    print("Detected Intent:", intent)


    # INTENT DETECTION


    # SIP

    if intent == "sip":

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

            ml_prediction = get_ml_recommendation(
                monthly_investment,
                years,
                "sip"
            )

            recommendation_text = format_recommendation_text(
                ml_prediction
            )

            bot_reply += recommendation_text

        else:

            bot_reply = """

Please provide:
• Monthly investment
• Years
• Expected return rate
"""


# EMI

    elif intent == "emi":

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

Based on your EMI calculation:

• Monthly EMI: ₹{result['monthly_emi']}

• Total Payment: ₹{result['total_payment']}

• Total Interest: ₹{result['total_interest']}

"""

            ml_prediction = get_ml_recommendation(
                loan_amount,
                years,
                "emi"
            )

            recommendation_text = format_recommendation_text(
                ml_prediction
            )

            bot_reply += recommendation_text

        else:

            bot_reply = """

Please provide:
• Loan amount
• Years
• Interest rate
"""

# Brokerage

    elif intent == "brokerage":

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

            ml_prediction = get_ml_recommendation(
                trade_amount,
                5,
                "brokerage"
            )

            recommendation_text = format_recommendation_text(
                ml_prediction
            )

            bot_reply += recommendation_text

        else:

            bot_reply = """

Please provide:
• Trade amount
• Brokerage percentage
"""

# Lumpsum

    elif intent == "lumpsum":

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

            ml_prediction = get_ml_recommendation(
                investment,
                years,
                "lumpsum"
            )

            recommendation_text = format_recommendation_text(
                ml_prediction
            )

            bot_reply += recommendation_text

        else:

            bot_reply = """

Please provide:
• Investment amount
• Expected return rate
• Investment duration
"""


    elif intent == "greeting":

        bot_reply = "Hello! I'm FinBot AI."


    elif intent == "recommendation":

        bot_reply = """
Here are some general financial suggestions:

• SIP investments are good for long-term wealth creation.

• Diversified mutual funds can help reduce risk.

• Maintain an emergency fund before high-risk investments.

• Avoid investing all savings into one asset category.

• Long-term disciplined investing usually performs better than short-term trading.
"""


    else:

        bot_reply = """
Sorry, I could not understand your request.

You can ask about:
• SIP
• EMI
• Lumpsum
• Brokerage
"""


    try:
        save_chat(message, bot_reply)
    except Exception as e:
        print(f"Database error: {e}")

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

    recommendation_key = get_ml_recommendation(
        amount,
        years,
        "sip"
    )
    recommendation = format_recommendation_label(recommendation_key)
    


    return jsonify({
    "future_value": result["future_value"],
    "total_investment": result["total_investment"],
    "estimated_returns": result["estimated_returns"],
    "recommendation": recommendation,
    "recommendation_key": recommendation_key
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

    recommendation_key = get_ml_recommendation(
        loan_amount,
        years,
        "emi"
    )
    recommendation = format_recommendation_label(recommendation_key)

    result["recommendation"] = recommendation
    result["recommendation_key"] = recommendation_key

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

    recommendation_key = get_ml_recommendation(
        amount,
        years,
        "lumpsum"
    )
    recommendation = format_recommendation_label(recommendation_key)

    result["recommendation"] = recommendation
    result["recommendation_key"] = recommendation_key

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

    trade_amount = (buy_price * quantity) + (sell_price * quantity)
    recommendation_key = get_ml_recommendation(
        trade_amount,
        brokerage_percent,
        "brokerage"
    )
    recommendation = format_recommendation_label(recommendation_key)

    result["recommendation"] = recommendation
    result["recommendation_key"] = recommendation_key

    print("Brokerage Recommendation:", recommendation)
    print("Brokerage Result:", result)

    return jsonify(result)

# RUN FLASK

app.run(debug=True)
