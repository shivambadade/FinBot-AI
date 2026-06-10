def generate_recommendation(intent, amount=None, years=None, rate=None):

    recommendation = ""



    # SIP RECOMMENDATIONS

    if intent == "sip":

        if years and years >= 15:

            recommendation = """
• Long-term SIP investing is generally suitable for aggressive wealth creation.

• Equity mutual funds and index funds may provide stronger long-term growth potential.

• Staying invested during market fluctuations can improve compounding benefits.
"""

        elif years and years >= 7:

            recommendation = """
• Medium to long-term SIP investing may help balance risk and returns.

• Diversified mutual fund portfolios are often considered suitable for such durations.
"""

        elif years and years < 7:

            recommendation = """
• Short-term SIP goals may benefit from balanced or lower-risk investment options.

• Consider maintaining investment flexibility for near-term financial needs.
"""

        else:

            recommendation = """
• SIP investing helps develop disciplined long-term financial habits.
"""



    # LUMPSUM RECOMMENDATIONS

    elif intent == "lumpsum":

        if amount and amount >= 500000:

            recommendation = """
• Large lumpsum investments may benefit from diversified asset allocation.

• Consider splitting investments across equity, debt, and hybrid instruments.

• Staggered investing strategies can help reduce market timing risk.
"""

        elif amount and amount >= 100000:

            recommendation = """
• Medium-sized lumpsum investments may benefit from diversified mutual funds.

• Balanced allocation strategies may help manage volatility.
"""

        elif amount and amount < 100000:

            recommendation = """
• Smaller lumpsum investments may be suitable for low-risk or short-term financial goals.
"""

        else:

            recommendation = """
• Lumpsum investments can support long-term financial planning when aligned with risk tolerance.
"""



    # EMI RECOMMENDATIONS

    elif intent == "emi":

        if years and years >= 20:

            recommendation = """
• Long-duration loans may significantly increase total interest burden.

• Prepayment strategies can help reduce long-term financial liability.

• Consider maintaining emergency savings alongside EMI obligations.
"""

        elif years and years >= 10:

            recommendation = """
• Medium to long-term EMI commitments should be balanced with investment planning.

• Avoid overextending monthly debt obligations.
"""

        elif years and years < 10:

            recommendation = """
• Shorter loan durations may reduce overall interest payments.

• Ensure monthly EMI remains manageable within income limits.
"""

        else:

            recommendation = """
• Proper EMI planning can help maintain financial stability and cash flow.
"""



    # BROKERAGE RECOMMENDATIONS

    elif intent == "brokerage":

        if amount and amount >= 100000:

            recommendation = """
• High-volume trading may significantly increase brokerage expenses.

• Comparing brokerage structures can improve long-term trading profitability.

• Consider low-cost brokerage platforms for frequent transactions.
"""

        elif amount and amount < 100000:

            recommendation = """
• Monitoring brokerage charges is important for maintaining net trading returns.

• Lower transaction costs may improve overall investment efficiency.
"""

        else:

            recommendation = """
• Brokerage management plays an important role in active trading strategies.
"""



    # GENERAL RECOMMENDATIONS

    else:

        recommendation = """
• Diversified investing and disciplined financial planning are generally considered safer long-term strategies.

• Maintaining emergency savings before high-risk investing is recommended.

• Financial goals should align with investment duration and risk tolerance.
"""



    return recommendation