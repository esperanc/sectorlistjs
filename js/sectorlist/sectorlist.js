var curr_op;
const DRAW = 100;
const SCALARTRANSF = 101;

class Sector {
  constructor(x,y,theta,w) {
    this.x = x;
    this.y = y;
    this.theta = theta;
    this.w = w;
  }
  clone() {
    return new Sector(this.x,this.y,this.theta,this.w);
  }
  compare(other) { // compare two sector by the scan order rule
	if (lsCoord(this.y,other.y)) return LESS;
    if (gtCoord(this.y,other.y)) return GREATER;
    if (lsCoord(this.x,other.x)) return LESS;
    if (gtCoord(this.x,other.x)) return GREATER;
    return compareTheta(other.theta,this.theta);
  }
  static compare_static(a,b) {
    return a.compare(b);
  }
  equal(other) {
    //return (this.x == other.x && this.y == other.y && compareTheta(this.theta,other.theta) == EQUAL);
    return (eqCoord(this.x,other.x) && eqCoord(this.y,other.y) && compareTheta(this.theta,other.theta) == EQUAL);
  }
};

class SectorList {
  constructor() {
    this.sectors = new Array();
  }

  canonicalForm() {
    var newSL = new SectorList();
    if (this.sectors.length == 0) return newSL; //nothing to do
    var sector = this.sectors[0].clone();
    for (var i=1;i<this.sectors.length;i++){
      if (sector.equal(this.sectors[i])) {
        sector.w += this.sectors[i].w;
      } else {
        if (sector.w != 0) newSL.sectors.push(sector);
		sector = this.sectors[i].clone();
      }
    }
	if (sector.w != 0) newSL.sectors.push(sector);
    return newSL;
  }

  sortSectors() {
    this.sectors.sort(Sector.compare_static);
  }

  scalarMultiplication(c) {
    for (var i=0;i<this.sectors.length;i++) {
      this.sectors[i].w *= c;
    }
  }

  add(other) { // merge
    var ncSL = new SectorList(); // a SL in non-canonical form
    var index_this = 0; var index_other = 0;
    while (index_this < this.sectors.length && index_other < other.sectors.length) {
      if (this.sectors[index_this].compare(other.sectors[index_other]) == LESS) {
        ncSL.sectors.push(this.sectors[index_this]);
        index_this++;
      } else {
        ncSL.sectors.push(other.sectors[index_other]);
        index_other++;
      }
    }
    while (index_this < this.sectors.length) {
      ncSL.sectors.push(this.sectors[index_this]);
      index_this++;
    }
    while (index_other < other.sectors.length) {
      ncSL.sectors.push(other.sectors[index_other]);
      index_other++;
    }
    var newSL = ncSL.canonicalForm(); // computing the SL in the canonical form
    return newSL;
  }

  // Convert a vertex circulation in SL given a weight w.
  // The resulting SL mapped the region inside vertex circulation to +w.
  // This algorithm assumes that the vertex circulation is
  // counter-clockwised. Otherwise, the region is mapped to -w.
  static convertFrom(vertex_circulation,w) {
    var ncSL = new SectorList(); // a unsorted SL in non-canonical form
    for(var i=0;i<vertex_circulation.length-2;i+=2) {
      var p = [vertex_circulation[i],vertex_circulation[i+1]];
      var q = [vertex_circulation[i+2],vertex_circulation[i+3]];
      if (eqPoint(p,q)) continue; // zero lenght segment!
      let theta = computeTheta(p[0],p[1],q[0],q[1]);
      ncSL.sectors.push(new Sector(p[0],p[1],theta,-w));
      ncSL.sectors.push(new Sector(q[0],q[1],theta,w));
    }
    ncSL.sortSectors(); // sorting the sectors in SL using the scan order
    var newSL = ncSL.canonicalForm(); // also put it in canonical form
    return newSL;
  }
  
  scalarTransformation(f) {
	  curr_op = SCALARTRANSF;
	  //println('<br><b>Scalar Transformation!</b>');
	  var scanln = new Scanline(this,[0,0,CANVASWIDTH,CANVASHEIGHT]);
	  var t_sl = new SectorList();
	  var t_scanln = new Scanline(t_sl,[0,0,CANVASWIDTH,CANVASHEIGHT]);
	  while (!scanln.endOfEvents()) {
		scanln.scan(PREPARE);
		if (scanln.thereIsInterEvent()) {
			//println('Reording transf_scanln at ',x_curr,',',y_curr);
			t_scanln.reinsertInActiveRays(new Ray(x_curr,y_curr,[0,1],null)); // to reorder the scanline, when necessary
			//println('After reorder...<br>',transf_scanln.active_rays.toString());
		}
		scanln.scan(FORWARD);
		let result = scanln.getRays();
		let rays = result.rays;
		//println('Result rays: ',rays);
		let scalar_values = result.scalar_values;
		let t_result = t_scanln.getRays();
		//println('Transf. result rays: ',t_result);
		let t_rays = t_result.rays;
		let t_scalar_value = t_result.scalar_values[0];
		let j = 0; let i = 0;
		let curr_theta;
		while (i<rays.length-1 && j<t_rays.length-1) { //remember: sentinel rays on left and right
			let res = rays[i+1].compare_rays(t_rays[j+1]);
			//println('Testing rays ',rays[i+1],' and ',t_rays[j+1]);
			//println('Result: ',res);
			if (res == LESS || res == EQUAL) {
				i++;
				curr_theta = rays[i].theta;
			}
			if (res == GREATER || res == EQUAL) {
				j++;
				t_scalar_value += t_rays[j].ds;
				curr_theta = t_rays[j].theta;
			}
			//println('i,j = ',i,',',j);
			//println('Test with scalar value = ',scalar_values[i],' f(scalar values) = ',f(scalar_values[i]),', but with t_scalar_value = ',t_scalar_value);
			if (t_scalar_value != f(scalar_values[i])) {
				let ds = f(scalar_values[i])-t_scalar_value;
				let new_sector = new Sector(x_curr,y_curr,curr_theta,ds);
				//println('>>>>> creating a sector: ',new_sector);
				t_sl.sectors.push(new_sector);
				t_scanln.insertInActiveRays(new Ray(x_curr,y_curr,curr_theta,ds));
				t_scalar_value += ds;
			}
		}
		
		/*for (let i=1;i<rays.length-1;i++) {
			while (scanln.compare_ray_inters(rays[i],transf_rays[j]) == LESS || (j < transf_rays.lenght-2 && scanln.compare_ray_thetas(rays[i],transf_rays[j+1]) == LESS)) {
				j++;
				transf_scalar_value += transf_rays[j].ds;
			}
			println('Test ',rays[i],' with scalar value = ',scalar_values[i],' f(scalar values) = ',f(scalar_values[i]),', but with transf_scalar_value = ',transf_scalar_value);
			if (transf_scalar_value != f(scalar_values[i])) {
				let ds = f(scalar_values[i])-transf_scalar_value;
				let new_sector = new Sector(x_curr,y_curr,rays[i].theta,ds);
				println('>>>>> creating a sector: ',new_sector);
				transf_sl.sectors.push(new_sector);
				transf_scanln.insertInActiveRays(new Ray(x_curr,y_curr,rays[i].theta,ds));
				transf_scalar_value += ds;
			}
		}*/
		//println('scanln:<br>',scanln.active_rays.toString());
		//println('t_scanln:<br>',t_scanln.active_rays.toString());
	  }
	  return t_sl;
  }
  
  draw() {
	  curr_op = DRAW;
	  var traps = new Array();
	  var scanln = new Scanline(this,[0,0,CANVASWIDTH,CANVASHEIGHT]);
	  while (!scanln.endOfEvents()) {
		scanln.scan(PREPARE);
		let result = scanln.getRays();
		let rays = result.rays;
		let scalar_values = result.scalar_values;
		//println('result: ',result);
		scanln.scan(FORWARD);
		if (scanln.eventsProcessed() === 0) continue; //nothing to do
		for (let i=1;i<rays.length;i++){
			let r1 = rays[i-1];
			let r2 = rays[i];
			let x1 = r1.interY(r1.y_low);
			let x2 = r1.interY(y_curr);
			let x3 = r2.interY(y_curr);
			let x4 = r2.interY(r1.y_low);
			traps.push(...[x1,r1.y_low,x2,y_curr,x3,y_curr,x4,r1.y_low,scalar_values[i-1]]);
			r1.y_low = y_curr;
		}
	  }
	  return traps;
  }
};
