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
        $lout.hide();
        $lin.show();
    });

    ltApi.getBoards();
    //ltApi.getLists();

}
$(document).ready(init);




/* REMOVE WHEN DONE DEV */
function reloadOnChange(url, checkIntervalMS) {
    if (!window.__watchedFiles) {
        window.__watchedFiles = {};
    }

    (function() {
        var self = arguments.callee;
        var xhr = new XMLHttpRequest();

        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if (__watchedFiles[url] &&
                    __watchedFiles[url] != xhr.responseText) {
                    window.location.reload();
                } else {
                    __watchedFiles[url] = xhr.responseText
                    window.setTimeout(self, checkIntervalMS || 1000);
                }
            }
        };

        xhr.open("GET", url, true);
        xhr.send();
    })();
}

reloadOnChange(chrome.extension.getURL('/scripts/apis.js'));
reloadOnChange(chrome.extension.getURL('/settings/index.html'));
reloadOnChange(chrome.extension.getURL('/settings/js/settings.js'));
