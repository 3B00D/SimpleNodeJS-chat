var server= require('socket.io').listen(7788);	

server.sockets.on('connection',function(socket){
	socket.on('join',function(data){
		socket.username=data.username;
		console.log("user "+socket.username);
		socket.broadcast.emit('newuserconnected', {
	      username: socket.username
	    });
	});
	socket.on('newmessage',function(data){
		socket.broadcast.emit('message', {
	      username: socket.username,
		  msg:data.msg
	    });
	});
	socket.on('userrename', function(data){
		var oldusername=socket.username;
		if(oldusername!=data.username){
			socket.username=data.username;
			socket.broadcast.emit('userrenameed', {
		      oldusername: oldusername,
		      username: socket.username
		    });
		}
	});
	socket.on('disconnect', function(){
		socket.broadcast.emit('left', {
	      username: socket.username
	    });
	});
});