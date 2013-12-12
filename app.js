var express = require("express");
var fs = require("fs");
var path = require("path");
var colors = require('colors');

var app = express();


require.uncache = function (moduleName) {
    // Run over the cache looking for the files
    // loaded by the specified module name
    require.searchCache(moduleName, function (mod) {
        delete require.cache[mod.id];
    });
};

/**
 * Runs over the cache to search for all the cached
 * files
 */
require.searchCache = function (moduleName, callback) {
    // Resolve the module identified by the specified name
    var mod = require.resolve(moduleName);

    // Check if the module has been resolved and found within
    // the cache
    if (mod && ((mod = require.cache[mod]) !== undefined)) {
        // Recursively go over the results
        (function run(mod) {
            // Go over each of the module's children and
            // run over it
            mod.children.forEach(function (child) {
                run(child);
            });

            // Call the specified callback providing the
            // found module
            callback(mod);
        })(mod);
    }
};


// Make it more beatufiul
function deleteRoute(method, url) {
	if ( method == "get" && app.routes.get){
	  for (var i = 0; i < app.routes.get.length; i++) {
	    if (app.routes.get[i].path === url) {
	      app.routes.get.splice(i, 1);
	    }
	  }
	}
	else if ( method == "post" && app.routes.post){
	  for (var i = 0; i < app.routes.post.length; i++) {
	    if (app.routes.post[i].path === url) {
	      app.routes.post.splice(i, 1);
	    }
	  }
	}
}

var routes = {};
function initRoutes(){
	console.log("[READING]".green, "Reading Routes file");
	fs.readFile('routes.json', "utf8", function (err, data) {
		try {
			routes = JSON.parse(data);
			for(var path in routes.get){
				console.log("[LOADING]".green ,  " Loading GET " + path);
				loadHandler("get", path, routes.get[path]);
			} 
		} catch(ex){
			console.log("[ERROR]".red, "Cannot parse routes.json", ex);
			throw ex;
		}
	});
}

function loadHandler(method, urlpath, filename){	
	var myFilename = "./" + path.join("route", filename);
	require.uncache(myFilename);	
	var handler = null;
	try {
		handler = require(myFilename);
	} catch ( ex){
		console.log("[ERROR]".red, "Cannot load handler for ", method, urlpath, filename, ex.message, ex.stack);
		return;
	}
	try {
		if ( method == "get"){
			deleteRoute("get", urlpath);
			app.get(urlpath, handler);
		} else if ( method == "post"){
			deleteRoute("post", urlpath);
			app.post(urlpath, handler);
		} else {
			console.log("[ERROR]".red, "Unknown method: " + method);
		}
	} catch (ex){
		console.log("[ERROR]".red, "Cannot load handler for ", method, urlpath, filename, ex.message, ex.stack);
	}
}

initRoutes();

var lastWatchTime = new Date();
fs.watch('routes.json', function (event, filename) {
	if (filename == "routes.json" && event == "change") {
		var currentTime = new Date();
		if ( currentTime - lastWatchTime > 250){
			console.log("[CHANGE]".cyan, "Detected change 'routes.json'");
			lastWatchTime = currentTime;
			initRoutes();
		}
	} 
});


var filter = function(pattern, fn) {
  return function(filename) {
    if (pattern.test(filename)) {
      fn(filename);
    }
  }
}

var accessTimes = {};
fs.watch('route', function (event, filename) {
	if (event == "change") {
		for(var path in routes.get){
			if ( routes.get[path] == filename){
				var now = new Date();
				if ( accessTimes[filename] && (now - accessTimes[filename]) < 100){
					// Ignore the duplicate change event
				} else {
					accessTimes[filename] = now;
					console.log("[RELOAD]".cyan, filename);
					loadHandler("get", path, routes.get[path]);					
				}
			}
		}		
	} 
});

app.listen(9000);