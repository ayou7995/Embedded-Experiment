# CREATE AND DROP TABLE

FILEPATH = '/home/ayou7995/NTUEE/8th_semester/embedded-exp/'
DB_NAME = 'ayou7995_chatroom'

CREATE_TABLE = {}

CREATE_TABLE['USER'] = (
    "CREATE TABLE USER ("
    "   userid INT NOT NULL AUTO_INCREMENT,"
    "   username VARCHAR(15) NOT NULL,"
    "   password VARCHAR(20) NOT NULL,"
    "   PRIMARY KEY (username),"
    "   KEY (userid)"
    ")" )

CREATE_TABLE['CHATGROUP'] = (
    "CREATE TABLE CHATGROUP ("
    "   groupid INT NOT NULL,"
    "   groupname VARCHAR(20),"
    "   PRIMARY KEY (groupid)"
    ")" )

CREATE_TABLE['BELONG_TO'] = (
    "CREATE TABLE BELONG_TO ("
    "   bt_id INT NOT NULL AUTO_INCREMENT,"
    "   username VARCHAR(15) NOT NULL,"
    "   groupid INT NOT NULL,"
    "   join_time TIMESTAMP,"
    "   PRIMARY KEY (username, groupid),"
    "   KEY (bt_id)"
    ")" )

CREATE_TABLE['MESSAGE'] = (
    "CREATE TABLE MESSAGE ("
    "   message_id INT NOT NULL AUTO_INCREMENT,"
    "   from_user VARCHAR(15) NOT NULL,"
    "   destination_id INT NOT NULL,"
    "   timestamp TIMESTAMP NOT NULL,"
    "   message_type VARCHAR(10),"
    "   message VARCHAR(100),"
    "   PRIMARY KEY (message_id)"
    ")" )

# add_user = ("INSERT INTO USER "
            # "(userid, username, password)"
            # "VALUES (%s,%s,%s)")

add_group = ("INSERT INTO CHATGROUP "
             "(groupid, groupname) "
             "VALUES (%s,%s)")

# bind_user_to_group = ("INSERT INTO BELONG_TO"
                      # "(bt_id, userid, groupid, join_time)"
                      # "VALUES (%s,%s,%s,%s)")

# add_message = ('INSERT INTO MESSAGE'
               # '(message_id, from_user_id, destination_id, timestamp, message_type, message)'
               # 'VALUES (%s,%s,%s,%s,%s,%s)' )

DROP_TABLE = {}
DROP_TABLE['USER'] = """DROP TABLE IF EXISTS USER"""
DROP_TABLE['CHATGROUP'] = """DROP TABLE IF EXISTS CHATGROUP"""
DROP_TABLE['BELONG_TO'] = """DROP TABLE IF EXISTS BELONG_TO"""
DROP_TABLE['MESSAGE'] = """DROP TABLE IF EXISTS MESSAGE"""

