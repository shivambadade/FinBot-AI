import mysql.connector

connection = mysql.connector.connect(

    host="localhost",

    user="root",

    password="password",

    database="finbot_ai"

)

if connection.is_connected():

    print("MySQL Connected Successfully")