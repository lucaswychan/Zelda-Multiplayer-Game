const Socket = (function () {
    // This stores the current Socket.IO socket
    let socket = null;
    let playerID = null;

    // let playerId; // Store the player's ID

    // This function gets the socket from the module
    const getSocket = function () {
        return socket;
    };

    // This function connects the server and initializes the socket
    const connect = function () {
        socket = io();

        // Listen for the player's unique ID from the server
        socket.on('playerId', (id) => {
            playerId = id;
        });
        

        socket.on("playerBehaviour", (data) => {
            setTimeout(function () {
                game.playerBehaviour(data.playerID, data.behaviour, data.direction)
            }, 10);
        });

        socket.on("gameEvent", (data) => {
            // if(data.gameEvent === "randomGem"){
            //     let value = {
            //         x:data.value.x, y:data.value.y, color:data.value.color
            //     }
            // }
            setTimeout(function () {
                game.gameControl(data.gameEvent, data.value)
            }, 10);
        });

        // Wait for the socket to connect successfully
        socket.on("connect", () => {
            // Get the online user list
            socket.emit("get users");

            // Get the chatroom messages
            socket.emit("get messages");
        });

        // Set up the messages event
        socket.on("messages", (chatroom) => {
            chatroom = JSON.parse(chatroom);

            // Show the chatroom messages
            ChatPanel.update(chatroom);
        });

        // Set up the add message event
        socket.on("add message", (message) => {
            message = JSON.parse(message);
            // Add the message to the chatroom
            ChatPanel.addMessage(message);
        });

        socket.on("add typing", (name) => {
            // console.log(JSON.stringify(Authentication.getUser()));
            if (Authentication.getUser().name != name)
                $("#chat-input-form").prepend($('<div style="font-style: italic; padding: 6px 10px; font-size: 90%" id="typing-message">' + name + " is typing..." + "</div>"));
        });

        socket.on("remove typing message", () => {
            // console.log("remove typing message");
            $("#typing-message").remove();
        });
        
        socket.on("ready join game", (player) => {
            const player1Button = $("#join-player1");
            const player2Button = $("#join-player2");

            if (player.id === 0) {
                player1Button.html(player.name);
                // player1Button.css("background", "purple");
            }
            else if (player.id === 1) {
                player2Button.html(player.name);
                // player2Button.css("background", "purple");
            }
            if (player1Button.html() !== "Player 1" && player2Button.html() !== "Player 2") {
                GamePage.show();
                PairUpPage.hide();
                //start the game 
                game.start();
            }
        });

        socket.on("get players name", (players) => {
            if (players["player1"] != null) {
                $("#player1-name").html(players["player1"]);
                $("#game-over-player1-name").html(players["player1"]);                
            }
            if (players["player2"] != null) {
                $("#player2-name").html(players["player2"]);
                $("#game-over-player2-name").html(players["player2"]);   
            }
        });

        socket.on("get ranking", (rankingsData) => {

            // we can get the player name and data in html here and store the score in the page
            // append both player result to ranking list
            // sort and get the top 10 result
            // write the need to write the result back the json

            console.log("rankingsData:",rankingsData)
            const dataArray = Object.entries(rankingsData).map(([name, score]) => ({ name, score }));
             
            // Sort in descending order based on the score
            dataArray.sort((a, b) => b.score - a.score);

            // Get the tbody element to populate
            const rankingList = $('#ranking-list');

            // Clear any existing content in the table body
            rankingList.empty();

            // Populate the table body with the sorted data
            dataArray.forEach((item, index) => {
                const row = `<tr>
                    <td>${index + 1}</td>
                    <td>${item.name}</td>
                    <td>${item.score}</td>
                </tr>`;
                rankingList.append(row);
            });

        });

        socket.on("restart", (players) => {
            const player1Button = $("#join-player1");
            const player2Button = $("#join-player2");
            players["player1"] = null
            players["player2"] = null
            // Reset the pair up button
            player1Button.html('Player 1');
            // player1Button.css("background", "rgb(117, 183, 229)");
            
            player2Button.html('Player 2');
            // player2Button.css("background", "rgb(117, 183, 229)");

            //clear chatroom data
            const chatroomArea = $('#chat-area');
            chatroomArea.empty();

            $('#chat-input').val('');

        });

        // get back from server
        // gemX, gemY gemColor
        socket.on("collect gem", (data) => {
            // setTimeout(function () {
            console.log("back to the client collect function")
            $("#player1-score").text(data.playerScore);
        
            game.genNewGem(data.gemX, data.gemY, data.gemColor);
        //    }, 10); 
          
        });




        
    };

    // This function disconnects the socket from the server
    const disconnect = function () {
        socket.disconnect();
        socket = null;
    };

    // This function sends a post message event to the server
    const postMessage = function (content) {
        if (socket && socket.connected) {
            socket.emit("post message", content);
        }
    };

    const typingMessage = (event) => {
        if (socket && socket.connected) {
            if (event == "typing")
                socket.emit("typing");
            else if (event == "remove typing")
                socket.emit("remove typing");
        }
    }

    
    const joinGame = (name, id) => {
        playerID = id;
        socket.emit("join game", { name, id });
    }

    const getPlayersName = function () {
        socket.emit("get players name", true);
    }

    const getRanking = function () {
        socket.emit("get ranking", true);
    }

    const restart = function () {
        socket.emit("restart", true);
    }

    const postBehaviour = function (behaviour, direction) {
        setTimeout(function () {
            socket.emit("playerBehaviour", { playerID: playerID, behaviour: behaviour, direction: direction });
        }, 10);
    }

    const postGameEvents = function(gameEvent, value) {
        socket.emit("gameEvent", {gameEvent: gameEvent, value: value});
    }

    // // collect gem to server (called by game.js)
    const collectGem = function () {
        console.log("collect gem player: ", playerID)
        socket.emit("collect gem", {playerID: playerID});
    }

    // const collectGem = function (player, playerid) {
    //     console.log("player: ", player, "playerID: ", playerid)
    //     const data = {
    //       playerId: playerid,
    //       action: 'collectGem',
    //       gemId: gemId,
    //     };
    //     socket.emit('playerAction', data);
    // }

    // // Listen for updates when a gem is collected by any player
    // socket.on('gemCollected', (data) => {
    //     // Process the gem collection event
    //     if (data.playerId === playerId) {
    //     // Player 1 or Player 2 collected the gem
    //     // Update UI or perform relevant actions
    //     }
    // });


    return { getSocket, connect, disconnect, postMessage, typingMessage, joinGame, getPlayersName,
         getRanking, restart, postBehaviour, postGameEvents, collectGem};
})();
