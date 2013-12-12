nodeplay
========

A web framework based on Express, like Play Framework, has hot reloading feature, without rebooting the server. It is just a proof of concept, many improvements are planned and on the way. 
Welcome to hear suggestions.

Adding Custom Routes
====================

Edit *routes.json* to fullfill your needs. You can add POST as well. 

```
{
	"get": {
		"/"		: "index.js",
		"/test"	: "test.js"
	}
}
```

Content of *routes/index.js*

```
module.exports = function(req,res){
	res.send("Index.js Function");
}
```

When you first start the server, you will see the following output:

```
$ node app
[READING] Reading Routes file
[LOADING]  Loading GET /
[LOADING]  Loading GET /test
```

If you change either `routes.json` or a file in `routes/` folder, you will see the following output:

```
[CHANGE] Detected change 'routes.json'
[READING] Reading Routes file
[LOADING]  Loading GET /
[LOADING]  Loading GET /test
```

```
[RELOAD] index.js
```


TODO
====
* For now, it loads all the `routes.json` file, a better approach would be a diff comparison to load only the changed functions. Additionally, for now only GET and POST is supported, but it is trivial to support other verbs.
* Provide parameter validations
* WebSocket support
* Global variables of utility modules
* A CLI to create apps
