import React, {Component} from 'react';


export default class NodeWrapper extends Component{

  constructor(props) {
    super(props);
    this.external_update_state_function = this.updateState.bind(this);
    this.external_onOverEvent = this.onOverEvent.bind(this);
    this.external_onClickEvent = this.onClickEvent.bind(this, true);
    this.external_onUnselectedEvent = this.onClickEvent.bind(this, false);

    // TODO add a call for CanvasMinimap
    // use the benefit of rendering loop
  }

  updateState(evt) {
    console.log('calling', evt);
  }

  onOverEvent() {
    this.props.onOver();
  }

  onClickEvent(state) {
    // console.log(this.props.onSelect);
    // return;
    if (state) {
      this.props.onSelect();
    } else {
      this.props.onUnselect();
    }
  }

  shouldComponentUpdate(nextProps ) {
    return true;
    // return nextProps.diffRender !== this.props.diffRender;
    // return (JSON.stringify(nextProps.diffRender) !== JSON.stringify(this.props.diffRender));
  }

  render() {
    return this.props.children;
  }
}