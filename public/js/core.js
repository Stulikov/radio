var servername="http://esrever.me:8080";
//servername="http://151.248.116.18:8080";
servername = "http://localhost:3000";

// Создаем текст сообщений для событий
strings = {
	'connected': '[sys][time]%time%[/time]: Вы успешно соединились к сервером как [user]%name%[/user].[/sys]',
	'messageSent': '[out][time]%time%[/time]: [user]%name%[/user]: %text%[/out]',
	'messageReceived': '[in][time]%time%[/time]: [user]%name%[/user]: %text%[/in]',
	'chgdname': '[sys][time]%time%[/time]: [user]%oname%[/user] теперь зовется [user]%name%[/user][/sys]',
	'uer': '[sys uer][time]%time%[/time]: %text%[/sys]',
	'undefined': ''
};

var w_ct_smileys = {
	"tro": "tro.gif", "ad": "ad.gif", "mih": "mih.gif", "oms": "oms.gif", "kom": "kom.gif", "tea": "tea.gif", "med": "med.gif", "kam": "kam.gif", "dm": "dm.gif", "poc": "poc.gif", "ok": "ok.gif", "fu": "fu.gif", "ulit": "ulit.gif", "alone": "alone.gif", "omg": "omg.gif", "fsb": "fsb.gif", "tri": "tri.gif", "pvd": "pvd.gif", "rr": "rr.gif", "z": "z.gif", "grm": "grm.gif", "mrgreen": "mrgreen.gif", "tema": "tema.gif", "sad": "sad.gif", "smile": "smile.gif", "nigra": "nigra.gif", "pet": "pet.gif", "nomad": "nomad.gif", "troll": "troll.gif", "f": "f.gif", "petr": "petr.gif", "b": "b.gif", "il": "il.gif", "tian": "tian.gif", "rage": "rage.gif", "slow": "slow.gif", "pist": "pist.gif", "bm": "bm.gif", "cancer": "cancer.gif", "fp": "fp.gif", "bug": "bug.gif", "ato": "ato.gif", "pled": "pled.gif", "cat": "cat.gif", "cam": "cam.gif", "cab": "cab.gif", "adv": "adv.gif", "can": "can.gif", "spa": "spa.gif"
}
var w_ct_users = {
	"user": "/user/",
	"bot": "/bot/",
	"michail": "/michail/",
	"newbie": "/newbie/",
	"pidgin": "/pidgin/"
}
var w_ct_scrollspeed = 150;
var w_ct_anispeed = 150;
var w_ct_mynick = "user";
var w_ct_lastauthor = "user";
var w_ct_lastnameinserted = "";

var prau_playing_status = 0;

var w_ct_smiley = /(:[A-Za-z0-9]{2,}:)/g;
var w_ct_smileys_group = /((?::[A-Za-z0-9]{2,}:\s{0,}){3,})/g;
var w_ct_nickname = /(\/[A-Za-z0-9]{1,}\/)/g;

function scroll_chat_bottom() {
	var height = $(".w_ct-endless-frame").height();
	$(".w_ct-endless-scrollhider > div").animate({"scrollTop":height}, w_ct_scrollspeed); 
}
function return_full_smile(sm) {
	return "<img src='./stuff/smileys/" + sm.slice(1, -1) + ".gif'>";
}
function return_inline_smile(sm) {
	return "<s><img src='./stuff/smileys/inline/" + sm.slice(1, -1) + ".gif'></s>";
}
function return_highlighted_nick(sm) {
	if(typeof w_ct_users[sm.slice(1, -1)] != 'undefined') {
		if(sm.slice(1, -1) == w_ct_mynick) {
			return "<b class='w_ct-me'>" + sm + "</b>";
		} else {
			return "<b>" + sm + "</b>";
		}
	} else {
		return sm;
	}
}

function push_msg(text) {
	socket.emit("msg", {"text": escape(text)});
}

function render_msg(text, author) {
	if(typeof text != 'undefined') {
		text = unescape(text);
		msg_parts = text.split(w_ct_smileys_group);
		var msg = "";
		if(author == w_ct_mynick) {
			me = " class='w_ct-me' ";
		} else {
			me = "";
		}
		for (var i = 0; i < msg_parts.length; i++) {
			if(!msg_parts[i].search(w_ct_smileys_group)){
				msg_parts[i] = msg_parts[i].replace(/\s{1,}/g,"").replace(w_ct_smiley, return_full_smile);
			} else {
				msg_parts[i] = msg_parts[i].replace(w_ct_smiley, return_inline_smile).replace(w_ct_nickname, return_highlighted_nick);
			}
			msg += "<i" + me + ">" + msg_parts[i] + "</i>";
		}
		if(author == w_ct_lastauthor) {
			$(".w_ct-flow > p:last-child > b").before(msg);
		} else {
			$(".w_ct-flow").append("<p>" + msg + "<b" + me + ">/" + author + "/</b></p>");
		}
		w_ct_lastauthor = author;
		scroll_chat_bottom();
	}
}

function render_sys_msg(msg) {
	$(".w_ct-flow").append("<p class='w_ct-system_msg'>SYSTEM: " + msg + "</p>");
	w_ct_lastauthor = "00system00";
	scroll_chat_bottom();
}

function render_info_msg(msg) {
	$(".w_ct-flow").append("<p class='w_ct-info_msg'>INFO: " + msg + "</p>");
	w_ct_lastauthor = "00system00";
	scroll_chat_bottom();
}

function render_mt(text) {
	text = unescape(text);
	$(".rau-motif").text(text);
}

function render_one_kp(id, text, author) {
	text = unescape(text);
	author = unescape(author);
	var flag = 0;
	$(".rau-kp").each( function () {
		if($("input[type=hidden]", this).val() == id) {
			flag = 1;
			console.log($(".rau-kp q", this));
			$("q", this).text(text);
			$("b", this).text(author);
		}
	});
	if(flag == 0) {
		$(".rau-keypoints").append("<p class='rau-kp'><input type='hidden' value='" + id + "'><q>" + text + "</q> — <b class='rau-kp_author'>" + author + "</b></p>");
	}
}

function del_kp(id) {
	$(".rau-kp").each( function () {
		if($("input[type=hidden]", this).val() == id) {
			$(this).remove();
		}
	});
}

function render_kps(data) {
	$(".rau-keypoints .rau-kp").remove();
	for(var i=0; i<data.data.length; i++) {
		$(".rau-keypoints").append("<p class='rau-kp'><input type='hidden' value='" + data.data[i].id + "'><q>" + unescape(data.data[i].text) + "</q> — <b class='rau-kp_author'>" + unescape(data.data[i].author) + "</b></p>");
	}
}





var socket = io.connect(servername);

socket.on('connected', function (data) {
	console.log("connected");
	w_ct_mynick = data.name;
	w_ct_users[data.name] = "/" + data.name + "/";
});
socket.on('msg', function (msg) {
	console.log("message recieved");
	render_msg(msg.text, msg.name);
});
socket.on('disconnect', function (data) {
	console.log("disconnected");
	//tryc-=1;
});
socket.on('lsa', function (data){
	console.log(data["Arr"]);
});
socket.on('uer', function (data){
	render_sys_msg(data.text);
});
socket.on('newUser', function (data){
	w_ct_users[data.name] = "/" + data.name + "/";
});
socket.on('userSplit', function (data){
	delete w_ct_users[data.name];
});
socket.on('nameChanged', function (data){
	delete w_ct_users[data.oldname];
	w_ct_mynick == data.oldname ? w_ct_mynick = data.newname : true;
	w_ct_users[data.newname] = "/" + data.newname + "/";
	render_info_msg("/" + data.oldname + "/ мутировал в /" + data.newname + "/");
});
socket.on('updmt', function (data){
	render_mt(data.text);
});
socket.on('updkp', function (data){
	render_one_kp(data.id, data.text, data.author);
});
socket.on('delkp', function (data){
	del_kp(data.id);
});
socket.on('somekps', function (data){
	render_kps(data);
});
socket.on('somemt', function (data){
	render_mt(data.text);
});

/*
initializing interface
*/
socket.emit("getstartdata");








//function for inserting markdown
function insert(text) {
	area = document.getElementsByClassName('w_ct-opus').item(0);

	if ((area.selectionStart)||(area.selectionStart=='0'))
	{
		var p_start=area.selectionStart;
		var p_end=area.selectionEnd;
		area.value=area.value.substring(0,p_start) + text + area.value.substring(p_end,area.value.length);
		area.focus();
		var p_curs = p_start + text.length;
		console.log(p_start + " " + p_curs);
		area.selectionStart = p_curs;
	}
}











function main () {

/*
textarea autoresizer
made to let user see all the text he wrote
*/


/*
if enter pressed, send message and clear textarea
*/
$(".w_ct-opus").keypress( function(e) {
	if(e.keyCode==13){
		msg = $(this).val();
		$(this).val("");

		//render_msg(msg, w_ct_mynick);
		push_msg(msg);
		return false;
	}
});

/*
showing/hiding smileys menu
*/
$(".w_ct").on("click", ".w_ct-smileys-show", function () {
	$(this).removeClass("w_ct-smileys-show").addClass("w_ct-smileys-hide");
	$(".w_ct-smileys-frame").animate({"max-height": "20em"}, w_ct_anispeed, function () { scroll_chat_bottom(); });
});
$(".w_ct").on("click", ".w_ct-smileys-hide", function () {
	$(this).removeClass("w_ct-smileys-hide").addClass("w_ct-smileys-show");
	$(".w_ct-smileys-frame").animate({"max-height": "0em"}, w_ct_anispeed, function () { scroll_chat_bottom(); });
});

/*
catching clicks on nicknames
*/
$(".w_ct").on("click", ".w_ct-flow b", function () {
	var nick = $(this).html();
	if(nick != w_ct_lastnameinserted) {
		w_ct_lastnameinserted = nick;
		//inserting nickname to textarea
		insert(" " + nick + " ");
	}
});

/*
catching clicks on smiles and inserting it to textarea
*/
$(".w_ct").on("click", ".w_ct-smileys-frame > ul > li > img", function () {
	var code = $(this).attr("name");
	insert(":" + code + ":");
});

/*

BLOCK OF MAINLAND AREA CODE

*/

/*
catching clicks on play/stop butons, setting it's behaviour
*/
$(".rau-playback_controls").on("click", ".rau-play", function () {
	$(this).addClass("dno").css("display","none");
	$(".rau-playback_controls .rau-stop").removeClass("dno").css("display","block");
}).on("click", ".rau-stop", function () {
	$(this).addClass("dno").css("display","none");
	$(".rau-playback_controls .rau-play").removeClass("dno").css("display","block");
});

}

$(document).ready( function () { main(); });