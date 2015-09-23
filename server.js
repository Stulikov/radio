// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var crypto = require('crypto');
var fs = require("fs");
var sudoer = "verytopboss";
sudoer = "asd";
//relsecureradio
var supasswd = "231bf61a0760e136fad5ca9acad7200dba424ccc067f2a93cc8b3ec8fd5dfa32";
var passwdfile = "passwd";
//token must be empty string
var token = "";
fs.readFile(passwdfile, {encoding: 'utf8'}, function (err, data) {
	if(!err) {
		//supasswd = data;
		console.log("supasswd readed " + supasswd);
	}
});

server.listen(port, function () {
	console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

// usernames which are currently connected to the chat
var nicklist = [];
var keypoints = [];
var maintopic = "";
// Навешиваем обработчик на подключение нового клиента
io.on('connection', function (socket) {
	// Т.к. чат простой - в качестве ников пока используем первые 5 символов от ID сокета
	var session = {id: socket.id, nick: ID};
	var ID = (socket.id).toString().substr(0, 5);
	var IP = socket.request.connection.remoteAddress;
	nicklist.push(session);
	var time = (new Date).toLocaleTimeString();
	// Посылаем клиенту сообщение о том, что он успешно подключился и его имя
	socket.emit('connected', {'event': 'connected', 'name': ID, 'time': time});
	// Посылаем всем остальным пользователям, что подключился новый клиент и его имя
	socket.broadcast.emit('newUser', {'name': ID, 'time': time});
	// Навешиваем обработчик на входящее сообщение
	socket.on('msg', function (data) {
		msg = data.text;
		var time = (new Date).toLocaleTimeString();

		//записывем сообщение в лог
		fs.open("log", "a", 0666, function(err, file_handle) {
			if (!err) {
				fs.write(file_handle, IP + ": " + time + ": " + ID + ": " + unescape(msg) + "\n\r", null, 'UTF8', function(err, written) {});
			}
			fs.close(file_handle);
		});
		//отлавливаем команду на изменение ника
		if(msg.search(/^%0A\/name%20/) == 0 || msg.search(/^\/name%20/) == 0) {
			oldID=ID;
			var tmsg = unescape(msg).substr(6).replace(/\s/, '');
			if(tmsg.length > 2) {
				tID=tmsg.substr(0, 7);
				if(!isnick(tID)) {
					ID=tID;
					session.nick=ID;
					socket.emit('nameChanged', {'oldname': oldID, 'newname': ID, 'time': time});
					socket.broadcast.emit('nameChanged', {'oldname': oldID, 'newname': ID, 'time': time});
				} else {
					socket.emit('uer', {'text': "Это имя занято."});
				}
			} else {
				socket.emit('uer', {'text': "Имя должно быть длиннее двух символов."});
			}
		} else {
			// Уведомляем клиента, что его сообщение успешно дошло до сервера
			socket.emit('msg', {'event': 'messageSent', 'name': ID, 'text': msg, 'time': time});
			// Отсылаем сообщение остальным участникам чата
			socket.broadcast.emit('msg', {'event': 'messageReceived', 'name': ID, 'text': msg, 'time': time});
		}
	});
	socket.on('getstartdata', function (){
		var max = 0;
		for(var i=0; i<keypoints.length; i++) {
			if(keypoints[i].id > max) {
				max = keypoints[i].id;
			}
		}
		socket.emit('somemt', {'text': maintopic});
		socket.emit('somekps', {'data': keypoints, 'max': max});
	});
	// При отключении клиента - уведомляем остальных
	socket.on('disconnect', function() {
		nicklist.splice(isnick(ID)-1, 1);
		var time = (new Date).toLocaleTimeString();
		io.sockets.emit('userSplit', {'name': ID, 'time': time});
	});
	socket.on('ls', function (){
		socket.emit("lsa", { 'Arr' : nicklist });
	});




	socket.on('changepasswd', function (data) {
		var myDate = new Date;
		var shorttime = (myDate.getMonth() + 1) + "-" + myDate.getDate() + "-" + myDate.getFullYear();
		if(crypto.createHash('sha256').update(IP + shorttime + data.token).digest("HEX") == token && token != "") {
			fs.writeFile(passwdfile, crypto.createHash('sha256').update(data.passwd).digest("HEX"), {encoding: 'utf8'}, function(err) {
				if(err) {
					console.log(err);
					socket.emit('suerr', {'text': 'На сервере ошибочка.'});
				} else {
					console.log("Пароль изменен.");
					socket.emit('suchconfirm', {'text': 'Пароль изменен.'});
				}
			});
		} else {
			console.log("Недостаточно прав.");
			socket.emit('suerr', {'text': 'Недостаточно прав.'});
		}
	});
	socket.on('sudo', function (data){
		if(data.name && data.passwd) {
			var myDate = new Date;
			var shorttime = (myDate.getMonth() + 1) + "-" + myDate.getDate() + "-" + myDate.getFullYear();
			var tocheck = crypto.createHash('sha256').update(data.passwd).digest("HEX");
			if(data.name == sudoer && tocheck == supasswd) {
				tokentosend = crypto.createHash('sha256').update(supasswd + "supersalt").digest("HEX");
				token = crypto.createHash('sha256').update(IP + shorttime + tokentosend).digest("HEX");
				//console.log(IP + " / " + token + " / " + tokentosend);
				socket.emit('suconfirm', {'text': 'Вход разрешен.', 'token': tokentosend});
				console.log("Вход разрешен.");
			} else {
				socket.emit('suerr', {'text': 'Неврная пара логин/пароль.', 'token': ""});
				console.log("Неврная пара логин/пароль.");
			}
		} else {
			socket.emit('suerr', {'text': 'Пришло всё, кроме логина и пароля, проследуйте в XVI.' + data.name + " / " + data.passwd});
			console.log("Пришло всё, кроме логина и пароля, проследуйте в XVI.");
		}
	});
	socket.on('checksudoer', function (data){
		var myDate = new Date;
		var shorttime = (myDate.getMonth() + 1) + "-" + myDate.getDate() + "-" + myDate.getFullYear();
		if(data.token) {
			if(crypto.createHash('sha256').update(IP + shorttime + data.token).digest("HEX") == token && token != "") {
				socket.emit('suconfirm', {'text': 'Вход разрешен.', 'token': tokentosend});
			} else {
				// console.log("Недостаточно прав.");
				// socket.emit('suerr', {'text': 'Недостаточно прав.'});
			}
		}
	});




	socket.on('updkeypoints', function (data){
		//data.id;
		//data.text;
		//data.author;
		//data.token;
		var myDate = new Date;
		var shorttime = (myDate.getMonth() + 1) + "-" + myDate.getDate() + "-" + myDate.getFullYear();
		if(crypto.createHash('sha256').update(IP + shorttime + data.token).digest("HEX") == token && token != "") {
			var flag = 0;
			socket.broadcast.emit('updkp', {'id': data.id, 'text': data.text, 'author': data.author});
			for(var i=0; i<keypoints.length; i++) {
				if(keypoints[i].id == data.id) {
					keypoints[i].text = data.text;
					keypoints[i].author = data.author;
					flag = 1;
				}
			}
			if(flag == 0) {
				keypoints.push({'id': data.id, 'text': data.text, 'author': data.author});
			}
		} else {
			console.log("Недостаточно прав.");
			socket.emit('suerr', {'text': 'Недостаточно прав.'});
		}
	});
	socket.on('delkeypoint', function (data){
		//data.id;
		//data.token;
		var myDate = new Date;
		var shorttime = (myDate.getMonth() + 1) + "-" + myDate.getDate() + "-" + myDate.getFullYear();
		if(crypto.createHash('sha256').update(IP + shorttime + data.token).digest("HEX") == token && token != "") {
			var flag = 0;
			socket.broadcast.emit('delkp', {'id': data.id});
			for(var i=0; i<keypoints.length; i++) {
				if(keypoints[i].id == data.id) {
					keypoints.splice(i, 1);
				}
			}
		} else {
			console.log("Недостаточно прав.");
			socket.emit('suerr', {'text': 'Недостаточно прав.'});
		}
	});
	socket.on('updmaintopic', function (data){
		//data.text;
		//data.token;
		var myDate = new Date;
		var shorttime = (myDate.getMonth() + 1) + "-" + myDate.getDate() + "-" + myDate.getFullYear();
		if(crypto.createHash('sha256').update(IP + shorttime + data.token).digest("HEX") == token && token != "") {
			socket.broadcast.emit('updmt', {'text': data.text});
			maintopic = data.text;
		} else {
			console.log("Недостаточно прав.");
			socket.emit('suerr', {'text': 'Недостаточно прав.'});
		}
	});



	socket.on('updlookup', function (data){
		var myDate = new Date;
		var shorttime = (myDate.getMonth() + 1) + "-" + myDate.getDate() + "-" + myDate.getFullYear();
		if(crypto.createHash('sha256').update(IP + shorttime + data.token).digest("HEX") == token && token != "") {
			fs.open("./public/css/patch.css", "w", 0666, function(err, file_handle) {
				if (!err) {
					fs.write(file_handle, data.text, null, 'UTF8', function(err, written) {});
					socket.emit('susucc', {'text': 'Стили применены.'});
				} else {
					socket.emit('suerr', {'text': 'Ошибка при записе в файл стилей.'});
				}
				fs.close(file_handle);
			});
		} else {
			console.log("Недостаточно прав.");
			socket.emit('suerr', {'text': 'Недостаточно прав.'});
		}
	});
	socket.on('defaultlookup', function (data){
		var myDate = new Date;
		var shorttime = (myDate.getMonth() + 1) + "-" + myDate.getDate() + "-" + myDate.getFullYear();
		if(crypto.createHash('sha256').update(IP + shorttime + data.token).digest("HEX") == token && token != "") {
			fs.open("./public/css/patch.css", "w", 0666, function(err, file_handle) {
				if (!err) {
					socket.emit('susucc', {'text': 'Восстановлены стандартные стили.'});
				} else {
					socket.emit('suerr', {'text': 'Ошибка при очистке файла стилей.'});
				}
				fs.close(file_handle);
			});
		} else {
			console.log("Недостаточно прав.");
			socket.emit('suerr', {'text': 'Недостаточно прав.'});
		}
	});
});

function isnick(data) {
	for(i=0; i<nicklist.length; i++) {
		if(nicklist[i].nick == data) {
			return i+1;
		}
	}
	return 0;
}