var stats = require('./stats.js');
var Client = require('mariasql');

function getDateString(d){
  var year = d.getFullYear();
  var month = d.getMonth()+1;
  month = (month<10)?'0'+month:month;
  var day = d.getDate();
  day = (day<10)?'0'+day:day;
  var hour = d.getHours();
  hour = (hour<10)?'0'+hour:hour;
  var min = d.getMinutes();
  min = (min<10)?'0'+min:min;
  var sec = d.getSeconds();
  sec = (sec<10)?'0'+sec:sec;
  return year+month+day+hour+min+sec;
  //return year+"-"+month+"-"day+" "+hour+":"+min+":"+sec;
  //YYYYMMDDhhmmss
}

let getHashTableCode = function(key) {
  let hash = 0;
  if (key.length == 0) return hash;
  for(let i = 0; i < key.length; i++) {
    // charCodeAt 會回傳指定字串內字元的 Unicode 編碼（可以包含中文字）
    //hash += key.charCodeAt(i);
    hash = (hash<<5) - hash;
    hash = hash + key.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  // 為了取到較小值，使用任意數做除法 mod 處理
  //return hash % 37;			
  return Math.abs(hash);
}


function login(name, passwd, callback) {
  let flag = true;
  c.query('USE ayou7995_chatroom');
  let query = c.query(stats.query_user, [name]); 
  query.on('result', function(res) {
    res.on('data', function(row) {
      if (row.password != passwd) { callback(false); }
      else callback(true);
      flag = false;
    }).on('end', function() {
      //console.log('Result set finished');
    });
  }).on('end', function() {
    if (flag) {
      console.log(flag);
      add_new_user(name, passwd, callback); 
    }
    //console.log('No more result sets!');
  });

}
function add_new_user(name, passwd, callback) {
  c.query('USE ayou7995_chatroom');
  let arr = [name, passwd];
  c.query(stats.add_user, arr, function(err, rows) {
    if (err){ console.log(err); callback(false); }
    else{ callback(true); }
  })
  bind_user_to_group(name, 0, getDateString(new Date()));
}

function add_message(from_user, users, time, msg_type, msg) {
  if (users.includes('all')) {
    let arr = [from_user, 0, time, msg_type, msg]
    c.query(stats.add_message, arr, function(err, rows){})
  }
  else {
    c.query('USE ayou7995_chatroom');
    let des_id = getHashTableCode(users.sort().join());
    let arr = [from_user, des_id, time, msg_type, msg]
    c.query(stats.add_message, arr, function(err, rows){})
  }
}

function update_groupname(users, new_groupname) {
  c.query('USE ayou7995_chatroom');
  var gid = getHashTableCode(users.sort().join());
  var arr = [new_groupname,gid];
  c.query(stats.update_groupname, arr, function(err, rows) {})
}

function begin_chat(users, callback) {
  if (users.includes('all')) {
    console.log('database in all!');
    retrieve_prev_message(0, callback);
  }
  else {
    c.query('USE ayou7995_chatroom');
    let gid = getHashTableCode(users.sort().join());
    let arr = [gid];
    c.query(stats.query_chatgroup_exist, arr, function(err, rows) {
      //console.log(rows);
      if (rows[0][Object.keys(rows[0])[0]]!=0) {
        console.log('group ' + gid + ' already exits');
        retrieve_prev_message(gid, callback);
      }
      else{
        add_new_chatgroup(gid,users,callback);
      }
    })
  }
}

function retrieve_prev_message(gid, callback) {
  let arr = [gid]
  let query = c.query(stats.query_prev_message, arr)
  c.query('USE ayou7995_chatroom');
  query.on('result', function(res) {
    res.on('data', function(row) {
      /*console.dir(row);*/
      callback(row)
    }).on('end', function() {
      //console.log('Result set finished');
    });
  }).on('end', function() {
    //console.log('No more result sets!');
  });
}

function add_new_chatgroup(gid, users, callback) {
  let arr = [gid, users.sort().join()];
  c.query('USE ayou7995_chatroom');
  c.query(stats.add_chatgroup, arr, function(err, rows){})
  for (key in users) {
    bind_user_to_group(users[key], gid, getDateString(new Date()));
  }
}

function bind_user_to_group(username, gid, time) {
  let arr = [username, gid, time];
  c.query('USE ayou7995_chatroom');
  c.query(stats.bind_user_to_group, arr, function(err, rows) {})
}

var c = new Client({
  host: '127.0.0.1',
  user: 'root',
  password: 'mysql'
});

c.query('USE ayou7995_chatroom');

c.end();

module.exports.add_message = add_message; 
module.exports.login = login; 
module.exports.getDateString = getDateString; 
module.exports.begin_chat = begin_chat; 
module.exports.update_groupname = update_groupname; 

