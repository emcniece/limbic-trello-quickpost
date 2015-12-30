// Template Parser: replace {{name}} with data.name
String.prototype.tplParse = function(data){
  if(!this.length) return;

  var pattern = /{{[a-zA-Z0-9_-]*}}/gi;
  return this.replace(pattern, function(match, text, orig){
    match = match.replace('{{', '').replace('}}','');
    return data[match];
  });
}
Array.prototype.clean = function(deleteValue) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == deleteValue) {
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};

/*
  API Trigger Actions
  Possible models:
    - user
    - boards
    - lists
*/
$(document).bind('api_trigger', function(e, model, data){
  switch(model){
    case 'user':
      ltApi.getMe();
      break;
    case 'boards':
      ltApi.getBoards();
      break;
    case 'lists':
      ltApi.getLists(data);
      break;
  }
});

$(document).bind('trello_trigger', function(e, model, data){

  // DOM attr parse
  $('[data-model="'+model+'"]').each(function(){
    var $elem = $(this);
    var html = $elem[0].outerHTML;

    if( (html.indexOf('}}' > -1) && (html.indexOf('data-template') === -1) ) ){
      $($elem[0].attributes).each(function() {
        $elem.attr( this.nodeName, this.nodeValue.tplParse(data) );
      });
    }
  });

  // Text models
  $('[data-service="trello"][data-model="'+model+'"][data-text]').each(function(){
    $(this).text( data[$(this).data('text')] );
    $(this).trigger('change');
  });

  // Append models
  $('select[data-service="trello"][data-model="'+model+'"]').each(function(){
    var $container = $(this);
    var template = $container.data('template');
    var list;

    if( $(this).data('append') ){
      // If data-append is specified, we're targeting a child property
      //list = data[$(this).data('append')];
      console.warn('Specific item data-append not implemented')
    } else{
      // No data-append speficier? cycle top-level elements
      list = data;
    }

    // cleaning old values
    if( $container.data('append') !== 'undefined'){
      $container.html('');
    }

    for(var i=0;i<list.length;i++){
      $container.append( template.tplParse(list[i]) );
    }

    // Sets inputs from localStorage options
    if( $container.data('active')){
      $container.val( $container.data('active'));
    }

    // Set input to default
    if( $container.data('default')){
      $container.val( ltApi.getOption( $container.data('default'), $container.data('default')) );
    }

    $container.trigger('change');
  });
});

// Dependent Input Binding
$('[data-bind]').each(function(){
  var $dep = $(this);
  var target = $dep.data('bind');

  $(target).on('change', function(){
    $(document).trigger('api_trigger', [$dep.data('model'), $(target).val() ]);
  });
});

// Option Input Actions
// Update localStorage settings
$('[data-setting]').on('change', function(){
    ltApi.setOption( $(this).attr('name'), $(this).val() );
});

// General API Wrapper
var ltApi = {
  initComplete: false,
  init: function(){
    if( this.initComplete) return;
    Trello.setKey(APP_KEY);

    if('undefined' === typeof(localStorage.options)){
      localStorage.options = JSON.stringify({});
    }

    // Load available settings
    var options = this.getOptions();
    $('[data-active]').each(function(){
      var opt = options[$(this).attr('name')];
      $(this).val( opt );
      $(this).data('active', opt);
    });

    this.initComplete = true;
  },
  auth: function(callback){
    this.init();
    var authToken = localStorage.trello_token || false;

    // If we have a token, set up our API call auths
    if (authToken) {
      Trello.setToken( authToken);
    }

    return callback ? callback(authToken) : authToken;
  },
  getOptions: function(){
    return JSON.parse(localStorage.options);
  },
  getOption: function(name, optDefault, forceReturn){
    var options = this.getOptions();
    var output;

    if( forceReturn && 0){
      output = name;
    }else if( name.indexOf('}}') > -1){
      output = name.tplParse(options);

      // Recuse to check if we have more variables
      if( output.indexOf('}}') > -1) output = this.getOption(output, optDefault);
    }else{
      output = options[name] ? options[name] : optDefault ? optDefault : name;
    }

    return output;
  },
  setOption: function(name, value){
    var options = this.getOptions();
    options[name] = value;
    localStorage.options = JSON.stringify(options);

    return value;
  },
  getMe: function(callback){
    Trello.members.get('me', function(user){
      $(document).trigger('trello_trigger', ['user', user]);
      return callback ? callback(user) : user;
    });
  },
  getBoards: function(callback){
    Trello.members.get('me/boards', function(data){
      $(document).trigger('trello_trigger', ['boards', data]);
      return callback ? callback(data) : data;
    });
  },
  getLists: function(boardId, callback){
    var opts = this.getOptions();
    var list = opts.lastBoard ? opts.lastBoard : opts.defaultBoard.tplParse(opts);
    boardId = boardId ? boardId : list;

    if(!boardId) return;

    Trello.boards.get( boardId+'/lists', function(data){
      $(document).trigger('trello_trigger', ['lists', data]);
      return callback ? callback(data) : data;
    });
  }
}
