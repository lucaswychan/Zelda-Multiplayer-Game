const HomePage = (function () {
    // This function initializes the UI
    const initialize = function () {
        // Populate the avatar selection
        Avatar.populate($("#register-avatar"));

        // Hide it
        $("#home-page").hide();

        // Submit event for the signin form
        $("#signin-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const username = $("#signin-username").val().trim();
            const password = $("#signin-password").val().trim();

            // Send a signin request
            Authentication.signin(username, password,
                () => {
                    hide();
                    PariUpPage.update(Authentication.getUser());
                    PariUpPage.show();

                    Socket.connect();

                    // Restart the the setting each time
                    Socket.restart();

                },
                (error) => {
                    $("#signin-message").text(error);
                }
            );
        });

        // Submit event for the register form
        $("#register-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const username = $("#register-username").val().trim();
            const password = $("#register-password").val().trim();
            const confirmPassword = $("#register-confirm").val().trim();

            // Password and confirmation does not match
            if (password != confirmPassword) {
                $("#register-message").text("Passwords do not match.");
                return;
            }

            // Send a register request
            Registration.register(username, password,
                () => {
                    $("#register-form").get(0).reset();
                    $("#register-message").text("You can sign in now.");
                },
                (error) => {
                    $("#register-message").text(error);
                }
            );
        });
    };

    // This function shows the form
    const show = function () {
        $("#home-page").fadeIn(500);
    };

    // This function hides the form
    const hide = function () {
        $("#signin-form").get(0).reset();
        $("#signin-message").text("");
        $("#register-message").text("");
        $("#home-page").fadeOut(500);
    };

    return {initialize, show, hide};
})();

const PariUpPage = (function () {
    // This function initializes the UI
    const initialize = function () {
        // Hide it
        $("#user-panel").hide();

        // Click event for the signout button
        $("#signout-button").on("click", () => {
            // Send a signout request
            Authentication.signout(
                () => {
                    Socket.disconnect();

                    hide();
                    HomePage.show();
                }
            );
        });

        $("#join-player1").on("click", () => {
            let playerName = Authentication.getUser().username;
            console.log(`${playerName} is ready to play`);
            Socket.joinGame(playerName, 0);
        });

        $("#join-player2").on("click", () => {
            let playerName = Authentication.getUser().username;
            console.log(`${playerName} is ready to play`);
            Socket.joinGame(playerName, 1);
        });

        hide();
    };

    // This function shows the form with the user
    const show = function (user) {
        $("#pair-up-page").show();
    };

    // This function hides the form
    const hide = function () {
        $("#pair-up-page").hide();
    };

    // This function updates the user panel
    const update = function (user) {
        if (user) {
            // $("#user-panel .user-avatar").html(Avatar.getCode(user.avatar));
            $("#user-panel .user-name").text(user.name);
        } else {
            // $("#user-panel .user-avatar").html("");
            $("#user-panel .user-name").text("");
        }
    };

    return {initialize, show, hide, update};
})();


const GamePage = (() => {

    const initialize = () => {
        // Socket.getPlayers();

        hide();
    };

    const show = () => {
        Socket.getPlayersName();
        $("#game-container").show();
    };

    const hide = () => {
        $("#game-container").hide();
    }
    return {initialize, show, hide};
})();

const ChatPanel = (function () {
    // This stores the chat area
    let chatArea = null;

    // This function initializes the UI
    const initialize = function () {
        // Set up the chat area
        chatArea = $("#chat-area");

        // Submit event for the input form
        $("#chat-input-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the message content
            const content = $("#chat-input").val().trim();

            // Post it
            Socket.postMessage(content);

            // Clear the message
            $("#chat-input").val("");
        });

        // New added codes for adding the typing message
        let timeID;
        let trigger = false;
        $('#chat-input')
            .on("keydown", () => {
                if (!trigger) {
                    Socket.typingMessage("typing");
                    trigger = true;
                    // console.log("keydown");
                    clearTimeout(timeID);
                }
                // clearTimeout(timeID);
            })
            .on("keyup", () => {
                if (trigger && !timeID) {
                    timeID = setTimeout(() => {
                        Socket.typingMessage("remove typing");
                        // console.log("keyup");
                        timeID = null;
                        trigger = false;
                    }, 3000);
                }
            });
    };

    // This function updates the chatroom area
    const update = function (chatroom) {
        // Clear the online users area
        chatArea.empty();

        // Add the chat message one-by-one
        for (const message of chatroom) {
            addMessage(message);
        }
    };

    // This function adds a new message at the end of the chatroom
    const addMessage = function (message) {
        // const datetime = new Date(message.datetime);
        // const datetimeString = datetime.toLocaleDateString() + " " +
        //     datetime.toLocaleTimeString();

        chatArea.append(
            $("<div class='chat-message-panel row'></div>")
                .append(UI.getUserDisplay(message.user))
                .append($("<div class='chat-message col'></div>")
                    // .append($("<div class='chat-date'>" + datetimeString + "</div>"))
                    .append($("<div class='chat-content'>" + message.content + "</div>"))
                )
        );
        chatArea.scrollTop(chatArea[0].scrollHeight);
    };

    return {initialize, update, addMessage};
})();


const GameOverPage = (() => {

    const initialize = () => {
        // Socket.getRanking();s
        $("#back-to-pair-up").on("click", () => {
            // Send a signout request

            hide();
            Socket.restart();
            PariUpPage.show();
        });

        // Click event for the signout button
        $("#back-to-home").on("click", () => {
            // Send a signout request
            Authentication.signout(
                () => {

                    Socket.disconnect();
                    hide();
                    HomePage.show();

                }
            );
        });

        hide();
    };
    const show = () => {
        Socket.getRanking();
        $("#game-over-page").show();
    };

    const hide = () => {
        $("#game-over-page").hide();
    }
    return {initialize, show, hide};
})();


const UI = (function () {
    // This function gets the user display
    const getUserDisplay = function (user) {
        return $("<div class='field-content row shadow'></div>")
            // .append($("<span class='user-avatar'>" +
            //     Avatar.getCode(user.avatar) + "</span>"))
            .append($("<span class='user-name'>" + user.name + "</span>"));
    };

    // The components of the UI are put here
    const components = [HomePage, PariUpPage, GamePage, ChatPanel, GameOverPage];

    // This function initializes the UI
    const initialize = function () {
        // Initialize the components
        for (const component of components) {
            component.initialize();
        }
    };

    return {getUserDisplay, initialize};
})();