def calculate_emi(loan_amount, annual_rate, years):
    months = years * 12
    if annual_rate == 0:
        emi = loan_amount / months if months > 0 else 0
    else:
        monthly_rate = annual_rate / 12 / 100
        emi = loan_amount * (
            monthly_rate * (1 + monthly_rate) ** months
        ) / (
            ((1 + monthly_rate) ** months) - 1
        )

    total_payment = emi * months
    total_interest = total_payment - loan_amount

    return {
        "monthly_emi": round(emi, 2),
        "total_payment": round(total_payment, 2),
        "total_interest": round(total_interest, 2)
    }
