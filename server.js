var express = require('express'),
		redis = require('redis'),
		JSONStream = require('JSONStream'),
		base32 = require('base32'),
		app = express(),
		client = redis.createClient(),
		thisPlayerId;

app.set('port', 3000);
app.use(express.static(__dirname));
app.use(express.urlencoded());
app.use(express.json());

// inits the game, returns the gameId back to the client
app.post("/init", function(req, res, next){	
	var data = base32.decode(req.body['data']).split('+');

	client.incr('game.id', function(err, id){
		var gameId = 'game:'+id;

		client.hmset(gameId+':init', {time: data[0]}, function(err, response){
			res.send({id: gameId});
		})
	});
})

// the client pings when reaching mid-game
app.post("/ping", function(req, res, next){	
	var data = base32.decode(req.body['data']).split('+');
	var gameId = data[1];

	client.hmset(gameId+':ping', {time: data[0], score: data[2]}, function(err, response){
		res.send({id: gameId});
	})
})

var validateRank = function(req, res, next){
	// rank validation - Date.now()+"+"+gameServerId+"+"+this.value+"+"+gameTime.toFixed(3)
	var data = base32.decode(req.body['data']).split("+"); 
	var gameTime = data[3],
			gameId = data[1];

	client.zrange(['s', 5, 6, 'WITHSCORES'], function(err, response) {
		if(response.length){
			var maxTopTime = response[1];

			// a time that will make the rankings
			if(gameTime < maxTopTime){ 
				client.hget([gameId+':init', 'time'], function(err, init){
					var startTs = init; 
					
					client.hget([gameId+':ping', 'time'], function(err, ping){
						var pingTs = ping; 

						console.log(startTs, pingTs, parseInt(pingTs) - parseInt(startTs), gameTime*1000)

						if(!startTs || !pingTs ||
								parseInt(pingTs) - parseInt(startTs) > (gameTime*1000)){
							res.send(500);
						} else {
							next();
						}
					});
				})
			} else {
				next();
			}
		} else {
			next();
		}
	})

}

// the final rank post
app.post("/rank", validateRank, function(req, res){	
	var data = base32.decode(req.body['data']);
	var arr = data.split("+");

	res.send(
		insertPlayerInfo(arr[1], arr[2], arr[3])
	);
})


client.on("error", function(err){
	console.log("Error: " + err);
})

client.setnx('game.id', 0);

app.get('/rank/:gameTime', function(req, res){
	var before,
			after,
			gameTime = parseFloat(req.params['gameTime']),
			retObj = {rank: []}, 
			rank = 1, 
			multi = client.multi();

	// getting the top 5
	client.zrangebyscore(['s', '-inf', '+inf', 'WITHSCORES', 'LIMIT', 0, 5], function(err, response){		
		for(var i=0; i<response.length; i+=2){
			multi.hget(response[i], 'name');			
		}		

		// now the names...
		multi.exec(function(err, replies){
			for(var i=0, j=0; i<response.length; i+=2, j++){				
				response[i] = replies[j];
				retObj.rank.push({rank: rank, name: replies[j], gameTime: response[i+1]})
				rank++;
			}
			// top 5 done
			// getting before and after players...
			client.zrangebyscore(['s', gameTime, '+inf', 'WITHSCORES', 'LIMIT', 0, 1], function(err, response){
				client.zrank(['s', response[0]], function(err, rank){
					client.hget([response[0], 'name'], function(err, name){				
						
						if(name)
							retObj['after'] = {name: name, gameTime: response[1], rank: rank+1};

						client.zrevrangebyscore(['s', '('+gameTime, '-inf', 'WITHSCORES', 'LIMIT', 0, 1], function(err, response){
							client.zrank(['s', response[0]], function(err, rank){
								client.hget([response[0], 'name'], function(err, name){
									
									if(name)
										retObj['before']  = {name: name, gameTime: response[1], rank: rank+1};

									res.send(retObj);

								});		
							});
						});	

					});
				});
			});
		});
	});
})

function insertPlayerInfo(gameId, name, gameTime){ 
	client.zadd(['s', gameTime, gameId], function(err, response){
		client.hmset(gameId, {name: name}, function(err, response){
			return {};				
		});			
	});
}

module.exports = app.listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});