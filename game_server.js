const express = require("express");

const bcrypt = require("bcrypt");
const fs = require("fs");
const session = require("express-session");

// Create the Express app
const app = express();

// Use the 'public' folder to serve static files
app.use(express.static("public"));

// Use the json middleware to parse JSON data
app.use(express.json());

// Use the session middleware to maintain sessions
const chatSession = session({
    secret: "game",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {maxAge: 300000}
});
app.use(chatSession);

// This helper function checks whether the text only contains word characters
function containWordCharsOnly(text) {
    return /^\w+$/.test(text);
}

// Handle the /register endpoint
app.post("/register", (req, res) => {
    // Get the JSON data from the body
    const {username, password} = req.body;

    //
    // D. Reading the users.json file
    //
    const users = JSON.parse(fs.readFileSync("data/users.json"));

    //
    // E. Checking for the user data correctness
    //
    if (username === '') res.json({status: "error", error: "The username cannot be empty."});
    if (password === '') res.json({status: "error", error: "The password cannot be empty."});

    if (!containWordCharsOnly(username)) res.json({
        status: "error",
        error: "The username can contain only underscores, letters or number"
    });

    if (username in users) res.json({
        status: "error",
        error: "The username has already existed in the current list of users"
    });

    //
    // G. Adding the new user account
    //
    const hash = bcrypt.hashSync(password, 10);
    users[username] = {"avatar": "&#128057;", "name": username, "password": hash};
    //
    // H. Saving the users.json file
    //
    fs.writeFileSync("data/users.json", JSON.stringify(users, null, " "));

    //
    // I. Sending a success response to the browser
    //
    res.json({status: "success"});

});

// Handle the /signin endpoint
app.post("/signin", (req, res) => {
    // Get the JSON data from the body
    const {username, password} = req.body;

    //
    // D. Reading the users.json file
    //
    const users = JSON.parse(fs.readFileSync("data/users.json"));

    //
    // E. Checking for username/password
    //  
    if (!(username in users)) res.json({status: "error", error: "This username is not registered yet"});
    const hash = users[username].password;

    if (!bcrypt.compareSync(password, hash)) res.json({status: "error", error: "Wrong Password"});

    //
    // G. Sending a success response with the user account
    //
    const save_user = {"username": username, "avatar": users[username].avatar, "name": users[username].name};
    req.session.user = save_user;
    res.json({status: "success", user: save_user});

});

// Handle the /validate endpoint
app.get("/validate", (req, res) => {


    const current_user = req.session.user;
    // B. Getting req.session.user
    //eq.session.user;

    //
    // D. Sending a success response with the user account
    //
    if (current_user == null) res.json({status: "error", error: "There is no current user logged in"});

    const save_user = {"username": current_user.username, "avatar": current_user.avatar, "name": current_user.name};
    res.json({status: "success", user: save_user});

    // Delete when appropriate
    // res.json({ status: "error", error: "This endpoint is not yet implemented." });
});

// Handle the /signout endpoint
app.get("/signout", (req, res) => {

    //
    // Deleting req.session.user
    //
    delete req.session.user;

    //
    // Sending a success response
    //
    res.json({status: "success"});

});


//
// ***** Please insert your Lab 6 code here *****
const {createServer} = require("http");
const {Server} = require("socket.io");
const httpServer = createServer(app);
const io = new Server(httpServer);
io.use((socket, next) => {
    chatSession(socket.request, {}, next);
});

const onlineUsers = {};
let players = {player1: null, player2: null};


// Game server timer logic
const totalGameTime = 60; // Total game time in seconds
const gemMaxAge = 5000;
const swordMaxAge = 3000;
let gem;
let sword;
let connectedClients = 0;
let monsterBirthTime;
const monsterMoveDuration = [300, 300];
const monsterStopDuration = [1000, 500];
const MonsterToMoveAge = [monsterMoveDuration[0], monsterMoveDuration[1]];
const stopProbability = 0.5;

function startGameTimer() {
    let gameStartTime = Date.now();
    // Update the timer every second
    const timer = setInterval(() => {
        let gameTimeSoFar = Math.floor((Date.now() - gameStartTime) / 1000);
        let timeRemaining = totalGameTime - gameTimeSoFar;
        if (timeRemaining <= 0) {
            connectedClients = 0;
            clearInterval(timer);
            io.emit('gameEvent', {gameEvent: 'endGame', value: null});
        } else {
            io.emit('gameEvent', {gameEvent: 'updateTimer', value: timeRemaining});
            if (gem) {
                const currentTime = Date.now();
                const gemAge = currentTime - gem.birthTime;
                if (gemAge >= gemMaxAge) {
                    gem = randomGem();
                    io.emit('gameEvent', {gameEvent: 'randomGem', value: {x: gem.x, y: gem.y, color: gem.color}});
                }
            } else {
                gem = randomGem();
                io.emit('gameEvent', {gameEvent: 'randomGem', value: {x: gem.x, y: gem.y, color: gem.color}});
            }
            if (sword) {
                const currentTime = Date.now();
                const swordAge = currentTime - sword.birthTime;
                if (swordAge >= swordMaxAge) {
                    sword = randomSword();
                    io.emit('gameEvent', {gameEvent: 'randomSword', value: {x: sword.x, y: sword.y}});
                }
            } else {
                sword = randomSword();
                io.emit('gameEvent', {gameEvent: 'randomSword', value: {x: sword.x, y: sword.y}});
            }

            if (monsterBirthTime) {
                monsterBirthTime.forEach((monster, index) => {
                    let moveAge = Date.now() - monster;
                    if (moveAge >= MonsterToMoveAge[index]) {
                        if (monsterRandomStop()) {
                            MonsterToMoveAge[index] = monsterStopDuration[index];
                            io.emit('gameEvent', {gameEvent: 'MonsterStop', value: index});
                        } else {
                            MonsterToMoveAge[index] = monsterMoveDuration[index];
                            let direction = monsterRandomMove(index);
                            io.emit('gameEvent', {
                                gameEvent: 'MonsterMove',
                                value: {index: index, direction: direction}
                            });
                        }
                    }
                });
            } else {
                monsterBirthTime = spawnMonster();
            }
        }
    }, 1000);
}

function startGame() {
    io.emit('gameEvent', {gameEvent: 'startGame', value: null});
    // Start the game timer
    startGameTimer();
}

const gameArea = {
    top: 60,
    left: 60,
    bottom: 700,
    right: 800,
};

const colors = ["green", "red", "yellow", "purple"];

const randomGem = function () {
    const x = gameArea.left + (Math.random() * (gameArea.right - gameArea.left));
    const y = gameArea.top + (Math.random() * (gameArea.bottom - gameArea.top));
    const color = colors[Math.floor(Math.random() * 4)];
    let birthTime = Date.now();
    return {x, y, color, birthTime};
};

const randomSword = function () {
    const x = gameArea.left + (Math.random() * (gameArea.right - gameArea.left));
    const y = gameArea.top + (Math.random() * (gameArea.bottom - gameArea.top));
    let birthTime = Date.now();
    return {x, y, birthTime};
};

const spawnMonster = function () {
    return [Date.now(), Date.now()];
};

function monsterRandomStop() {
    return Math.random() < stopProbability;
}

const monsterRandomMove = function (monsterID) {
    const directions = [1, 2, 3, 4]; // 1: down, 2: right, 3: up, 4: left
    const randomDirection = directions[Math.floor(Math.random() * directions.length)];

    monsterBirthTime[monsterID] = Date.now();
    return randomDirection;
};

const MonsterRandomize = () => {
    const x = gameArea.left + (Math.random() * (gameArea.right - gameArea.left));
    const y = gameArea.top + (Math.random() * (gameArea.bottom - gameArea.top));
    return {x, y};
}


io.on("connection", (socket) => {
    if (socket.request.session.user != null) {
        // update the online users' list when a new user connected
        onlineUsers[socket.request.session.user.username] = {
            "avatar": socket.request.session.user.avatar,
            "name": socket.request.session.user.name
        };

        // send the online users' list to browser
        socket.on("get users", () => {
            socket.emit("users", JSON.stringify(onlineUsers));
        });

        // chatroom content
        const chatroom = JSON.parse(fs.readFileSync("data/chatroom.json"));
        socket.on("get messages", () => {
            socket.emit("messages", JSON.stringify(chatroom));
        });

        socket.on("post message", (content) => {
            const chat_details = {"user": socket.request.session.user, "datetime": new Date(), "content": content};
            chatroom.push(chat_details);
            // console.log(chatroom);
            fs.writeFileSync("data/chatroom.json", JSON.stringify(chatroom, null, " "));
            io.emit("add message", JSON.stringify(chat_details));
        });

        socket.on("typing", () => {
            io.emit("add typing", socket.request.session.user.name);
        });

        socket.on("remove typing", () => {
            io.emit("remove typing message");
        });


        // disconnection
        socket.on("disconnect", () => {
            delete onlineUsers[socket.request.session.user.username];
            io.emit("remove user", JSON.stringify(socket.request.session.user));

            //Delete Players
            players['player1'] = null;
            players['player2'] = null;

            //clear chatroom Data
            const emptyData = []
            fs.writeFileSync('data/chatroom.json', JSON.stringify(emptyData));
        });

        // Below is the game logic socket

        socket.on("join game", (player) => {
            if (player.id === 0) {
                players.player1 = player.name;
            } else if (player.id === 1) {
                players.player2 = player.name;
            }
            connectedClients++
            if (connectedClients === 2) {
                startGame();
            }
            io.emit("ready join game", {name: player.name, id: player.id});
        });

        socket.on("get players name", () => {
            io.emit("get players name", players);
        });

        // socket.on("get ranking", () => {
        //     let rankingData = JSON.parse(fs.readFileSync("data/rankings.json"));
        //     socket.emit("get ranking", rankingData);
        // });

        socket.on("restart", (players) => {
            //Clear User Data
            players["player1"] = null;
            players["player2"] = null;
            // Clear chatroom Data
            // let chatroomData = JSON.parse(fs.readFileSync("data/chatroom.json"));s
            const emptyData = []
            fs.writeFileSync('data/chatroom.json', JSON.stringify(emptyData));

            io.emit("restart", players);
        });

        socket.on("playerBehaviour", (data) => {
            let MonsterNewLocaltion;
            if (data.behaviour === "collect gem") {
                gem = randomGem();
                io.emit('gameEvent', {gameEvent: 'randomGem', value: {x: gem.x, y: gem.y, color: gem.color}});
                io.emit("playerBehaviour", {
                    playerID: data.playerID,
                    behaviour: data.behaviour,
                    direction: data.direction
                });
            } else if (data.behaviour === "pick up sword") {
                sword = randomSword();
                io.emit('gameEvent', {gameEvent: 'randomSword', value: {x: sword.x, y: sword.y}});
                io.emit("playerBehaviour", {
                    playerID: data.playerID,
                    behaviour: data.behaviour,
                    direction: data.direction
                });
            } else if (data.behaviour === "attackMonster") {
                MonsterNewLocaltion = MonsterRandomize();
                io.emit('gameEvent', {
                    gameEvent: 'randomMonster',
                    value: {index: data.direction.monsterID, x: MonsterNewLocaltion.x, y: MonsterNewLocaltion.y}
                });
                io.emit("playerBehaviour", {
                    playerID: data.playerID,
                    behaviour: data.behaviour,
                    direction: data.direction.score
                });
                // io.emit("playerBehaviour", { playerID: data.playerID, behaviour: "kill monster", direction: data.score });
            } else {
                io.emit("playerBehaviour", {
                    playerID: data.playerID,
                    behaviour: data.behaviour,
                    direction: data.direction
                });
            }
        });

        socket.on("gameEvent", (data) => {
            io.emit("gameEvent", {gameEvent: data.gameEvent, value: data.value});
        });

        socket.on('startGame', () => {
            startGame();
        });

        socket.on("end game", (data) => {
            let rankingData = JSON.parse(fs.readFileSync("data/rankings.json"));
            console.log("player1 name = ", players.player1);
            console.log("player2 name = ", players.player2);
            // upadte the rankings.json to add the current players into it
            if (players.player1 in rankingData) {
                rankingData[players.player1] = Math.max(rankingData[players.player1], data.playersScore[0]);
            } else {
                rankingData[players.player1] = data.playersScore[0];
            }
            if (players.player2 in rankingData) {
                rankingData[players.player2] = Math.max(rankingData[players.player2], data.playersScore[1]);
            } else {
                rankingData[players.player2] = data.playersScore[1];
            }
            fs.writeFileSync("data/rankings.json", JSON.stringify(rankingData, null, " "));
            console.log("In end game rankingData = ", rankingData);
            io.emit("end game", {players: players, playersScore: data.playersScore, rankingData: rankingData});
        });


    }
});


// Use a web server to listen at port 8000
httpServer.listen(8000, () => {
    console.log("The game has started...");
});

