# cards-against-world-history
A web-based interface for *Cards Against World History*. One instance is hosted at [cardsagainstworldhistory.com](http://www.cardsagainstworldhistory.com).

# Proposal
Our project will be *Cards Against World History*, which is similar to *Cards Against Humanity*, but cleaner and about world history. This project will be a web app designed for mobile devices. The UI will have two screens. The login screen will be a screen where players can either create a group or join an existing one. The gameplay screen will have three tabs: one for the card that was dealt by the card czar, one for the cards the other players played, and one for your hand. The tab for your hand will also be an “OK” button at the bottom which is used to select cards to play. The card czar will also rotate every turn. The frontend will be designed in HTML5/CSS/JS using Bootstrap 4 and JQuery, while the backend will be entirely Java (as we are required to use Java for something). The frontend and backend will communicate with each other through HTTP GET requests.

# Usage
This program is meant to be run on Linux. First, download or clone this repository into a directory `$DIR`. Then, change to it with `cd $DIR`. Finally, with the JDK in your path, start the server with `./man.sh start` (make sure you can execute ithe file as a program). To stop the server, change to `$DIR` with `cd $DIR` then run `./man.sh stop`.
