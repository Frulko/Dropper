import React, {
  useRef, useEffect, createRef, useState,
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

  // const [ _xy, _setPosition ] = useState([posX, posY]);
  const bind = {
    ref: useRef(null),
  };

  const boardBind = {
    ref: useRef(null),
  };

  const setPosition = (pos) => {
    // _setPosition(pos);
    // xy = pos;
    // boardBind.ref.current.style.transform = `translate3d(${pos[0]}px, ${pos[1]}px, 0) scale(${scaleFactor})`;
  };

  let dragNDropInstance = null;
  let isShifted = false;

  const onScaleHandler = ({ scale, origin }) => {
    // console.log('scale', p)
    // boardBind.ref.current.style.transform = `translate3d(${origin[0]}px, ${origin[1]}px, 0) scale(${scale})`;
  };

  const onDragHandler = (evt) => {
    if (evt.first) {
      // console.log('first');
      if (isShifted && evt.node) {
        console.log('add', evt.target);
      }
    }

    if (evt.moving) {
      const [deltaX, deltaY] = evt.delta;
      const [x, y] = xy;

      const pos = [
        x + deltaX,
        y + deltaY,
      ];


      setPosition(pos);
      dragNDropInstance.setOrigin(pos);
    }

    if (evt.last) {
      // console.log(evt.native.target, id, );

      console.log(evt.selection, evt.unselection);

      if (evt.node) {
        const id = evt.target.getAttribute('data-node');
        console.log(id, evt.pos);
        // items[id].posX = evt.pos[0];
        // items[id].posY = evt.pos[1];
        // // console.log('|->>>', evt.pos, [plop[id].posX, plop[id].posY], evt.newPosition);
        // items[id].ref.current.external_onClickEvent();
        onUpdateNodePosition(items[id].arrayIndex, evt.pos);

        const triggerSelectionEvent = (node, isSelected) => {
          const id = node.getAttribute('data-node');
          const el = items[id].ref.current;

          if (isSelected) {
            el.external_onClickEvent();
            return;
          }

          el.external_onUnselectedEvent();
        };

        for (const selectedIndex in evt.selection) {
          triggerSelectionEvent(evt.selection[selectedIndex], true);
        }

        for (const unSelectedIndex in evt.unselection) {
          triggerSelectionEvent(evt.unselection[unSelectedIndex], false);
        }
      } else {

        // onUpdateBoardOrigin(xy);

        // for (let i = 0, l = evt.selection.length; i < l; i++) {
        //   const id =  evt.selection[i].getAttribute('data-node');
        //   items[id].ref.current.external_onUnselectedEvent();
        // }
      }
      // plop[id].ref.current.external_update_state_function('click')
    }

    if (!evt.first && !evt.last) {
      //  // console.log(event.x, draggedClickPositionOffset[0]);
      // const posX = getPosByScale(event.x - draggedClickPositionOffset[0], );
      // const posY = getPosByScale(event.y - draggedClickPositionOffset[1], );
      // dragged.style.transform = `translate3d(${posX}px, ${posY}px, 0px)`;
    }
  };


  const onKeyEventHandler = (state, evt) => {
    // console.log(evt.keyCode);
    if (state !== 'down') {
      isShifted = false;
      bind.ref.current.dragNDropInstance.setDraggingBoard(false);
      return;
    }

    if (evt.keyCode === 16) {
      bind.ref.current.dragNDropInstance.setDraggingBoard(true);
      isShifted = true;
    }


    if (evt.keyCode === 82 && state === 'down') {
      bind.ref.current.dragNDropInstance.reset();
    }

    if (evt.keyCode === 70 && state === 'down') {
      bind.ref.current.dragNDropInstance.fitToScreen();
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

    dragNDropInstance = bind.ref.current.dragNDropInstance;

    boardBind.ref.current.style.transformOrigin = '0 0';
    // boardBind.ref.current.style.transform = `translate3d(${xy[0]}px, ${xy[1]}px, 0) scale(${scaleFactor})`;

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
