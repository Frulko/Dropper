import React, {useState} from 'react';
import useDnD from '../hooks/useDnD';
import Node from './Node';
import '../assets/Graph.scss';

const GraphNavigator = (props) => {

  const [connectables, setConnectables] = useState(props.connectables); 
  const [boardOrigin, setBoardOrigin] = useState([0, 0]); 
  const [scaleFactor, setScaleFactor] = useState(0.5); 

  let indexedConnectables = {};


  const cpt = [];
  for (let idx = 0, l = connectables.length; idx < l; idx += 1 ) {
    const connectable = connectables[idx];
    const r = React.useRef(null);
    connectable.ref = r;
    connectable.arrayIndex = idx;
    indexedConnectables[connectable.id] = connectable;
    cpt.push(<Node {...connectable} tabIndex={idx}  ref={r} key={'Node__' + idx} />);
  }

  const { bind, boardBind } = useDnD({
    boardOrigin,
    scaleFactor,
    items: indexedConnectables,
    onUpdateNodePosition: (index, [x, y]) => {
      
      // const newCon = [...connectables]; 
      // newCon[index].posX = x;
      // newCon[index].posY = y;

      // console.log('>', newCon[index], index, [x, y])
      // setConnectables(newCon);
    },
    onUpdateBoardOrigin: (position) => {
      // console.log('onUpdateBoardOrigin', position);
      setBoardOrigin(position)
    },
    onScaleFactor: (scale) => {
      console.log('onScaleFactor', scale);
    },
  });



  return (
    <div data-root="true" className="GraphViewer" {...bind}>

      <div {...boardBind}>
        {cpt}
      </div>

    </div>
  );
}

export default GraphNavigator;