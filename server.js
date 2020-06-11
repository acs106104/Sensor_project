var PORT = process.env.PORT || 3000;
var fs = require('fs');
var express = require('express');
var app = express();
var https = require('https')
var server = https.createServer({
	key: fs.readFileSync('/Applications/XAMPP/xamppfiles/etc/ssl/private.key'),
	cert: fs.readFileSync('/Applications/XAMPP/xamppfiles/etc/ssl/certificate.crt'),
	ca: fs.readFileSync('/Applications/XAMPP/xamppfiles/etc/ssl/ca_bundle.crt'),
	requestCert:false,
	rejectUnauthorized:false
},app);
//mysql-------------------------------
// var mysql      = require('mysql');
// var connection = mysql.createConnection({
//   host     : 'localhost',
//   user     : 'root',
//   password : 'ting813813',
//   database : 'QRcodeProject'
// });
 
// connection.connect();
 
// var  sql = 'SELECT * FROM `covid-19 hdc`';
// //查
// connection.query(sql,function (err, result) {
//         if(err){
//           console.log('[SELECT ERROR] - ',err.message);
//           return;
//         }
 
//        console.log('--------------------------SELECT----------------------------');
//        console.log(result);
//        console.log('------------------------------------------------------------\n\n');  
// });
 
// connection.end();

//------------------------------------

var io = require('socket.io')(server);
var moment = require('moment');
var connectedUsers = {};
var createdRooms = {};

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket) {
	console.log('A user is connected.');

	socket.on('disconnect', function() {
		var userData = connectedUsers[socket.id];
		if (typeof userData !== 'undefined') {
			socket.leave(connectedUsers[socket.id]);
			// io.to(userData.room).emit('message', {
			// 	username: 'System',
			// 	text: userData.username + ' has left!',
			// 	timestamp: moment().valueOf()
			// });
			delete connectedUsers[socket.id];
		}
	});

	//Create room
	socket.on('createRoom', function(req, callback) {
		if (req.username.replace(/\s/g, "").length > 0) {
			var nameTaken = false;

			Object.keys(connectedUsers).forEach(function(socketId) {
				var userInfo = connectedUsers[socketId];
				if (userInfo.username.toUpperCase() === req.username.toUpperCase()) {
					nameTaken = true;
				}
			});

			if (nameTaken) {
				callback({
					nameAvailable: false,
					error: 'Sorry this username is taken!'
				});
			} 
			else {
				createdRooms[req.room] = {code: req.code,roomName: req.roomName};
				//createdRooms[req.code]
				connectedUsers[socket.id] = req;
				socket.join(req.code);
				// socket.broadcast.to(req.code).emit('message', {
				// 	username: 'System',
				// 	text: req.username + ' has joined!',
				// 	timestamp: moment().valueOf()
				// });
				callback({
					nameAvailable: true,
				});
			}
		} else {
			callback({
				nameAvailable: false,
				error: 'Hey, please fill out the form!'
			});
		}
	});

	//Join room
	socket.on('joinRoom', function(req, callback) {
		if (req.room.replace(/\s/g, "").length > 0 && req.username.replace(/\s/g, "").length > 0) {
			var nameTaken = false;
			var roomUnCreated = false;
			var controlAble = false;

			/* check room是否有建立 */
			let roomCheck = Object.getOwnPropertyNames(createdRooms);
			if(roomCheck.indexOf(req.room) < 0 ){
				roomUnCreated = true;
			}
			/* check id是否符合活動創建者 */
			if(!roomUnCreated){
				let idCheck = createdRooms[req.room].code;//控制此room的id是多少
				if(idCheck === req.code){
					controlAble = true;
				}
			}
			/* check username是否有重複 */
			Object.keys(connectedUsers).forEach(function(socketId) {
				var userInfo = connectedUsers[socketId];
				if (userInfo.username.toUpperCase() === req.username.toUpperCase()) {
					nameTaken = true;
				}
			});

			if(roomUnCreated){
				callback({
					roomAvailable: false,
					error: 'Sorry room has not been created! '
				});
			}
			else if (nameTaken) {
				callback({
					nameAvailable: false,
					error: 'Sorry this username is taken!'
				});
			} 
			else {
				connectedUsers[socket.id] = req;
				socket.join(req.room);
				// socket.broadcast.to(req.room).emit('message', {
				// 	username: 'System',
				// 	text: req.username + ' has joined!',
				// 	timestamp: moment().valueOf()
				// });
				if(controlAble){
					callback({
						nameAvailable: true,
						roomAvailable: true,
						controlAvailable: true,
						roomName: createdRooms[req.room].roomName,
						roomCode: req.room,
						controlId: createdRooms[req.room].code
					});
				}
				else{
					callback({
						nameAvailable: true,
						roomAvailable: true,
						controlAvailable: false,
						roomName: createdRooms[req.room].roomName
					});
				}
			}
		} else {
			callback({
				nameAvailable: false,
				error: 'Hey, please fill out the form!'
			});
		}
	});

	socket.on('showParticipants', function(req,callback) {
		var participants = '';
		Object.keys(connectedUsers).forEach(function(socketId) {
			let userInfo = connectedUsers[socketId];
			if (userInfo.room === connectedUsers[socket.id].room) {
				participants +=  userInfo.username + "\n";
			}
		});
		callback({
			text: participants
		});
	});


	//server收到message的反饋
	//server將廣播給在這個房間的人什麼訊息
	socket.on('message', function(message) {
		message.timestamp = moment().valueOf();
		io.to(connectedUsers[socket.id].room).emit('message', message);
	});
	
	// //client傳訊息給server
	// socket.emit('message', {
	// 	username: 'System',
	// 	text: 'Hey there! Ask someone to join this chat room to start talking.',
	// 	timestamp: moment().valueOf()
	// });
	// //server收到shakeDetected的反饋
	// socket.on('shakeDetected', function(message) {
	// 	message.timestamp = moment().valueOf();
	// 	io.to(connectedUsers[socket.id].room).emit('message', message);
	// });

});

// https.listen(PORT, function() {
// 	console.log('Server started on port ' + PORT);
// });

server.listen(PORT, function() {
	console.log('Server started on port PORT');
});