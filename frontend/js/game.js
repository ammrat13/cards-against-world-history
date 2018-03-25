var WHRatio = .85

var pin = window.localStorage.getItem("pin");
var pin = window.localStorage.getItem("pid");
var dealtCards = [];
var fieldCards = [];
var handCards = [];
var score = 0;
var cardCzar = false;

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
			slidesToShow: 3,
			arrows: true,
			infinite: true,
			responsive: [
				{
					breakpoint: 1024,
					settings: {
						arrows: true,
						slidesToShow: 3,
						infinite: true
					}
				},
				{
					breakpoint: 768,
					settings: {
						arrows: true,
						slidesToShow: 2,
						infinite: true
					}
				},
				{
					breakpoint: 480,
					settings: {
						arrows: true,
						slidesToShow: 1,
						infinite: true
					}
				}	
			]
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
		}
		// Remove from array
		dealtCards.splice(i,1);
		// So we don't skip
		i--;
	}
}

function addField(s){
	$("#field-card-carousel").slick("slickAdd",
		'<div class="game-card card bg-light text-dark"><h5><b>' + s + '</b></h5>'
	);
	fieldCards.push(s);
}

function removeField(s){
	for(var i=0; i<fieldCards.length; i++){
		if(fieldCards[i] === s){
			$("#field-card-carousel").slick("slickRemove", i);
		}
		// Remove from array
		fieldCards.splice(i,1);
		// So we don't skip
		i--;
	}
}

function addHand(s){
	$("#hand-card-carousel").slick("slickAdd",
		'<div class="game-card card bg-light text-dark"><h5><b>' + s + '</b></h5>'
	);
	handCards.push(s);
}

function removeHand(s){
	for(var i=0; i<handCards.length; i++){
		if(handCards[i] === s){
			$("#hand-card-carousel").slick("slickRemove", i);
		}
		// Remove from array
		handCards.splice(i,1);
		// So we don't skip
		i--;
	}
}

// Called every so often
function update(){
	// TODO: Networking
	// UI updates
	if(cardCzar){
		$("#card-czar-alert").effect("slide", {direction: "right", mode: "show"}, 500);
		$("#field-go").removeClass("disabled");
		$("#hand-go").addClass("disabled");
	} else {
		$("#card-czar-alert").effect("slide", {direction: "right", mode: "hide"}, 500);
		$("#field-go").addClass("disabled");
		$("#hand-go").removeClass("disabled");
	}
	$("#score").html(score.toString());
}

$(document).ready(function(){
	if(window.localStorage.getItem("pin") === null || window.localStorage.getItem("pin") === ""){
		window.location.href = "index.html";
	}

	// Handle everything if the user goes away
	$(window).on("beforeunload", function(){
		// Clear pin and pid
		window.localStorage.removeItem("pin");
		window.localStorage.removeItem("pid");
		// TODO: Networking
	});

	slickReload();

	// Slick needs this to work with tabs
	$('a[data-toggle=tab]').on("shown.bs.tab", function(e){
		slickReload();
	});

	// TODO: Implement handlers with networking
	$("#field-go").click(function(){

	});

	$("#hand-go").click(function(){
		
	});

	update();
	setInterval(update, 2000);
});