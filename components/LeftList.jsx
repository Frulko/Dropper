import React from 'react';


export default () => {

  function dragstart_handler(ev) {
    // On ajoute l'identifiant de l'élément cible à l'objet de transfert
    console.log('drag start');
    ev.dataTransfer.setData("text/plain", ev.target.innerText);
    // ev.dataTransfer.setData("text/plain", 'youplaboom');
    ev.dataTransfer.dropEffect = "link";
   }

  return (
    <div className="LeftList">
      <ul>
        <li draggable="true" onDragStart={dragstart_handler.bind(this)}>Item 1</li>
        <li draggable="true" onDragStart={dragstart_handler.bind(this)}>Item 2</li>
        <li draggable="true" onDragStart={dragstart_handler.bind(this)}>Item 3</li>
        <li draggable="true" onDragStart={dragstart_handler.bind(this)}>Item 4</li>
      </ul>
    </div>
  );
}