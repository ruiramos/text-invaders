var ycenter = view.size.height / 2;
var xcenter = view.size.width / 2;
var maxSpeed = 5;
var radius = 40;
var speed = 0;
var text, padSprite;


var pad = createPad();

function createPad(){
    padSprite = new Path.Circle(new Point(xcenter, ycenter-40), radius);
    padSprite.style.fillColor = "red";
    padSprite.orientation = 1;
    var moving = false;
    var lastMove;

    this.moveLeft = function(){
        moving = true;
        lastMove = "left";
        if(speed==0) speed++;
        if(speed<maxSpeed) speed*=1.25;
        //padSprite.position.x-=speed;
    };

    this.moveRight = function(){
        lastMove = "right";
        moving = true;
        if(speed==0) speed++;
        if(speed<maxSpeed) speed*=1.25;
        console.log(speed);
        //padSprite.position.x+=speed;
    };

    this.keyUp = function(){
        moving = false;
    };

    this.inertia = function(){
        if(speed == 1 || moving) return;
        speed/=1.15;
        if(lastMove == "left") padSprite.position.x-=speed;
        else padSprite.position.x+=speed;
        if(speed < 2) speed = 1;
    };

    this.move = function(){ 
      if(lastMove == "right")
        padSprite.position.x += speed;
      else
        padSprite.position.x -= speed;
    }

    return this;
}



function onFrame(){
    pad.move();
    //pad.inertia();
}

function onKeyDown(event) {
    // When a key is pressed, set the content of the text item:
    switch(event.key){
      case 'right': pad.moveRight(); break;
      case 'left': pad.moveLeft(); break;
    }
}

function onKeyUp(event) {
    switch(event.key){
      case 'right': pad.keyUp(); break;
      case 'left': pad.keyUp(); break;
    }
}