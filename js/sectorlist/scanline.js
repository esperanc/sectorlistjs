const EVENTINSERT = 2;
const EVENTINTER = 1;
const PREPARE = 10;
const FORWARD = 11;

var y_curr; var x_curr; var theta_curr;

class Ray {
  constructor(x0,y0,theta,ds) {
    this.x0 = x0;
    this.y0 = y0;
    this.theta = theta;
    this.ds = ds;
	if (curr_op === DRAW) this.y_low = y0;
  }
  interY(y) {
	  if (this.theta[1] == 0) return x_curr; // horizontal ray!
	  return this.x0 + this.theta[0] * (y - this.y0) / this.theta[1];
  }
  inter(other) {
	  var det = other.theta[0] * this.theta[1] - other.theta[1] * this.theta[0];
	  if (det == 0) return null;
	  var t = (this.theta[0]*(other.y0-this.y0)-this.theta[1]*(other.x0-this.x0) ) / det;
	  if (t > 2 || t < 0) return null;
	  var x_inter = other.x0+other.theta[0]*t;
	  var y_inter = other.y0+other.theta[1]*t;
	  return [x_inter,y_inter];
  }
  equal_theta(other) {
	  return (this.theta[0] == other.theta[0] && this.theta[1] == other.theta[1]);
  }
  compare_ray_inters(other) {
	  var x1_inter = this.interY(y_curr);
	  var x2_inter = other.interY(y_curr);
	  var result;
	  if (lsCoord(x1_inter,x2_inter)) {
		  result = LESS;
	  } else if (gtCoord(x1_inter,x2_inter)) {
	  	  result = GREATER;
	  } else {
		  result = EQUAL;
	  }
	  //println('r1: ',this.toString(),' r2: ',other.toString(),' result: ',result);
	  return result;
  }
  static compare_ray_inters_static(r1,r2) {
	  return r1.compare_ray_inters(r2);
  }
  compare_ray_thetas(other) {
	  return compareTheta(other.theta,this.theta);
  }
  static compare_ray_thetas_static(r1,r2) {
	  return r1.compare_ray_thetas(r2);
  }
  compare_rays(other) {
	  var res = this.compare_ray_inters(other);
	  if (res != EQUAL) return res;
	  return this.compare_ray_thetas(other);
  }
  toString() {
	  return 'Ray(x_curr:'+this.interY(y_curr)+',y_curr:'+y_curr+',x0:'+this.x0+',y0:'+this.y0+',ds:'+this.ds+',theta:'+this.theta+(curr_op === DRAW ? ',y_low='+this.y_low : '')+')';
  }
}

class Event {
  constructor(type,ray) {
    this.type = type;
    this.ray = ray;
  }
  x() {
	return this.ray.x0;
  }
  y() {
	return this.ray.y0;
  }
  compare(other) {
	  if (lsCoord(this.ray.y0,other.ray.y0)) return LESS;
	  if (gtCoord(this.ray.y0,other.ray.y0)) return GREATER;
	  if (lsCoord(this.ray.x0,other.ray.x0)) return LESS;
	  if (gtCoord(this.ray.x0,other.ray.x0)) return GREATER;
	  if (this.type > other.type) return GREATER;
	  if (this.type < other.type) return LESS;
	  if (this.type === EVENTINTER) return EQUAL;
	  return compareTheta(other.ray.theta,this.ray.theta);
  }
  static compare_first_is_lesser(e1,e2) {
	  return e1.compare(e2) === LESS;
  }
};

class Scanline {
  constructor(sl,bbox) {
	this.events = new PriorityQueue(Event.compare_first_is_lesser);
	this.bbox = bbox;
	this.scan_prepared = false;
	this._events_processed = 0;
	x_curr = bbox[0]-1;
	y_curr = bbox[1]-1;
	theta_curr = [0,1];
    this.initInsertEvents(sl);
	this.initActiveRays();
  }
  initInsertEvents(sl) {
	var insert_events = sl.sectors.map(function(sector) {
							return new Event(EVENTINSERT,new Ray(sector.x,sector.y,sector.theta,sector.w));
						});
    this.events.push_sorted(...insert_events);
  }
  initActiveRays() {
	  // creating two sentinel and vertical rays
	  const DELTA = Math.max(this.bbox[3]-this.bbox[1],this.bbox[2]-this.bbox[0])*0.1;
	  var theta = [0,this.bbox[3]-this.bbox[1]];
	  var sentinel_min = new Ray(this.bbox[0]-DELTA,this.bbox[1]-DELTA,theta,0);
	  var sentinel_max = new Ray(this.bbox[2]+DELTA,this.bbox[1]-DELTA,theta,0);
	  var maxlevels = computeMaxLevels(this.events.size());
	  this.active_rays = new Skiplist(maxlevels,0.5,Ray.compare_ray_inters_static,Ray.compare_ray_thetas_static,sentinel_min,sentinel_max);
  }
  endOfEvents() {
	  return this.events.size() === 0;
  }
  _prepareNextScan(){
	  if (this.scan_prepared == true) return; //nothing to do
	  //println('<br>------<br>## New scan:<br>x_prev,y_prev=',x_curr,',',y_curr);
	  x_curr = this.events.peek().x();
	  y_curr = Math.max(y_curr,this.events.peek().y()); // update the current x, y and inicial theta. Max function enforces that y_curr does not slow down in float operations errors
	  theta_curr = Number.NEGATIVE_INFINITY;
	  //println('x_curr,y_curr=',x_curr,',',y_curr,'<br>');
	  //println(this.active_rays.toString());
	  this._events_processed = 0;
	  this.scan_prepared = true;
  }
  _processingNextPoint() {
	  // Processing INTERSECTION EVENTS (they always come first at a same point in scan order)
	  if (this.events.peek().type == EVENTINTER) {
	    let e_inter = this.events.pop();
	    //println('next intersect event: ',e_inter);
	    if (this.reinsertInActiveRays(e_inter.ray)) this._events_processed++;
	    // To remove any duplicate intersection events
		while (this.thereIsInterEvent()) this.events.pop();
	  }
	  // Processing INSERT EVENTS
	  while (!this.endOfEvents() && eqCoord(this.events.peek().x(),x_curr) && eqCoord(this.events.peek().y(),y_curr)) {
		  let e_ins = this.events.pop();
		  //println('next insert event: ',e_ins);
		  assert(e_ins.type == EVENTINSERT,'An intersection event finded in a wrong position!');
		  theta_curr = e_ins.ray.theta;
		  this.insertInActiveRays(e_ins.ray);
		  this._events_processed++;
	  }
	  this.scan_prepared = false;
  }
  scan(mode = FORWARD) {
	  if (this.endOfEvents()) return false; //nothing to do
	  if (this.scan_prepared == false || mode == PREPARE) {
		this._prepareNextScan();
		if (mode == PREPARE) return ; // else, forwards to second step
	  }
	  this._processingNextPoint();
	  //println('scan stopped!',this.active_rays.toString());
	  this.active_rays.assertNodes();
	  return !this.endOfEvents();
  }
  getRays() {
	  // Get rays at [x_curr,ycurr]
	  return this.active_rays.getRaysAtCurrPoint();
  }
  insertInActiveRays(ray) {
	  var neig_rays = this.active_rays.insert(ray);
	  this._detect_new_intersect_events(neig_rays);
  }
  _detect_new_intersect_events(neig_rays){
	  // detecting new intersect events...
	  for (var i=0;i<neig_rays.length;i++) {
		  // neig_rays.length in {0,1,2}
		  var r1 = neig_rays[i][0];
		  var r2 = neig_rays[i][1];
		  //println('TEST INTERSECTION: ',r1,' | ',r2);
		  var p = this.computeFutherIntersectionPoint(r1,r2);
		  if (p === null) continue;
		  //println('########## INTERSECTION FOUND: ',p,' r1: ',r1,' r2: ',r2);
		  this.events.push(new Event(EVENTINTER,new Ray(p[0],p[1],[0,1],null)));
	  }
  }
  reinsertInActiveRays(ray) { // remove and insert again all rays at point top update sort order in scanline
      var neig_rays = this.active_rays.reinsert_all_rays_at_same_point(ray);
	  if (neig_rays.length === 0) return false;
	  this._detect_new_intersect_events(neig_rays);
	  return true;
  }
  computeFutherIntersectionPoint(r1,r2) {
	  var p = r1.inter(r2);
	  if (p === null) return null;
	  if (p[0] < this.bbox[0]) return null;
	  if (p[1] < this.bbox[1]) return null;
	  if (p[0] > this.bbox[2]) return null;
	  if (p[1] > this.bbox[3]) return null;
	  if (lsCoord(p[1],y_curr)) return null;
	  if (gtCoord(p[1],y_curr)) return p;
	  if (lsCoord(p[0],x_curr)) return null;
	  if (gtCoord(p[0],x_curr)) return p;
	  if (compareTheta(theta_curr,r1.theta)!=GREATER) return null;
	  if (compareTheta(theta_curr,r2.theta)==LESS) return null;
	  return p;
  }
  eventsProcessed() {
	  return this._events_processed;
  }
  thereIsInterEvent() { // there is intersect event at x_curr,y_curr
	  return (!this.endOfEvents() && eqCoord(this.events.peek().x(),x_curr) && eqCoord(this.events.peek().y(),y_curr) && this.events.peek().type == EVENTINTER);
  }
};
