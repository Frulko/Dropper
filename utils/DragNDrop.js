const getPosByScale = (pos, scaleFactor) => {
  // console.log('getPosByScale', pos, scaleFactor);
  let scale = scaleFactor;
  if (scaleFactor < 1) {
    scale = 1 / scaleFactor;
    return pos * scale;
  }
  return pos / scale;
};

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

    this.el = opts.el;

    this.transform = {
      k: opts.scaleFactor,
      x: this.origin[0],
      y: this.origin[1]
    };
    this._startPosition = null;

    this.mouseDown = false;
    this.isDragging = false;
    this.posFirst = [0, 0];
    this.posLast = [0, 0];

    this.isNode = null;

    this.selectedNodes = [];
    this.unselectedNodes = [];

    this.draggingBoard = true;

    console.log("--> constructor");

    var img = document.createElement("img");
    img.src =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

    img.onload = function() {
      console.log("ready");
    };

    this.dragImagePlaceholder = img;

    this.onKeyHandler = () => {};

    window.fitToScreen = value => {
      this.fitToScreen();
    };

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

    const rect = this.el.getBoundingClientRect();
    const wheelDelta = e.wheelDelta;
    const intensity = 0.1;
    const delta = (wheelDelta ? wheelDelta / 120 : -e.deltaY / 3) * intensity;

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
    this.el.style.transform = `translate3d(${t.x}px, ${t.y}px, 0) scale(${t.k})`;
  }

  handleMouseWheel_(e) {
    var delta = e.wheelDeltaY != null ? e.wheelDeltaY : e.detail * -60;

    this.adjustMouseEvent(e);

    var scale = this.scaleFactor;

    if (delta > 0) {
      scale *= 1.1;
    } else if (delta < 0) {
      scale *= 1 / 1.1;
    }
    this.changeScale(scale, [e.localX, e.localY]);
  }

  convertCanvasToOffset(pos, out) {
    out = out || [0, 0];
    out[0] = pos[0] / this.scaleFactor - this.origin[0];
    out[1] = pos[1] / this.scaleFactor - this.origin[1];
    return out;
  }

  changeScale(value, zooming_center) {
    if (value < this.min_scale) {
      value = this.min_scale;
    } else if (value > this.max_scale) {
      value = this.max_scale;
    }

    if (value == this.scaleFactor) {
      return;
    }

    var rect = this.container.getBoundingClientRect(); //aka -> canvas element
    if (!rect) {
      return;
    }

    zooming_center = [rect.width * 0.5, rect.height * 0.5]; // center of rect if no zooming_center

    var center = this.convertCanvasToOffset(zooming_center);
    this.scaleFactor = value;
    if (Math.abs(this.scaleFactor - 1) < 0.01) {
      this.scaleFactor = 1;
    }

    var new_center = this.convertCanvasToOffset(zooming_center);

    var delta_offset = [new_center[0] - center[0], new_center[1] - center[1]];

    console.log(this.scaleFactor, delta_offset);

    this.origin[0] = delta_offset[0];
    this.origin[1] = delta_offset[1];

    // console.log("update all", this.origin);

    this.onScaleHandler({
      scale: this.scaleFactor,
      origin: this.origin
    });
  }

  handleMouseDown(event) {
    if (event.button !== 0 || event.ctrlKey) {
      // check if left click only
      return;
    }

    this.mouseDown = true;
    this.posFirst = [event.x, event.y];

    const dragObject = {
      first: true,
      delta: this.getDeltaPosition(event.x, event.y)
    };

    const nodeElement = this.checkIsNode(event.target);
    if (nodeElement) {
      this.dragged = nodeElement;
      const { x, y } = this.dragged.getBoundingClientRect();
      this.draggedClickPositionOffset = [event.x - x, event.y - y];
      this.originalPosition = [x, y];

      dragObject.node = true;
      dragObject.target = nodeElement;
      this.isNode = true;
      this.updateDOMTranslate(event);
    }

    const evt = this.updateEventObject(dragObject, event); // build a correct object

    this.onStart(); // used for scaling --> refactoring to delete it
    // this.onDragHandler.call(this, evt); // dispatch to the down click event
  }

  handleMouseUp(event) {
    this.mouseDown = false;
    this.isDragging = false;

    this.isNode = this.checkIsNode(event.target);
    const delta = this.getDeltaPosition(event.x, event.y);
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

    this.unselectedNodes = [];

    this.posFirst = [0, 0];

    this.onDragHandler.call(this, evt);
  }

  handleMouseMove(event) {
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
      const d = this.getDeltaPosition(event.x, event.y);
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
    // console.log(getPosByScale(event.x - this.draggedClickPositionOffset[0], this.scaleFactor));
    // const evt = this.updateEventObject({
    //   delta: this.getDeltaPosition(event.x, event.y)
    // }, event)

    // this.onDragHandler.call(this, evt);
    // this.dragged.style.transform = `translate3d(${getPosByScale(event.x - this.draggedClickPositionOffset[0], this.scaleFactor)}px, ${getPosByScale(event.y - this.draggedClickPositionOffset[1], this.scaleFactor)}px, 0px)`
  }

  updateDOMTranslate(event) {
    const [posX, posY] = this.getPosition(event.x, event.y);

    for (let i = 0, l = this.selectedNodes.length; i < l; i += 1) {
      const dragged = this.selectedNodes[i];
      // dragged.style.transform = `translate3d(${posX}px, ${posY}px, 0px)`;
    }

    this.dragged.style.transform = `translate3d(${posX}px, ${posY}px, 0px)`;
  }

  getPosition(x, y) {
    const newX = x - this.transform.x;
    const newY = y - this.transform.y;

    const [dposX, dposY] = this.draggedClickPositionOffset;

    const posX = getPosByScale(newX - dposX, this.transform.k);
    const posY = getPosByScale(newY - dposY, this.transform.k);

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
    }

    for (let i = 0, l = els.length; i < l; i += 1) {
      const b = els[i].getBoundingClientRect();
      const rect = {
        x: +els[i].getAttribute('data-x'),
        y: +els[i].getAttribute('data-y'),
        width: b.width * (1/this.transform.k),
        height: b.height * (1/this.transform.k)
      };

      // console.log('w', rect.width, rect.width * (1/this.transform.k))

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
    if (boundingBox.width < boundingBox.height) { // if landscape mode
      k = (rect.height - padding) / (boundingBox.height);
    } else {
      k = (rect.width - padding) / (boundingBox.width);
    }

    this.transform = {
      k,
      x: rect.width/2 - ((boundingBox.width / 2) * (k) ), 
      y: rect.height/2 - ((boundingBox.height / 2) * (k) ), 
    }

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
}
