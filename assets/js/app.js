var myMessages=null;
var conversationStarted = false;
var myMessagebar=null;
var issocketReady=false;
var currentUserName=getUserName();
function getUserName(){
	var un=window.localStorage.getItem("username");
	if(un!=null){
		return un;
	}else{
		return new Date().getTime();
	}
}

$(document).ready(function ()
{
	var socket=io.connect('http://localhost:7788');
	
	$("#username-txt").val(currentUserName);
	$("#changeNameForm").submit(function (ev){
		ev.preventDefault();
		
		myApp.closeModal(".set-name-popup");
		currentUserName=$("#username-txt").val();
		window.localStorage.setItem("username",currentUserName);
		socket.emit("userrename",{username:currentUserName});
	});
	$(".change-name-submit").click(function ()
	{
		$("#changeNameForm").submit();
	});
	var myApp = new Framework7();
	var mainView = myApp.addView('.view-main',{domCache: true,pushState:true});

	var $$ = Dom7;

	// Init Messages
	myMessages = myApp.messages('.messages', {
			autoLayout:true
		});

	// Init Messagebar
	myMessagebar = myApp.messagebar('.messagebar');

	socket.on("disconnect", function() {
		issocketReady=false;
	});
	socket.on("connect", function() {
		issocketReady=true;
	  	socket.emit("join",{username:currentUserName});
	});
	socket.on("newuserconnected",function (data)
	{
		myApp.addNotification({
	        title: 'User joined',
			hold:2000,
	        message: data.username+' has joined the chat'
	    });
	});
	socket.on("userrenameed",function (data)
	{
		myApp.addNotification({
	        title: 'Rename',
			hold:2000,
	        message: data.oldusername+' changed his name to '+data.username
	    });
	});
	socket.on("left",function (data)
	{
		myApp.addNotification({
	        title: 'User leaved',
			hold:2000,
	        message: data.username+' leaved the chat'
	    });
	});
	socket.on("message",function (data){
		addMessageToView({msg:data.msg,type:"received",name:data.username});
	});
	function sendMessage(msg){
		if(issocketReady){
			socket.emit("newmessage",{msg:msg});
			return true;
		}else{
			return false;
		}
	}
	function addMessageToView(msg_details){
		// Add message
		myMessages.addMessage({
			// Message text
			text: msg_details.msg,
			// Random message type
			type: msg_details.type,
			/*// Avatar and name:
			avatar: avatar,*/
			name: msg_details.name,
			// Day
			day: !conversationStarted ? 'Today' : false,
			time: !conversationStarted ? (new Date()).getHours() + ':' + (new Date()).getMinutes() : false
		})
	}
	// Handle message
	$$('.messagebar .link').on('click', function () {
	
		// Message text
		var messageText = myMessagebar.value().trim();
		// Exit if empy message
		if (messageText.length === 0) return;

		// Empty messagebar
		myMessagebar.clear();
		if(sendMessage(messageText)){
			addMessageToView({msg:messageText,type:"sent",name:currentUserName});
		}else{
			myApp.addNotification({
		        title: 'Error',
				hold:2000,
		        message: 'You are disconnected'
		    });
		}
	});                
	conversationStarted = true;
});