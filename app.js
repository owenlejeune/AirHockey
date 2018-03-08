const app = require("http").createServer(handler);
const fs = require("fs");
const url = require("url");
const io = require("socket.io")(app);
const PORT = process.env.PORT || 3000;
const ROOT_DIR = "html";
const MIME_TYPES = {
    css: "text/css",
    gif: "image/gif",
    htm: "text/html",
    html: "text/html",
    ico: "image/x-icon",
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    js: "application/javascript",
    json: "application/json",
    png: "image/png",
    txt: "text/plain"
};
const timer = setInterval(handleTimer, 30);
const PLAYERS_AVAILABLE = {
    p1: true,
    p2: true
}
const PLAYER_ONE_STATE = 0;
const PLAYER_TWO_STATE = 1;
const SPECTATOR_STATE = 3;
const PLAYER_1_DEFAULT_X = 100;
const PLAYER_2_DEFAULT_X = 825;
const PLAYER_DEFAULT_Y = 200;
const PLAYER_DEFAULT_DIM = 75;
const PLAYER_DEFAULT_COLOUR = 'grey';
const PUCK_DEFAULT_COLOUR = 'black'
const PLAYER_1_COLOUR = 'orange';
const PLAYER_2_COLOUR = 'green';
const PLAYER_DEFAULT_NAME = "";
const PLAYER_DEFAULT_SCORE = 0;
const PUCK_DEFAULT_X = 500;
const PUCK_DEFAULT_Y = 235;
const PUCK_DEFAULT_RADIUS = 25;
const DIR_UP = -1;
const DIR_DOWN = 1;
const DIR_LEFT = -1;
const DIR_RIGHT = 1;
const DIR_NONE = 0;
const dXY = 5;

var canvasWidth = 0;
var canvasHeight = 0;
var windowsID = 0;
var spectators = [];
var player1 = {
    state: PLAYER_ONE_STATE,
    x: PLAYER_1_DEFAULT_X,
    y: PLAYER_DEFAULT_Y,
    side: PLAYER_DEFAULT_DIM,
    score: PLAYER_DEFAULT_SCORE,
    colour: PLAYER_DEFAULT_COLOUR,
    name: PLAYER_DEFAULT_NAME
};
var player2 = {
    state: PLAYER_TWO_STATE,
    x: PLAYER_2_DEFAULT_X,
    y: PLAYER_DEFAULT_Y,
    side: PLAYER_DEFAULT_DIM,
    score: PLAYER_DEFAULT_SCORE,
    colour: PLAYER_DEFAULT_COLOUR,
    name: PLAYER_DEFAULT_NAME
};
var puck = {
    x: PUCK_DEFAULT_X,
    y: PUCK_DEFAULT_Y,
    radius: PUCK_DEFAULT_RADIUS,
    directionX: DIR_NONE,
    directionY: DIR_NONE,
    colour: PUCK_DEFAULT_COLOUR
}

function get_mime(filename){
    let ext, type;
    for(let ext in MIME_TYPES){
        type = MIME_TYPES[ext];
        if(filename.indexOf(ext, filename.length - ext.length) !== -1){
            return type;
        }
    }
    return MIME_TYPES['txt'];
}

app.listen(PORT);

io.on("connection", (socket) => {
    socket.on("newWindowLoad", (data) => {
        var receivedData = JSON.parse(data);
        canvasWidth = (receivedData.width > canvasWidth) ? receivedData.width : canvasWidth;
        canvasHeight = (receivedData.height > canvasHeight) ? receivedData.height : canvasHeight;
        var responseObj = {player1: player1, player2: player2, puck: puck, id: windowsID};
        windowsID++;
        io.emit("newWindowLoadResponse", JSON.stringify(responseObj));
    });
    socket.on("keyPressed", (data) => {
        var receivedData = JSON.parse(data);
        if(receivedData.state === PLAYER_ONE_STATE){
            player1.x = receivedData.x;
            player1.y = receivedData.y;
        }else{
            player2.x = receivedData.x;
            player2.y = receivedData.y;
        }
        io.emit("playerMove", data);
    });
    socket.on("newPlayerRequest", (data) => {
        var receivedData = JSON.parse(data);
        findPlayerPosition(receivedData.name, receivedData.id);
    });
    socket.on("playerLeaveGame", (data) => {
        var receivedData = JSON.parse(data);
        if(receivedData.state === PLAYER_ONE_STATE){
            PLAYERS_AVAILABLE.p1 = true;
            resetPlayer(player1);
        }else if(receivedData.state === PLAYER_TWO_STATE){
            PLAYERS_AVAILABLE.p2 = true;
            resetPlayer(player2);
        }else{
            var id = receivedData.id;
            for(let spectator of spectators){
                if(id === spectator.id){
                    spectators.splice(spectator, 1);
                    break;
                }
            }
            io.emit("spectatorLeft", JSON.stringify({spectators: spectators}));
        }
    });
    socket.on("spectatorJoinRequest", (data) => {
        var receivedData = JSON.parse(data);
        var id = receivedData.id;
        var name;
        for(let spectator of spectators){
            if(id === spectator.id){
                name = spectator.name;
                spectators.splice(spectator, 1);
                break;
            }
        }
        io.emit("spectatorLeft", JSON.stringify({spectators: spectators}));
        findPlayerPosition(name, id);
    });
});

function findPlayerPosition(name, id){
    if(PLAYERS_AVAILABLE.p1){
        PLAYERS_AVAILABLE.p1 = false;
        player1.colour = PLAYER_1_COLOUR;
        player1.name = name;
        var responseObj = {id: id, player: player1};
        io.emit("newPlayerResponse", JSON.stringify(responseObj));
    }else if(PLAYERS_AVAILABLE.p2){
        PLAYERS_AVAILABLE.p2 = false;
        player2.colour = PLAYER_2_COLOUR;
        player2.name = name;
        var responseObj = {id: id, player:player2};
        io.emit("newPlayerResponse", JSON.stringify(responseObj));
    }else{
        spectators.push({id: id, name: name});
        io.emit("newPlayerResponse", JSON.stringify({id: id, player: SPECTATOR_STATE, names: spectators}));
    }
    startGame();
}

function resetPlayer(player){
    player1.x = PLAYER_1_DEFAULT_X;
    player1.y = PLAYER_DEFAULT_Y;
    player2.x = PLAYER_2_DEFAULT_X;
    player2.y = PLAYER_DEFAULT_Y;
    player1.score = PLAYER_DEFAULT_SCORE;
    player2.score = PLAYER_DEFAULT_SCORE;
    player.colour = PLAYER_DEFAULT_COLOUR;
    player.name = PLAYER_DEFAULT_NAME;
    puck.x = PUCK_DEFAULT_X;
    puck.y = PUCK_DEFAULT_Y;
    puck.directionX = DIR_NONE;
    puck.directionY = DIR_NONE;
    var responseObj = {player1: player1, player2: player2, puck: puck};
    io.emit("playerReset", JSON.stringify(responseObj));
}

function startGame(){
    if(!PLAYERS_AVAILABLE.p1 && !PLAYERS_AVAILABLE.p2){
        puck.directionX = (Math.random() < 0.5) ? DIR_LEFT : DIR_RIGHT;
        puck.directionY = (Math.random() < 0.5) ? DIR_UP : DIR_DOWN;
        io.emit('startGame', JSON.stringify(puck));
    }
}

function handler(request, response){
    let urlObj = url.parse(request.url, true, false);

    console.log("\n============================")
    console.log("PATHNAME: " + urlObj.pathname)
    console.log("REQUEST: " + ROOT_DIR + urlObj.pathname)

    let receivedData = ""

    request.on("data", (chunk) => {
        receivedData += chunk;
    });

    request.on("end", () =>{
        console.log("REQUEST END: ");

        if(request.method == "GET"){
            console.log("METHOD: GET");
            fs.readFile(ROOT_DIR + urlObj.pathname, (err, data) => {
                if(err){
                    console.log("ERROR: " + JSON.stringify(err).red);
                    response.writeHead(404);
                    response.end(JSON.stringify(err));
                    return;
                }
                response.writeHead(200, {"Content-Type": get_mime(urlObj.pathname)});
                response.end(data);
            });
        }
    });
}

function handleTimer(){
    if(!PLAYERS_AVAILABLE.p1 && !PLAYERS_AVAILABLE.p2){
        puck.x = puck.x + 5 * puck.directionX;
        puck.y = puck.y + 5 * puck.directionY;

        var hit = false;

        if(puck.x + puck.radius >= canvasWidth){
            if(puck.y > canvasHeight/3 && puck.y < canvasHeight*(2/3)){
                puck.directionX = 0;
                puck.directionY = 0;
                player1.score += 1;
                pointScored();
            }else{puck.directionX = DIR_LEFT;}
        }
        if(puck.x-puck.radius <= 0){
            if(puck.y > canvasHeight/3 && puck.y < canvasHeight*(2/3)){
                puck.directionX = 0;
                puck.directionY = 0;
                player2.score += 1;
                pointScored();
            }else{puck.directionX = DIR_RIGHT;}
        }
        if(puck.y-puck.radius < 0){hit = true; puck.directionY = DIR_DOWN;}
        if(puck.y + puck.radius > canvasHeight){hit = true; puck.directionY = DIR_UP;}

        if(hit){io.emit("collision", null);}

        detectCollision();
    }
}

function detectCollision(){
    var collision = false;
    //TOP
    if(player1.x <= puck.x && player1.x+player1.side >= puck.x
        && puck.y+puck.radius >= player1.y && puck.y < player1.y){
        collision = true;
        puck.directionY = DIR_UP;
    }
    if(player2.x <= puck.x && player2.x+player2.side >= puck.x
        && puck.y+puck.radius >= player2.y && puck.y < player2.y){
        collision = true;
        puck.directionY = DIR_UP;
    }
    //BOTTOM
    if(player1.x <= puck.x && player1.x+player1.side >= puck.x
        && puck.y-puck.radius <= player1.y+player1.side && puck.y > player1.y+player1.side){
        collision = true;
        puck.directionY = DIR_DOWN;
    }
    if(player2.x <= puck.x && player2.x+player2.side >= puck.x
        && puck.y-puck.radius <= player2.y+player2.side && puck.y > player2.y+player2.side){
        collision = true;
        puck.directionY = DIR_DOWN;
    }
    //RIGHT
    if(puck.y >= player1.y && puck.y <= player1.y+player1.side
        && puck.x-puck.radius <= player1.x+player1.side && puck.x > player1.x+player1.side){
        collision = true;
        puck.directionX = DIR_RIGHT;
    }
    if(puck.y >= player2.y && puck.y <= player2.y+player2.side
        && puck.x-puck.radius <= player2.x+player2.side && puck.x > player2.x+player2.side){
        collision = true;
        puck.directionX = DIR_RIGHT;
    }
    //LEFT
    if(puck.y >= player1.y && puck.y <= player1.y+player1.side
        && puck.x+puck.radius >= player1.x && puck.x < player1.x){
        collision = true;
        puck.directionX = DIR_LEFT;
    }
    if(puck.y >= player2.y && puck.y <= player2.y+player2.side
        && puck.x+puck.radius >= player2.x && puck.x < player2.x){
        collision = true;
        puck.directionX = DIR_LEFT;
    }
    io.emit('timerTick', JSON.stringify(puck));
    if(collision){io.emit("collision", null);}
}

function pointScored(){
    puck.x = PUCK_DEFAULT_X;
    puck.y = PUCK_DEFAULT_Y;
    puck.directionX = (Math.random() < 0.5) ? DIR_LEFT : DIR_RIGHT;
    puck.directionY = (Math.random() < 0.5) ? DIR_UP : DIR_DOWN;
    player1.x = PLAYER_1_DEFAULT_X;
    player1.y = PLAYER_DEFAULT_Y;
    player2.x = PLAYER_2_DEFAULT_X;
    player2.y = PLAYER_DEFAULT_Y;
    var returnObj = {p1Score: player1.score, p2Score: player2.score, p1x: player1.x,
        p1y: player1.y, p2x: player2.x, p2y: player2.y, puck: puck};
    io.emit("pointScored", JSON.stringify(returnObj));
}

console.log("Server Running at PORT: 3000  CNTL-C to quit");
console.log("To Test: open several browsers at: http://localhost:3000/airhockey.html")
