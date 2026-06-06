def calculate_sip(monthly_investment, annual_rate, years):
    months = years * 12
    if annual_rate == 0:
        future_value = monthly_investment * months
    else:
        monthly_rate = annual_rate / 12 / 100
        future_value = monthly_investment * (
            ((1 + monthly_rate) ** months - 1)
            / monthly_rate
        ) * (1 + monthly_rate)

    total_investment = monthly_investment * months
    estimated_returns = future_value - total_investment

    return {
        "future_value": round(future_value, 2),
        "total_investment": round(total_investment, 2),
        "estimated_returns": round(estimated_returns, 2)
    }
