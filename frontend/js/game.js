var WHRatio = .85

var pin = window.localStorage.getItem("pin");

var dealtCards = [];
var fieldCards = [];
var handCards = [];

var slickInited = false;

function slickInit(){
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
	$("#dealt-card-carousel").slick('removeSlide', null, null, true)
}

$(document).ready(function(){
	if(pin === null){
		window.location.href = "index.html";
	}

	slickInit();

	$('a[data-toggle=tab]').on("shown.bs.tab", function(e){
		slickInit();
	});
});