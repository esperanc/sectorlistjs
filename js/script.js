const CREATINGMSG = 'Left clicks add vertices to new polygon. Right click finishes the geometry.';
const INFOMSG = 'Move your mouse pointer over polygon vertices to inspect its sector representation.';
const INVALIDPOLYMSG = "Polygon can't have less than three vertices.";
const DISSOLVEMSG = 'Dissolve all polygons in one.';
const INTERMSG = 'Compute polygon intersections.';
const SYMDIFMSG = 'Symmetrical difference calculation.';
const SELFINTERMSG = 'Automatically corrects self-intersection (on/off).';
const PRESET1MSG = 'Load polygons from preset 1.';
const PRESET2MSG = 'Load polygons from preset 2.';
const PRESET3MSG = 'Load polygons from preset 3.';
const PRESET4MSG = 'Load polygons from preset 4.';
const PRESET5MSG = 'Load polygons from preset 5.';

var sectorlist = new SectorList(); // the sector list!

var processingInstance; // to get the processing instance to call its functions from JS
var init = function() {
	hintToActiveCommand();
	processingInstance = Processing.getInstanceById('canvas');
	buildLegend();
}

var buildLegend = function() {
	var colors = processingInstance.getColorMap();
	var legend = document.getElementById('legend');
	var code = 'Legend:';
	for (var i=0;i<colors.length;i++) {
		code += '<div class="legend-item" style="background-color:#' +colors[i].slice(2)+ '"></div>' + (i-Math.floor(colors.length/2));
	}
	legend.innerHTML = code;
};

var showHint =  function(type) {
  var msg = '';
  if (type == 'add') {
    msg = 'Create a new polygon using a sector list';
  } else if (type == 'info') {
    msg = 'Inspect sectors that structures a polygon';
  } else if (type == 'clear') {
    msg = 'Clear the canvas';
  } else if (type == 'creating') {
    msg = CREATINGMSG;
  } else if (type == 'union') {
	msg = DISSOLVEMSG;
  } else if (type == 'inter') {
	msg = INTERMSG;
  } else if (type == 'symdif') {
	msg = SYMDIFMSG;
  } else if (type == 'selfinter') {
	msg = SELFINTERMSG;
  } else if (type == 'preset1') {
	msg = PRESET1MSG;
  } else if (type == 'preset2') {
	msg = PRESET2MSG;
  } else if (type == 'preset3') {
	msg = PRESET3MSG;
  } else if (type == 'preset4') {
	msg = PRESET4MSG;
  } else if (type == 'preset5') {
	msg = PRESET5MSG;
  } else {
    return ; // type invalid; nothing to do
  }
  document.getElementById('msg').innerHTML = 'Hint: '+msg;
};

var hintToActiveCommand = function() {
  var msg = '';
  if (active_command == 'add') {
    msg = CREATINGMSG;
  } else if (active_command == 'info') {
	msg = INFOMSG;
  }
  document.getElementById('msg').innerHTML = msg; // recover the last message
};

var changeActiveCommand = function(newcmd) {
  var btns = document.getElementsByClassName('btn');
  for (var i=0;i<btns.length;i++) {
    btns[i].className = btns[i].className.replace(' btnselect','');
  }
  var btn;
  if (newcmd == 'add') {
    btn = document.getElementById('btnadd');
    showHint('creating');
  } else if (newcmd == 'info') {
    btn = document.getElementById('btninfo');
  } else {
    return ; // invalid newcmd; nothing to do
  }
  btn.className += ' btnselect';
  active_command = newcmd;
};

var setHint = function(newmsg) {
  document.getElementById('msg').innerHTML = newmsg;
}

var updateMousePosition = function (x,y) {
	document.getElementById('mouse-position').innerHTML = 'Pos: ' + x.toString() + ',' + y.toString();
}
