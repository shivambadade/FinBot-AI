import mysql.connector



connection = mysql.connector.connect(

    host="localhost",

    user="root",

    password="password",

    database="finbot_ai"

)



cursor = connection.cursor()



cursor.execute("""

    SELECT * FROM chat_history

""")



rows = cursor.fetchall()



for row in rows:

    print("\n-------------------")

    print("ID:", row[0])

    print("User:", row[1])

    print("Bot:", row[2])



connection.close()