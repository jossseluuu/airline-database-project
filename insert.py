import mysql.connector, os
from dotenv import load_dotenv

load_dotenv()

connection = mysql.connector.connect(host=os.getenv('SQL_HOST'), user=os.getenv('SQL_USER'), password=os.getenv('SQL_PWD'), db=os.getenv('SQL_DB'))

mycursor = connection.cursor()
mycursor.execute("insert into actor (first_name, last_name) values ('joseluis', 'lopez');")
connection.commit()

connection.close()
