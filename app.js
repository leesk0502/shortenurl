var config = require('./config.json');

var http = require('http');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser')
var app = express();

var base62 = require('base62');
var redis =  require('redis').createClient();

var REDIS_PREFIX = 'shorten:';

app.use(bodyParser.json());
app.use('/assets', express.static(path.join(__dirname, '/app/assets')));
app.use(express.static(path.join(__dirname, '/app/views/')));

app.post('/api/regist', function(req, res){
	var url = req.body.url;
	var return_data = {
		'result' : false,
		'en' : ''
	};

	if( url ){
		redis.exists(REDIS_PREFIX+url, function(err, isExist){
			if( isExist ) {

				return_data.result = true;
				return_data.en = base62.encode( redis.get(url) );
				res.json(return_data);
				res.end();
			}
			else {
				redis.incr(REDIS_PREFIX+'idx', function(err, idx){
					url.replace('http://', '');
					url.replace('https://', '');
					if( redis.set(REDIS_PREFIX+idx, url) && redis.set(REDIS_PREFIX+url, idx)){
						return_data.result = true;
						return_data.en = base62.encode( redis.get(url) );
					}

					res.json(return_data);
					res.end();
				});
			}
		});
	}
});

app.get('/:url', function(req, res){
	var idx = base62.decode( req.params.url );
	redis.exists(REDIS_PREFIX+idx, function(err, isExist){
		if( isExist ){
			redis.get(REDIS_PREFIX+idx, function(err, url){
				res.writeHead(301,
											{Location: 'http://'+url}
										 );
										 res.end();
			});
		}
	});
});

redis.auth( config.redis.password, function(){
	app.listen(3000, function(){
		console.log("Server start.");
	});
});
