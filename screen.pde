int GRIDSIZE = 8;
int FRAMERATE = 10;
int[] new_vertices = {};

color[] colormap = {
	color(178,24,43),
	color(214,96,77),
	color(244,165,130),
	color(253,219,199),
	color(210,210,210),
	color(209,229,240),
	color(146,197,222),
	color(67,147,195),
	color(33,102,172)
};

void getColorMap() {
	String[] colors = new String[colormap.length];
	for(int i=0;i<colormap.length;i++) {
		colors[i] = hex(colormap[i]);
	}
	return colors;
}

boolean creatingPolygon = false;

int computeIndex(value) {
  value += floor(colormap.length/2); // shift to array center...
  while (value < 0) value += colormap.length;
  return value%colormap.length;
}

void setup()
{
  size(CANVASWIDTH, CANVASHEIGHT);
  frameRate(FRAMERATE);
  background(200);
  fill(255);
  PFont fontA = loadFont("courier");
  textFont(fontA, 14);
}

void draw(){
  int i; int j;
  background(210); // clear canvas
  // draw computed trapezoids
  if (show_traps) {
     stroke(1);
  } else {
     noStroke();
  }
  for (i=0;i<traps.length;i+=9) {
	fill(colormap[computeIndex(traps[i+8])]);
	beginShape();
	for (j=i;j<i+8;j+=2) {
	  vertex(traps[j],traps[j+1]);
	}
	endShape(CLOSE);
  }
  // draw the grid
  fill(150,150,150,120);
  rectMode(RADIUS);
  noStroke();
  for (i=0;i<CANVASWIDTH;i+=GRIDSIZE) {
    for (j=0;j<CANVASHEIGHT;j+=GRIDSIZE) {
      rect(i,j,1,1);
    }
  }
  // draw new polygon, if exists
  noStroke();
  if (active_command == 'add') {
	if (new_vertices.length > 0) { // for drawing polygon
	  // draw new polygon
	  fill(0, 126, 255, 102);
	  beginShape();
	  for (i=0;i<new_vertices.length;i+=2) {
	    vertex(new_vertices[i],new_vertices[i+1]);
	  }
	  endShape(CLOSE);
	  // draw new polygon vertices
	  stroke(1);
	  fill(255);
	  for (i=0;i<new_vertices.length;i+=2) {
		ellipse(new_vertices[i],new_vertices[i+1],10,10);
	  }
	}
  }
  // draw a dot on the grid point nearest to mouse cursor
  stroke(1);
  if (active_command == 'add') {
	fill(255);
    ellipse(snapToGrid(mouseX),snapToGrid(mouseY),10,10); // a white dot on grid by mouse position
  }
  // draw sectors!
  if (active_command == 'info') {
	drawSectorsNearby(snapToGrid(mouseX),snapToGrid(mouseY));
  }
}

void drawSectorsNearby(gridX1,gridY1) {
  int i;
  int cont = 0;
  for (i=0;i<sectorlist.sectors.length;i+=1) {
	if (sectorlist.sectors[i].x == gridX1 && sectorlist.sectors[i].y == gridY1) {
	  stroke(120);
	  noFill();
	  int gridX2 = gridX1+sectorlist.sectors[i].theta[0]*128;
	  int gridY2 = gridY1+sectorlist.sectors[i].theta[1]*128;
	  int gridX3 = gridX1+CANVASWIDTH;
	  int gridY3 = gridY1;
	  beginShape();
	  vertex(gridX1,gridY1);
	  vertex(gridX2,gridY2);
	  vertex(CANVASWIDTH,CANVASHEIGHT);
	  if (sectorlist.sectors[i].theta[1] < 0) vertex(0,CANVASHEIGHT);
	  vertex(gridX3,gridY3);
	  endShape(CLOSE);
	  stroke(0);
	  float theta = atan2(sectorlist.sectors[i].theta[1],sectorlist.sectors[i].theta[0]);
	  arc(gridX1,gridY1,50+30*cont,50+30*cont,0,theta);
	  textSize(20);
	  if (sectorlist.sectors[i].w > 0) {
	    fill(255,0,0);
	  } else {
		fill(255);
	  }
	  pushMatrix();
	  translate(gridX1,gridY1);
	  rotate(theta/2);
	  translate(80+20*cont,0);
	  rotate(-theta/2);
	  text(sectorlist.sectors[i].w,0,0);
	  popMatrix();
	  cont++;
    }
  }
}

void mouseMoved() {
	updateMousePosition(snapToGrid(mouseX),snapToGrid(mouseY));
}

void mouseClicked() {
  if (active_command == 'add') {
    addCommandClick();
  } else if (active_command == 'info') {
    // to be implemented
  }
}

int snapToGrid(int coord) {
  return floor(coord/GRIDSIZE)*GRIDSIZE;
}

void addCommandClick() {
  if (mouseButton == LEFT) { // add a new vertex
    if (!creatingPolygon) { // it is the first vertex?
      creatingPolygon = true;
    }
    new_vertices = expand(new_vertices,new_vertices.length+2);
    new_vertices[new_vertices.length-2] = snapToGrid(mouseX);
    new_vertices[new_vertices.length-1] = snapToGrid(mouseY);
  } else if (mouseButton == RIGHT && creatingPolygon) { // finish the polygon!
    if (new_vertices.length < 4) { // invalid polygon
      setHint(INVALIDPOLYMSG);
      return ;
    }
    creatingPolygon = false;
    new_vertices = expand(new_vertices,new_vertices.length+4);
    new_vertices[new_vertices.length-4] = snapToGrid(mouseX);
    new_vertices[new_vertices.length-3] = snapToGrid(mouseY);
	new_vertices[new_vertices.length-2] = new_vertices[0]; // to close the circulation
    new_vertices[new_vertices.length-1] = new_vertices[1];
	println(new_vertices);
	convertVertexCirculationToSectorList(new_vertices);
	new_vertices = new int[0];
  }
}

void clearCanvas() {
  new_vertices = new int[0];
}