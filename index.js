import React from 'react';
import ReactDOM from 'react-dom';
import GraphNavigator from './components/GraphNavigator';
import './assets/App.scss';

const fakeConnectable = [
  {
    '@id': '/nodes/99',
    '@type': 'Node',
    label: null,
    id: 99,
    name: '',
    description: '',
    color: null,
    posX: 0,
    posY: 0,
    posZ: 262,
    outputLinks: [],
    inputLinks: [],
    mediaType: '/media_types/2',
    graphPos: {
      x: 0,
      y: 0,
    },
    isRoot: true,
    idx: 0,
    tokenUpdate: 0,
  },
  {
    '@id': '/nodes/100',
    '@type': 'Node',
    label: null,
    id: 100,
    name: '',
    description: '',
    color: null,
    posX: 400,
    posY: 400,
    posZ: 260,
    outputLinks: [],
    inputLinks: [],
    mediaType: '/media_types/2',
    graphPos: {
      x: 100,
      y: 100,
    },
    isRoot: false,
    idx: 1,
    tokenUpdate: 0,
  },
];

const App = () => {
  return (
    <div className="App">
      <GraphNavigator connectables={fakeConnectable} />
    </div>
  );
}

ReactDOM.render(<App />, document.querySelector('#root'));