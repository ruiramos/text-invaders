
var ycenter = view.size.height / 2;
var xcenter = view.size.width / 2;
var xpad = 10;
var r = 80;
var pad = 35;
var circles = [];
var orientation = 0;

init();

function init(){
  var background = new Path.Rectangle(new Point(0, 0), new Size(view.size.width, view.size.height));
  //background.style.fillColor = new RgbColor(0,0,0);
  
  text = new PointText(new Point(xcenter, ycenter+pad));
  text.justification = 'center';
  text.characterStyle = {
      fontSize: 100,
      fillColor: 'white',
      font: "Arial Black"
  };
  text.content = 'Rui Ramos'; 
  text.opacity = 0.85;
  text.selected = true;
  
  text.clipMask = false;
}


var circleStyle = function() {
  return {
    fillColor: new RgbColor(Math.random(), Math.random(), Math.random()),
  }
};



function onFrame(event) {
   for(var i = 0; i < circles.length; i++){
     circles[i].position.y += Math.random()*circles[i].delta*1.5;
     circles[i].position.x += orientation * (1+Math.random());
     circles[i].opacity -= Math.random()*.05;
     if(circles[i].opacity<0){ 
       circles[i].opacity = 0;
       circles.splice(i,1);
     }
   }
   
   if(event.count % 6 == 0){
     generateMore();
     
   }
}

function generateMore() {
  for(var i = r+pad+Math.random()*r; i + r < view.size.width-pad ; i += r+Math.random()*r){
    y = ycenter + xpad * (Math.random()*2-1);
    circle = new Path.Circle(new Point(i, y), r);
    circle.style = circleStyle();
    circle.opacity = Math.random()*.4+.5;
    do { var d = Math.round(Math.random()*2-1)} while(d == 0)
    circle.delta = d;
    circles.push(circle);
  }
}

function onMouseMove(event){
    orientation = (event.point.x*2/view.size.width)-1;
}
