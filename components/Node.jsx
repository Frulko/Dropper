import React, { useState } from "react";
import classNames from 'classnames';
import NodeWrapper from "./NodeWrapper";
import DeepDebugNode from "./DeepDebugNode";


export default React.forwardRef((props, ref) => {

  const { id, posX, posY, name, tabIndex } = props;
  const [isSelected, setSelected] = useState(false);
  const [tokenUpdate, setUpdate] = useState(props.tokenUpdate);

  const handleOnOver = () => {
    console.log('over', id);
  }

  const handleOnClick = () => {
    setSelected(true);
    // setUpdate((new Date).getTime());
  }
  
  const handleOnUnselect = () => {
    setSelected(false);
    // setUpdate((new Date).getTime());
  }
  

  console.log('n-render', posX, posY);
   
  return (
    <NodeWrapper ref={ref} diffRender={tokenUpdate} onSelect={handleOnClick.bind(this)} onUnselect={handleOnUnselect} onOver={handleOnOver.bind(this)}>
      <DeepDebugNode
        className={classNames('node', {'node--selected': isSelected})}
        data-node={id}
        data-x={posX}
        data-y={posY}
        draggable="true"
        style={{ transform: `translate3d(${posX}px, ${posY}px, 0)` }}
        tabIndex={tabIndex}
      >

        <form action="">
          <label htmlFor="hello">#{id} --> {name} ?</label>
          <input type="text" id="hello" name="hello" />
        </form>

      </DeepDebugNode>
    </NodeWrapper>
  );
});
