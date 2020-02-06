export default class Node {

  constructor() {

  }

  isNode(target) {
    if (target.getAttribute("data-root") !== null) {
      return false;
    }

    if (target.getAttribute("draggable") === null) {
      return this.isNode(target.parentElement);
    }
    return target;
  }
}