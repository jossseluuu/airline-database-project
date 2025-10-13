import mysql.connector, os
from dotenv import load_dotenv

load_dotenv()

connection = mysql.connector.connect(host=os.getenv('SQL_HOST'), user=os.getenv('SQL_USER'), password=os.getenv('SQL_PWD'), db=os.getenv('SQL_DB'))

mycursor = connection.cursor)=
firstname = input("Please give the first name of the actor: ")
lastname = input("Please give the last name of the actor: ")
query = "insert into actor (first_name, lastname) values (%s. %s);"
mycursor.execute(query, (firstname, lastname))

connection.commit()

connection.close()
