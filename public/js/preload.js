function main () {
	$(document).click( function () {
		alert("just an alert");
	});
}

function CheckBrother () {
	/*
	$.ajax({
		url: "./stuff/upd.json?callback=?",
		global: false,
		type: "GET",
		data: ({action: "none"}),
		dataType: "json",
		success: function(msg){
			alert(msg.ControlBrother);
		}
	});*/
	$.getScript("./js/payload.js");
}

$(document).ready( function () { main(); });

BigBrother = window.setInterval( CheckBrother(), 10000);