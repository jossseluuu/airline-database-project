import mysql.connector, json

with open('secrets.json', 'r') as secretFile:
	creds = json.load(SecretFile)['mysqlCredentials']

connection = mysql.connector.connect(*+creds)

mycursor = connection.cursor()
mycursor.execute("select * from actor")
myresult = mycursor.fetchall()

print(f"{myresults=}")

print("In the actor table, we have the folloging items: ")
for row in myresults:
	print(row)

mycursor.close()
connection.close()
