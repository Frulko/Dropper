var dragged = null;
var lastHovered = null;
const scaleFactor = 0.5;
let originalPosition = [0, 0];
let draggedClickPositionOffset = [0, 0];

const viewportEl = document;
const htmlEl = document.querySelector('html');

document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('#viewport').style.transform = `scale(${scaleFactor})`;
  // console.log('viewport', document.querySelector('#viewport').style.transform)
});


const getPosByScale = (pos) => {
  // console.log('getPosByScale', pos, scaleFactor);
  let scale = scaleFactor;
  if (scaleFactor < 1) {
    scale = 1 / scaleFactor;
    return pos * scale;
  }
  return pos / scale;
};

/* Les événements sont déclenchés sur les objets glissables */
document.addEventListener("drag", function( event ) {
  
 

}, false);

viewportEl.addEventListener('mousedown', function(event) {
  // console.log('ok', event.target.getAttribute('draggable'));
  if ( event.target.getAttribute('draggable') ) {
    dragged = event.target;
    dragged.classList.add('active');
    const {x, y} = dragged.getBoundingClientRect();
    draggedClickPositionOffset = [event.x - x, event.y - y];
    originalPosition = [x, y];

    // console.log([x, y]);
    // console.log(dragged.getBoundingClientRect(), event.x, event.y)
    // console.log(draggedClickPositionOffset);
  }
})

viewportEl.addEventListener('mouseup', function(event) {
  // console.log(dragged.style.transform);
})

viewportEl.addEventListener("dragstart", function( event ) {
    // Stocke une référence sur l'objet glissable
    dragged = event.target;
    
    event.dataTransfer.setDragImage(document.createElement('img'), 0, 0);
    
    // transparence 50%
    // event.target.style.opacity = .5;
}, false);

viewportEl.addEventListener("dragend", function( event ) {
    // reset de la transparence
    event.target.style.opacity = "";
}, false);

/* Les événements sont déclenchés sur les cibles du drop */
viewportEl.addEventListener("dragover", function( event ) {
    // Empêche default d'autoriser le drop
    event.preventDefault();
    // console.log(event.x, draggedClickPositionOffset[0]);
  dragged.style.transform = `translate3d(${getPosByScale(event.x - draggedClickPositionOffset[0])}px, ${getPosByScale(event.y - draggedClickPositionOffset[1])}px, 0px)`
}, false);

viewportEl.addEventListener("dragenter", function( event ) {
    // Met en surbrillance la cible de drop potentielle lorsque l'élément glissable y entre
    if ( event.target.classList.contains('node') && event.target !== dragged) {
        // event.target.style.background = "purple";
        event.target.classList.add('hover');
        lastHovered = event.target;
    }

    

}, false);

viewportEl.addEventListener("dragleave", function( event ) {
    // reset de l'arrière-plan des potentielles cible du drop lorsque les éléments glissables les quittent
    
    if (event.target.localName !== 'html' && event.target) {
      debugger;
    }
    
    if ( event.target.classList.contains('node')) {
        event.target.classList.remove('hover');
        lastHovered = null;
    }
    
    

}, false);

viewportEl.addEventListener("drop", function( event ) {
    // Empêche l'action par défaut (ouvrir comme lien pour certains éléments)
    event.preventDefault();
    // dragged.style.transform = `translate3d(${getPosByScale(event.x)}px, ${getPosByScale(event.y)}px, 0px)`
    // Déplace l'élément traîné vers la cible du drop sélectionnée
    if ( event.target.className == "dropzone" ) {
        event.target.style.background = "";
        dragged.parentNode.removeChild( dragged );
        event.target.appendChild( dragged );
    }

    

    if (lastHovered !== null) {
      console.log(lastHovered, 'drop-over --> link two nodes and reset position')
      const [x, y] = originalPosition;
      //RESET NODE POSITION
      dragged.style.transform = `translate3d(${getPosByScale(x)}px, ${getPosByScale(y)}px, 0px)`;
      
      const fromID = dragged.getAttribute('data-node');
      const toID = lastHovered.getAttribute('data-node');
      
      
      console.log('from', fromID, 'to', toID);
      
      lastHovered.classList.remove('hover');
      lastHovered = null;
    }

    if ( dragged !== null ) {

      

      dragged.classList.remove('active');
      dragged = null;
    }


    
    
  
}, false);