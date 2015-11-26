function init(){
    Trello.setKey(APP_KEY);

    // If we have a token, set up our API call auths
    if (localStorage.trello_token) {
        isAuthed = true;
        Trello.setToken( localStorage.trello_token);
        $('.not-authed').hide();
        $('.authed').show();
    }

    // AUTH ONLY BELOW HERE!
    if( !isAuthed) return;

    Trello.members.get('me', function(data){
        $('#username').text( '@'+data.username);
        $('#username').attr('href', data.url);
    });

    Trello.members.get('me/boards', function(data){
console.log(data);
        // Get all boards
        data.forEach(function(board, i){
            if(board.closed === false){
                $('#board').append('<option value="'+board.id+'">'+board.name+'</option>');
            }
        });

        // Load lists for first board
        var fBId = $('#board option:first-child').val();
        var lists = getBoardLists(fBId, true);
    });

    // Action bindings
    $('#board').on('change', function(){
        var bID = $(this).val();
        getBoardLists( bID, true);
    });

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

function getBoardLists(bID, updateLists){
    if( !bID) return null;

    Trello.boards.get( bID+'/lists', function(data){

        if( true === updateLists){
            $('#list').html('');
            data.forEach(function(list){
                if( list.closed === false){
                    $('#list').append('<option value="'+list.id+'">'+list.name+'</option>');
                }
            });
        }
console.log(data);
        return data;
    });
}

$(document).ready(init);