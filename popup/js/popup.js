function init(){

    ltApi.auth(function(token){
        if( token){
            $('.not-authed').hide();
            $('.authed').show();
        }
    });

    // AUTH ONLY BELOW HERE!
    if( !ltApi.auth() ) return;

    ltApi.getMe();
    ltApi.getBoards();



    // Set current URL
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true, 'currentWindow': true}, function (tabs) {
        var url = tabs[0].url;
        console.log(url);
        if( url) $('#url').val(url);
    });

    $('#submit').on('click', function(){
        if( $(this).attr('disabled') !== false){
            $(this).attr('disabled', 'disabled');

            Trello.post("cards", {
                    name: $('#title').val(),
                    desc: $('#desc').val(),
                    idList: $('#list').val(),
                    due: null,
                    urlSource: $('#url').val()
            }, function(){
                console.log('Post success!');
                $(this).attr('disabled', false);
            }, function(data){
                console.log('Post error!', data);
                $(this).attr('disabled', false);
            });

        }
    });
}


$(document).ready(init);