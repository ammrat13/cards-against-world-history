let roomN = null;
let playerN = null;
let isCardCzar = false;

function errorOut(){
	window.location.href = "/index.html?ping_fail=true"
}

function update(){
	// Pinging
	$.ajax({
		method: "POST",
		url: "/ping",
		data: {rN: roomN, pN: playerN},
		success: function(data){
			if(data !== "Done"){
				errorOut();
			}
		},
		error: function(jqXHR, textStatus, errorThrown){
			errorOut();
		},
		timeout: 3000
	});

	// Black card
	$.ajax({
		method: "POST",
		url: "/get_b_card",
		data: {rN: roomN},
		success: function(data){
			$("#prompt").html(data);
		},
		error: function(jqXHR, textStatus, errorThrown){
			errorOut();
		},
		timeout: 3000
	});

	// Card Czar
	$.ajax({
		method: "POST",
		url: "/get_card_czar",
		data: {rN: roomN},
		success: function(data){
			if(data === playerN){
				isCardCzar = true;
				$("#card-czar-alert").slideDown();
			} else {
				isCardCzar = false;
				$("#card-czar-alert").slideUp();
			}
		},
		error: function(jqXHR, textStatus, errorThrown){
			errorOut();
		},
		timeout: 3000
	});
}

$(document).ready(function(){
	// Set room and player names
	roomN = new URL(window.location.href).searchParams.get("rN");
	playerN = new URL(window.location.href).searchParams.get("pN");
	$("#room-name").html(roomN);

	// Call update at start and every 3 seconds
	update();
	setInterval(function(){
		update();	
	}, 3000);
});