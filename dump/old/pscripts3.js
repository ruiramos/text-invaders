
var ycenter = view.size.height / 2;
var xcenter = view.size.width / 2;
var step = 10;
var radius = 40;
var text, circle, rect;

text = new PointText(new Point(xcenter, ycenter));
text.justification = 'center';
text.characterStyle = {
    fontSize: 100,
    fillColor: 'black',
    font: "Arial Black"
};
text.content = 'Rui Ramos';
console.log(text.bounds);


function onMouseMove(event){
    var hit = myHit(text.getBounds(), event.point);
    if (hit){
        console.log(hit.item.name);
    } else {
        console.log("no hit");
    }
}

//circle = new Path.Circle(new Point(xcenter, ycenter-40), radius);
//circle.style.fillColor = "red";
//circle.orientation = 1;

//var g = new Group([tr, circle]);
//g.clipped = true;

function myHit(obj, p){
  if(p.)



}

function onFrame(){

    
}