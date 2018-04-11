#!/bin/bash

# For managing the server
# Pass `up` to start and `down` to stop

if [[ $1 == "" ]]; then
	echo "No arguments present"
elif [[ $1 == "up" ]]; then
	# Check if we already have it up
	wget -q --spider localhost
	if [[ $? -eq 0 ]]; then
		echo "Server is already up"
	else
		echo "Starting server"
		cd backend
		javac Server.java && sudo bash -c 'java Server > /dev/null &'
		cd ..
		echo "Started server"
	fi
elif [[ $1 == "down" ]]; then
	echo "Stopping server"
	sudo killall java
	echo "Stopped server"
fi