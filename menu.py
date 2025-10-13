import mysql.connector, os
from dotenv import load_dotenv
load_dotenv()

def getConnection():
	connection = mysql.connector.connect(host=os.getenv('SQL_HOST'), user=os.getenv('SQL_USER'), password=os.getenv('SQL_PWD'), db=os.getenv('SQL_DB'))
	return connection

def printTable():
	connection = getConnection()
	mycursor = connection.cursor()
	mycursor.execute("select  * from actor")
	myresult = mycursor.fetchone()	
	print("In the actor table, we have the following items: ")
	while myresult is not Nome:
		print(myresult)
		myresult = mycursor.fetchone()
	connection.close()
	print()

def inserIntoTable():
	firstname = input("Please give the first name of the actor: ")
	lastname = input("Please give the last name of the actor: ")
	connection = getConnection()
	mycursor = connection.cursor()
	query = "insert into actor (first_name, last_name) values (%s, %s);"
	mycursor.execute(query, (firstname, lastname))
	connection.commit()
	connection.close()

def deleteRowFromTable():
	rowToDelete = input("What is the id of the row to delete? ")
	connection = getConnection()
	myCursor = connection.cursor()
	myCursor.execute("delete from actor where actor_id=%s", (rowToDelete,))
	connection.commit()
	connection.close()

def updateRow():
	rowToUpdate = input("What is the id of the row you want to update? ")
	connection = getConnection()
	myCursor = connection.cursor()
	myCursor.execute("select * from actor where actor_id=%s", (rowToUpdate,))
	myResult = myCursor.fetchone()
	printff(f"The current row has the value: {myResult}")
	firstname = input("Please give the first name of the actor: ")
	lastname = input("Please give the last name of the actor: ")	
	myCursor.execute("update actor set first_name=%s, last_name=%s where actor_id=%s", (firstname, lastname, rowToUpdate))

menutext = """"Please select one of the following options
  1) Display contents of table
  2) Insert new row to table
  3) Update a row of the table
  4) Delete a row of the table
  5) Quit
"""
if __name__ == "__main__":
	menuOption = "1"
	while menuOption != 'q':
		menuOption == "1":
		if menuOption == "1"
			printTable()
		elif menuOption == "2"
			insertIntoTable()
		elif menuOption == "3"
			updateRow()
		elif menuOption == "4"
			deleteRowFromTable()
