var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var db = require('./db/test.js');
//pair of user's name and user's socket
var all_users = [];
var all_sockets = [];
var all_msg = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){

    socket.on('auth', function(info){
      db.login(info.name, info.psw, function(auth){
          if(auth){
              var d = {name:info.name, auth:true};
		          io.emit('user join', d);
		          socket.emit('pass auth', d);

              var data = {name:[info.name], group:info.name};
              socket.rename = 'all';
              socket.user_name = info.name;

	            if(all_users.indexOf(info.name)==-1){
                  console.log(info.name+' first');
		              all_users.push(info.name);
		              all_sockets.push(socket);
		              io.emit('add userList', data);
	            }

              else{
                  io.emit('relogin',info.name);
              }

              for (var i = 0; i < all_users.length; i++) {
                  var data = {name:[all_users[i]], group:all_users[i]};
                  socket.emit('add userList', data);
              }

              db.query_belong_group(info.name, function(group){
                  socket.emit('add userList', group);
              });

          }
          else{
              socket.emit('login fail',true);  
          }
      });

  });

  socket.on('change socket rename', function(rename){
      socket.rename = rename;     
  });

  socket.on('chat message', function(data){
    //socket.rename = data.rename;
    console.log('socket.rename = '+socket.rename);
    console.log('socket.user_name = '+socket.user_name);

    if(data.rename.length>1){
        db.add_message(data.name,data.rename, data.time, null, data.msg);
    }
    else{
        var rename = data.rename.slice();
        rename.push(data.name);
        db.add_message(data.name, rename, data.time, null, data.msg); 
    }

    for(var i=0; i<data.rename.length; i++){
        console.log('rename: '+data.rename[i]);
        console.log('length: '+data.rename.length);
        if(data.rename[i] == 'all'){
            for(var j=0; j<all_sockets.length; j++){
                if((all_sockets[j].rename == 'all') && (all_sockets[j].user_name!=data.name)) {
                    console.log('\nin all receiver: '+all_sockets[j].user_name);
                    console.log('sender: '+data.name);
                    all_sockets[j].emit('chat message', data);
                }
            }
        }
        else{
            for(var k=0; k<all_users.length; k++){
                console.log('all_users: '+all_users[k]+' '+typeof(all_users[k]));
            }
            console.log('\n individual: '+data.rename[i]+' '+typeof(data.rename[i]));
            console.log(all_sockets[all_users.indexOf(data.rename[i])].rename+'\n');
            
            var receiver_rename = all_sockets[all_users.indexOf(data.rename[i])].rename;
            if((receiver_rename.length == data.rename.length) && (receiver_rename.indexOf(data.name)!=-1)){
                if(data.rename[i] != data.name){
                    all_sockets[all_users.indexOf(data.rename[i])].emit('chat message', data);
                }
            all_msg.push(JSON.stringify(data));
           }
        }
    }
  });

  socket.on('old message', function(data){
      db.begin_chat(data.name, function(msg){
          if(msg!=''){
              socket.emit('append old message',msg);
          }
      });
  });

   
  socket.on('disconnect', function(){
	if(all_sockets.indexOf(socket)!=-1){
		//when disconnect username doesn't null, show user left message
		//problem: sometimes client receive null left message, and nobody was disconnect.
		if(all_users[all_sockets.indexOf(socket)] != null){
			io.emit('disconnect', all_users[all_sockets.indexOf(socket)]);
            console.log('dis: '+all_users[all_sockets.indexOf(socket)]+' '+typeof(all_users[all_sockets.indexOf(socket)]));
		}
	}
  });

  socket.on('add group', function(group_member, group_name){
      for(var i = 0; i<group_member.length; ++i){
          var data = {name:group_member, group:group_name};
          all_sockets[all_users.indexOf(group_member[i])].emit('add userList', data);
      }
      console.log(typeof(group_name)+' '+typeof(group_member));
      console.log(group_name+' '+group_member);
      
      db.begin_chat(group_member, function(msg){
          if (msg!="") {
              socket.emit('append old message',msg);
          }
          db.update_groupname(group_member, group_name);
      });
  });
  
  //when a new client connected add current users to client selector
});

http.listen(process.env.PORT || 5000, function(){
  console.log('listening on *:5000');
});

