import sqlite3

connection = sqlite3.connect("finbot.db")

cursor = connection.cursor()

cursor.execute("""

CREATE TABLE IF NOT EXISTS chat_history (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_message TEXT,

    bot_reply TEXT

)

""")

connection.commit()

connection.close()

print("Database Ready")