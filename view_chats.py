import sqlite3


connection = sqlite3.connect("finbot.db")

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