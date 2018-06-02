// Imports ---------------------------------------------------------------------

// Express.js
const express = require('express');
// Initialize application
const app = express();

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
let bdeck = [];
fs.readFile("./bdeck.txt", "utf8", function(err, data){
	// If we failed, quit
	if(err){
		console.log(err);
		process.exit(1)
	}
	bdeck = data.split(/\n/);
});

// White deck and initialization
let wdeck = [];
fs.readFile("./wdeck.txt", "utf8", function(err, data){
	// If we failed, quit
	if(err){
		console.log(err);
		process.exit(1)
	}
	wdeck = data.split(/\n/);
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
	constructor(roomName){
		this.roomName = roomName

		this.bcard = this.getBCard();
		this.wdeck = wcards.slice(); // Cards we can still deal
		shuffle(wdecl);

		this.players = [];
		this.cardCzar = -1; // Index in this.players
		this.field = {}; // "player_name": "card_played"
	}

	getBCard(){
		return bdeck[Math.floor(Math.random() * bdeck.length)];
	}

	ping_player(p_nam){
		for(let i=0; i<this.players.length; i++){
			if(this.players[i].nam === p_nam){
				this.players[i].ping();
				break;
			}
		}
	}

	prune(){
		for(let i=0; i<this.players.length; i++){
			if(this.players[i].hasTimedOut()){
				this.players.splice(i, 1);
				i--;
			}
		}
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
		if(	(this.players.length+1)*CARDS_PER_PLAYER <= wdeck.length
		&&	this.players.filter((p) => p.nam == player.nam).length == 0){
			this.players.push(player);
			if(this.cardCzar == -1){
				this.cardCzar = 0;
			}
			deal();

			return true;
		} else {
			return false;
		}
	}
}


// Static Files ----------------------------------------------------------------

app.use(express.static("../frontend"));


// Listen ----------------------------------------------------------------------

// Wait until ready
while(bdeck === [] || wdeck === []){}
app.listen(PORT, () => console.log("Listening on port " + PORT));