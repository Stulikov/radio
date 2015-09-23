var servername="http://esrever.me:8080";
//servername="http://151.248.116.18:8080";
servername = "http://localhost:3000";

socket = io.connect(servername);

var brand = {
	"align": "",
	"padding": "",
	"top": "",
	"font-size": "",
	"letter-spacing": "",
	"color": ""
}

var player = {
	"top": "",
	"controls-color": "",
	"nowplaying-color": "",
	"song-color": ""
}

var keypoints = {
	"top": "",
	"header-color": "",
	"text-color": "",
	"author-color": ""
}

var general = {
	"background-color": "",
	"background-image": "",
	"padding": "",
}

function show_respond(text, type, timedelay) {
	$("#serverrespond").stop(true, true).removeClass("fail").removeClass("success").addClass(type).find("p").html(text).parent().slideDown(w_ct_anispeed).delay(timedelay).slideUp(w_ct_anispeed);
}

function addpicker(trgt) {
	$(trgt).ColorPicker({
		color: "#" + $(trgt).val(),
		onShow: function (colpkr) {
			$(colpkr).fadeIn(100);
			return false;
		},
		onHide: function (colpkr) {
			$(colpkr).fadeOut(100);
			return false;
		},
		onChange: function (hsb, hex, rgb) {
			$(trgt).next(".colorpreview").css('background-color', '#' + hex);
			$(trgt).val(hex).trigger("change");
		}
	});
}
function updatePickerColor(trgt) {
	$(trgt).ColorPickerSetColor($(trgt).val());
}
socket.on('suconfirm', function (data) {
	console.log(data.token);
	setCookie('token', data.token);
	$("#loginwrapper").fadeOut(50);
	$("#allthecontent").fadeIn(50);
});
socket.on('suerr', function (data) {
	console.log(data.text);
	show_respond(data.text, "fail", 2000);
});
socket.on('susucc', function (data) {
	console.log(data.text);
	show_respond(data.text, "success", 2000);
});

function trylogin(name, passwd) {
	socket.emit("sudo", {'name': name, 'passwd': passwd});
}
function checkcookie() {
	console.log("trying" + getCookie('token'));
	socket.emit("checksudoer", {'token': getCookie('token')});
}

function main () {

checkcookie();
$("#lw_submit").on("click", function () {
	trylogin($("#lw_login").val(), $("#lw_pass").val());
	return false;
});
$("form").keypress( function(e) {
	if(e.keyCode==13){
		trylogin($("#lw_login").val(), $("#lw_pass").val());
		return false;
	}
});

$("#savestyle").on("click", function () {
	//$("#styles").css("display", "block");

	var styles = "\
#mainland {\
	background-color: " + general['background-color'] + " !important;\
	background-image: " + general['background-image'] + " !important;\
}\
\
.rau-stationname {\
	padding: " + brand['padding'] + " !important;\
	top: " + brand['top'] + " !important;\
	font-size: " + brand['font-size'] + " !important;\
	letter-spacing: " + brand['letter-spacing'] + " !important;\
	color: " + brand['color'] + " !important;\
	text-align: " + brand['align'] + ";\
}\
\
.rau-player {\
	padding: " + player['padding'] + " !important;\
	top: " + player['top'] + " !important;\
}\
\
.rau-keypoints {\
	padding: " + keypoints['padding'] + " !important;\
	top: " + keypoints['top'] + " !important;\
}\
\
.rau-playback_controls svg polygon {\
	fill: " + player['controls-color'] + " !important;\
}\
\
.rau-title {\
	color: " + player['nowplaying-color'] + " !important;\
}\
\
.rau-songname {\
	color: " + player['song-color'] + " !important;\
}\
\
.rau-kp {\
	color: " + keypoints['author-color'] + " !important;\
	border-color: " + keypoints['author-color'] + " !important;\
}\
.rau-kp q,\
.rau-motif {\
	color: " + keypoints['text-color'] + " !important;\
}\
.rau-keypoints h1 {\
	color: " + keypoints['header-color'] + " !important;\
}\
	";
	$("#styles").text(styles);
	socket.emit("updlookup", {'text': styles, 'token': getCookie('token')});
});
$("#truncatestyle").on("click", function () {
	if(confirm("Уверен, что хочешь вернуться к стандартному стилю? Отменить не получится.")) {
		socket.emit("defaultlookup", {'token': getCookie('token')});
	}
});

addpicker($(".general-background-color"));
addpicker($(".brand-color"));
addpicker($(".player-controls-color"));
addpicker($(".player-nowplaying-color"));
addpicker($(".player-song-color"));
addpicker($(".kp-color"));
addpicker($(".kp-quote-color"));
addpicker($(".kp-author-color"));


$(".general-background-color").on("change", function () {
	var tmp = "#" + $(this).val();
	general['background-color'] = tmp;
	$(this).next(".colorpreview").css('background-color', tmp);
	$("#mainland").css("background-color", tmp);
	updatePickerColor(this);
});
$(".general-padding").on("change", function () {
	var tmp = "0% " + $(this).val() + "%";
	general.padding = tmp;
	player.padding = tmp;
	brand.padding = tmp;
	keypoints.padding = tmp;
	$(".rau-stationname, .rau-player, .rau-keypoints").css("padding", tmp);
});
$(".general-background-image").on("input", function () {
	var tmp = "url(" + $(this).val() + ")";
	general["background-image"] = tmp;
	$("#mainland").css("background-image", tmp);
});

$(".brand-align").on("change", function () {
	var tmp = $(this).val();
	brand['align'] = tmp;
	$(".rau-stationname").css("text-align", tmp);
});
$(".brand-padding-horizontal").on("change", function () {
	var tmp = "0% " + $(this).val() + "%";
	brand.padding = tmp;
	$(".rau-stationname").css("padding", tmp);
});
$(".brand-padding-vertical").on("change", function () {
	var tmp = $(this).val() + "%";
	brand.top = tmp;
	$(".rau-stationname").css("top", tmp);
});
$(".brand-font-size").on("change", function () {
	var tmp = $(this).val() + "em";
	brand["font-size"] = tmp;
	$(".rau-stationname").css("font-size", tmp);
});
$(".brand-letter-spacing").on("change", function () {
	var tmp = $(this).val() + "em";
	brand["letter-spacing"] = tmp;
	$(".rau-stationname").css("letter-spacing", tmp);
});
$(".brand-color").on("change", function () {
	var tmp = "#" + $(this).val();
	general['color'] = tmp;
	$(this).next(".colorpreview").css('background-color', tmp);
	$(".rau-stationname").css("color", tmp);
	updatePickerColor(this);
});

$(".player-padding").on("change", function () {
	var tmp = $(this).val() + "%";
	brand["top"] = tmp;
	$(".rau-player").css("top", tmp);
});
$(".player-controls-color").on("change", function () {
	var tmp = "#" + $(this).val();
	player['controls-color'] = tmp;
	$(this).next(".colorpreview").css('background-color', tmp);
	$(".rau-playback_controls svg polygon").css("fill", tmp);
	updatePickerColor(this);
});
$(".player-nowplaying-color").on("change", function () {
	var tmp = "#" + $(this).val();
	player['nowplaying-color'] = tmp;
	$(this).next(".colorpreview").css('background-color', tmp);
	$(".rau-title").css("color", tmp);
	updatePickerColor(this);
});
$(".player-song-color").on("change", function () {
	var tmp = "#" + $(this).val();
	player['song-color'] = tmp;
	$(this).next(".colorpreview").css('background-color', tmp);
	$(".rau-songname").css("color", tmp);
	updatePickerColor(this);
});

$(".kp-padding").on("change", function () {
	var tmp = $(this).val() + "%";
	brand["top"] = tmp;
	$(".rau-keypoints").css("top", tmp);
});
$(".kp-color").on("change", function () {
	var tmp = "#" + $(this).val();
	keypoints['header-color'] = tmp;
	$(this).next(".colorpreview").css('background-color', tmp);
	$(".rau-keypoints > h1").css("color", tmp);
	updatePickerColor(this);
});
$(".kp-quote-color").on("change", function () {
	var tmp = "#" + $(this).val();
	keypoints['text-color'] = tmp;
	$(this).next(".colorpreview").css('background-color', tmp);
	$(".rau-kp q, .rau-motif").css("color", tmp);
	updatePickerColor(this);
});
$(".kp-author-color").on("change", function () {
	var tmp = "#" + $(this).val();
	keypoints['author-color'] = tmp;
	$(this).next(".colorpreview").css('background-color', tmp);
	$(".rau-kp").css("color", tmp).css("border-color", tmp);
	updatePickerColor(this);
});

}

$(document).ready( function () { main(); });