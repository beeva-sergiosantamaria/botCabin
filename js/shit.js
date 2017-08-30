$(document).ready(function() {
    console.log( "ready!" );
    init();
});

function init() {

  var w = window.innerWidth;
  var h = window.innerHeight;

  this.side = h / 25;

  this.matrix = Array(25).fill(Array(45).fill(0));

  var elem = document.getElementById('container');
  var params = { width: w, height: h };
  this.two = new Two(params).appendTo(elem);

  this.startX = 5 * w/45, this.startY = 5 * h/25;

  painHexagons(5,3, {x: Math.floor((Math.random() * 45))* this.side,y:Math.floor((Math.random() * 25))* this.side});

  two.update();

  /*hexagon._renderer.elem.addEventListener('click', function(){
    alert('click');
  }, false);*/
}

var hexModifiers = [
  [0, 0],
  [-1.5, -0.85],
  [0, -1.7],
  [1.5, -0.85],
  [-1.5, 0.85],
  [0, 1.7],
  [1.5, 0.85],
];

var hexGrowKeys = [
  [0,1,2,3,4,5,6],
  [1,2,4],
  [2,3],
  [3,6],
  [4,5],
  [5,6],
  [6]
];

function painHexagons(hexagons, filled, center) {
  console.log(center);
  var pivot = 0;
  while(hexagons > 0) {
    for(var i = 0; hexagons > 0 && i < hexGrowKeys[pivot].length; i++, hexagons--) {
      var expandIndex = hexGrowKeys[pivot][i];
      var x = center.x + hexModifiers[expandIndex][0] * this.side;
      var y = center.y + hexModifiers[expandIndex][1] * this.side;
      console.log(x,y,[Math.round(x/this.side),Math.round(y/this.side)]);
      this.matrix[Math.round(x/this.side)][Math.round(y/this.side)] = 1;
      var hexagon = two.makePolygon(this.startX + x, this.startY + y, this.side, 6);
      if(filled-- > 0)
        hexagon.fill = 'orange';
      else hexagon.fill = 'yellow';
      hexagon.stroke = 'black';
      hexagon.linewidth = 3;
    }
    pivot += 1;
    if(hexagons <= 0)
      return;
    center.x = center.x + hexModifiers[pivot][0] * this.side - hexModifiers[pivot-1][0] * this.side;
    center.y = center.y + hexModifiers[pivot][1] * this.side - hexModifiers[pivot-1][1] * this.side;
  }
}

function findCenter(hexagons){
  var radio = findRadio(hexagons);
  var stop = false;
  var x = radio,y = radio;
  while(!stop){
    var ocuppied = false;
    for(var i = x - Math.round(radio/2); i < x + Math.round(radio/2);i++)
      for(var j = y - Math.round(radio/2); j < y + Math.round(radio/2);j++){
        if(j >= 45 || i >= 25 || this.matrix[i][j] == 1)
          ocuppied = true;

      }
    if(ocuppied) {
      x = Math.floor((Math.random() * 45));
      y = Math.floor((Math.random() * 25));
    }
    else return {'x': x, 'y': y};
  }
}

function findRadio(hexagons){
  if(hexagons <= 1)
    return 1;
  else if(hexagons <= 7)
    return 3;
  else if(hexagons <= 19)
    return 5;
}

function paintEmptyHexagon(x, y){
  var hexagon = two.makePolygon(x, y, this.side, 6);
  hexagon.fill = 'transparent';
  hexagon.stroke = 'black';
  hexagon.linewidth = 3;

}

/////------------------------------------------





function painHexagons(hexagons, filled, center) {
  hexagons += 5;
  var hexModifiers = [
    [0, 0],
    [-1.5, -0.85],
    [0, -1.7],
    [1.5, -0.85],
    [-1.5, 0.85],
    [0, 1.7],
    [1.5, 0.85],
  ];

  var hexGrowKeys = [
    [0,1,2,3,4,5,6],
    [1,2,4],
    [2,3],
    [3,6],
    [4,5],
    [5,6],
    [6]
  ];

  var pivot = 0;
  while(hexagons > 0) {
    for(var i = 0; hexagons > 0 && i < hexGrowKeys[pivot].length; i++, hexagons--) {
      var expandIndex = hexGrowKeys[pivot][i];
      var x = (5 + center.x) * this.hexSide + hexModifiers[expandIndex][0] * this.hexSide;
      var y = (5 + center.y) * this.hexSide + hexModifiers[expandIndex][1] * this.hexSide;
      var hexagon = two.makePolygon(x, y, this.hexSide, 6);
      if(filled-- > 0)
        hexagon.fill = 'orange';
      else hexagon.fill = 'yellow';
      hexagon.stroke = 'black';
      hexagon.linewidth = 3;
      this.two.update();
    }
  }
}

function getBoards() {
  var self = this;
  Trello.get('/boards/IpBUdjIP/lists', {cards: 'all', actions: 'all', checklists: 'all'},
  function(lists){
    console.log(lists);
    var center = {x: 5, y: Math.round(self.height / (2 * self.hexSide))};
    lists.forEach(function(item){
      painHexagons(item.cards.length, 5, center);
      console.log(item.name);
      center.x = center.x + Math.round(self.width / (8 * self.hexSide));
    });
  }, function(err){
    console.error(err);
  });

}
