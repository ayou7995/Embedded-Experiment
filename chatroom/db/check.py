import mysql.connector

cnx = mysql.connector.connect(host='10.43.68.171', user='ayou7995', password='ayou7995', database='ayou7995_chatroom')
cursor = cnx.cursor(buffered=True)

cursor.execute('SELECT * FROM USER')
users = cursor.fetchall()
for user in users:
    print(user)

cnx.commit()
cursor.close()
cnx.close()
