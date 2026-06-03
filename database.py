import mysql.connector
import os
from dotenv import load_dotenv
load_dotenv()


def get_connection():

    return mysql.connector.connect(

        host=os.getenv("MYSQL_HOST"),

        user=os.getenv("MYSQL_USER"),

        password=os.getenv("MYSQL_PASSWORD"),

        database=os.getenv("MYSQL_DATABASE")

    )



def save_chat(user_message, bot_reply):

    connection = get_connection()

    cursor = connection.cursor()

    query = """

    INSERT INTO chat_history

    (user_message, bot_reply)

    VALUES (%s, %s)

    """

    values = (user_message, bot_reply)

    cursor.execute(query, values)

    connection.commit()

    connection.close()



def get_chat_history():

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute(

        "SELECT user_message, bot_reply FROM chat_history"

    )

    chats = cursor.fetchall()

    connection.close()

    return chats