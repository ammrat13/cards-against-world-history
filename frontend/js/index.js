function updatePlayerList(roomN){
	$.post("/players", {rN: roomN}, function(data){
		// Game does not exist
		if(data === ""){
			$("#player-listing").html("There are no players.");
		} else {
			$("#player-listing").html("");
			// Website gives `data` as an array with player names
			for(let i=0; i<data.length; i+=3){
				$("#player-listing").html($("#player-listing").html() + 
					"<div class=\"row\">" + 
						"<div class=\"col-sm\">" + 
							(data[i] === undefined ? "" : data[i]) +
						"</div>" +
						"<div class=\"col-sm\">" + 
							(data[i+1] === undefined ? "" : data[i+1]) +
						"</div>" +
						"<div class=\"col-sm\">" + 
							(data[i+2] === undefined ? "" : data[i+2]) +
						"</div>" +
					"</div>"
				);
			}
		}
	});
}

$(document).ready(function(){
	// Check if a ping failed
	if(new URL(window.location.href).searchParams.get("ping_fail") === "true"){
		$.notify({
			title: "<b>Error:</b>",
			message: "Something went wrong"
		},{
			type: "danger",
			placement: {
				from: "top",
				align: "center"
			},
			newest_on_top: true
		});
	}

	setInterval(function(){
		updatePlayerList($("#room-name").val());
	}, 3000)

	$("#room-name").on("input", function(){
		$("#player-listing").html("Loading...");
		updatePlayerList($("#room-name").val());
		$.post("/is_full", {rN: $("#room-name").val()}, function(data){
			if(data === "true"){
				$("#room-name").addClass("is-invalid");
				$("#room-nameHelpBlock").show();
			} else {
				$("#room-name").removeClass("is-invalid");
				$("#room-nameHelpBlock").hide();
			}
		});
	});

	$("#player-name").on("input", function(){
		if($("#player-name").val() === ""){
			$("#player-name").addClass("is-invalid");
			$("#player-nameHelpBlock").show();
			$("#player-nameHelpBlock").html("You must enter a name.");
		} else {
			$("#player-name").removeClass("is-invalid");
			$("#player-nameHelpBlock").hide();
			$.post("/is_name_taken", {rN: $("#room-name").val(), pN: $("#player-name").val()}, function(data){
				if(data === "true"){
					$("#player-name").addClass("is-invalid");
					$("#player-nameHelpBlock").show();
					$("#player-nameHelpBlock").html("This name is already taken.");
				} else {
					$("#player-name").removeClass("is-invalid");
					$("#player-nameHelpBlock").hide();
				}
			});
		}
	});

	$("#join-form").submit(function(e){
		e.preventDefault();

		if($("#player-name").val() !== ""){
			let rNTemp = $("#room-name").val();
			let pNTemp = $("#player-name").val();

			$("#join-btn").html("Loading...");
			$("#join-btn").prop("disabled", true);
			$("#room-name").prop("disabled", true);
			$("#player-name").prop("disabled", true);

			$.post("/join", {rN: rNTemp, pN: pNTemp}, function(data){
				if(data === "Fail"){
					$.notify({
						title: "<b>Error:</b>",
						message: "Something went wrong"
					},{
						type: "danger",
						placement: {
							from: "top",
							align: "center"
						},
						newest_on_top: true
					});
					$("#join-btn").html("Join");
					$("#join-btn").prop("disabled", false);
					$("#room-name").prop("disabled", false);
					$("#player-name").prop("disabled", false);
				} else if(data === "Done"){
					window.location.href = "game.html?rN=" + rNTemp + "&pN=" + pNTemp;
				}
			});
		}
	});
});