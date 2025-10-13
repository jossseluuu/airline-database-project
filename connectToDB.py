"""
{
	"mysqlCredentials": {
		"host":"127.0.0.1"
		"user":"jossseluuu"
		"password":"0705"
		"db":"sakila"
	}
}
"""

import mysql.connector, json

with open('secrets.json', 'r') as secretFile:
	creds = json.load(secretFile)['mysqlCredentials']

connection = mysql.connector.connect(**creds)

print(connection)
connection.close()
