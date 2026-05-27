import sqlite3


def create_database():

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



def save_chat(user_message, bot_reply):

    connection = sqlite3.connect("finbot.db")

    cursor = connection.cursor()


    cursor.execute("""

        INSERT INTO chat_history (

            user_message,

            bot_reply

        )

        VALUES (?, ?)

    """, (user_message, bot_reply))


    connection.commit()

    connection.close()



create_database()