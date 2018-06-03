// Imports ---------------------------------------------------------------------

// Express.js
const express = require('express');
// Initialize application
const app = express();

// To read parameters
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // Support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // Support encoded bodies

// To read files
const fs = require('fs');

// For shuffling arrays
const shuffle = require('shuffle-array');


// Configuration ---------------------------------------------------------------

// What port to listen on
// If PORT <= 1024, then sudo is required
const PORT = 80;

// How quickly to timeout a user (ms)
const T_OUT = 60*1000;

// How many cards each player gets
const CARDS_PER_PLAYER = 10;


// Decks -----------------------------------------------------------------------

// Black deck and initialization
let bcards = [];
fs.readFile("./bdeck.txt", "utf8", function(err, data){
	// If we failed, quit
	if(err){
		console.log(err);
		process.exit(1)
	}
	bcards = data.split(/\n/);
});

// White deck and initialization
let wcards = [];
fs.readFile("./wdeck.txt", "utf8", function(err, data){
	// If we failed, quit
	if(err){
		console.log(err);
		process.exit(1)
	}
	wcards = data.split(/\n/);
});


// Player Class ----------------------------------------------------------------

class Player {
	constructor(nam, score, hand){
		this.nam = nam;
		this.score = score;
		this.hand = hand;
		this.lastPing = Date.now();
	}

	ping(){
		this.lastPing = Date.now();
	}

	hasTimedOut(){
		return Date.now() - this.lastPing >= T_OUT;
	}
}


// Game Class ------------------------------------------------------------------

class Game {
	constructor(){
		this.bcard = this.getBCard();
		this.wdeck = wcards.slice(); // Cards we can still deal
		shuffle(this.wdeck);

		this.players = [];
		this.cardCzarIdx = -1; // Index in this.players
		this.field = {}; // "player_name": "card_played"
	}

	getBCard(){
		return bcards[Math.floor(Math.random() * bcards.length)];
	}

	pingPlayer(p_nam){
		for(let i=0; i<this.players.length; i++){
			if(this.players[i].nam === p_nam){
				this.players[i].ping();
				return true;
			}
		}
		return false;
	}

	prune(){
		for(let i=0; i<this.players.length; i++){
			if(this.players[i].hasTimedOut()){
				this.players.splice(i, 1);
				i--;
			}
		}
	}

	getCardCzar(){
		if(this.cardCzarIdx === -1 || this.players[this.cardCzarIdx] === undefined){
			return null;
		}
		return this.players[this.cardCzarIdx].nam;
	}

	deal(){
		shuffle(this.wdeck);
		for(let i=0; i<this.players.length; i++){
			while(this.players[i].hand.length < CARDS_PER_PLAYER){
				this.players[i].hand.push(this.wdeck.pop());
			}
		}
	}

	join(player){
		// Check that they will have enough cards and the name isn't taken
		if(!this.isFull() && !this.isNameTaken(player.name)){
			this.players.push(player);
			if(this.cardCzarIdx === -1){
				this.cardCzarIdx = 0;
			}
			this.deal();

			return true;
		} else {
			return false;
		}
	}

	isFull(){
		return CARDS_PER_PLAYER > this.wdeck.length;
	}

	isNameTaken(p_nam){
		return this.players.filter((p) => p.nam == p_nam).length !== 0
	}
}

// List of games we have as roomName: game
let games = {};

// Pruning
function deleteEmptyGames(){
	for(let rN in games){
		if(games[rN].players.length === 0){
			delete games[rN];
		}
	}
}

setInterval(function(){
	for(let rN in games){
		games[rN].prune();
	}
	deleteEmptyGames();
}, 5000);


// Static Files ----------------------------------------------------------------

app.use(express.static("../frontend"));


// Communication ---------------------------------------------------------------

app.post("/is_full", function(req, res){
	if(games[req.body.rN] === undefined){
		res.send("false");
	} else if(games[req.body.rN].isFull()){
		res.send("true");
	} else {
		res.send("false");
	}
});

app.post("/is_name_taken", function(req, res){
	if(games[req.body.rN] === undefined){
		res.send("false");
	} else if(games[req.body.rN].isNameTaken(req.body.pN)){
		res.send("true");
	} else {
		res.send("false");
	}
});

app.post("/players", function(req, res){
	if(games[req.body.rN] === undefined){
		res.send(null);
	} else {
		ret = [];
		for(let i=0; i<games[req.body.rN].players.length; i++){
			ret.push(games[req.body.rN].players[i].nam);
		}
		res.send(ret);
	}
});

app.post("/join", function(req, res){
	if(games[req.body.rN] === undefined){
		games[req.body.rN] = new Game();
	}
	if(games[req.body.rN].join(new Player(req.body.pN, 0, []))){
		res.send("Done");
	} else {
		res.send("Fail");
	}
});

app.post("/ping", function(req, res){
	if(games[req.body.rN] !== undefined && games[req.body.rN].pingPlayer(req.body.pN)){
		res.send("Done");
	} else {
		res.send("Fail");
	}
});

app.post("/get_b_card", function(req, res){
	if(games[req.body.rN] !== undefined){
		res.send(games[req.body.rN].bcard);
	} else {
		res.send("Fail");
	}
});

app.post("/get_card_czar", function(req, res){
	if(games[req.body.rN] !== undefined){
		res.send(games[req.body.rN].getCardCzar());
	} else {
		res.send("");
	}
});


// Listen ----------------------------------------------------------------------

// Wait until ready
while(bcards === [] || wcards === []){}
app.listen(PORT, () => console.log("Listening on port " + PORT));