var db = require('./test.js')


function callback(string) {
  console.log('============');
  console.log(string);
  console.log('============');
}

db.query_belong_group('AMY', callback);
db.query_belong_group('BOB', callback);
//users = ['Amy','Bob','Cherry','Bob','Cherry','Amy']
////,'David','Eric','Frank','Gary','Henry','Ian','Jonathan'];
//groups = {'0':['Amy','Bob'], '1':['Bob','Cherry'], '2':['Cherry','Amy']}

//db.add_new_user(users[0], 'aaa', callback);
//db.add_new_user(users[1], 'bbb', callback);
//db.add_new_user(users[2], 'ccc', callback);

//db.begin_chat(['Amy','Bob'], callback);
//db.begin_chat(['Bob','Cherry'], callback);
//db.begin_chat(['Cherry', 'Amy'], callback);

db.update_groupname(['Q','T','R'], 'CRACKER');
//db.update_groupname(['AMY','DAVID','BOB'], 'FUCKTHATSHIT');
////db.update_groupname(['Bob','Cherry'],'BOB&CHERRY');
////db.update_groupname(['Cherry', 'Amy'],'CHERRY&AMY');

//setInterval( function(){ 
  //var time = new Date;
  //db.add_message(users[time%6], groups[time%3], db.getDateString(new Date()), null, 'Hello from the other side')
//},4000 );
