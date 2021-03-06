// JAVASCRIPT INSERT SYNTAX

var FILEPATH = '/home/ayou7995/NTUEE/8th_semester/embedded-exp/';
var DB_NAME = 'ayou7995_chatroom';

var use_database = 'USE ' + DB_NAME; 

var add_user = 'INSERT INTO USER (username, password) VALUES (?, ?) ';
var add_chatgroup = ' INSERT INTO CHATGROUP (groupid, groupname) VALUES (?, ?) ';
var add_message = ' INSERT INTO MESSAGE \
                    (from_user, destination_id, timestamp, message_type, message) \
                    VALUES (?, ?, ?, ?, ?) ';

var bind_user_to_group = '  INSERT INTO BELONG_TO \
                            (username, groupid, join_time) \
                            VALUES (?, ?, ?) ';

var query_user = 'SELECT * FROM USER WHERE username = ?';
var query_chatgroup_exist = 'SELECT EXISTS ( SELECT * FROM CHATGROUP WHERE groupid = ? )';
var query_prev_message = 'SELECT CHATGROUP.groupname, MESSAGE.from_user, MESSAGE.message, \
                          MESSAGE.timestamp, MESSAGE.message_type \
                          FROM MESSAGE, CHATGROUP \
                          WHERE destination_id = ? \
                          AND MESSAGE.destination_id = CHATGROUP.groupid \
                          ORDER BY MESSAGE.timestamp';
var query_belong_groupid = 'SELECT groupid \
                            FROM BELONG_TO \
                            WHERE username = ? \
                            AND groupid <> 0 \
                            AND groupid in (SELECT groupid \
                                            FROM BELONG_TO \
                                            GROUP BY groupid \
                                            HAVING COUNT(username) > 2)'
var query_belong_groupname = 'SELECT groupname \
                              FROM CHATGROUP \
                              WHERE groupid = ?'
var query_belong_groupmember = 'SELECT username \
                                FROM BELONG_TO \
                                WHERE groupid = ?'
//var query_belong_group = 'SELECT groupname \
                          //FROM CHATGROUP \
                          //WHERE groupid in (SELECT groupid \
                                            //FROM BELONG_TO \
                                            //WHERE groupid in (SELECT groupid \
                                                              //FROM BELONG_TO \
                                                              //GROUP BY groupid \
                                                              //HAVING COUNT(username) > 2) \
                                            //AND username = ?)';

var update_groupname = 'UPDATE CHATGROUP SET groupname = ? WHERE groupid = ?';

module.exports.DB_NAME =  DB_NAME;
module.exports.add_user = add_user;
module.exports.add_chatgroup = add_chatgroup;
module.exports.add_message =  add_message;
module.exports.bind_user_to_group = bind_user_to_group;
module.exports.use_database = use_database;
module.exports.query_user = query_user;
module.exports.query_chatgroup_exist = query_chatgroup_exist;
module.exports.query_prev_message = query_prev_message;
module.exports.query_belong_groupid = query_belong_groupid;
module.exports.query_belong_groupname = query_belong_groupname;
module.exports.query_belong_groupmember = query_belong_groupmember;
module.exports.update_groupname = update_groupname;

