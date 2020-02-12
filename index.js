import React from 'react';
import ReactDOM from 'react-dom';
import GraphNavigator from './components/GraphNavigator';
import './assets/App.scss';
import fakeData from './connectables.json';
import LeftList from './components/LeftList';
import BottomList from './components/BottomList';
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
    posX: 1000,
    posY: 800,
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
    <div>
      <div style={{height: 80, backgroundColor: 'tomato'}}></div>
<div className="App">
      <LeftList />
      <div className="MainContainer">

        <GraphNavigator connectables={fakeData.connectables} />
        <BottomList />
      </div>
    </div>
    </div>
  );
}

ReactDOM.render(<App />, document.querySelector('#root'));