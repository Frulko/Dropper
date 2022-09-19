import DragNDrop from "./utils/DragNDrop";
import './assets/Graph.scss';


const dragNDropInstance = new DragNDrop({
    origin: [0, 0],
    scaleFactor: 1,
    el: document.querySelector('.GraphViewer__bind'),
});


dragNDropInstance.setContainer(document.querySelector('.GraphViewer'));
dragNDropInstance.onDrag((evt) => {
    console.log('onDrag', evt)
    // if (evt.first) {
    //     // console.log('first');
    //     if (isShifted && evt.node) {
    //         console.log('add', evt.target);
    //     }
    // }

    // if (evt.moving ) {
    //     const [deltaX, deltaY] = evt.delta;
    //     const [x, y] = xy;

    //     const pos = [
    //         x + deltaX,
    //         y + deltaY
    //     ];


    //     // setPosition(pos);
    //     dragNDropInstance.setOrigin(pos);
    // }

    // if (evt.last) {


    // // console.log(evt.native.target, id, );

    // // console.log(evt.selection, evt.unselection);

    //     if (evt.node) {
            
    //         const id = evt.target.getAttribute('data-node');
    //         // console.log(id, evt.pos);
    //         // items[id].posX = evt.pos[0];
    //         // items[id].posY = evt.pos[1];
    //         // // console.log('|->>>', evt.pos, [plop[id].posX, plop[id].posY], evt.newPosition);
    //         /* items[id].ref.current.external_onClickEvent();
    //         onUpdateNodePosition(items[id].arrayIndex, evt.pos);

    //         const triggerSelectionEvent = (node, isSelected) => {
    //         const id = node.getAttribute('data-node');
    //         const el = items[id].ref.current;
            
    //         if (isSelected) {
    //             el.external_onClickEvent()
    //             return;
    //         }

    //         el.external_onUnselectedEvent();
    //         }

    //         for(let selectedIndex in evt.selection) {
    //         triggerSelectionEvent(evt.selection[selectedIndex], true);
    //         }

    //         for(let unSelectedIndex in evt.unselection) {
    //         triggerSelectionEvent(evt.unselection[unSelectedIndex], false);
    //         } */
            
    //     } else {
            
    //         // onUpdateBoardOrigin(xy);

    //         // for (let i = 0, l = evt.selection.length; i < l; i++) {
    //         //   const id =  evt.selection[i].getAttribute('data-node');
    //         //   items[id].ref.current.external_onUnselectedEvent();
    //         // }
    //     }
    //     // plop[id].ref.current.external_update_state_function('click')
    // }

    // if (!evt.first && !evt.last) {
    // //  // console.log(event.x, draggedClickPositionOffset[0]);
    // // const posX = getPosByScale(event.x - draggedClickPositionOffset[0], );
    // // const posY = getPosByScale(event.y - draggedClickPositionOffset[1], );
    // // dragged.style.transform = `translate3d(${posX}px, ${posY}px, 0px)`;
    // }

    if (evt.last) {
        // const posX = getPosByScale(event.x - draggedClickPositionOffset[0], );
        // const posY = getPosByScale(event.y - draggedClickPositionOffset[1], );
        if (evt.node) {
            const { transform, pos } = evt; 
            const [x, y] = pos;
            const { node } = evt;

            const posX = (x - transform.x) * (1/transform.k);
            const posY = (y - transform.y) * (1/transform.k);
            
            node.setAttribute('data-x', posX)
            node.setAttribute('data-y', posY)
            node.style.transform = `translate3d(${posX}px, ${posY}px, 0px)`;
        }
    }
});
dragNDropInstance.onScale(() => {});
dragNDropInstance.onKeyEvent(() => {});

dragNDropInstance.initEventListeners();