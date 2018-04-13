var WHRatio = .85

var pin = window.sessionStorage.getItem("pin");
var pid = window.sessionStorage.getItem("pid");
var oldDealt = [];
var dealtCards = [];
var fieldCards = [];
var handCards = [];
var score = 0;
var cardCzar = false;

var leader = false;
var slickInited = false;
var updating = false; // So we don't update while we are updating

function slickReload(){
	// Unslick if we have slicked already
	if(slickInited){
		$(".card-carousel").each(function(){
			$(this).slick("unslick");
		});
	} else {
		slickInited = true;
	}

	$(".card-carousel").each(function(){
		$(this).slick({
			slidesToShow: 1,
			arrows: true,
			infinite: true
		});
	});
}

function addDealt(s){
	$("#dealt-card-carousel").slick("slickAdd",
		'<div class="game-card card bg-dark text-white"><h5><b>' + s + '</b></h5>'
	);
	dealtCards.push(s);
}

function removeDealt(s){
	for(var i=0; i<dealtCards.length; i++){
		if(dealtCards[i] === s){
			$("#dealt-card-carousel").slick("slickRemove", i);
			// Remove from array
			dealtCards = dealtCards.slice(0,i).concat(dealtCards.slice(i+1, dealtCards.length));
			// So we don't skip
			i--;
		}
	}
}

function addField(s){
	$("#field-card-carousel").slick("slickAdd",
		'<div class="game-card card bg-light"><h5><b>' + s + '</b></h5>'
	);
	fieldCards.push(s);
}

function removeField(s){
	for(var i=0; i<fieldCards.length; i++){
		if(fieldCards[i] === s){
			$("#field-card-carousel").slick("slickRemove", i);
			// Remove from array
			fieldCards = fieldCards.slice(0,i).concat(fieldCards.slice(i+1, fieldCards.length));
			// So we don't skip
			i--;
		}
	}
}

function addHand(s){
	$("#hand-card-carousel").slick("slickAdd",
		'<div class="game-card card bg-light"><h5><b>' + s + '</b></h5>'
	);
	handCards.push(s);
}

function removeHand(s){
	for(var i=0; i<handCards.length; i++){
		if(handCards[i] === s){
			$("#hand-card-carousel").slick("slickRemove", i);
			// Remove from array
			handCards = handCards.slice(0,i).concat(handCards.slice(i+1, handCards.length));
			// So we don't skip
			i--;
		}
	}
}

// Called every so often
function update(){
	updating = true;

	// Make sure we ping
	$.get(encodeURI("/ping.txt?pin=" + pin + "&pid=" + pid), function(data){
		// If the ping failed, something has gone wrong. Leave
		if(data.trim() !== "PONG"){
			window.sessionStorage.removeItem("pin");
			window.sessionStorage.removeItem("pid");
			window.sessionStorage.setItem("fail", "fail");
			window.location.href = "index.html";
		}

	// Only do it after all this so we don't leave connections open
	$.get("/get_dealt.txt?pin=" + pin, function(data){
		if(data.trim() !== "INVALID"){
			var ds = data.split("\n");
			if(data.trim() === "DONE"){
				ds = [];
			}

			for(var i=0; i<dealtCards.length; i++){
				if(!ds.includes(dealtCards[i])){
					removeDealt(dealtCards[i]);
					// So we don't skip
					i--
				}
			}
			for(var i=0; i<ds.length; i++){
				if(!dealtCards.includes(ds[i])){
					addDealt(ds[i]);
				}
			}
		}

	$.get("/get_field.txt?pin=" + pin, function(data){
		if(data.trim() !== "INVALID"){
			var ds = data.split("\n");
			if(data.trim() === "DONE"){
				ds = [];
			}

			for(var i=0; i<fieldCards.length; i++){
				if(!ds.includes(fieldCards[i])){
					removeField(fieldCards[i]);
					// So we don't skip
					i--
				}
			}
			for(var i=0; i<ds.length; i++){
				if(!fieldCards.includes(ds[i])){
					addField(ds[i]);
				}
			}
		}

	$.get(encodeURI("/get_hand.txt?pin=" + pin + "&pid=" + pid), function(data){
		if(data.trim() !== "INVALID"){
			var ds = data.split("\n");
			if(data.trim() === "DONE"){
				ds = [];
			}

			for(var i=0; i<handCards.length; i++){
				if(!ds.includes(handCards[i])){
					removeHand(handCards[i]);
					// So we don't skip
					i--
				}
			}
			for(var i=0; i<ds.length; i++){
				if(!handCards.includes(ds[i])){
					addHand(ds[i]);
				}
			}
		}

	$.get(encodeURI("/get_card_czar.txt?pin=" + pin), function(data){
		if(data.trim() === pid){
			// Alert if we were not previously
			if(!cardCzar){
				$.notify({
					title: "<b>You Are the Card Czar: </b>",
					message: "Pick the funniest card played"
				},{
					type: "success",
					newest_on_top: true,
					delay: 3000,
					animate: {
						enter: "animated fadeInDown",
						exit: "animated fadeOutUp"
					},
					placement: {
						from: "top",
						align: "center"
					}
				});
			}
			$("#card-czar-text").html("You are");
			$("#field-go").removeClass("disabled");
			$("#field-go").prop("disabled", false);
			$("#hand-go").addClass("disabled");
			$("#hand-go").prop("disabled", true);
			cardCzar = true;
		} else if(data !== "INVALID"){
			$("#card-czar-text").html(data.trim() + " is");
			$("#field-go").addClass("disabled");
			$("#field-go").prop("disabled", true);
			if(dealtCards !== oldDealt){
				oldDealt = dealtCards
				$("#hand-go").removeClass("disabled");
				$("#hand-go").prop("disabled", false);
			}
			cardCzar = false;
		}

	$.get(encodeURI("/get_score.txt?pin=" + pin + "&pid=" + pid), function(data){
		if(data !== "INVALID"){
			$("#score").html(data);
			var nscore = parseInt(data);
			if(nscore !== score){
				score = nscore;
				$.notify({
					title: "<b>You Scored: </b>",
					message: "Your score increased by one"
				},{
					type: "success",
					newest_on_top: true,
					delay: 3000,
					animate: {
						enter: "animated fadeInDown",
						exit: "animated fadeOutUp"
					},
					placement: {
						from: "top",
						align: "center"
					}
				});
			}
		}

	$.get("/get_leaderboard.txt?pin=" + pin, function(data){
		if(data !== "INVALID"){
			// Remove all entries
			$("#leader-body tr").each(function(){
				$(this).remove();
			});
			// Update entrys
			var scoreStrs = data.split(";");
			for(var i=0; i<scoreStrs.length; i++){
				$("#leader-body").append('<tr id="' + i + '"> </tr>');
				$("#"+i).append('<th scope="row">' + (i+1) + '</th>');
				$("#"+i).append("<td>" + scoreStrs[i].split(",")[0] + "</td>");
				$("#"+i).append("<td>" + scoreStrs[i].split(",")[1] + "</td>");
			}
		}

		updating = false;
	})})})})})})});
}

$(document).ready(function(){
	if(window.sessionStorage.getItem("pin") === null || window.sessionStorage.getItem("pin") === ""){
		window.location.href = "index.html";
	}

	// Handle everything if the user goes away
	$(window).on("beforeunload unload", function(){
		// Clear pin and pid
		$.get({
			url: "/leave_game.txt?pin=" + pin + "&pid=" + pid,
			success: function(data){
				window.sessionStorage.removeItem("pin");
				window.sessionStorage.removeItem("pid");
			},
			timeout: 3000,
			error: function(xhr, ajaxOptions, thrownError){
				window.sessionStorage.removeItem("pin");
				window.sessionStorage.removeItem("pid");
			},
			async: false
		});
	});

	slickReload();

	// Slick needs this to work with tabs
	$('a[data-toggle=tab]').on("shown.bs.tab", function(e){
		slickReload();
	});

	// Make sure we can timeout
	// Setup unless otherwise specified
	$.ajaxSetup({
		timeout: 1000,
		error: function(xhr, ajaxOptions, thrownError){
			updating = false;
		}
	});

	$("#leader-btn").click(function(){
		if(!leader){
			$("#leaderboard").slideDown();
			$("#leader-btn").html('<i class="fa fa-chevron-down"></i> Leaderboard');
			leader = true;
		} else {
			$("#leaderboard").slideUp(function(){
				// Hack to scroll to top while hidden
				$("#leaderboard").replaceWith('<div id="leaderboard" class="card initially-hidden">' + $("#leaderboard").html() + '</div>');
			});
			$("#leader-btn").html('<i class="fa fa-chevron-right"></i> Leaderboard');
			leader = false;
		}
	});

	$("#field-go").click(function(){
		if(fieldCards[$("#field-card-carousel").slick("slickCurrentSlide")] !== undefined){
			var current = fieldCards[$("#field-card-carousel").slick("slickCurrentSlide")];
			for(var i=0; i<fieldCards.length; i++){
				removeField(fieldCards[i]);
				i--
			}

			$("#field-go").addClass("disabled");
			$("#field-go").prop("disabled", true);
			
			$.get({
				url: encodeURI("/select_card.txt?pin=" + pin + "&card=" + current),
				success: function(data){},
				error: function(xhr, ajaxOptions, thrownError){}
			});
		}
	});

	$("#hand-go").click(function(){
		if(handCards[$("#hand-card-carousel").slick("slickCurrentSlide")] !== undefined){
			var current = handCards[$("#hand-card-carousel").slick("slickCurrentSlide")];
			addField(current);
			removeHand(current);
			$("#hand-go").addClass("disabled");
			$("#hand-go").prop("disabled", true);
			
			$.get({
				url: encodeURI("/play_card.txt?pin=" + pin + "&pid=" + pid + "&card=" + current),
				success: function(data){},
				error: function(xhr, ajaxOptions, thrownError){}
			});
		}
	});

	update();
	setInterval(function(){if(!updating){update();}}, 2000);
});