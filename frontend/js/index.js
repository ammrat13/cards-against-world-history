var joinDrop = false;
var createDrop = false;

function verifyPin(pin){
	// Pin is a 6 digit long string
	return /^\d+$/.test(pin) && pin.length === 6;
}

function retrPinAndPid(){
	// We only need to check for pin as if it is present, pid is present
	window.localStorage.setItem("pin", "126352");
	window.localStorage.setItem("pid", "0");
}

function go(){
	window.location.href = "game.html";
}

$(document).ready(function(){
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
		if(verifyPin($("#join-pin").val())){
			window.localStorage.setItem("pin", $("#join-pin").val());
			go();
		} else {
			$("#join-pin").addClass("is-invalid");
		}
	});

	$("#create-go").click(function(){
		if(verifyPin($("#create-pin").html())){
			window.localStorage.setItem("pin", $("#create-pin").html());
			go();
		}
	});

	retrPin();
	$("#create-pin").html(window.localStorage.getItem("pin"));
});