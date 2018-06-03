let roomN = null;
let playerN = null;
let cardCzar = null;
let playerScore = 0;
let selectedCard = false;

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
	$.ajax({
		method: "POST",
		url: "/get_card_czar",
		data: {rN: roomN},
		success: function(data){
			let oldCardCzar = cardCzar;
			cardCzar = data;

			if(cardCzar === playerN && oldCardCzar !== cardCzar){
				selectedCard = false;
				$("#card-czar-alert").slideDown();
			} else if(cardCzar !== playerN && oldCardCzar !== cardCzar) {
				$("#card-czar-alert").slideUp();
				// Hand only when card czar changes
				$.ajax({
					method: "POST",
					url: "/get_player_hand",
					data: {rN: roomN, pN: playerN},
					success: function(data){
						selectedCard = false;
						// Website gives `data` as an array with cards
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
					},
					error: function(jqXHR, textStatus, errorThrown){
						errorOut();
					},
					timeout: 3000
				});
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
			if(cardCzar === playerN){
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

			// Make sure we get the scrolling right
			let scrollTemp = $("#leaderboard-container").scrollTop();

			$("#leaderboard").html("");
			for(let i=0; i<data.length; i++){
				$("#leaderboard").html($("#leaderboard").html() + 
					"<tr>" +
						"<th style=\"width: 20%\" scope=\"col\">" + (i+1) + "</th>" +
						"<th scope=\"col\">" + data[i].nam + "</th>" + 
						"<th scope=\"col\">" + data[i].score + "</th>" +
					"</tr>"
				);

				// Notification if we scored
				if(data[i].nam === playerN && data[i].score === playerScore + 1){
					playerScore++;
					$.notify({
						title: "<b>You Scored:</b>",
						message: "Your score increased by one"
					},{
						type: "success",
						placement: {
							from: "top",
							align: "center"
						},
						delay: 3000,
						animate: {
							enter: "animated fadeInDown",
							exit: "animated fadeOutUp"
						},
						newest_on_top: true
					});
				}
			}

			$("#leaderboard-container").scrollTop(scrollTemp);
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

	// So it works with dynamically added elements
	// From http://www.makeitspendit.com/fix-jquery-click-event-not-working-with-dynamically-added-elements/
	$("body").on("click", ".card-body", function(){
		if(!selectedCard){
			selectedCard = true;

			$(".card-body").removeClass("bg-success");
			$(".card-body").removeClass("text-white");

			$(this).addClass("bg-success");
			$(this).addClass("text-white");

			// Different handling if we are the card czar
			if(cardCzar !== playerN){
				$.ajax({
					method: "POST",
					url: "/select_card",
					data: {rN: roomN, pN: playerN, cd: $(this).html()},
					success: function(data){
						if(data === "Fail"){
							errorOut();
						}
					},
					error: function(jqXHR, textStatus, errorThrown){
						errorOut();
					},
					timeout: 3000
				});
			} else {
				$.ajax({
					method: "POST",
					url: "/card_czar_select",
					data: {rN: roomN, cd: $(this).html()},
					success: function(data){
						if(data === "Fail"){
							errorOut();
						} else {
							update();
						}
					},
					error: function(jqXHR, textStatus, errorThrown){
						errorOut();
					},
					timeout: 3000
				});
			}
		}
	});

	// Call update at start and every 3 seconds
	update();
	setInterval(function(){
		update();	
	}, 3000);
});