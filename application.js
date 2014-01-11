$(document).ready(function(){

	var dw = $(document).width()
	var dh = $(document).height()

	var shots = 0, ishots = 0;
	var game = 0;
	var txtmoving = 1;
	var speed = 350; //text - ms 
	var hspeed = Math.round(dw/81); //px
	var vSpeed = Math.round(dh/15); //px
	var aspeed = 1;
	var txt = $('#text').text();
	var vmargin = 150;
	var soundEmbed = null;
	var musicEmbed = null;
	var reloading = false;
	var visible = [];
	var ishotsint;
	var lifes = 3, score = 0;
	var leftPress = false, rightPress = false;
	var padSpeed = 5; //pixels
	var maxScore;
	var gameStart, gameTime, txtint, gameTimeout, gameServerId;
	var t = {};
	var pinged = false;

	var textPosCache = null;

	var soundshoot = 'sounds/shoot.mp3'
	var soundkilled = 'sounds/invaderkilled.mp3'
	var explosion = 'sounds/explosion.mp3';

	$('.template').each(function(){
		var elm = $(this);
		t[elm.attr('data-template-name')] = elm.removeClass('template');
		elm.remove();
	})

function init(txt) {

	$("body").addClass('fadetoblack');

	txt = txt.split(' ');
	txtSpan = $(txt).map(function(i, c){
		if(c.trim().length == 0) return;
		c = removeTags(c);
		span = "<span id='t"+ i +"' class='invaders'>"+ c +"</span>";
		visible["t"+i] = span;
		return span;
	}).get().join(' ');
	$('#text').html(txtSpan);
	maxScore = txt.length*100; 

	gameStart = new Date();
	
	// starts movement and sound
	gameTimeout = setTimeout(function(){
		$('#text').css("color", "#ddd");
		$('#game-controls').show();
		txtint = setTimeout(movetext,speed);

		// makes the words shot letters
		ishotsint = setTimeout(invaderShoot, (Math.random()*1000)+1000 );
		setTimeout(invaderShoot, (Math.random()*1000)+2000 );
		setTimeout(invaderShoot, (Math.random()*1000)+3000 );

		// pad movement
		setInterval(movePad, 15);
		$("#pad").show();

		// hide instructions
		setTimeout(function(){$('#instructions-container').fadeOut('slow')}, 7500)

		// init the game
		$.post('/init', {
			data: base32.encode(Date.now()+"+"+score)
		}, function(res){
			gameServerId = res.id;
		});		

	}, 500);
}


// ------------------------------------------------ keyboard

$(document).keydown(function(key) {

	if(key.which == 37){
		leftPress = true;
	} else if(key.which == 39){
		rightPress = true;
	}	
	else if(key.which == 32){ //space
		if(!game){ //start the game!
			init(txt);
			game = 1;
		} else if(game == 1) {
			shoot();
		}
	}
});

$(document).keyup(function(key) {
	if(key.which == 37){
		leftPress = false;
	} else if(key.which == 39){
		rightPress = false;
	}	
});
	
// ------------------------------------------------ shoot
function shoot(){
	if(reloading){ 
		return; 
	} else { 
		reloading = true;
		setTimeout(function(){ reloading = false; }, 450)
	}
	soundPlay(soundshoot, 'shoot');
  	
  	$("body").append($("<div id='shot"+shots+"' class='shot'/>"));
  	currShot = $("#shot"+shots);
  	padCenter = $('#pad').offset()['left'] + 26; //$('#pad').width()/2 - 1;
  	padTop = dh - 70; //$('#pad').offset()['top']-$('#pad').height()/2;
  	currShot.css('top', padTop+'px');
  	currShot.css('left', padCenter+'px');

  	$("#shot"+shots).animate({top: '0px'},
			{
			duration: 750,
			easing: 'linear',
		  step: function(now, fx) {
		  	// we killed someone!
		  	if(colliding(fx.elem, $("#text"))){
		  		textPosCache = null;
					$(this).stop();
					$(fx.elem).remove();
					score+=100;
					$("#score").html("&nbsp;"+score);
					soundPlay(soundkilled, 'killed');
					if(score==maxScore){
						victory();
					} else if(score >= maxScore/2 && !pinged){
						pinged = true;
						$.post('/ping', {
							data: base32.encode(Date.now()+"+"+gameServerId+"+"+score)
						})
					}		  	
		  	} 
		  },
		  complete: function(){
		  	$(this).remove();
		  }
		});

	shots++;
  }


// ---------------------------------------- padMovement

function movePad(){
	pad = $('#pad');
	if(leftPress){
		if(pad.offset().left > padSpeed)
			pad.css('left', (pad.offset().left-padSpeed)+'px');
		else
			pad.css('left', '5px');
	} else if(rightPress){
		if(pad.offset().left+pad.width()+padSpeed < dw)
			pad.css('left', (pad.offset().left+padSpeed)+'px');
		else
			pad.css('left', (dw-pad.width()-5)+'px');
	}
}



// ---------------------------------------- positions

function getPositions(box) {
	var $box = $(box);
	var pos = $box.offset();
	var width = $box.width();
	var height = $box.height();
	return [ [ pos.left, pos.left + width ], [ pos.top, pos.top + height ] ];
}

function getVisiblePositions(box) {
	
	if(textPosCache != null){  
		boxPosition = getPositions(box);
		return [ 	[ boxPosition[0][0]+textPosCache.d1x, boxPosition[0][0]+textPosCache.d2x ], 
					[ boxPosition[1][0], boxPosition[1][0]+textPosCache.dy ] ];		
	}

	var $box = $(box);
	var pos = $box.offset();

	var maxwidth = 0, minwidth = 999, maxheight = 0;

	$(box).children("span:not(.invisible)").each(function(){
		c = $(this); 
		if(c.offset().left + c.width() > maxwidth)
			maxwidth = c.offset().left+c.width();
		
		if(c.offset().left < minwidth){
			minwidth = c.offset().left;
		}


		if(c.offset().top + c.height() > maxheight)
			maxheight = c.offset().top + c.height();
	});
	maxwidth = Math.round(maxwidth);
	minwidth = Math.round(minwidth);
	maxheight = Math.round(maxheight);

	textPosCache = {
		d1x: minwidth - pos.left,
		d2x: maxwidth - pos.left,
		dy: maxheight - pos.top
	}

	return [ [ minwidth, maxwidth ], [ pos.top, maxheight ] ];
}

function colliding(shot, text){
	pe1 = getPositions(shot);
	pe2 = getPositions(text);
	collided = false;

	if(pe1[1][0] <= pe2[1][1] && pe2[0][0] < pe1[0][1] && pe2[0][1] > pe1[0][0] && pe1[1][1] >= pe2[1][0]){
		$('#text span').each(function(){
			if(!$(this).hasClass('invisible')){
				pspan = getPositions(this);
				if(pspan[1][1] >= pe1[1][0] && pspan[0][0] < pe1[0][1] && pspan[0][1] > pe1[0][0]){
					$(this).addClass('invisible');
					delete visible[$(this).attr("id")];
					collided = true;
					return false;
				}
			}
		});
		return collided;
	}

}

function movetext(){ 
	txt = $('#text');
	txtpos = getVisiblePositions(txt);

	if(txtpos[0][1] < dw-hspeed && txtmoving == 1){
		if(txt.offset().left == 0 && txtpos[1][1] < dh-vmargin)
			txt.css('top','+='+vSpeed);

		txt.animate({'left': '+='+hspeed}, aspeed);
	
	} else if(txtmoving == 1){
		txt.animate({'left': (dw-txt.width() + ((txt.offset().left+txt.width()) - txtpos[0][1]))}, aspeed);
		txtmoving = -1;
		if(speed > 150) speed /= 1.25;

	} else if(txtmoving == -1 && txtpos[0][0] > (hspeed)) {
		if(txtpos[0][1]== dw && txtpos[1][1] < dh-vmargin)
			txt.css('top','+='+vSpeed);

		txt.animate({'left': '-='+hspeed}, aspeed);

	} else if(txtmoving == -1) {
		txt.animate({'left': "-"+(txtpos[0][0] - txt.offset().left)}, aspeed);
		txtmoving = 1;
		if(speed > 150) speed /= 1.25;

	}
	txtint = setTimeout(movetext,speed);
}

function removeTags(txt){
	if(txt.indexOf("<h1>") > -1){ 
		return txt.replace(/<(?:.|\n)*>(\w+)/, '<b>$1</b>');
	} else if(txt.indexOf("</h1>") > -1){ 
		return txt.replace(/(\w+)<\/(?:.|\n)*>/, '<b>$1</b>');		
	} else {
		return txt;
	}
}
// ---------------------------------------- invader shots (letters)

function invaderShoot(){
	elm = randomPropertyInObject(visible);

	if(!($(elm).html() && $(elm).html().match(/\w/))) {
		ishotsint = setTimeout(invaderShoot, (Math.random()*1000));
		return;
	};

	elm = $("#"+$(elm).attr("id"));

	shotContent = getRandomLetter(elm);
	$("body").append($("<div id='invaderShot"+ishots+"' class='ishot fadetowhite'>"+shotContent+"</div>"));
  	currShot = $("#invaderShot"+ishots);
  	
  elmpos = getLetterPosition(shotContent, elm);
  currShot.css('top', elmpos[1]+'px');
  currShot.css('left', elmpos[0]+'px');

  currShot.animate({top: (dh-30)+'px'}, {
	duration: 1000,
	easing: 'linear',
  	step: function(now, fx) {
  		pad = $("#pad");
  		s = $(fx.elem);
  		if(s.offset().top >= pad.offset().top && s.offset().left >= pad.offset().left && s.offset().left + s.width() <= pad.offset().left + pad.width()){
			$(this).stop();
			$(this).remove();

			lifes-=1;
			if(lifes == 0){
				gameover();
			} else {
				restart();
			}
		ishotsint = setTimeout(invaderShoot,(Math.random()*1500));
  		} 
  	},
  	complete: function(){
  		$(this).remove();
			ishotsint = setTimeout(invaderShoot,(Math.random()*1500));
  	}
	});

	ishots++;
  }

  function getRandomLetter(elm){
  	tmp = $(elm).html().replace(/<(?:.|\n)*?>/gm, '').split('');
  	do{ letter = tmp[Math.floor(Math.random() * tmp.length)]; } while (!letter.match(/\w/));
  	return letter;
  }

  function getLetterPosition(letter, elm){
  	p = getPositions(elm);
  	elmContent = $(elm).html().replace(/<(?:.|\n)*?>/gm, '');
  	letterPosition = Math.ceil( ((p[0][1]-p[0][0]) * elmContent.indexOf(letter)) / elmContent.length );
  	return [ p[0][0]+letterPosition, p[1][0] ];
  }

// ---------------------------------------- sound - isto nao pode ficar sempre no mesmo elemento!

function soundPlay(which, elm){
	if(!elm) elm = "sfx";
    
    if (!$("#"+elm)) {
    	elm = $('<audio/>', {
    		hidden: true,
    		autoplay: true,
    		id: elm
		});
		$('<source/>', {
    		src: which,
    		type: "audio/mpeg",
		}).appendTo(elm);
    } else {
    	$("#"+elm).remove();
    	elm = $('<audio/>', {
    		hidden: true,
    		autoplay: true,
    		id: elm
		});
		$('<source/>', {
    		src: which,
    		type: "audio/mpeg",
		}).appendTo(elm);
    }

    $("body").append(elm);
}

// ------------------------------------------- game control

function gameover() { 
	soundPlay(explosion, "sfx2");
	$('#pad').hide();
	$("#lifes-container").css("width", "0px");

	$('#instructions-container').css("margin-left", "-150px");
	$('#instructions-container').html("game over, refresh and try again!")
	$('#instructions-container').fadeIn();
}

function restart() { 
	soundPlay(explosion, "sfx2");
	$('#pad').hide();
	$("#lifes-container").css("width", "-=31px");
	setTimeout(function(){
			$("#pad").css("left", "100px");
			$('#pad').show();
	},500);
}

function victory() {
	game = 2;
	//showVideo();
	gameTime = ((new Date()) - gameStart) / 1000;

	// stops the text movement
	clearTimeout(txtint);

	$('#lifes-result').text(lifes);
	$('.time-result').text(gameTime + "s");

	$('#pad').hide();

	displayRank();
}

function displayRank(){
	var formShown = false,
			currRank;

	$.getJSON('/rank/'+gameTime, function(data){	
		$.each(data.rank, function(k, v){
			var elm = t['player'].clone();
			v.gameTime = parseFloat(v.gameTime).toFixed(3) + 's';

			// do we have a place in the top 5?
			if(parseFloat(v.gameTime) >= gameTime && !formShown){
				var newElm = t['new-player'].clone();
				updateBindings({rank: v.rank, gameTime: gameTime+'s'}, newElm);
				$('#final-score table tbody').append(newElm);
				formShown = true;
				currRank = v.rank;
			}

			if(formShown) v.rank++;
			if(v.rank > 5 && formShown) return;
			updateBindings(v, elm);
			$('#final-score table tbody').append(elm);
		})

		// not in the top 5, too bad!
		if(!formShown){
			currRank = (data.after) ? data.after.rank : 
											(data.before) ? data.before.rank + 1 : 1;

			// player before
			if(data.before && data.before.rank >= 5){
				$('#final-score table tbody').append(t['separator-tr']);

				if(data.before.rank > 5){
					var beforeElm = t['player'].clone();
					data.before.gameTime = parseFloat(data.before.gameTime).toFixed(3) + 's';		
					updateBindings(data.before, beforeElm);	
					$('#final-score table tbody').append(beforeElm);	
				}
			}

			// the form
			var newElm = t['new-player'].clone();
			updateBindings({rank: currRank, gameTime: gameTime+'s'}, newElm);
			$('#final-score table tbody').append(newElm);

			// player after (if we're not the last!)
			if(data.after && data.after.rank > 5){
				data.after.rank+=1;	
				data.after.gameTime = parseFloat(data.after.gameTime).toFixed(3) + 's';

				var afterElm = t['player'].clone();
				updateBindings(data.after, afterElm);
			$('#final-score table tbody').append(afterElm);	
			}
		}

		$('#final-score tr.actual input').on('keypress', function(e){
			var elm = $(this);
			if (e.keyCode == 13) { // enter
				if(this.value.length > 30) {
					this.value = this.value.substr(0, 30);
				}

				var str = base32.encode(Date.now()+"+"+gameServerId+"+"+this.value+"+"+gameTime.toFixed(3));
				$.post('/rank', {data: str}, function(res){
					elm.parents('td').text(elm.val());
					elm.remove();
				})
			}
		});

		$('#final-score').css('margin-top', $('#final-score').height()/-2+'px'); 
		$('#final-score').show();
	});			

	$(".fb-share-button").click(function(){
		FB.ui({
		  method: 'feed',
		  name: 'Text Invaders - ruiramos.com',
		  picture: 'http://ruiramos.com/game-shot.png',
		  link: 'http://ruiramos.com',
		  caption: 'Just finished #'+currRank+' at Text Invaders with a time of '+gameTime+' secs!',
		  description: 'Shoot some bullshit text, let that anger flow!'
		}, function(response){});			
	})
} 

// ------------------------------------------- utils

if(!Object.keys) Object.keys = function(o){
   if (o !== Object(o))
      throw new TypeError('Object.keys called on non-object');
   var ret=[],p;
   for(p in o) if(Object.prototype.hasOwnProperty.call(o,p)) ret.push(p);
   return ret;
}

function randomPropertyInObject(object) {
  var keys = Object.keys(object);
  return object[keys[Math.floor(keys.length * Math.random())]];
};

function showVideo() {
  var params = { allowScriptAccess: "always" };
  var atts = { id: "vid" };
  swfobject.embedSWF("http://www.youtube.com/v/3GwjfUFyY6M?controls=0&showinfo=0&enablejsapi=1&playerapiid=ytplayer&version=3", "vid", "100%", "100%", "9", null, null, params, atts);

}

function updateBindings(obj, elm){
	$.each(obj, function(key, props){
		var root = elm.find('[data-bind='+key+']');	
		if (root.length) {
			$.each(props, function(k, v){
				root.find('[data-bind-prop='+k+']').text(v);
			})
		} else {
			elm.find('[data-bind-prop='+key+']').text(props);
		}
	});
}

});

function onYouTubePlayerReady(playerId) {
  player = document.getElementById("vid");
  player.seekTo(34);
}
