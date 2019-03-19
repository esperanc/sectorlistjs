class SLNode {
	constructor(value,num_lvls) {
		this.value = value;
		this.next = new Array(num_lvls);
		this.ds = new Array(num_lvls);
		// to set default values...
		for (var i=0;i<num_lvls;i++){
			this.next[i] = null;
			this.ds[i] = 0;
		}
	}
	cnt_levels() {
		return this.next.length;
	}
}

class SLFindResult {
	constructor(svalue_at=null,lvlpath=null,find_equal=false) {
		this.svalue_at = svalue_at;
		this.find_equal = find_equal;
		this.lvlpath = lvlpath;
	}
	finded_node() {
		return this.lvlpath[0].next[0];
	}
	get_nextNodeOnPath(lvl,steps=1) {
		var node = this.lvlpath[lvl];
		for(var i=0;i<steps;i++){
			if (node === null) return null;
			var node = node.next[lvl];
		}
		return node;
	}
	set_nextNodeOnPath(new_node) {
		//println('in set_nextNodeOnPath procedure');
		//for (var i=0;i<this.lvlpath.length;i++) println('lvlpath['+i+']=',this.lvlpath[i].value.toString());
		var new_svalue = this.svalue_at[0] + new_node.value.ds;
		for (var lvl=0;lvl<this.lvlpath.length;lvl++) {
			let prev_node = this.lvlpath[lvl];
			if (lvl < new_node.cnt_levels()) { // then, updates linked list and ds values
				let next_node = prev_node.next[lvl];
				// updating linked list
				new_node.next[lvl] = next_node;
				prev_node.next[lvl] = new_node;
				// updating ds values
				let prev_svalue = this.svalue_at[lvl];
				let new_next_svalue = prev_svalue + new_node.value.ds + prev_node.ds[lvl];	
				prev_node.ds[lvl] = new_svalue-prev_svalue;
				new_node.ds[lvl] = new_next_svalue-new_svalue;
			} else { // update only ds value of prev_node
				prev_node.ds[lvl] += new_node.value.ds;
			}
		}
	}
	valueAt() {
		return this.value_at[0];
	}
	update_ds_on_path(ds) {
		for(var lvl=0;lvl<this.lvlpath.length;lvl++) {
			this.lvlpath[lvl].ds[lvl] += ds;
		}
	}
	remove_finded_node() {
		var finded_node = this.finded_node();
		var ds = finded_node.value.ds;
		for (var lvl=0;lvl<this.lvlpath.length;lvl++) {
			if (lvl < finded_node.cnt_levels()) {
				var prev_node = this.lvlpath[lvl];
				var next_node = finded_node.next[lvl];
				// updating linked list
				prev_node.next[lvl] = next_node;
				// updating ds values
				var prev_svalue = this.svalue_at[lvl];
				var new_next_svalue = prev_svalue + prev_node.ds[lvl] + finded_node.ds[lvl] - ds;
				prev_node.ds[lvl] = new_next_svalue-prev_svalue;
			} else {
				this.lvlpath[lvl].ds[lvl] -= ds;
			}
		}
		// returning the new neighborhood rays at first level to intersection test
		return [this.lvlpath[0].value,this.lvlpath[0].next[0].value];
	}
}

class Skiplist {
	constructor(n,p,cmp_func1,cmp_func2,sent1,sent2) {
		this._levels = n;
		this._p = p;
		// head and tail are sentinel rays on leftmost and rightmost in scan
		this._head = new SLNode(sent1,n);
		this._tail = new SLNode(sent2,n);
		for(var i=0;i<n;i++) this._head.next[i] = this._tail; // at the beginning head points to tail in all levels
		this._size = 0;
		this._cmp_func1 = cmp_func1;
		this._cmp_func2 = cmp_func2;
	}
	_find(value,dirty_sort=false) {
		//println("<br>--- Find procedure | Ray: ",value);
		var curr_node = this._head;
		var curr_lvl = this._levels-1;
		var ds = 0;
		var svalue_at = new Array(this._levels);
		var lvlpath = new Array(this._levels);
		var result;
		while (curr_lvl >= 0) {
			result = this._cmp_func1(value,curr_node.next[curr_lvl].value);
			if (result == EQUAL && !dirty_sort) result = this._cmp_func2(value,curr_node.next[curr_lvl].value);
			//println('Test with: ',curr_node.next[curr_lvl].value.toString(),' | result: ',result);
			if (result == GREATER) {
				ds += curr_node.ds[curr_lvl];
				curr_node = curr_node.next[curr_lvl];
			} else { // else, result is equal to LESS or EQUAL
				lvlpath[curr_lvl] = curr_node;
				svalue_at[curr_lvl] = ds;
				//println('lvlpath['+curr_lvl+']=',curr_node.value.toString());
				curr_lvl--;
			}
			//println('curr_ray: ',curr_node.value.toString(),' curr_lvl: ',curr_lvl);
		}
		//println('find finished!');
		var result = new SLFindResult(svalue_at,lvlpath,result == EQUAL);
		//for (var i=0;i<this._levels;i++) println('lvlpath['+i+']=',result.lvlpath[i].value.toString());
		return result;
	}
	valueOf(value) {
		return this._find(value).valueAt();
	}
	getRaysAtCurrPoint() {
		// get all rays at [x_curr,y_curr] and one ray after and one before
		var pivot = new Ray(x_curr,y_curr,[0,1],null); // only a pivot to search
		var find_result = this._find(pivot,true);
		var curr_node = find_result.lvlpath[0];
		var rays = [curr_node.value]; // the ray before [x_curr,y_curr]
		var s_value = find_result.svalue_at[0];
		var scalar_values = [s_value];
		curr_node = curr_node.next[0];
		//while (curr_node.value.interY(y_curr) == x_curr) {
		while (eqCoord(curr_node.value.interY(y_curr),x_curr)) {
			s_value += curr_node.value.ds;
			rays.push(curr_node.value);
			scalar_values.push(s_value);
			curr_node = curr_node.next[0];
		}
		rays.push(curr_node.value); // the ray after [x_curr,y_curr]
		scalar_values.push(s_value+curr_node.value.ds);
		return {rays: rays, scalar_values: scalar_values};
	}
	insert(value) {
		var find_result = this._find(value);
		if (find_result.find_equal) {
			var equal_node = find_result.finded_node();
			if (equal_node.value.ds + value.ds === 0) {
				// remove (cancel) the node from skiplist!
				var neigh_rays = this._removenode(find_result);
				//println(this.toString());
				return neigh_rays;
			} else { // else, update value.ds and path
				equal_node.value.ds += value.ds;
				find_result.update_ds_on_path(value.ds);
				//println(this.toString());
				// in this case, this._size does not change...
				return []; // there are not new neighborhood rays to intersection test...
			}
		} else {
			var random_levels = this._randLevels();
			var new_node = new SLNode(value,random_levels);
			find_result.set_nextNodeOnPath(new_node);
			//println(this.toString());
			this._size += 1;
			return [[find_result.lvlpath[0].value,value],[value,find_result.get_nextNodeOnPath(0,2).value]];
		}
	}
	_removenode(find_result) {
		this._size -= 1;
		// remove node and return the new neighborhood rays
		return [find_result.remove_finded_node()];
	}
	reinsert_all_rays_at_same_point(value) {
		var find_result = this._find(value,true);
		var rays_to_reinsert = [];
		if (!find_result.find_equal) {return [];} // there aren't rays at point :: nothing to do
		//if (find_result.get_nextNodeOnPath(0,2).value.interY(y_curr) != x_curr) return []; // less than 2 rays at current point :: reorder is not necessary
		//println('>>> find_result: ',find_result.finded_node().value,' find_equal: ',find_result.find_equal);
		if (!eqCoord(find_result.get_nextNodeOnPath(0,2).value.interY(y_curr),x_curr)) return []; // less than 2 rays at current point :: reorder is not necessary
		while (find_result.find_equal) {//find_result.get_nextNodeOnPath(0).value.interY(y_curr) == value.interY(y_curr)) {
			rays_to_reinsert.push(find_result.finded_node().value);
			this._removenode(find_result);
			find_result = this._find(value,true);
		}
		assert(rays_to_reinsert.length > 1,'Less than 2 rays at current point! Reinsert procedure fail to check!');
		var next_node_at_point = find_result.get_nextNodeOnPath(0);
		//println('.............');
		//println('rays_to_reinsert: ',rays_to_reinsert);
		for(var i=0;i<rays_to_reinsert.length;i++) {
			this.insert(rays_to_reinsert[i]); // reinsert in the correct order...
		}
		return [[find_result.lvlpath[0].value,rays_to_reinsert[rays_to_reinsert.length-1]],[next_node_at_point.value,rays_to_reinsert[0]]];
		// !!!! ineficiência se rays_to_reinsert.length == 1 !!!
	}
	_randLevels() {
		var cnt = 1;
		while (Math.random() > this._p && cnt < this._levels) cnt++;
		return cnt;
	}
	toString() {
		var str_values = '';
		var str_lines = new Array(this._levels);
		for (var i=0;i<this._levels;i++) str_lines[i] = '';
		var node = this._head;
		while (node !== null) {
			str_values += '<br>value: '+ node.value.toString() + ' | next: ';
			for (var curr_lvl=this._levels-1;curr_lvl>=0;curr_lvl--) {
				if (curr_lvl >= node.cnt_levels()) {
					str_lines[curr_lvl] += '---------';
				} else {
					if (node.next[curr_lvl] === null) {
						str_values += 'null | ';
					} else {
						str_values += node.next[curr_lvl].value.toString() + ' | ';
					}
					if (node.next[0] === null) {
						str_lines[curr_lvl] += '|--null';
					} else {
						var str_ds;
						if (typeof node.ds[curr_lvl] === 'undefined')
							str_ds = '?   ';
						else {
							str_ds = node.ds[curr_lvl].toString();
							while (str_ds.length<2) str_ds += ' ';
						}
						str_lines[curr_lvl] += '|-- '+str_ds+' --';
					}
				}
			}
			node = node.next[0]; //next at first level
		}
		var str = '<pre>------<br>Skiplist Data Structure<br>';
		for (i=this._levels-1;i>=0;i--) str += str_lines[i]+'<br>';
		str += '-----<br>Values'+str_values+'</pre>';
		return str;
	}
	assertNodes() {
		var node = this._head;
		while (node.next[0] !== null && gtCoord(node.next[0].value.interY(y_curr),x_curr)) {
			let result = node.value.compare_rays(node.next[0].value);
			assert(result != GREATER,'Unordered scanline not expected! Problem found between '+node.value.toString()+' and '+node.next[0].value.toString()+'. result = '+result);
			node = node.next[0];
		}
	}
}