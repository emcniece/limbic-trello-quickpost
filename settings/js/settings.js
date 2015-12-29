var isAuthed = false;
function init() {

    Trello.setKey(APP_KEY);

    // Check if page load is a redirect back from the auth procedure
    if (HashSearch.keyExists('token')) {
        Trello.authorize(
            {
                name: "Trello Helper Extension",
                expiration: "never",
                interactive: false,
                scope: {read: true, write: true},
                success: function () {},
                error: function () {
                    alert("Failed to authorize with Trello.")
                }
            });
    }

    // If we have a token, set up our API call auths
    ltApi.auth();

    // Message and button containers
    var $lout = $("#trello_helper_loggedout");
    var $lin = $("#trello_helper_loggedin");

    // Log in button
    $("#trello_helper_login").click(function () {
        Trello.authorize(
            {
                name: "Trello Helper Extension",
                type: "redirect",
                expiration: "never",
                interactive: true,
                scope: {read: true, write: true},
                success: function () {
                    // Can't do nothing, we've left the page
                },
                error: function () {
                    alert("Failed to authorize with Trello.")
                }
            });
    });

    // Log out button
    $("#trello_helper_logout").click(function () {
        Trello.deauthorize();
        location.reload();
    });

    if (!ltApi.auth() ) {
        $lout.show();
        $lin.hide();
        return;
    }

    ltApi.getMe(function(me){
        //$('.user_name').text( me.username);
        $lout.hide();
        $lin.show();
    });

    ltApi.getBoards(function(data){ console.log( 'complete'); });
}
$(document).ready(init);