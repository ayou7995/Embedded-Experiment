from __future__ import print_function

import stats
import mysql.connector
from mysql.connector import errorcode

def create_database(cursor):
    try:
        cursor.execute(
            "CREATE DATABASE {0} DEFAULT CHARACTER SET 'utf8'".format(stats.DB_NAME))
    except mysql.connector.Error as err:
        print("Failed creating database: {0}".format(err))
        exit(1)

def initialize():
    
    cnx = mysql.connector.connect(user='root', password='mysql', database=stats.DB_NAME)
    cursor = cnx.cursor(buffered=True) 
    try:
        cursor.execute(stats.add_group,[0,'All'])
    except mysql.connector.Error as err:
        print(err)
    cnx.commit() 
    cursor.close()
    cnx.close()

if __name__ == '__main__':
 
    cnx = mysql.connector.connect(user='root', password='mysql')
    cursor = cnx.cursor(buffered=True) 

    try:
        cnx.database = stats.DB_NAME
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_BAD_DB_ERROR:
            create_database(cursor)
            cnx.datebase = stats.DB_NAME
        else:
            print(err)
            exit(1)

    for name, ddl in stats.CREATE_TABLE.items():
        try:
            print("Creating table {0}: ".format(name), end = '')
            cursor.execute(ddl)
        except mysql.connector.Error as err: 
            if err.errno == errorcode.ER_TABLE_EXISTS_ERROR:
                print("already exists")
            else:
                print(err.msg)
        else:
            print("OK")


    cnx.commit() 
    cursor.close()
    cnx.close()

    initialize()
   

