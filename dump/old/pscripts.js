
var ycenter = view.size.height / 2;
var xcenter = view.size.width / 2;

var speed = 1;
var ammount = 2;
var padding = 50;

var circles = [];

var background = new Path.Rectangle(new Point(0, 0), new Size(view.size.width, view.size.height));
//background.style.fillColor = new RgbColor(0,0,0);

var rectGroup = new Group();
var drawing;

var score = 0;
init();

/* ----------------------------------------------------------- */

function init(){
}

function onFrame(event) {
   if(event.count % 150 == 0){
     morePoints();
     cleanUp();
   }
   if(event.count % 4 == 0){
     toRemove = [];
     for(var i = 0; i < circles.length; i++){
      if(circles[i].opacity == 0 && circles[i].visible){
        toRemove.push(i)
      }else{
        circles[i].move();
      }
     }
   circles = removeFromArray(circles, toRemove);
   
   }
   
}

function morePoints() {
  for(var i = 0; i < ammount; i++){
    circles.push(newCircle());
  }
  
}

var newCircle = function(){
  var radix = 15;
  var x = Math.random()*(view.size.width-padding);
  var y = Math.random()*(view.size.height-padding); 
  var c = new Path.Circle(new Point(x, y), 1);
  c.visible = false;
  c.opacity = 0;
  //c.fillColor = new RgbColor(1,0,0); 
  //c.style = circleStyle();
    
  c.move = function(){ 
    var hit = rectGroup.hitTest(this.position);

    if(hit && hit.item){
    // c.remove();
     //hit.item.remove();
    // this.position += new Point()*(Math.random()*2-1)*5;
    } else {      
      c.appear();
    }
  }
  
  c.appear = function() { 
    if(!c.visible){ 
      c.style = this.circleStyle();
      c.visible = true;
    } 
    if(this.bounds.width < radix*100){ 
      this.scale(1.15+(Math.random()*2-1)/10); 
    } 
    
    if((this.bounds.width > radix * 8 * (Math.random()+1)) && this.bounds.width < radix * 80){ 
      if(this.opacity > 0.08) this.opacity -= 0.07*Math.random();
    } else if (this.bounds.width > radix * 80){
      this.opacity = 0;
      this.remove();
      score++;
      console.log(score);
    } else if(this.opacity < 1 ){
        this.opacity += 0.04*Math.random();
    }
    
  };
  c.circleStyle = function() { return { fillColor: new RgbColor(Math.random(), Math.random(), Math.random()) } };
  return c;
};

function onMouseDown(event) {
  drawing = new Path.Rectangle();
}
function onMouseMove(event) {
  if(drawing){
    drawing = new Path.Rectangle(event.downPoint, event.point);
    drawing.fillColor = "#dddddd";  
    drawing.removeOnMove();
  }
}
function onMouseUp(event) {
    var rect = drawing.clone();
    rect.fillColor = "#000000";
    rectGroup.addChild(rect);
    
    drawing.remove();
    drawing = false;
}

function cleanUp(){
  toRemove = [];
  for(var i = 0; i < circles.length; i++){
     var hit = rectGroup.hitTest(circles[i].position);
     if(hit && hit.item){
       circles[i].remove();
       toRemove.push(i);
     }
  }
  circles = removeFromArray(circles, toRemove);
  rectGroup.removeChildren();
}

function removeFromArray(circles, toRemove){
  for(var j = 0; j < toRemove.length; j++)
    circles.splice(toRemove[j], 1);

    return circles;
}


