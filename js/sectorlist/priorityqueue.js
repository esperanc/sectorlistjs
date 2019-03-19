const PQ_TOP = 0;
const PQ_PARENT = i => ((i + 1) >>> 1) - 1;
const PQ_LEFT = i => (i << 1) + 1;
const PQ_RIGHT = i => (i + 1) << 1;

class PriorityQueue {
  constructor(comparator) {
    this._heap = [];
    this._comparator = comparator;
  }
  size() {
    return this._heap.length;
  }
  isEmpty() {
    return this.size() == 0;
  }
  peek() {
    return this._heap[PQ_TOP];
  }
  push(...values) {
    values.forEach(value => {
      this._heap.push(value);
      this._siftUp();
    });
    return this.size();
  }
  push_sorted(...values) {
    values.forEach(value => {
      this._heap.push(value);
    });
    return this.size();
  }
  pop() {
    const poppedValue = this.peek();
    const bottom = this.size() - 1;
    if (bottom > PQ_TOP) {
      this._swap(PQ_TOP, bottom);
    }
    this._heap.pop();
    this._siftDown();
    return poppedValue;
  }
  replace(value) {
    const replacedValue = this.peek();
    this._heap[PQ_TOP] = value;
    this._siftDown();
    return replacedValue;
  }
  _greater(i, j) {
    return this._comparator(this._heap[i], this._heap[j]);
  }
  _swap(i, j) {
    [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
  }
  _siftUp() {
    let node = this.size() - 1;
    while (node > PQ_TOP && this._greater(node, PQ_PARENT(node))) {
      this._swap(node, PQ_PARENT(node));
      node = PQ_PARENT(node);
    }
  }
  _siftDown() {
    let node = PQ_TOP;
    while (
      (PQ_LEFT(node) < this.size() && this._greater(PQ_LEFT(node), node)) ||
      (PQ_RIGHT(node) < this.size() && this._greater(PQ_RIGHT(node), node))
    ) {
      let maxChild = (PQ_RIGHT(node) < this.size() && this._greater(PQ_RIGHT(node), PQ_LEFT(node))) ? PQ_RIGHT(node) : PQ_LEFT(node);
      this._swap(node, maxChild);
      node = maxChild;
    }
  }
}