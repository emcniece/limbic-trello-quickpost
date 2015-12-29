// API Trigger Actions
$(document).bind('trello_trigger', function(e, model, data){

  // Text models
  $('[data-service="trello"][data-model="'+model+'"][data-text]').each(function(){
    $(this).text( data[$(this).data('text')] );
  });

  // Append models
  $('[data-service="trello"][data-model="'+model+'"][data-append]').each(function(){
    var $container = $(this);
    var list;

    if( $(this).data('append') ){
      // If data-append is specified, we're targeting a child property. Untested!
      //list = data[$(this).data('append')];
      console.warn('NOT IMPLEMENTED!')
    } else{
      // No data-append? cycle top-level elements
      list = data;
    }

    for(var i=0;i<list.length;i++){

      if( $container.data('template')){
        var pattern = /{{[a-zA-Z0-9_-]*}}/gi;
        var output = $container.data('template');

        output = output.replace(pattern, function(match, text, orig){
          match = match.replace('{{', '').replace('}}','');
          return list[i][match];
        });

        $container.append( output );
      } else{
        $container.append( list[i] );
      }
    }

    //$(this).append( data[$(this).data('text')] );
  });

});

// General API Wrapper
var ltApi = {
  auth: function(callback){
    var authToken = localStorage.trello_token || false;

    // If we have a token, set up our API call auths
    if (authToken) {
      Trello.setToken( authToken);
    }

    return callback ? callback(authToken) : authToken;
  },
  getMe: function(callback){
    Trello.members.get('me', function(user){
      $(document).trigger('trello_trigger', ['user', user]);
      return callback(user);
    });
  },
  getBoards: function(callback){
    Trello.members.get('me/boards', function(data){
      $(document).trigger('trello_trigger', ['boards', data]);
      return callback(data);
    });
  }
}
