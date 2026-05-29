def calculate_brokerage(*args, **kwargs):

    # Two-argument form: (trade_amount, brokerage_percent)
    if len(args) == 2 and not kwargs:
        trade_amount = float(args[0])
        brokerage_percent = float(args[1])

        brokerage = (trade_amount * brokerage_percent) / 100
        gross_profit = trade_amount
        net_profit = gross_profit - brokerage

        return {
            "gross_profit": round(gross_profit, 2),
            "brokerage": round(brokerage, 2),
            "net_profit": round(net_profit, 2),
        }

    # Four-argument form: (buy_price, sell_price, quantity, brokerage_percent)
    # Allow mixing positional and keyword args
    # Extract values from kwargs if present, else from args
    try:
        buy_price = kwargs.get("buy_price") if "buy_price" in kwargs else args[0]
        sell_price = kwargs.get("sell_price") if "sell_price" in kwargs else args[1]
        quantity = kwargs.get("quantity") if "quantity" in kwargs else args[2]
        brokerage_percent = kwargs.get("brokerage_percent") if "brokerage_percent" in kwargs else args[3]
    except Exception:
        raise TypeError("calculate_brokerage expects either (trade_amount, brokerage_percent) or (buy_price, sell_price, quantity, brokerage_percent)")

    buy_price = float(buy_price)
    sell_price = float(sell_price)
    quantity = float(quantity)
    brokerage_percent = float(brokerage_percent)

    gross_profit = (sell_price - buy_price) * quantity

    turnover = (buy_price * quantity) + (sell_price * quantity)

    brokerage = (turnover * brokerage_percent) / 100

    net_profit = gross_profit - brokerage

    return {
        "gross_profit": round(gross_profit, 2),
        "brokerage": round(brokerage, 2),
        "net_profit": round(net_profit, 2),
    }