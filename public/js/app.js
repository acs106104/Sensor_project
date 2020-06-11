var socket = io();
var $loginForm = $('#login-form');
var $loginArea = $('#login-area');
var $createForm = $('#create-form');
var $createArea = $('#create-area');
var $msgForm = $('#message-form');
var $messageArea = $('#message-area');
var $errorMessage = $('#error-msg');
var $shakeCount = $('#shakeCount');
var $button = $('#button');
var $controlArea = $('#controlpanel');

//Create room
socket.on('connect', function() {
	//登入按下submit後觸發
	$createForm.on('submit', function(e) {
		e.preventDefault();
		var $username = $.trim($createForm.find('input[name=username]').val());
		var $room = $.trim($createForm.find('input[name=roomName]').val());//活動名稱
		let $code = Math.random().toString(36).substring(7)//產生random code->房間名稱
		var $userid = $.trim($createForm.find('input[name=userid]').val());
		socket.emit('createRoom', {
			username: $username,
			roomName: $room, //活動名稱
			room: $code, //房間號碼
			code: $userid
		}, function(data) {
			if (data.nameAvailable) {
				$(".room-title").text('You are in the room: ' + $room);
				$(".code-title").text('Room Code: ' +$code);
				$(".id-title").text('User id: ' +$userid);
				$messageArea.show();
				$createArea.hide('slow');
			} else {
				$errorMessage.text(data.error);
			}
		});
	});
});

//Join room
socket.on('connect', function() {
	//登入按下submit後觸發
	$loginForm.on('submit', function(e) {
		e.preventDefault();
		var $username = $.trim($loginForm.find('input[name=username]').val());
		var $room = $.trim($loginForm.find('input[name=room]').val());
		var $id = $.trim($loginForm.find('input[name=code]').val());
		socket.emit('joinRoom', {
			username: $username,
			room: $room,
			code: $id
		}, function(data) {
			if ( data.roomAvailable && data.nameAvailable) {
				$(".room-title").text('You are in the room: ' + data.roomName);
				$(".code-title").text('Room Code: ' +data.roomCode);
				$(".id-title").text('User id: ' +data.controlId);
				$messageArea.show();
				$loginArea.hide('slow');
				console.log(data.controlAvailable);
				//如果是控制的人
				if(data.controlAvailable){
					alert('Control Available');
					$controlArea.show();
					$('#changeUse').text('Host');//把Client -> Host
					$("body").addClass("host");
					$("#shakeShowArea").hide();
					$(".code-title").show();
					$(".id-title").show();
				}
				else
					if($id !== '')
						alert('Control Unavailable');
			} else {
				$errorMessage.text(data.error);
			}
		});
	});
});

function scrollSmoothToBottom(id) {
	var div = document.getElementById(id);
	$('#' + id).animate({
		scrollTop: div.scrollHeight - div.clientHeight
	}, 500);
}

//* Host查看當前參與者 */
function showParticipants(){
	// $("#participants").text("changelalala");
	socket.emit('showParticipants', {
	}, function(data) {
		$("#participants").text(data.text);
	});
}

//client傳給server message
socket.on('message', function(message) {
	var momentTimestamp = moment.utc(message.timestamp);
	var $message = $('#messages');
	$message.append('<p><strong>' + message.username + '</strong> <span class="time">' + momentTimestamp.local().format("h:mma") + '</span></p>');
	$message.append('<div class="wrap-msg"><p>' + message.text + '</p></div>');
	scrollSmoothToBottom('messages');
});

$msgForm.on('submit', function(e) {
	e.preventDefault();
	var $message = $msgForm.find('input[name=message]');
	var $username = $loginForm.find('input[name=username]');
	var reg = /<(.|\n)*?>/g;
	if (reg.test($message.val()) == true) {
		alert('Sorry, that is not allowed!');
	} else {
		//client傳訊息給server
		//告訴傳訊息的是誰
		//內容是什麼
		socket.emit('message', {
			username: $.trim($username.val()),
			text: $message.val()
		});
	}
	$message.val('');
});

//測試用的按鈕
$button.on('submit', function(e) {
	e.preventDefault();
	var $username = $loginForm.find('input[name=username]');
		//client傳訊息給server
		//告訴傳訊息的是誰
		//內容是什麼
		socket.emit('message', {
			username: $.trim($username.val()),
			text: 'hello'
		});
});