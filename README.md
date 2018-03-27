# cards-against-world-history
A web-based interface for *Cards Against World History*.

# Proposal
Our project will be *Cards Against World History*, which is similar to *Cards Against Humanity*, but cleaner and about world history. This project will be a web app designed for mobile devices. The UI will have two screens. The login screen will be a screen where players can either create a group or join an existing one. The gameplay screen will have three tabs: one for the card that was dealt by the card czar, one for the cards the other players played, and one for your hand. The tab for your hand will also be an “OK” button at the bottom which is used to select cards to play. The card czar will also rotate every turn. The frontend will be designed in HTML5/CSS/JS using Bootstrap 4 and JQuery, while the backend will be entirely Java (as we are required to use Java for something). The frontend and backend will communicate with each other through HTTP GET requests.

# Usage
First, download or clone this repository into a directory `$DIR`. Then, change to the `backend` folder with `cd $DIR/backend` on Linux, and `cd $DIR\backend` on Windows. Finally, with the JDK in your path, compile with `javac Server.java` and run with `java Server`. Note that the server will be running on port `80`, and doing so will require root/administrative priviledges. On Linux, run `sudo java Server` instead, and on Windows, perform the comands in an administrative command prompt (`Win + X` then `Command Prompt (Admin)`).
