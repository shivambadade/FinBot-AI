def calculate_lumpsum(investment, annual_rate, years):

    future_value = investment * (

        (1 + annual_rate / 100) ** years
    )


    estimated_returns = future_value - investment


    return {

    "future_value": round(future_value, 2),

    "invested_amount": round(investment, 2),

    "estimated_returns":
    round(estimated_returns, 2)

}