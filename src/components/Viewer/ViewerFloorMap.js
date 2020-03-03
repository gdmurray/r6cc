import React, { Component } from "react";
import { Stage, Layer, Rect, Text, Group, Line } from "react-konva";
import { FloorImage } from "../Maps";
import HotSpotComponent from "./HotSpotComponent";

class ViewerFloorMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stageWidth: window.innerWidth,
      stageHeight: window.innerHeight,
      stageScale: 1,
      stageX: 0,
      stageY: 0,
      floorCallouts: [],

      dragClick: false,
    }
  }

  componentWillReceiveProps(props) {
    if (this.props.callouts.length !== props.callouts.length || this.state.floorCallouts.length === 0) {
      // Callouts Changed... 
      this.setState({
        floorCallouts: props.callouts
      });
    }
  }

  handleWheel = e => {
    /*
      Handles Scaling on scroll
    */
    e.evt.preventDefault();

    //Scale Factor (only change by 0.0X)
    const scaleBy = 1.04;
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

  handleMouseDown = e => {
    // Some kind of user display function
  }

  componentDidMount() {
    window.addEventListener("resize", this.checkParentSize);
    document.addEventListener("keydown", this._handleKeyDown);
    this.checkParentSize();
    //this.loadCallouts();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.checkParentSize);
    document.removeEventListener("keydown", this._handleKeyDown);
  }

  checkParentSize = () => {
    const layer = this.layerRef.getLayer();
    const image = layer.children[0];
    const width = image.getAttr("width");
    const height = image.getAttr("height");
    this.setState({
      stageWidth: window.innerWidth,
      imageWidth: width,
      imageHeight: height
    })
  };

  imageLoadedCallback = () => {
    this.checkParentSize();
  }

  handleMouseDown = (e) => {
    /*if ("which" in e.evt)  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
      if (e.evt.which === 3) {
        console.log("Dragclick: ", e);
        var stage = this.stageRef.getStage();
        stage.draggable(true);
        //console.log(this.stageRef.getStage());

        this.setState({
          dragClick: true
        })
      }
      else if ("button" in e.evt)  // IE, Opera 
        if (e.evt.button === 2) {
          console.log("Dragclick: ", e);
          this.setState({
            dragClick: true
          })
        }*/
  }

  /*handleMouseUp = (e) => {
    var stage = this.stageRef.getStage();
    stage.draggable(false);
  }*/

  selectShape = (shape) => {
    console.log("shape selected", shape);
  }

  /*handleContextMenu = (e) => {
    e.evt.preventDefault();
  }*/

  _handleKeyDown = event => {
    switch (event.keyCode) {
      case 80:
        console.log(this.getTranslatedPosition())
        return
      default:
        return true;
    }
  }

  getTranslatedPosition = () => {
    /*
        Translates the position of the cursor to its x,y coordinates on the map
    */
    var absPos = this.getAbsolutePosition();
    console.log("abs pos");
    var imageLayer = this.layerRef.getLayer();
    const image = imageLayer.children[0];
    const imageWidth = image.getAttr("width");
    const imageHeight = image.getAttr("height");
    const newX = (absPos.x / imageWidth) * 2560;
    const newY = (absPos.y / imageHeight) * 1440;
    return { x: newX, y: newY }
  }

  getAbsolutePosition = () => {
    /*
        Gets Position of mouse on canvas
    */
    const stage = this.stageRef.getStage();
    const point = stage.getPointerPosition();
    var transform = this.layerRef.getAbsoluteTransform().copy();
    transform.invert();
    var absPos = transform.point(point);
    return absPos;
}

  render() {
    return (
      <div ref={node => {
        this.container = node;
      }}>
        <Stage
          ref={node => {
            this.stageRef = node;
          }}
          draggable={true}
          width={window.innerWidth}
          height={window.innerHeight}
          onWheel={this.handleWheel}
          scaleX={this.state.stageScale}
          scaleY={this.state.stageScale}
          x={this.state.stageX}
          y={this.state.stageY}
          //onContextMenu={this.handleContextMenu}
          onMouseDown={this.handleMouseDown}
          onMouseUp={this.handleMouseUp}>
          <Layer ref={node => { this.layerRef = node }}>
            <FloorImage ref={node => { this.imageObj = node }}
              map={this.props.map}
              floor={this.props.activeFloor}
              canvasHeight={this.state.stageHeight}
              canvasWidth={this.state.stageWidth}
              imageLoadedCallback={this.imageLoadedCallback} />
          </Layer>
          <Layer ref={node => { this.shapeLayerRef = node }} >
            {this.state.floorCallouts.map((shape, index) => {
              return (
                <Group key={'group-' + index}>
                  <HotSpotComponent
                    activeFloor={this.props.activeFloor}
                    imageWidth={this.state.imageWidth}
                    imageHeight={this.state.imageHeight}
                    imageLayer={this.layerRef}
                    onSelect={this.selectShape}
                    {...shape}
                  />

                </Group>

              );
            })}
          </Layer>
        </Stage>
      </div>
    )
  }
}

export default ViewerFloorMap;