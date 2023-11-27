const Authentication = (function() {
    // This stores the current signed-in user
    let user = null;

    // This function gets the signed-in user
    const getUser = function() {
        return user;
    }

    // This function sends a sign-in request to the server
    // * `username`  - The username for the sign-in
    // * `password`  - The password of the user
    // * `onSuccess` - This is a callback function to be called when the
    //                 request is successful in this form `onSuccess()`
    // * `onError`   - This is a callback function to be called when the
    //                 request fails in this form `onError(error)`
    const signin = function(username, password, onSuccess, onError) {

        //
        // A. Preparing the user data
        //
        const sigin_data = {"username": username, "password": password};
        const sigin_json = JSON.stringify(sigin_data);
        //
        // B. Sending the AJAX request to the server
        //
        fetch("/signin", { method: "POST", headers: { "Content-Type": "application/json" }, body: sigin_json })
            .then((res) => res.json())
            .then((json) => {
                if (json.status == "success") {
                    user = json.user;
                    sounds.logIn.currentTime = 0;
                    sounds.logIn.play();
                    onSuccess();
                }
                else if (onError) onError(json.error);
            })
            .catch((err) => onError(err));


    };

    // This function sends a validate request to the server
    // * `onSuccess` - This is a callback function to be called when the
    //                 request is successful in this form `onSuccess()`
    // * `onError`   - This is a callback function to be called when the
    //                 request fails in this form `onError(error)`
    const validate = function(onSuccess, onError) {

        fetch("/validate").then((res) => res.json()).then((json) => {
            if (json.status == "success") {
                onSuccess();
            }
            else if (onError) onError(json.error);
        })
        .catch((err) => onError(err));

    };

    // This function sends a sign-out request to the server
    // * `onSuccess` - This is a callback function to be called when the
    //                 request is successful in this form `onSuccess()`
    // * `onError`   - This is a callback function to be called when the
    //                 request fails in this form `onError(error)`
    const signout = function(onSuccess, onError) {

        fetch("/signout").then((res) => res.json()).then((json) => {
            if (json.status == "success") {
                user = null;
                onSuccess();
            }
            else if (onError) onError(json.error);
        })
        .catch((err) => onError(err));

        // Delete when appropriate
        if (onError) onError("This function is not yet implemented.");
    };

    return { getUser, signin, validate, signout };
})();
