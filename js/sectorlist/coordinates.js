const LESS = -1;
const GREATER = 1;
const EQUAL = 0;

var _round_func = function(coord) {
	return Math.round(coord*1000);
}

var eqCoord = function(c1,c2) {
	return _round_func(c1) == _round_func(c2);
}

var eqPoint = function(p1,p2) {
	return (_round_func(p1[0]) == _round_func(p2[0]) && _round_func(p1[1]) == _round_func(p2[1]));
}

var gtCoord = function(c1,c2) {
	return _round_func(c1) > _round_func(c2);
}

var lsCoord = function(c1,c2) {
	return _round_func(c1) < _round_func(c2);
}

var computeTheta = function(x1,y1,x2,y2) {
  if (lsCoord(y1,y2)) return [x2-x1,y2-y1];
  if (gtCoord(y1,y2)) return [x1-x2,y1-y2];
  return [Math.abs(x1-x2),0];
}

var compareTheta = function(t1,t2) {
	if (t1 === Number.NEGATIVE_INFINITY && t2 === Number.NEGATIVE_INFINITY) return EQUAL;
	if (t1 === Number.NEGATIVE_INFINITY) return LESS;
	if (t2 === Number.NEGATIVE_INFINITY) return GREATER;
    var p = t1[0]*t2[1]-t1[1]*t2[0];
    if (p<0) return GREATER;
    if (p == 0) return EQUAL;
    return LESS;
}
