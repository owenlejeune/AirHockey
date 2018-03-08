const PLAYER_ONE_STATE = 0;
const PLAYER_TWO_STATE = 1;
const SPECTATOR_STATE = 3;
const RIGHT_ARROW = 39;
const LEFT_ARROW = 37;
const UP_ARROW = 38;
const DOWN_ARROW = 40;
const GOAL_WIDTH = 5;
const canvas = document.getElementById('canvas1');
const SPECTATORS = document.getElementById("spectator-area");
const GOAL_HEIGHT = canvas.height/3;
const dXY = 15;
const HIT_SOUND = new Audio('hit.mp3');
const GOAL_SOUND = new Audio('ding.mp3');
const SOUND_ICON = 'sound.png';
const MUTE_ICON = 'mute.png';

var collisionSound = true;
var goalSound = true;
var player1 = {};
var player2 = {};
var puck = {}
var id = -1;
var player = null;
var socket = io('http://' + window.document.location.host);
var joined = false;

socket.on("newWindowLoadResponse", (data) => {
    if(id === -1){
        var receivedData = JSON.parse(data);
        player1 = receivedData.player1;
        player2 = receivedData.player2;
        puck = receivedData.puck;
        id = receivedData.id;
        drawCanvas();
    }
});

socket.on("timerTick", (data) => {
    puck = JSON.parse(data);
    drawCanvas();
});

socket.on("playerMove", (data) => {
    var receivedData = JSON.parse(data);
    if(receivedData.id !== id){
        if(receivedData.state === PLAYER_ONE_STATE){
            player1.x = receivedData.x;
            player1.y = receivedData.y;
        }else{
            player2.x = receivedData.x;
            player2.y = receivedData.y;
        }
    }
    drawCanvas();
});

socket.on("newPlayerResponse", (data) => {
    var receivedData = JSON.parse(data);
    var playerData = receivedData.player;
    if(receivedData.player !== SPECTATOR_STATE){
        if(playerData.state === PLAYER_ONE_STATE){
            player1 = playerData;
            if(receivedData.id === id){player = player1;}
        }else{
            player2 = playerData;
            if(receivedData.id === id){player = player2;}
        }
    }else{
        printSpectators(receivedData.names);
    }
    drawCanvas();
});

socket.on("playerReset", (data) => {
    var receivedData = JSON.parse(data);
    player1 = receivedData.player1;
    player2 = receivedData.player2;
    puck = receivedData.puck;
    if(player !== null){
        player = (player.state === PLAYER_ONE_STATE) ? player1 : player2;
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
    }
    drawCanvas();
});

socket.on("pointScored", (data) => {
    if(goalSound){GOAL_SOUND.play()};
    var receivedData = JSON.parse(data);
    puck = receivedData.puck;
    player1.score = receivedData.p1Score;
    player2.score = receivedData.p2Score;
    if(player !== null){
        if(player.state === PLAYER_ONE_STATE){
            player.x = receivedData.p1x;
            player.y = receivedData.p1y;
            player2.x = receivedData.p2x;
            player2.y = receivedData.p2y;
        }else{
            player.x = receivedData.p2x;
            player.y = receivedData.p2y;
            player1.x = receivedData.p1x;
            player1.y = receivedData.p1y;
        }
    }
    drawCanvas();
});

socket.on("spectatorLeft", (data) => {
    var receivedData = JSON.parse(data);
    printSpectators(receivedData.spectators);
});

socket.on("startGame", (data) => {
    if(player !== null){
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
    }
    puck = JSON.parse(data);
});

socket.on("collision", (data) => {
    if(collisionSound){HIT_SOUND.play();}
})

document.addEventListener("DOMContentLoaded", () => {
    socket.emit("newWindowLoad", JSON.stringify({width: canvas.width, height: canvas.height}));
});

window.addEventListener("beforeunload", (e) => {
    leaveGame();
});

function printSpectators(names){
    var spectators = names;
    console.log(spectators);
    SPECTATORS.innerHTML = "<p>";
    for(let spectator of spectators){
        SPECTATORS.innerHTML = SPECTATORS.innerHTML + `${spectator.name}  `;
    }
    SPECTATORS.innerHTML = SPECTATORS.innerHTML + `</p>`;
}

function handleKeyUp(e){
    console.log("key UP: " + e.which);
    if(e.which == RIGHT_ARROW | e.which == LEFT_ARROW | e.which == UP_ARROW | e.which == DOWN_ARROW){
        socket.emit("keyPressed", JSON.stringify({id: id, state: player.state, x: player.x, y: player.y}));
        drawCanvas();
    }
}

function handleKeyDown(e) {
    console.log("keydown code = " + e.which);

    if(player.state === PLAYER_ONE_STATE){
        if(e.which == UP_ARROW && player.y >= dXY) player.y -= dXY;
        if(e.which == RIGHT_ARROW && player.x + player.side + dXY <= canvas.width/2) player.x += dXY;
        if(e.which == LEFT_ARROW && player.x >= dXY) player.x -= dXY;
        if(e.which == DOWN_ARROW && player.y + player.side + dXY <= canvas.height) player.y += dXY;
    }else{
        if(e.which == UP_ARROW && player.y >= dXY) player.y -= dXY;
        if(e.which == RIGHT_ARROW && player.x + player.side + dXY <= canvas.width) player.x += dXY;
        if(e.which == LEFT_ARROW && player.x >= dXY + canvas.width/2) player.x -= dXY;
        if(e.which == DOWN_ARROW && player.y + player.side + dXY <= canvas.height) player.y += dXY;
    }

    socket.emit("keyPressed", JSON.stringify({id: id, state: player.state, x: player.x, y: player.y}));
}

var drawCanvas = function(){

    document.getElementById('player1Name').innerHTML = player1.name;
    document.getElementById('player1Score').innerHTML = player1.score;
    document.getElementById('player2Name').innerHTML = player2.name;
    document.getElementById('player2Score').innerHTML = player2.score;

    var context = canvas.getContext("2d");

    var rinkBackground = new Image();
    rinkBackground.src = "rink.jpg";
    rinkBackground.onload = function(){
        var pattern = context.createPattern(this, "no-repeat");
        context.fillStyle = pattern;
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = "black";
        context.fillRect(0, 0, GOAL_WIDTH, canvas.height);
        context.fillRect(0, 0, canvas.width, GOAL_WIDTH);
        context.fillRect(canvas.width-GOAL_WIDTH, 0, GOAL_WIDTH, canvas.height);
        context.fillRect(0, canvas.height-GOAL_WIDTH, canvas.width, GOAL_WIDTH);

        context.fillStyle = "#9370db";
        context.fillRect(0, GOAL_HEIGHT, GOAL_WIDTH, GOAL_HEIGHT);
        context.fillRect(canvas.width-GOAL_WIDTH, GOAL_HEIGHT, GOAL_WIDTH, GOAL_HEIGHT);

        context.fillStyle = puck.colour;
        context.beginPath();
        context.arc(puck.x, puck.y, puck.radius, 0, 2*Math.PI, false);
        context.fill();

        context.fillStyle = player1.colour;
        context.fillRect(player1.x, player1.y, player1.side, player1.side);

        context.fillStyle = player2.colour;
        context.fillRect(player2.x, player2.y, player2.side, player2.side);

        //draw player numbers on paddle if in use
        context.fillStyle = "black"
        if(player1.colour !== 'grey'){
            let x = player1.x + (player1.side/2) - 5;
            context.fillRect(x, player1.y+15, 10, player1.side-30);
        }
        if(player2.colour !== 'grey'){
            let x = player2.x+15;
            let y = player2.y+10;
            context.fillRect(x, y, player2.side-30, 10);
            y = player2.y+30;
            context.fillRect(x, y, player2.side-30, 10);
            context.fillRect(x, y, 10, 20);
            y = player2.y+50;
            context.fillRect(x, y, player2.side-30, 10);
            x = player2.x+player2.side-25;
            y = player2.y+10;
            context.fillRect(x, y, 10, 20);
        }
    }
}

function joinGame(){
    if(!joined){
        var name = prompt("Please enter your name", "");
        socket.emit("newPlayerRequest", JSON.stringify({id: id, name: name}));
        joined = true;
    }else{
        socket.emit("spectatorJoinRequest", JSON.stringify({id: id}));
    }
}

function leaveGame(){
    var state = (player !== null) ? player.state : SPECTATOR_STATE;
    socket.emit("playerLeaveGame", JSON.stringify({id: id, state: state}));
    player = null;
    joined = false;
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
}

function toggleSound(){
    collisionSound = (collisionSound) ? false : true;
    goalSound = (goalSound) ? false : true;
    document.getElementById('soundstate').src = (collisionSound) ? SOUND_ICON : MUTE_ICON;
}
