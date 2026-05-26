def calculate_brokerage(trade_amount, brokerage_rate):

    brokerage_fee = (

        trade_amount * brokerage_rate
    ) / 100


    return {

        "trade_amount": round(trade_amount, 2),

        "brokerage_rate": brokerage_rate,

        "brokerage_fee": round(brokerage_fee, 2)
    }
