var WHRatio = .85

var pin = window.localStorage.getItem("pin");
var pid = window.localStorage.getItem("pid");
var oldDealt = [];
var dealtCards = [];
var fieldCards = [];
var handCards = [];

var slickInited = false;

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

	$("#hand-card-carousel").on("beforeChange", function(event, slick, currentSlide, nextSlide){
		$(".slick-slide").removeClass("bg-light");
		$(".slick-slide").addClass("bg-secondary");
	}).on("afterChange", function(event, slick, currentSlide, nextSlide){
		$(".slick-current").addClass("bg-light");
	}).on("init", function(event, slick){
		$(".slick-current").addClass("bg-light");
	});

	$("#field-card-carousel").on("beforeChange", function(event, slick, currentSlide, nextSlide){
		$(".slick-slide").removeClass("bg-light");
		$(".slick-slide").addClass("bg-secondary");
	}).on("afterChange", function(event, slick, currentSlide, nextSlide){
		$(".slick-current").addClass("bg-light");
	}).on("init", function(event, slick){
		$(".slick-current").addClass("bg-light");
	});

	$(".slick-slide").removeClass("bg-light");
	$(".slick-slide").addClass("bg-secondary");
	$(".slick-current").addClass("bg-light");
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
		'<div class="game-card card bg-secondary"><h5><b>' + s + '</b></h5>'
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
		'<div class="game-card card bg-secondary"><h5><b>' + s + '</b></h5>'
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
	$.get("/get_dealt.html?pin=" + pin, function(data){
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
	});

	$.get("/get_field.html?pin=" + pin, function(data){
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
	});

	$.get("/get_hand.html?pin=" + pin + "&pid=" + pid, function(data){
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
	});

	$.get("/is_card_czar.html?pin=" + pin + "&pid=" + pid, function(data){
		if(data === "true"){
			$("#card-czar-alert").effect("slide", {direction: "right", mode: "show"}, 500);
			$("#field-go").removeClass("disabled");
			$("#field-go").prop("disabled", false);
			$("#hand-go").addClass("disabled");
			$("#hand-go").prop("disabled", true);
		} else if(data === "false"){
			$("#card-czar-alert").effect("slide", {direction: "right", mode: "hide"}, 500);
			$("#field-go").addClass("disabled");
			$("#field-go").prop("disabled", true);
			if(dealtCards !== oldDealt){
				oldDealt = dealtCards
				$("#hand-go").removeClass("disabled");
				$("#hand-go").prop("disabled", false);
			}
		}
	});

	$.get("/get_score.html?pin=" + pin + "&pid=" + pid, function(data){
		if(data !== "INVALID"){
			$("#score").html(data);
		}
	});

	$(".slick-slide").removeClass("bg-light");
	$(".slick-slide").addClass("bg-secondary");
	$(".slick-current").addClass("bg-light");
}

$(document).ready(function(){
	if(window.localStorage.getItem("pin") === null || window.localStorage.getItem("pin") === ""){
		window.location.href = "index.html";
	}

	// Handle everything if the user goes away
	$(window).on("beforeunload", function(){
		// Clear pin and pid
		$.get("/leave_game.html?pin=" + pin + "&pid=" + pid, function(data){});
		window.localStorage.removeItem("pin");
		window.localStorage.removeItem("pid");
	});

	slickReload();

	// Slick needs this to work with tabs
	$('a[data-toggle=tab]').on("shown.bs.tab", function(e){
		slickReload();
	});

	$("#field-go").click(function(){
		if(fieldCards[$("#field-card-carousel").slick("slickCurrentSlide")] !== undefined){
			var current = fieldCards[$("#field-card-carousel").slick("slickCurrentSlide")];
			for(var i=0; i<fieldCards.length; i++){
				removeField(fieldCards[i]);
				i--
			}
			
			$(".slick-slide").removeClass("bg-light");
			$(".slick-slide").addClass("bg-secondary");
			$(".slick-current").addClass("bg-light");
			
			$.get(encodeURI("/select_card.html?pin=" + pin + "&card=" + current), function(data){});
		}
	});

	$("#hand-go").click(function(){
		if(handCards[$("#hand-card-carousel").slick("slickCurrentSlide")] !== undefined){
			var current = handCards[$("#hand-card-carousel").slick("slickCurrentSlide")];
			addField(current);
			removeHand(current);
			$("#hand-go").addClass("disabled");
			$("#hand-go").prop("disabled", true);
			
			$(".slick-slide").removeClass("bg-light");
			$(".slick-slide").addClass("bg-secondary");
			$(".slick-current").addClass("bg-light");
			
			$.get(encodeURI("/play_card.html?pin=" + pin + "&pid=" + pid + "&card=" + current), function(data){});
		}
	});

	update();
	setInterval(update, 2000);
});