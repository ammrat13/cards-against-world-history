#!/bin/bash

# For managing the server
# Pass `start` to start and `stop` to stop and `restart` to restart

if [[ $1 == "" ]]; then
	echo "No arguments present"
elif [[ $1 == "start" ]]; then
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
elif [[ $1 == "stop" ]]; then
	echo "Stopping server"
	sudo killall java
	echo "Stopped server"
elif [[ $1 == "restart" ]]; then
	./$0 stop
	./$0 start
else
	echo "Illegal argument: $1"
fi