const CANVASWIDTH = 800;
const CANVASHEIGHT = 400;

var union_transf = function(x) {
	if (x == 0) return 0;
	return 1;
}

var inter_trasnf = function(x) {
	if (x > 1) return x;
	return 0;
}

var symdifference_transf = function(x) {
	if (x == 1) return 1;
	return 0;
}

var modulo_transf = function(x) {
	if (x < 0) return -x;
	return x;
}

var symdifference = function () {
	printlog('Creating a new sector list by a <i>Scalar Transformation</i> with the symmetric difference operation.');
	var new_sl = sectorlist.scalarTransformation(symdifference_transf);
	printlog(' Done!',true,true);
	//println('original sl: ',sectorlist);
	//println('transf sl: ',new_sl);
	sectorlist = new_sl;
	computeTrapezoids();
}

var union = function() {
	printlog('Creating a new sector list by a <i>Scalar Transformation</i> with the union operation.');
	var new_sl = sectorlist.scalarTransformation(union_transf);
	printlog(' Done!',true,true);
	//println('original sl: ',sectorlist);
	//println('transf sl: ',new_sl);
	sectorlist = new_sl;
	computeTrapezoids();
}

var intersection = function() {
	printlog('Creating a new sector list by a <i>Scalar Transformation</i> with the intersection operation.');
	var new_sl = sectorlist.scalarTransformation(inter_trasnf);
	printlog(' Done!',true,true);
	//println('original sl: ',sectorlist);
	//println('transf sl: ',new_sl);
	sectorlist = new_sl;
	computeTrapezoids();
}

var convertVertexCirculationToSectorList = function(vertices,computetraps = true) {
	printlog('<i>Convert from</i> new polygon to a new sector list.');
	var newsl = SectorList.convertFrom(vertices,1);
	printlog(' Done!',true,true);
	if (prevents_selfinter) {
		printlog('Self-intersection mode safe active. Applying a <i>scalar transformation</i> with modulus operator.');
		newsl = newsl.scalarTransformation(modulo_transf);
		printlog(' Done!',true,true);
	}
	printlog('Operation <i>Add</i> to merge the new sector list to previous one.');
	sectorlist = sectorlist.add(newsl);
	printlog(' Done!',true,true);
	//println(JSON.stringify(sectorlist));
	if (computetraps) computeTrapezoids();
}

var traps = new Array(); // global variable to store trapezoids computed by the draw method
var computeTrapezoids = function() {
	 printlog('Computing the <i>Draw</i> operation to display the new sector list.');
	 traps = sectorlist.draw();
	 printlog(' Done!',true,true);
	 printlog('---END OF PROCESSING----',true);
	 //println('traps: ',traps);
}

var prevents_selfinter = false;
var changeSelfInter = function() {
	var elem = document.getElementById('btnselfinter');
	var classes = elem.className.split(' ');
	var newclasses = '';
	for (var i=0;i<classes.length-1;i++) newclasses += ' ' + classes[i];
	prevents_selfinter = !prevents_selfinter;
	if (prevents_selfinter) {
		newclasses += ' selfinteron';
	} else {
		newclasses += ' selfinteroff';
	}
	elem.className = newclasses;
}

var show_traps = false;
var changeTrapsShow = function() {
	var elem = document.getElementById('btntrap');
	var classes = elem.className.split(' ');
	var newclasses = '';
	for (var i=0;i<classes.length-1;i++) newclasses += ' ' + classes[i];
	show_traps = !show_traps;
	if (show_traps) {
		newclasses += ' trapson';
	} else {
		newclasses += ' trapsoff';
	}
	elem.className = newclasses;
}

var computeMaxLevels = function(size) {
	var result = Math.floor(Math.log2(Math.sqrt(size)));
	return result < 3 ? 3 : result;
}

var _println = function(args) {
	var msg = '';
	for (var i=0;i<args.length;i++) {
		if (i !== 0) msg += ' ';
		if (typeof args[i] !== 'object') {
			msg += ' ' + args[i];
		} else {
			msg += ' ' + JSON.stringify(args[i]);
		}
	}
	processingInstance.println(msg);
}

var println = function() {
	//return ;
	//if (x_curr != 424 || !eqCoord(189.8181818,y_curr)) return ;
	setTimeout(_println(arguments),2);
}

var _printlog = function(msg,newline,time) {
	var log = document.getElementById('log-content');
	log.innerHTML = log.innerHTML+msg+(time === false ? '' : ( ' (in ' + time.toFixed(2) + ' miliseconds)')) + (newline ? '<br>' : '');
	log.scrollTop = log.scrollHeight;
	lasttime = performance.now();
}

var lasttime;
var printlog = function(msg,newline=false,time=false) {
	setTimeout(_printlog(msg,newline,(time ? performance.now()-lasttime : false)),1);
	lasttime = performance.now();
}

var loadPreset = function(num) {
	var data;
	if (num == 1) {
		data = [[72,96,120,160,128,120,192,64,216,72,224,80,248,88,280,80,320,56,336,40,368,40,400,56,432,56,448,64,448,88,448,88,416,120,408,144,416,184,504,192,520,192,544,160,568,136,600,128,624,136,632,152,608,184,608,216,584,240,560,272,560,304,600,336,640,336,664,320,688,304,720,336,704,360,672,368,640,376,592,384,552,384,520,368,504,344,496,312,480,296,448,304,416,328,376,344,344,352,288,352,264,328,304,312,320,296,328,272,328,240,336,224,296,208,272,224,248,256,232,272,192,296,152,312,120,280,160,256,104,280,80,248,120,232,144,224,160,216,144,200,128,192,96,200,72,208,48,160,72,96],[240,112,240,144,264,168,288,160,304,144,280,112,240,112],[440,216,400,216,368,200,368,232,360,264,352,280,376,296,416,280,440,264,464,264,464,232,440,216],[256,16,696,16,696,168,256,168,256,16,256,16],[408,232,520,232,520,280,408,280,408,232],[32,96,304,96,304,336,32,336,32,96]];
	} else if (num == 2) {
		//data = [[664,32,776,72,728,144,608,144,536,96,528,160,584,208,640,232,688,256,688,296,656,312,600,336,544,344,480,328,448,280,464,224,520,248,512,192,480,160,480,128,496,88,536,56,504,24,456,48,432,88,408,168,376,200,344,152,344,96,376,48,416,24,480,8,608,8,664,32],[384,104,360,120,360,136,376,160,392,160,400,128,384,104],[472,88,448,96,416,112,384,128,376,136,400,152,416,160,440,160,472,152,496,168,520,176,528,200,536,216,536,232,520,248,488,248,456,256,432,264,432,296,456,312,472,312,496,312,528,312,568,312,600,296,632,280,648,264,664,240,696,240,712,256,720,256,728,240,736,224,728,192,696,184,672,160,664,120,632,144,608,168,584,176,568,160,560,136,560,104,520,88,472,88]];
		//data = [[376,72,304,168,496,200,376,72],[480,80,408,104,416,152,488,152,432,208,568,216,480,80]];
		data = [[96,48,280,48,280,104,96,104,96,48],[96,104,96,184,144,184,144,104,96,104],[96,184,272,184,272,232,96,232,96,184],[232,184,280,184,280,296,232,296,232,184],[96,296,96,344,280,344,280,296,96,296],[352,48,408,48,408,344,344,344,344,48],[344,296,528,296,528,344,344,344,344,296],[528,136,568,88,616,88,656,136,624,184,568,184,528,136],[576,104,592,104,592,136,576,136,576,104],[600,160,600,272,704,272,704,160,600,160],[752,320,656,224,656,320,752,320],[680,96,704,72,728,96,752,72,776,96,752,120,776,144,752,168,728,144,704,168,680,144,680,96],[736,112,704,112,704,128,736,128,736,112],[576,248,624,248,600,344,576,248],[688,176,656,176,656,208,688,208,688,176],[680,184,664,184,664,200,680,200,680,184],[568,112,600,112,600,128,568,128,568,112],[360,72,392,72,392,328,360,328,360,72],[360,312,504,312,504,328,360,328,360,312],[120,312,120,328,256,328,256,312,120,312],[112,136,120,152,128,136,120,120,112,136],[120,72,152,56,184,72,216,56,240,72,256,80,256,88,240,96,216,80,184,96,152,80,120,96,120,72],[112,200,112,176,128,176,128,200,112,200]];
	} else if (num == 3) {
		data = [[32,384,40,16,784,64,104,104,776,136,104,184,776,208,104,272,776,288,96,328,768,376,32,384],[704,392,112,392,192,8,224,368,248,8,264,368,296,8,304,336,368,8,376,368,424,8,424,368,496,8,496,368,720,8,536,368,752,80,608,352,728,232,728,232,704,392],[80,40,560,64,80,80,80,144,544,136,88,160,88,224,640,208,88,248,88,296,520,288,88,312,72,344,472,368,48,376,56,40,80,40]];
	} else if (num == 4) {
		data = [[232,136,264,136,296,152,328,136,360,120,400,128,424,152,448,160,480,144,536,144,560,184,512,200,504,216,552,240,560,272,512,296,448,296,448,296,440,264,400,256,376,288,368,336,328,344,304,328,312,328,304,280,280,264,248,272,192,264,168,296,128,256,144,224,200,200,176,168,184,136,232,136],[472,72,512,40,584,24,648,48,640,96,616,104,672,128,736,176,704,192,664,208,664,240,704,264,736,296,720,344,648,384,592,384,520,360,472,336,456,304,480,280,512,264,536,256,568,248,568,216,528,208,488,208,464,200,472,168,488,160,496,136,472,112,432,136,424,160,400,176,376,152,360,120,384,96,440,88,472,72],[248,40,432,176,496,184,496,288,112,288,112,40,248,40],[256,184,312,184,312,232,256,232,256,184],[288,200,400,200,400,216,288,216,288,200]];
	} else {
		data = [[176,152,240,120,304,160,360,184,368,184,416,136,456,104,456,104,512,88,552,120,568,160,600,160,632,184,576,240,536,264,576,304,584,312,592,360,512,384,392,368,344,320,264,328,224,368,160,368,104,312,136,272,112,232,112,184,176,152],[496,152,472,176,456,192,408,216,392,216,360,224,272,200,240,200,208,216,184,232,208,272,232,280,272,288,320,288,376,304,408,320,472,336,496,312,472,280,488,248,520,216,528,184,496,152],[48,120,112,56,192,40,256,56,304,88,320,120,328,152,320,200,288,232,240,232,240,224,200,208,200,184,184,176,168,200,168,232,208,248,248,256,280,264,272,280,240,304,208,312,200,312,176,304,144,320,96,352,64,320,48,296,80,224,48,176,48,120],[400,264,336,248,280,192,296,112,376,64,456,48,456,48,512,56,560,80,624,80,720,56,720,184,648,240,560,216,456,256,400,264],[432,280,472,208,560,192,656,208,688,304,528,328,432,280],[176,80,112,112,144,136,192,104,176,80],[392,72,360,96,368,120,344,128,360,152,424,104,392,72],[600,104,592,176,688,144,600,104]];
	}
	clearAll();
	for (var i=0;i<data.length;i++) convertVertexCirculationToSectorList(data[i],false);
	computeTrapezoids();
}

var clearAll = function() {
  sectorlist = new SectorList();
  traps = new Array();
  processingInstance.clearCanvas();
}

var assert = function (condition, message) {
	return ;
    if (!condition) {
        message = message || "Assertion failed";
        if (typeof Error !== "undefined") {
            throw new Error(message);
        }
        throw message; // Fallback
    }
}