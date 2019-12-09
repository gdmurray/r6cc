import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {
  Menu, Container, Segment, Icon
} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css'
import { MapInteractionCSS, MapInteraction } from 'react-map-interaction';
import Konva from "konva";
import { Stage, Layer, Rect, Text, Image, Group } from "react-konva";
import useImage from "use-image";
//import {Surface, Layer, Text, Image, } from "react-canvas";
import { useStrictMode } from 'react-konva';
import myData from './callouts.json';

useStrictMode(true);


const FloorImage = () => {
  const [image] = useImage(process.env.PUBLIC_URL + "/img/kanal_1f.png");
  return <Image image={image} />;
};

// If you want to have control over the scale and translation,
// then use the `scale`, `translation`, and `onChange` props.
class Hotspot extends Component {
  /*constructor(props){
    super(props);


  }
  render() {
    if(this.)
  */
}

class FloorMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stageScale: 1,
      stageX: 0,
      stageY: 0,
      layerX: 0,
      layerY: 0,
      newRect: [{}],
      rects: [{ x: 200, y: 200, w: 50, h: 50 },]
    }
  }

  handleWheel = e => {
    e.evt.preventDefault();

    const scaleBy = 1.01;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale
    };

    const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    stage.scale({ x: newScale, y: newScale });

    this.setState({
      stageScale: newScale,
      stageX:
        -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
      stageY:
        -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale
    });
  };

  handleDoubleClick = e => {
    if (this.props.editMode) {
      const stage = this.stageRef.getStage();
      const point = stage.getPointerPosition();
      console.log(point);
      //console.log("IN Editmode");
    }
  }

  handleMouseDown = () => {
    if (this.props.editMode) {
      if (this.props.tool == 0) {
        this._drawing = true;
        const stage = this.stageRef.getStage();
        const point = stage.getPointerPosition();
        var transform = this.layerRef.getAbsoluteTransform().copy();
        transform.invert();
        var absPos = transform.point(point);
        this.setState({
          newRect: [{ x: absPos.x, y: absPos.y, w: 10, h: 10 }]
        });
      }
    }
  }

  handleMouseMove = e => {
    if (!this._drawing) {
      return;
    }

    if (this.props.editMode) {
      if (this.props.tool == 0) {
        const stage = this.stageRef.getStage();
        const point = stage.getPointerPosition();
        const { newRect } = this.state;
        var rect = newRect[0];
        var transform = this.layerRef.getAbsoluteTransform().copy();
        transform.invert();
        var absPos = transform.point(point);

        var newHeight = absPos.y - rect.y;
        var newWidth = absPos.x - rect.x;
        if(newHeight > 5 && newWidth > 5){
          rect.w = newWidth;
          rect.h = newHeight;
          this.setState({
            newRect: [rect]
          })
        }
      }
    }
  }

  handleMouseUp = () => {
    if (this.props.editMode) {
      if (this.props.tool == 0) {
        this._drawing = false;
        var { newRect, rects } = this.state;
        var rect = newRect.pop();
        console.log(rect);
        this.setState({
          newRect: [{}],
          rects: rects.concat(rect)
        })
      }
    }
  };

  render() {
    return (
      <div
        className={this.props.editMode ? 'edit-mode' : ''}
      >
        <Stage
          ref={node => {
            this.stageRef = node;
          }}
          width={1485}
          height={964}
          onWheel={this.handleWheel}
          scaleX={this.state.stageScale}
          scaleY={this.state.stageScale}
          x={this.state.stageX}
          y={this.state.stageY}
          onContentDblclick={this.handleDoubleClick}
          onContentMousedown={this.handleMouseDown}
          onContentMousemove={this.handleMouseMove}
          onContentMouseup={this.handleMouseUp}  >
          <Layer ref={node => {
            this.layerRef = node;
          }}
            draggable={!this.props.editMode}>
            <FloorImage />
            {this.state.newRect.map((shape, index) => {
                if(this._drawing){
                return (
                  <Rect
                    x={shape.x}
                    y={shape.y}
                    width={shape.w}
                    height={shape.h}
                    fill="red"
                    shadowBlur={10}
                  />
                );
                }
              })}
            <Group>
              {this.state.rects.map((shape, index) => {
                return (
                  <Rect
                    x={shape.x}
                    y={shape.y}
                    width={shape.w}
                    height={shape.h}
                    fill="red"
                    shadowBlur={10}
                  />
                );
              })}
            </Group>
          </Layer>
        </Stage>
      </div>
    )
  }
}

class R6Map extends Component {
  render() {
    return (
      <FloorMap {...this.props} />
    )
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      edit: false,
      tool: 0
    }
  }
  tools = ["rectangle", "pencil"]

  handleEditChange = () => {
    const { edit } = this.state;
    this.setState({
      edit: !edit
    })
  }

  handleToolChange = (tool) => {
    console.log("tool changed: ", tool);
    this.setState({
      tool: tool
    });
  }


  render() {
    return (
      <div className="App">
        <Segment inverted style={{ borderRadius: '0px' }}>
          <Menu inverted pointing secondary>
            <Menu.Item
              name='R6CC'
            />
            <Menu.Item active={!this.state.edit} onClick={this.handleEditChange}>
              <Icon name='move' />
            </Menu.Item>
            <Menu.Item active={this.state.edit} onClick={this.handleEditChange}>
              <Icon name='pencil square' />
            </Menu.Item>
            <Menu.Item active={this.state.tool == 0 && this.state.edit} onClick={() => this.handleToolChange(0)}>
              <Icon name='square outline' />
            </Menu.Item>
            <Menu.Item active={this.state.tool == 1 && this.state.edit} onClick={() => this.handleToolChange(1)}>
              <Icon name='pencil' />
            </Menu.Item>
            <Menu.Item >
              <Icon name='check' />
            </Menu.Item>
          </Menu>
        </Segment>
        <R6Map editMode={this.state.edit} tool={this.state.tool} />
      </div>
    )
  }
}

export default App;
