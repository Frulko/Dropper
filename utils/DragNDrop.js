import {
  positionningRect2Dom,
  rectPositionToCSSProperties,
  getValueByScale
} from "./positionningRect2Dom";

window.positionningRect2Dom = positionningRect2Dom;
window.rectPositionToCSSProperties = rectPositionToCSSProperties;

export default class DragNDrop {
  constructor(opts) {
    this.container = null;
    this.dragged = null;
    this.draggedSelection = [];
    this.draggedClickPositionOffset = [];
    this.originalPosition = [];

    this.scaleFactor = opts.scaleFactor;
    this.origin = opts.origin;
    this.max_scale = 10;
    this.min_scale = 0.1;

    this.selectionAreaEl = null;

    this.el = opts.el;

    this.transform = {
      k: opts.scaleFactor,
      x: this.origin[0],
      y: this.origin[1]
    };

    this.selectionAreaBox = {
      x: 0,
      y: 0,
      endx: 0,
      endy: 0,
      initialized: false
    };

    this._startPosition = null;

    this.mouseDown = false;
    this.isDragging = false;
    this.posFirst = [0, 0];
    this.posLast = [0, 0];

    this.isNode = null;

    this.selectedNodes = [];
    this.unselectedNodes = [];

    this.draggingBoard = false;

    this.containerOffset = {
      x: 0,
      y: 0
    };

    this.previousSelectionLength = -1;

    console.log("--> constructor");

    var img = document.createElement("img");
    img.src =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

    img.onload = function() {
      console.log("ready");
    };

    this.dragImagePlaceholder = img;

    this.onKeyHandler = () => {};

    this.update();
  }

  updateEventObject(data, nativeEvent) {
    return {
      first: false,
      last: false,
      delta: [],
      dragging: false,
      moving: false,
      native: nativeEvent,
      node: false,
      selection: [],
      target: nativeEvent.target,
      ...data
    };
  }

  setContainer(container) {
    this.container = container;

    this.selectionAreaEl = document.createElement("div");
    this.selectionAreaEl.classList.add("GraphViewer__SelectionBox", 'GraphViewer__SelectionBox--hide');

    this.container.appendChild(this.selectionAreaEl);

    const rect = this.container.getBoundingClientRect();
    this.containerOffset = {
      x: rect.x,
      y: rect.y
    };
  }

  setOrigin(origin) {
    this.origin = origin;
  }

  onDrag(handler) {
    this.onDragHandler = handler;
  }

  onScale(handler) {
    this.onScaleHandler = handler;
  }

  onKeyEvent(handler) {
    this.onKeyHandler = handler;
  }

  initEventListeners() {
    // this.container.addEventListener('touchstart', function() {
    //   console.log('>>');
    // });

    document.addEventListener(
      "keyup",
      this.onKeyHandler.bind(this, "up"),
      false
    );
    document.addEventListener(
      "keydown",
      this.onKeyHandler.bind(this, "down"),
      false
    );

    this.container.addEventListener(
      "drag",
      this.handleDragEvent.bind(this),
      false
    );
    this.container.addEventListener(
      "dragstart",
      this.handleDragStartEvent.bind(this),
      false
    );
    this.container.addEventListener(
      "dragend",
      this.handleDragEndEvent.bind(this),
      false
    );
    this.container.addEventListener(
      "dragover",
      this.handleDragOverEvent.bind(this),
      false
    );
    this.container.addEventListener(
      "drop",
      this.handleDropEvent.bind(this),
      false
    );
    this.container.addEventListener(
      "mousedown",
      this.handleMouseDown.bind(this),
      false
    );
    this.container.addEventListener(
      "mouseup",
      this.handleMouseUp.bind(this),
      false
    );
    this.container.addEventListener(
      "mousemove",
      this.handleMouseMove.bind(this),
      false
    );

    this.container.addEventListener(
      "wheel",
      this.handleMouseWheel.bind(this),
      false
    );

    this.isMouseCounts = [];
    this.hasTouchpad = false;
  }

  destroyEventListeners() {
    this.container.removeEventListener(
      "drag",
      this.handleDragEvent.bind(this),
      false
    );
    this.container.removeEventListener(
      "dragend",
      this.handleDragEndEvent.bind(this),
      false
    );
    this.container.removeEventListener(
      "dragstart",
      this.handleDragStartEvent.bind(this),
      false
    );
    this.container.removeEventListener(
      "dragover",
      this.handleDragOverEvent.bind(this),
      false
    );
    this.container.removeEventListener(
      "mousedown",
      this.handleMouseDown.bind(this),
      false
    );
    this.container.removeEventListener(
      "mouseup",
      this.handleMouseUp.bind(this),
      false
    );
    this.container.removeEventListener(
      "mousemove",
      this.handleDragStartEvent.bind(this),
      false
    );

    this.container.removeEventListener(
      "wheel",
      this.handleMouseWheel.bind(this),
      false
    );
  }

  handleMouseWheel(e) {
    e.preventDefault();
    if (!e.shiftKey) {
      //if normal gesture move
      this._startPosition = { ...this.transform };
      this.onTranslate(e.deltaX, e.deltaY); // invert delta for natural scroll behavior
      return;
    }

    // pinch to zoom on trackpad is set by browser w/ ctrlKey=true

    const rect = this.el.getBoundingClientRect();
    const wheelDelta = e.wheelDelta;
    const intensity = 0.05;
    const delta = (wheelDelta ? wheelDelta / 120 : -e.deltaY / 3) * intensity;

    // console.log(e.clientX);
    let zoomingCenter = [e.clientX, e.clientY];
    // zoomingCenter = [this.container.getBoundingClientRect().width /2 , this.container.getBoundingClientRect().height /2 ];

    const ox = (rect.left - zoomingCenter[0]) * delta;
    const oy = (rect.top - zoomingCenter[1]) * delta;

    this.onZoom(delta, ox, oy, "wheel");
  }

  onZoom(delta, ox, oy, source) {
    this.zoom(this.transform.k * (1 + delta), ox, oy, source);
    this.update();
  }

  onStart() {
    this._startPosition = { ...this.transform };
  }

  onTranslate(dx, dy) {
    // if (this._zoom.translating) return; // lock translation while zoom on multitouch

    if (this._startPosition)
      this.translate(this._startPosition.x + dx, this._startPosition.y + dy);
  }

  zoom(zoom, ox = 0, oy = 0, source) {
    const k = this.transform.k;
    const params = { transform: this.transform, zoom, source };

    let value = params.zoom || 1;
    if (value < this.min_scale) {
      value = this.min_scale;
    } else if (value > this.max_scale) {
      value = this.max_scale;
    }

    if (value == k) {
      return;
    }

    const d = (k - value) / (k - zoom || 1);

    this.transform.k = value;
    this.transform.x += ox * d;
    this.transform.y += oy * d;

    this.update();
  }

  translate(x, y) {
    const params = { transform: this.transform, x, y };

    this.transform.x = params.x;
    this.transform.y = params.y;

    this.update();
  }

  update() {
    const t = this.transform;
    // update board
    this.el.style.transform = `translate3d(${t.x}px, ${t.y}px, 0) scale(${t.k})`;
  }

  handleMouseDown(event) {
    if (event.button !== 0 || event.ctrlKey) {
      // check if left click only
      return;
    }

    const [evtX, evtY] = this.getPosFromEvent(event.x, event.y);

    this.mouseDown = true;
    this.posFirst = [evtX, evtY];

    const dragObject = {
      first: true,
      delta: this.getDeltaPosition(evtX, evtY)
    };

    const nodeElement = this.checkIsNode(event.target);
    if (nodeElement) {
      this.dragged = nodeElement;
      const draggedRect = this.dragged.getBoundingClientRect();
      const [x, y] = this.getPosFromEvent(draggedRect.x, draggedRect.y);

      this.draggedClickPositionOffset = [evtX - x, evtY - y];
      this.originalPosition = [x, y];

      dragObject.node = true;
      dragObject.target = nodeElement;
      this.isNode = true;
      this.updateDOMTranslate(event);
      // this.selectionAreaBox.initialized = false;
    } else {
      /* SELECTION BEHAVIOR PUT THIS INTO A CLASS */
      // if selection --> setting up xy pos,
      this.selectionAreaBox.x = evtX; // take event.x + box offset of container pos
      this.selectionAreaBox.y = evtY;
      this.selectionAreaBox.initialized = true;
      // this.renderSelectionAreaBox();
      /* SELECTION BEHAVIOR PUT THIS INTO A CLASS */
    }

    const evt = this.updateEventObject(dragObject, event); // build a correct object

    this.onStart(); // used for scaling --> refactoring to delete it
    // this.onDragHandler.call(this, evt); // dispatch to the down click event
  }

  handleMouseUp(event) {
    this.mouseDown = false;
    this.isDragging = false;

    const [evtX, evtY] = this.getPosFromEvent(event.x, event.y);

    this.isNode = this.checkIsNode(event.target);
    const delta = this.getDeltaPosition(evtX, evtY);
    const evt = this.updateEventObject(
      {
        target: this.isNode,
        last: true,
        delta,
        node: this.isNode,
        pos: [
          ((this.originalPosition[0] - this.origin[0] + delta[0]) * 1) /
            this.scaleFactor,
          ((this.originalPosition[1] - this.origin[1] + delta[1]) * 1) /
            this.scaleFactor
        ],
        selection: [...this.selectedNodes],
        unselection: [...this.unselectedNodes]
      },
      event
    );

    //

    if (!this.isNode) {
      this.selectedNodes = [];
    }

    // console.log([this.selectionAreaBox.x, event.x], [this.selectionAreaBox.y, event.y])
    // TODO check if is stop on a node -- do not select and trigger it
    // TODO DISABLE SELECTION IF DRAGGING
    const selectionIsAtSamePosition =
      this.selectionAreaBox.x === evtX && this.selectionAreaBox.y === evtY;
    if (selectionIsAtSamePosition || this.selectionAreaBox.initialized) {
      this.resetSelectionBoxArea();
    }

    this.unselectedNodes = [];
    this.posFirst = [0, 0];
    this.onDragHandler.call(this, evt);
    this.dragged = null;
    this.previousSelectionLength = -1;
  }

  handleMouseMove(event) {

    // TODO handle the case of you drag and move outside the view (today: still moving while mouse is up, futur: cancel all action)
    const [evtX, evtY] = this.getPosFromEvent(event.x, event.y);



    if (this.mouseDown && !this.isDragging ) {
      if (this.dragged !== null) {
        return;
      }


      /* SELECTION BEHAVIOR PUT THIS INTO A CLASS */
      const { x, y } = this.selectionAreaBox;

      const endX = evtX;
      const endY = evtY;
      if (x !== endX && y !== endY) {
        this.showSelectionBox();
        // if same pos do nothing
        // const rectPos = positionningRect2Dom([x, y], [endX, endY]);
        // this.selectionAreaBox = { ...rectPos };
        this.selectionAreaBox.endx = evtX;
        this.selectionAreaBox.endy = evtY;
        this.renderSelectionAreaBox();
      }
      /* SELECTION BEHAVIOR PUT THIS INTO A CLASS */
    }

    if (!this.mouseDown && !this.isDragging) {
      return;
    }

    if (this.mouseDown && event.target !== this.container) {
      return;
    }

    // if (this.isNode) {
    //   return;
    // }

    // console.log(this.getDeltaPosition(event.x, event.y))

    // const evt = this.updateEventObject(
    //   {
    //     moving: true,
    //     delta: this.getDeltaPosition(event.x, event.y)
    //   },
    //   event
    // );
    // this.posFirst = [event.x, event.y];
    // this.onDragHandler.call(this, evt);

    if (this.draggingBoard) {
      const d = this.getDeltaPosition(evtX, evtY);
      this.onTranslate(d[0], d[1]);
    }
  }

  handleDragStartEvent(event) {
    // this.dragged = event.target;

    if (!this.checkIsNode(event.target)) {
      return;
    }

    this.isDragging = true;
    event.dataTransfer.setDragImage(this.dragImagePlaceholder, 0, 0);
  }

  handleDragEndEvent(event) {
    this.handleMouseUp(event);
  }

  handleDragEvent(event) {}

  handleDragOverEvent(event) {
    // Empêche default d'autoriser le drop
    event.preventDefault();
    this.isDragging = true;
    this.updateDOMTranslate(event);
  }

  handleDropEvent(ev) {
    ev.preventDefault();
    // var data = event.dataTransfer.getData("text/plain");
    const items = ev.dataTransfer.items;

    if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      for (var i = 0; i < ev.dataTransfer.items.length; i++) {
        // If dropped items aren't files, reject them
        if (ev.dataTransfer.items[i].kind === "file") {
          var file = ev.dataTransfer.items[i].getAsFile();
          console.log("... file[" + i + "].name = " + file.name);
        }
      }
    } else {
      // Use DataTransfer interface to access the file(s)
      for (var i = 0; i < ev.dataTransfer.files.length; i++) {
        console.log(
          "... file[" + i + "].name = " + ev.dataTransfer.files[i].name
        );
      }
    }
  }

  getPosFromEvent(x, y) {
    const evtX = x - this.containerOffset.x;
    const evtY = y - this.containerOffset.y;
    return [evtX, evtY]
  }

  updateDOMTranslate(event) {
    const [evtX, evtY] = this.getPosFromEvent(event.x, event.y);


    const [posX, posY] = this.getPosition(evtX, evtY);

    for (let i = 0, l = this.selectedNodes.length; i < l; i += 1) {
      const dragged = this.selectedNodes[i];
      // dragged.style.transform = `translate3d(${posX}px, ${posY}px, 0px)`;
    }

    // update node
    this.dragged.setAttribute('data-x', posX); // need to be update because selection might be not working (calculate on old values)
    this.dragged.setAttribute('data-y', posY);
    this.dragged.style.transform = `translate3d(${posX}px, ${posY}px, 0px)`;
  }

  getPosition(x, y) {
    const newX = x - this.transform.x;
    const newY = y - this.transform.y;

    const [dposX, dposY] = this.draggedClickPositionOffset;

    const posX = getValueByScale(newX - dposX, this.transform.k);
    const posY = getValueByScale(newY - dposY, this.transform.k);

    return [posX, posY];
  }

  getDeltaPosition(x, y) {
    return [x - this.posFirst[0], y - this.posFirst[1]];
  }

  checkIsNode(target) {
    if (target.getAttribute("data-root") !== null) {
      return false;
    }

    if (target.getAttribute("draggable") === null) {
      return this.checkIsNode(target.parentElement);
    }
    return target;
  }

  addToSelection(element) {
    this.selectedNodes.push(element);
  }

  // TODO add dblclick to zoom

  fitToScreen() {
    const els = document.querySelectorAll('[draggable="true"]');

    const boundingBox = {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    };

    for (let i = 0, l = els.length; i < l; i += 1) {
      const b = els[i].getBoundingClientRect();
      const l = (b.left - this.transform.x) * (1 / this.transform.k);
      const t = (b.top - this.transform.y) * (1 / this.transform.k);
      const rect = {
        x: l,
        y: t,
        width: b.width * (1 / this.transform.k),
        height: b.height * (1 / this.transform.k)
      };

      if (rect.x > boundingBox.width) {
        boundingBox.width = rect.x + rect.width;
      }

      if (rect.y > boundingBox.height) {
        boundingBox.height = rect.y + rect.height;
      }

      if (rect.x < boundingBox.x) {
        boundingBox.x = rect.x;
      }

      if (rect.y < boundingBox.y) {
        boundingBox.y = rect.y;
      }
    }

    const rect = this.container.getBoundingClientRect();
    const padding = 150;
    let k = this.transform.k;
    if (boundingBox.width < boundingBox.height) {
      // if landscape mode
      k = (rect.height - padding) / boundingBox.height; // need to take x,y position of rect
    } else {
      k = (rect.width - padding) / boundingBox.width;
    }

    this.transform = {
      k,
      x: rect.width / 2 - (boundingBox.width / 2) * k,
      y: rect.height / 2 - (boundingBox.height / 2) * k
    };

    this.update();
  }

  setDraggingBoard(dragging) {
    this.draggingBoard = dragging;
  }

  reset() {
    this.transform = {
      k: this.transform.k,
      x: 0,
      y: 0
    };

    this.update();
  }

  renderSelectionAreaBox() {
    /* SELECTION BEHAVIOR PUT THIS INTO A CLASS */

    if (this.selectionAreaEl === null) {
      return;
    }

    const { x, y, endx, endy } = this.selectionAreaBox;
    this.updateSelectionBoxDOM([x, y], [endx, endy]);

    const selection = this.calculateCollisionsInsideSelectionArea(
      [x, y],
      [endx, endy]
    );

    if (selection.length === this.previousSelectionLength) {
      return;
    }

    console.log(selection);
    this.previousSelectionLength = selection.length;
  }

  updateSelectionBoxDOM(start, end) {
    const { transform, width, height } = rectPositionToCSSProperties(
      positionningRect2Dom(start, end)
    );

    this.selectionAreaEl.style.transform = transform;
    this.selectionAreaEl.style.width = width;
    this.selectionAreaEl.style.height = height;
  }

  hideSelectionBox() {
    this.selectionAreaEl.classList.add("GraphViewer__SelectionBox--hide");
  }

  showSelectionBox() {
    this.selectionAreaEl.classList.remove("GraphViewer__SelectionBox--hide");
  }

  resetSelectionBoxArea() {
    this.hideSelectionBox();

    this.selectionAreaBox = {
      x: 0,
      y: 0,
      endx: 0,
      endy: 0,
      initialized: false
    };
  }

  calculateCollisionsInsideSelectionArea(start, end) {
    const {
      x,
      y,
      width,
      height
    } = this.transposePositionToBoardWithOriginOffsetAndScale(
      positionningRect2Dom(start, end)
    );

    // TODO do not do this !!! // check at start selection and use dom selection after
    const els = document.querySelectorAll('[draggable="true"]');
    
    const selection = [];

    for (let i = 0, l = els.length; i < l; i += 1) {

      const element = els[i];
      const elementPosition = {
        x: +element.getAttribute("data-x"), // TODO ok for this piece of shit but you need to update it before
        y: +element.getAttribute("data-y"),
        width: +element.offsetWidth,
        height: +element.offsetHeight
      };

      // TODO: Use QuadTree algo for faster check
      const isCollied =
        elementPosition.x < x + width &&
        elementPosition.x + elementPosition.width > x &&
        elementPosition.y < y + height &&
        elementPosition.y + elementPosition.height > y;

      if (isCollied) {
        selection.push(element);
        element.classList.add("activate");
      } else {
        element.classList.remove("activate");
      }
    }

    // console.log([x, y, width, height], selection.length);
    return selection;
  }

  transposePositionToBoardWithOriginOffsetAndScale({
    x = 0,
    y = 0,
    width = 0,
    height = 0
  }) {
    x = getValueByScale(x - this.transform.x, this.transform.k);
    y = getValueByScale(y - this.transform.y, this.transform.k);
    width = width * (1 / this.transform.k);
    height = height * (1 / this.transform.k);

    return {
      x,
      y,
      width,
      height
    };
  }

  updateQuadTree() {
    // clear() and populate insert()
    // see if reference work and then update only the changed
  }

  collisionQuadTree() {
    
  }
}
