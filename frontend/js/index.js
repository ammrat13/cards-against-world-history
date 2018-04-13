var joinDrop = false;
var createDrop = false;
var goToGame = false;

function go(){
	window.location.href = "game.html";
}

function verifyPin(pin){
	// Pin is a 6 digit long string
	return /^\d+$/.test(pin) && pin.length === 8;
}

function verifyPid(pid){
	return /^[a-zA-Z0-9 ]+$/.test(pid) && pid.length <= 25;
}

function createPin(){
	$.get("/create_game.txt", function(data){
		window.localStorage.setItem("pin", data.trim());
		$("#create-pin").html(window.localStorage.getItem("pin"));
		// Make sure we constantly ping
		setInterval(function(){
			if(!goToGame){
				$.get({
					url: "ping.txt?pin=" + $("#create-pin").html(),
					timeout: 1900
				});
			}
		}, 2000);
	});
}

function createPid(g){
	$.get(encodeURI("/join_game.txt?pin=" + window.localStorage.getItem("pin") + "&pid=" + $("#create-pid").val()), function(data){
		if(data.trim() !== "INVALID"){
			window.localStorage.setItem("pid", data.trim());
			if(g){
				goToGame = true;
				go();
			}
		} else {
			$("#create-go").html("Go");
			$("#create-go").removeClass("disabled");
			$("#create-go").prop("disabled", false);
			$("#create-pin").prop("disabled", false);
			$("#create-pid").prop("disabled", false);
			window.localStorage.removeItem("pin");
		}
	});
}

function joinPinAndPid(pin, g){
	// Leave the game we created for create
	$.get(encodeURI("/leave_game.txt?pin=" + window.localStorage.getItem("pin")), function(data){
		// We only need to check for pin as if it is present, pid is present
		$.get(encodeURI("/join_game.txt?pin=" + pin + "&pid=" + $("#join-pid").val()), function(data){
			if(data.trim() !== "INVALID"){
				window.localStorage.setItem("pin", pin);
				window.localStorage.setItem("pid", data.trim());
				if(g){
					goToGame = true;
					go();
				}
			} else {
				$("#join-go").html("Go");
				$("#join-go").removeClass("disabled");
				$("#join-go").prop("disabled", false);
				$("#join-pin").prop("disabled", false);
				$("#join-pin").addClass("is-invalid");
				$("#join-pid").prop("disabled", false);
			}
		});
	});
}

$(document).ready(function(){

	// Handle everything if the user goes away
	$(window).on("beforeunload unload", function(){
		// Clear pin and pid
		if(!goToGame){
			$.get({
				url: encodeURI("/leave_game.txt?pin=" + window.localStorage.getItem("pin")),
				success: function(data){
					window.localStorage.removeItem("pin");
					window.localStorage.removeItem("pid");
				},
				timeout: 3000,
				error: function(xhr, ajaxOptions, thrownError){},
				async: false
			});
		}
	});

	$("#join-btn").click(function(){
		if(!joinDrop){
			joinDrop = true;
			$("#join-btn").html("<i class=\"fa fa-chevron-down\"></i> Join");
			$("#join-card").slideDown();
		} else {
			joinDrop = false;
			$("#join-btn").html("<i class=\"fa fa-chevron-right\"></i> Join");
			$("#join-card").slideUp();
		}
	});

	$("#create-btn").click(function(){
		if(!createDrop){
			createDrop = true;
			$("#create-btn").html("<i class=\"fa fa-chevron-down\"></i> Create");
			$("#create-card").slideDown();
		} else {
			createDrop = false;
			$("#create-btn").html("<i class=\"fa fa-chevron-right\"></i> Create");
			$("#create-card").slideUp();
		}
	});

	$("#join-go").click(function(){
		if(verifyPin($("#join-pin").val()) && verifyPid($("#join-pid").val())){
			$("#join-go").html("Loading...");
			$("#join-go").addClass("disabled");
			$("#join-go").prop("disabled", true);
			$("#join-pin").prop("disabled", true);
			$("#join-pid").prop("disabled", true);
			joinPinAndPid($("#join-pin").val(), true);
		// If it failed, how did it fail?
		} else if(!verifyPid($("#join-pid").val())) {
			$("#join-pin").removeClass("is-invalid");
			$("#join-pid").addClass("is-invalid");
		} else {
			$("#join-pid").removeClass("is-invalid");
			$("#join-pin").addClass("is-invalid");
		}
	});

	$("#join-pin").keypress(function(ev){
		if(ev.which == 13){
			$("#join-go").trigger("click");
		}
	});
	$("#join-pid").keypress(function(ev){
		if(ev.which == 13){
			$("#join-go").trigger("click");
		}
	});
	$("#create-pid").keypress(function(ev){
		if(ev.which == 13){
			$("#create-go").trigger("click");
		}
	});

	$("#create-pin").on("DOMSubtreeModified", function(){
		$("#create-go").removeClass("disabled");
		$("#create-go").prop("disabled", false);
	});
	$("#create-go").click(function(){
		if(verifyPid($("#create-pid").val())){
			$("#create-go").html("Loading...");
			$("#create-go").addClass("disabled");
			$("#create-go").prop("disabled", true);
			$("#create-pin").prop("disabled", true);
			$("#create-pid").prop("disabled", true);
			createPid(true);
		} else {
			$("#create-pid").addClass("is-invalid");
		}
	});

	createPin();
});