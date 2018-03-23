var WHRatio = .85

var pin = window.localStorage.getItem("pin");

var dealtCards = ["Lorem", "Ipsum", "Dolor"];
var fieldCards = ["Field", "Macjwqks", "dsda"];
var handCards = ["asd"];
var cardCzar = true;

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
			responsive: [
				{
					breakpoint: 1024,
					settings: {
						arrows: true,
						slidesToShow: 3
					}
				},
				{
					breakpoint: 768,
					settings: {
						arrows: true,
						slidesToShow: 2
					}
				},
				{
					breakpoint: 480,
					settings: {
						arrows: true,
						slidesToShow: 1
					}
				}	
			]
		});
	});
}

// Update the cards displayed to the cards in the list
function refreshCards(){
	// Remove all cards
	$("#dealt-card-carousel").slick("removeSlide", null, null, true);
	$("#field-card-carousel").slick("removeSlide", null, null, true);
	$("#hand-card-carousel").slick("removeSlide", null, null, true);

	for(var i=0; i<dealtCards.length; i++){
		$("#dealt-card-carousel").slick("slickAdd", '<div class="game-card card bg-dark text-white"><h5><b>' + dealtCards[i] + '</b></h5></div>');
	}

	for(var i=0; i<fieldCards.length; i++){
		$("#field-card-carousel").slick("slickAdd", '<div class="game-card card bg-light text-dark"><h5><b>' + fieldCards[i] + '</b></h5></div>');
	}

	for(var i=0; i<handCards.length; i++){
		$("#hand-card-carousel").slick("slickAdd", '<div class="game-card card bg-light text-dark"><h5><b>' + handCards[i] + '</b></h5></div>');
	}
}

// Called every so often
function update(){
	// UI updates
	if(cardCzar){
		$("#card-czar-alert").slideDown();
	} else {
		$("#card-czar-alert").slideUp();
	}
	refreshCards();
}

$(document).ready(function(){
	if(window.localStorage.getItem("pin") === null || window.localStorage.getItem("pin") === ""){
		window.location.href = "index.html";
	}

	slickReload();
	refreshCards();

	// Slick needs this to work with tabs
	$('a[data-toggle=tab]').on("shown.bs.tab", function(e){
		slickReload();
	});

	setInterval(update, 5000);
});