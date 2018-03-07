--------------------------------------------------------------------------------
                                Air Hockey

                    A simple browser-based air hockey game using
                                web sockets

--------------------------------------------------------------------------------
Developer:
                Owen LeJeune

Date:
                March 8, 2018

--------------------------------------------------------------------------------
Version:
                node 8.9.4
                npm 5.7.1
                Tested on MacOS 10.13.2

--------------------------------------------------------------------------------
Install
                run "npm install" inside the root project directory
                    if that fails, run "npm install socket.io"

                Requires node.js installed

--------------------------------------------------------------------------------
Launch
                "node app.js" from root project directory

--------------------------------------------------------------------------------
Testing
                Visit http://localhost:3000/assignment3.html
                To join the game, click "Join Game" and enter your name
                Once another player has joined from another browser window,
                    the game will begin and puck will pick a random direction
                    to travel
                Use the arrow keys on your keyboard to move your paddle
                The paddle will not move until 2 players are present
                When the puck enters one of the purple goals on either end,
                    the opposing player will score a point and the player's
                    positions will be reset, with the puck traveling in a new
                    random direction
                If you attempt to join a game with 2 players, you will not be
                    allowed, but your name will appear in the Spectator box
                    below
                You can toggle collision and goal sounds using the Toggle
                    Sounds button

--------------------------------------------------------------------------------
Organization:
                app.js
                html
                    assignment3.html
                    ding.mp3
                    game.js
                    hit.mp3
                    mute.png
                    rink.jpg
                    sound.png
                    style.css
                node_modules
                    all modules required by node and socket.io
                package-lock.json
                package.json
                README.txt

--------------------------------------------------------------------------------
Enhancements:
                1) Scoring
                2) Spectator list
                3) Puck collision sounds (toggle-able)

--------------------------------------------------------------------------------
