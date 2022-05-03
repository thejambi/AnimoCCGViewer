var QueryString = function () {
	var query_string = {};
	var query = window.location.search.substring(1);
  
	if (query.length > 0 && !(query.includes("appType=") || query.includes("f="))) {
		// Decompress first
		query = LZString.decompressFromEncodedURIComponent(query);
	}
  
	var vars = query.split("&");
	if (query.includes("&amp;")) {
		vars = query.split("&amp;");
	}
	for (var i=0;i<vars.length;i++) {
		var pair = vars[i].split("=");
		  // If first entry with this name
		  if (typeof query_string[pair[0]] === "undefined") {
			  query_string[pair[0]] = decodeURIComponent(pair[1]);
		  // If second entry with this name
	  } else if (typeof query_string[pair[0]] === "string") {
		  var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
		  query_string[pair[0]] = arr;
		  // If third or later entry with this name
	  } else {
		  query_string[pair[0]].push(decodeURIComponent(pair[1]));
	  }
	} 
	return query_string;
  }();

var debugOn = false;

/* Set to true if building for iOS, else set to false */
var ios = false;

/* Set to true if building for Android, else set to false */
var runningOnAndroid = false;


var compressSearchForShareLink = true;


/* --- */


function debug(str) {
    if (debugOn) {
      if (ios || QueryString.appType === 'ios') {
        try {
          webkit.messageHandlers.callbackHandler.postMessage(
              "{debugMessage:" + str + "}"
          );
        } catch(err) {
            console.log('error');
        }
      }
      
      console.log(str);
    }
}


function arrayIncludesAll(array1, array2) {
  for (var i = 0; i < array2.length; i++) {
    if (!array1.includes(array2[i])) {
      return false;
    }
  }
  return true;
}

function copyArray(arr) {
	var copyArr = [];
	for (var i = 0; i < arr.length; i++) {
		copyArr.push(arr[i].getCopy());
	}
	return copyArr;
}

// Array shuffle
function shuffleArray(array) {
  var i = 0
    , j = 0
    , temp = null

  for (i = array.length - 1; i > 0; i -= 1) {
    j = Math.floor(Math.random() * (i + 1))
    temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
}

// polyfill
if (!String.prototype.includes) {
  String.prototype.includes = function(search, start) {
    'use strict';
    if (typeof start !== 'number') {
      start = 0;
    }
    
    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}

if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/) {
    'use strict';
    if (this == null) {
      throw new TypeError('Array.prototype.includes called on null or undefined');
    }

    var O = Object(this);
    var len = parseInt(O.length, 10) || 0;
    if (len === 0) {
      return false;
    }
    var n = parseInt(arguments[1], 10) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {k = 0;}
    }
    var currentElement;
    while (k < len) {
      currentElement = O[k];
      if (searchElement === currentElement ||
         (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
        return true;
      }
      k++;
    }
    return false;
  };
}

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position){
      position = position || 0;
      return this.substr(position, searchString.length) === searchString;
  };
}

if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, position) {
      var subjectString = this.toString();
      if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.lastIndexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
  };
}



// Warn if overriding existing method
if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});

