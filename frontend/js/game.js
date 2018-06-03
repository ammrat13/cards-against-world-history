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
			data !== "" ? $("#prompt").html(data) : errorOut();
		},
		error: function(jqXHR, textStatus, errorThrown){
			errorOut();
		},
		timeout: 3000
	});

	// Card Czar
	// Must come before hand as there is different handling
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

	// Hand
	$.ajax({
		method: "POST",
		url: "/get_player_hand",
		data: {rN: roomN, pN: playerN},
		success: function(data){
			// Website gives `data` as an array with cards
			if(!isCardCzar){
				$("#cards").html("");
				for(let i=0; i<data.length; i+=3){
					$("#cards").html($("#cards").html() + 
						"<div class=\"row\">" + 
							"<div class=\"col-md player-card-container\">" + 
								(data[i] === undefined ? "" : "<div class=\"card player-card\"><div class=\"card-body\">" + data[i] + "</div></div>") +
							"</div>" +
							"<div class=\"col-md player-card-container\">" + 
								(data[i+1] === undefined ? "" : "<div class=\"card player-card\"><div class=\"card-body\">" + data[i+1] + "</div></div>") +
							"</div>" +
							"<div class=\"col-md player-card-container\">" + 
								(data[i+2] === undefined ? "" : "<div class=\"card player-card\"><div class=\"card-body\">" + data[i+2] + "</div></div>") +
							"</div>" +
						"</div>"
					);
				}
			}
		},
		error: function(jqXHR, textStatus, errorThrown){
			errorOut();
		},
		timeout: 3000
	});

	//Field if card czar
	$.ajax({
		method: "POST",
		url: "/get_field",
		data: {rN: roomN},
		success: function(data){
			// Website gives `data` as an array with cards
			if(isCardCzar){
				$("#cards").html("");
				for(let i=0; i<data.length; i+=3){
					$("#cards").html($("#cards").html() + 
						"<div class=\"row\">" + 
							"<div class=\"col-md player-card-container\">" + 
								(data[i] === undefined ? "" : "<div class=\"card player-card\"><div class=\"card-body\">" + data[i] + "</div></div>") +
							"</div>" +
							"<div class=\"col-md player-card-container\">" + 
								(data[i+1] === undefined ? "" : "<div class=\"card player-card\"><div class=\"card-body\">" + data[i+1] + "</div></div>") +
							"</div>" +
							"<div class=\"col-md player-card-container\">" + 
								(data[i+2] === undefined ? "" : "<div class=\"card player-card\"><div class=\"card-body\">" + data[i+2] + "</div></div>") +
							"</div>" +
						"</div>"
					);
				}
			}
		},
		error: function(jqXHR, textStatus, errorThrown){
			errorOut();
		},
		timeout: 3000
	});

	// Leaderboard
	$.ajax({
		method: "POST",
		url: "/get_leaderboard",
		data: {rN: roomN},
		success: function(data){
			if(data === ""){
				errorOut();
			}

			$("#leaderboard").html("");
			for(let i=0; i<data.length; i++){
				$("#leaderboard").html($("#leaderboard").html() + 
					"<tr>" +
						"<th style=\"width: 20%\" scope=\"col\">" + (i+1) + "</th>" +
						"<th scope=\"col\">" + data[i].nam + "</th>" + 
						"<th scope=\"col\">" + data[i].score + "</th>" +
					"</tr>"
				);
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