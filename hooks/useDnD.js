import {
  useRef, useEffect,
} from 'react';
import DragNDrop from '../utils/DragNDrop';

const getTranslatationFromScaleFactor = ([x, y]) => {
  return [x, y];
};


export default ({
  boardOrigin,
  scaleFactor,
  items,
  onUpdateNodePosition,
  onUpdateBoardOrigin,
  onScaleFactor,
}) => {
  const xy = getTranslatationFromScaleFactor(boardOrigin, scaleFactor);
  const bind = {
    ref: useRef(null),
  };

  const boardBind = {
    ref: useRef(null),
  };

  const setPosition = (pos) => {
  };

  let dragNDropInstance = null;
  let isShifted = false;

  const onScaleHandler = ({ scale, origin }) => {
    console.log('onScale', scale, origin);
  };

  const onDragHandler = (evt) => {
    if (evt.first) {
      // mousedown
    }

    if (evt.moving) {
      console.log('move');
    }

    if (evt.last) {
      console.log(evt.selection, evt.unselection);
    }

    if (!evt.first && !evt.last) {
      // between first & last --> move
    }
  };


  const onKeyEventHandler = (state, evt) => {
    // console.log(evt.keyCode);
    const dndInstance = bind.ref.current.dragNDropInstance;
    if (state !== 'down') {
      isShifted = false;
      dndInstance.setDraggingBoard(false);
      return;
    }

    if (evt.ctrlKey) { // prevent when ctrl is pressed
      return;
    }

    if (evt.keyCode === 16) {
      dndInstance.setDraggingBoard(true);
      isShifted = true;
    }


    if (evt.keyCode === 82 && state === 'down') { // r -> reset
      dndInstance.reset();
    }

    if (evt.keyCode === 70 && state === 'down') { // f -> fit to screen
      dndInstance.fitToScreen();
    }

    if (evt.keyCode === 65 && state === 'down') { // a -> scale to 0.5
      dndInstance.setScale(0.5);
    }

    if (evt.keyCode === 90 && state === 'down') { // z -> scale to 1
      dndInstance.setScale(1);
    }

    if (evt.keyCode === 69 && state === 'down') { // e -> scale to 2
      dndInstance.setScale(2);
    }
  };


  useEffect(() => {
    // create a new instance of DragNDrop class and attach it to the ref..
    /*
      purpose of this is to create only one instance of drag by binding,
      without that at each state update we create a new DnD class and detach, attach events...
      it not really good for speed
    */
    if (typeof bind.ref.current.dragNDropInstance === 'undefined') {
      bind.ref.current.dragNDropInstance = new DragNDrop({
        origin: xy,
        scaleFactor,
        el: boardBind.ref.current,
      });
    }

    // maybe need to be improve
    dragNDropInstance = bind.ref.current.dragNDropInstance;

    dragNDropInstance.setContainer(bind.ref.current);
    dragNDropInstance.onDrag(onDragHandler.bind(this));
    dragNDropInstance.onScale(onScaleHandler.bind(this));
    dragNDropInstance.onKeyEvent(onKeyEventHandler.bind(this));

    dragNDropInstance.initEventListeners();
    return () => {
      dragNDropInstance.destroyEventListeners();
    };
  }, []);

  return {
    bind,
    boardBind,
  };
};
