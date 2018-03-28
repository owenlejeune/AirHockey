# Air Hockey
A simple browser-based air hockey game using socket.io with Electron desktop client

### Development Environment
* node 8.9.4
* npm 5.7.1
* Tested on MacOS 10.13.2

### Dependencies
node.js, Electron, socket.io

# Installation Instructions
* Clone to local machine
* Run _npm install_ from root directory and Electron Client directory to install node module dependencies

# Running the App
### Starting the server
* Execute _node app.js_ from root directory to start the app server

### Launching Browser Client
* Navigate to http://localhost:3000/airhockey.html from your browser

### Launching Electron Client
* Execute _npm start_ from inside the _Electron Client_ directory to launch the Electron Client

### Usage
* To join the game, click "Join Game" and enter your name
* Once another player has joined from another browser window, the game will begin and puck will pick a random direction to travel
* Use the arrow keys on your keyboard to move your paddle
* The paddle will not move until 2 players are present
* When the puck enters one of the purple goals on either end, the opposing player will score a point and the player's positions will be reset, with the puck traveling in a new random direction
* If you attempt to join a game with 2 players, you will not be allowed, but your name will appear in the _Spectator_ box below the game
* If you are currently a Spectator and a paddle becomes available, clicking _Join Game_ will automatically assign your name to that paddle
* You can toggle collision and goal sounds using the _Toggle Sounds_ button
