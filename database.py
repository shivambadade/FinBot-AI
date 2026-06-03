import mysql.connector



def get_connection():

    return mysql.connector.connect(

        host="localhost",

        user="root",

        password="password",

        database="finbot_ai"

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