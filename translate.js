

( function( ext ) {

  var
  API_KEY = 'trnsl.1.1.20171024T144620Z.0ab0e4a70d925560.a2b9514f36f1b2c2bbb18c99113b06c9d986b41b',    // Get API key  http://api.yandex.com/translate/
  lastQuery = {},
  supportedLanguages = {},
  connection = {
    status: 1,
    msg: 'Setting up extension'
  },
  defaultLang = null;
        
  ext._shutdown = function() {};
  
  ext._getStatus = function() {
    return connection;
  };
  
  ext.translate = function( text, from, to, callback ) {
        
    if ( text == lastQuery.text && from == lastQuery.from && to == lastQuery.to ) {
      callback( lastQuery.response );
      return;
    }
    
    if ( to == from ) {
      callback( text );
      return;
    }
    
    translate( text, from, to, callback );
    
  };
  
  ext.translateDefault = function( text, from, callback ) {
  
    if ( text == lastQuery.text && from == lastQuery.from && lastQuery.to == defaultLang ) {
      callback( lastQuery.response );
      return;
    }
    
    if ( from == defaultLang ) {
      callback( text );
      return;
    }
    
    translate( text, from, defaultLang, callback );
    
  }; 
    
  ext.setDefaultLang = function( lang ) {
    defaultLang = lang;
  };
  
  ext.getDefaultLang = function( lang ) {
    return defaultLang;
  };
  
  function translate( text, from, to, callback ) {
  
    var url = 'https://translate.yandex.net/api/v1.5/tr.json/translate' +
      '?key=' + API_KEY +
      '&lang=' + supportedLanguages[ from ] + '-' + supportedLanguages[ to ] +
      '&text=' + encodeURIComponent( text );
    
    lastQuery.text = text;
    lastQuery.from = from;
    lastQuery.to = to;
    lastQuery.completed = false;
                
    $.ajax({
      url: url,
      dataType: 'json',
      success: function( translation ) {
        lastQuery.response = translation.text[ 0 ];
        callback( translation.text[ 0 ] );
      }
    });
  }
  
  function getYandexLanguages() {
    
    var url = 'https://translate.yandex.net/api/v1.5/tr.json/getLangs' +
      '?key=' + API_KEY +
      '&ui=en';
    
       
    $.ajax({
      url: url,
      dataType: 'jsonp',
      success: function( data ) {
      
        if ( defaultLang in data.langs ) {
          defaultLang = data.langs[ defaultLang ];
          descriptor.blocks[ 0 ][ 4 ] = defaultLang;
          descriptor.blocks[ 1 ][ 4 ] = defaultLang;
          descriptor.blocks[ 2 ][ 3 ] = defaultLang;
        } else {
          defaultLang = 'English';
        }
        
        for ( var l in data.langs ) {
          supportedLanguages[ data.langs[ l ] ] = l;
          descriptor.menus.lang.push( data.langs[ l ] );
        }
        
        connection.status = 2;
        connection.msg = 'Ready';
      },
      error: function() {
        console.log( "Failed to get language list" );
        connection.status = 0;
        connection.msg = 'Failed to get language list';
      },
      complete: function() {
        ScratchExtensions.register( 'Translation extension', descriptor, ext );
      }
    });
  }
  
  var descriptor = {
    blocks: [
      [ 'R', 'translate %s from %m.lang to %m.lang', 'translate', 'Hello', 'English', 'Spanish' ],
      [ 'R', 'translate %s from %m.lang to default language', 'translateDefault', 'Hello', 'English' ],
      [ ' ', 'set default language to %m.lang', 'setDefaultLang', 'English' ],
      [ 'r', 'default language', 'getDefaultLang' ]
    ],
    menus: {
      lang: []
    },
      url: 'https://github.com/edutev/translate_extension'
  };
  
 

} )( {} );
