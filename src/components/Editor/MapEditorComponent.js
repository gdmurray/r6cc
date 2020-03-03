import React, { Component } from "react";
import {
  Menu, Icon, Segment, Popup
} from "semantic-ui-react";
import { TOOLS, KEYCODES } from "../../constants";
import EditorFloorMap from "./EditorFloorMap";

let _findIndex = require('lodash/findIndex');


export default class MapEditorComponent extends React.Component {
  constructor(props) {
    super(props);
    this._cache = {}

    this.state = {
      edit: false,
      tool: 0,
      updatedCallouts: [],
      updatedCalloutIds: [],
      selectedId: null,

      activeFloor: 0,
      activeCallouts: [],

      calloutDeleted: false
    }
  }
  
  componentDidMount() {
    document.addEventListener("keydown", this._handleKeyDown);
    this.getCallouts();
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this._handleKeyDown);
  }

  componentDidUpdate(prevProps, prevState) {
    const { activeFloor } = this.state;
    if (prevState.activeFloor !== activeFloor) {
      this.props.getCallouts(this.props.map, activeFloor);
    }
  }
  calloutsFloorChanged(prevCallouts, callouts) {
    if (prevCallouts.length > 0 && callouts.length > 0) {
      if (prevCallouts[0].floor !== callouts[0].floor) {
        return true
      }
    }
    return false;
  }

  getUpdatedCalloutIds = () => {
    return this.state.updatedCalloutIds;
  }

  getCallouts = () => {
    this.props.getCallouts(this.props.map, this.state.activeFloor);
  }

  handleToolChange = (tool) => {
    this.setState({
      tool: tool,
      edit: true
    });
  }


  saveCallouts = () => {
    const { updatedCallouts, activeFloor } = this.state;

    let newCallouts = updatedCallouts.filter(callout => callout.id.includes("tmp-"));
    let calloutsToUpdate = updatedCallouts.filter(callout => !callout.id.includes("tmp-"));

    // Need to delete Id so that Firebase generates new id
    newCallouts.forEach(function (v) {
      delete v.id;
      // Round any points to whole numbers
      if (v.shape.type === "rect") {
        v.shape.values = v.shape.values.map(val => Math.round(val))
      }
    });

    console.log("INSERTED CALLOUTS: ", newCallouts);
    this.props.insertCallouts(newCallouts);

    console.log("CALLOUTS TO UPDATE: ", calloutsToUpdate);
    this.props.updateCallouts(calloutsToUpdate);

    this.setState({
      updatedCallouts: []
    })
    
    this.getCallouts();
  }

  insertCalloutCallback = (callout) => {
    this.setState({
      updatedCallouts: this.state.updatedCallouts.concat(callout)
    })
  }

  selectedIdCallback = (id) => {
    console.log("SELECTED ID CALLBACK: ", id);
    this.setState({
      selectedId: id
    })
  }

  handleDelete = () => {
    const { selectedId } = this.state;
    if (selectedId !== null) {
      console.log(selectedId);
      if (!selectedId.includes("tmp-")) {
        this.props.deleteCallout(selectedId);
        this.setState({
          calloutDeleted: selectedId,
          selectedId: null
        })
        console.log(this.state.activeCallouts);
      }else{
        this.setState({
          calloutDeleted: selectedId,
          selectedId: null
        })
        console.log("deleting not committed shape");
        console.log(this.state);
      }
    }
  }

  updateCalloutCallback = (callout) => {
    console.log("Update Callout", callout);
    var callouts = [...this.state.updatedCallouts];
    var calloutIndex = _findIndex(callouts, { id: callout.id });
    console.log(calloutIndex);
    if (calloutIndex !== -1) {
      callouts[calloutIndex] = callout;
      this.setState({
        updatedCallouts: callouts
      })
    } else {
      this.setState({
        updatedCallouts: this.state.updatedCallouts.concat(callout)
      })
    }
  }

  deletedCalloutCallback = (callout) => {
    this.setState({
      calloutDeleted: false
    });
    console.log("finished delete of: ", callout);
  }

  _handleKeyDown = event => {
    var { activeFloor } = this.state;
    switch (event.keyCode) {
      case KEYCODES.ARROW_UP:
        event.preventDefault();
        const { mapData } = this.props;
        if (activeFloor < (mapData.floors.length - 1)) {
          this.setState({
            activeFloor: this.state.activeFloor + 1
          })
        }
        return
      case KEYCODES.ARROW_DOWN:
        event.preventDefault();
        if (activeFloor > 0) {
          this.setState({
            activeFloor: this.state.activeFloor - 1
          })
        }
        return
      default:
        return true;
    }
  }


  render() {
    const { tool, edit } = this.state;
    return (
      <div className="edit-map-pane">
        <div className="map-pane">
          <Menu icon style={{ borderRadius: '0px' }}>
            <Menu>
              <p>Mode</p>
              <Menu.Item
                active={!edit} onClick={() => this.setState({ edit: false })}
                name='move'>
                <Popup
                  trigger={<Icon name='move' />}
                  content="Move Canvas"
                  position="top left"
                />
              </Menu.Item>
              <Menu.Item
                active={edit} onClick={() => this.setState({ edit: true })}
                name='Edit'>
                <Popup
                  trigger={<Icon name='pencil square' />}
                  content="Edit Canvas"
                  position="top center"
                />
              </Menu.Item>
            </Menu>
            <Menu>
              <p>Draw</p>
              <Menu.Item
                active={tool === TOOLS.RECTANGLE && edit}
                onClick={() => this.handleToolChange(TOOLS.RECTANGLE)}
                name='Rectangle Tool'>
                <Popup
                  trigger={<Icon name='square outline' />}
                  content="Draw Rectangle"
                  position="top center" />
              </Menu.Item>
              <Menu.Item
                active={tool === TOOLS.POLYGON && edit}
                onClick={() => this.handleToolChange(TOOLS.POLYGON)}
                name='Polygon Tool'>
                <Popup
                  trigger={<Icon name='pencil' />}
                  content="Draw Polygon"
                  position="top center" />
              </Menu.Item>
            </Menu>
            <Menu>
              <p>Modify</p>
              <Menu.Item
                active={tool === TOOLS.TRANSFORM && edit}
                onClick={() => this.handleToolChange(TOOLS.TRANSFORM)}
                name='Transform Tool'>
                <Popup
                  trigger={<Icon name='expand arrows alternate' />}
                  content="Transform Tool"
                  position="top center" />
              </Menu.Item>
              <Menu.Item
                active={tool === TOOLS.POINT_TRANSFORM && edit}
                onClick={() => this.handleToolChange(TOOLS.POINT_TRANSFORM)}
                name='Point Transform Tool'>
                <Popup
                  trigger={<Icon name='dot circle outline' />}
                  content="Edit Polygon"
                  position="top center" />
              </Menu.Item>
              <Menu.Item
                active={tool === TOOLS.EDIT && edit}
                onClick={() => this.handleToolChange(TOOLS.EDIT)}
                name="Edit Tool">
                <Popup
                  trigger={<Icon name='edit outline' />}
                  content="Edit Callout"
                  position="top center" />
              </Menu.Item>
            </Menu>
            <Menu>
              <p>Actions</p>
              <Menu.Item
                onClick={() => this.handleDelete()}
                name='Delete tool'>
                <Popup
                  trigger={<Icon name='trash alternate' />}
                  content="Delete Callout"
                  position="top center"
                />
              </Menu.Item>
              <Menu.Item
                onClick={() => this.saveCallouts()}
                name='Save'>
                <Popup
                  trigger={<Icon name='save' />}
                  content="Save Callouts"
                  position="top center"
                />

              </Menu.Item>
            </Menu>
          </Menu>
        </div>
        <div>
          <EditorFloorMap
            {...this.props}
            editMode={edit} tool={tool}
            
            insertCalloutCallback={this.insertCalloutCallback}
            updateCalloutCallback={this.updateCalloutCallback}
            selectedIdCallback={this.selectedIdCallback}
            getUpdatedIdsCallback={this.getUpdatedCalloutIds}
            getCalloutsCallback={this.getCallouts}

            updatedCallouts={this.state.updatedCallouts}
            activeFloor={this.state.activeFloor}
            activeCallouts={this.state.activeCallouts}

            calloutDeleted={this.state.calloutDeleted}
            deletedCalloutCallback={this.deletedCalloutCallback}
             />
        </div>
      </div>
    )
  }
}

/*
<R6Map {...this.props}
            editMode={edit} tool={tool}
            insertCalloutCallback={this.insertCalloutCallback}
            updateCalloutCallback={this.updateCalloutCallback}
            selectedIdCallback={this.selectedIdCallback}
            updatedCallouts={this.state.updatedCallouts}
            getUpdatedIdsCallback={this.getUpdatedCalloutIds} />
            */