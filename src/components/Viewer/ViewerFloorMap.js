import React, { Component } from "react";
import { Stage, Layer, Rect, Text, Group, Line } from "react-konva";
import { FloorImage } from "../Maps";
import { DEFAULT_ZOOM_WIDTH, DEFAULT_ZOOM_HEIGHT } from "../../constants";
import HotSpotComponent from "./HotSpotComponent";

import {
  Dimmer, Loader
} from "semantic-ui-react";


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
      baseImageLoaded: false,

      centered: false,
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

  centerOnBuilding = () => {
    console.log("CENTERING ON BUILDING");
    const { center } = this.props.mapData;

    const stage = this.stageRef.getStage();
    var x = stage.x();
    var y = stage.y();
    const { stageWidth, stageHeight } = this.state;
    var xFactor = stageWidth / DEFAULT_ZOOM_WIDTH;
    var yFactor = stageHeight / DEFAULT_ZOOM_HEIGHT;

    stage.scale({ x: center.scale, y: center.scale });
    var centerX = Math.round(center.x, 4);
    var centerY = Math.round(center.y, 4);
    console.log("factors: ", xFactor, yFactor);
    console.log("stage: ", x, y);
    console.log("original: ", centerX, centerY);

    var newX = (centerX * xFactor)
    var newY = (centerY * yFactor)
    console.log("new: ", newX, newY);
    this.setState({
      stageScale: Math.round(center.scale, 4),
      stageX: newX,
      stageY: newY,
      centered: true
    })
    stage.x(newX);
    stage.y(newY);
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
    document.addEventListener("keydown", this._handleKeyDown);
    this.preloadImages();
    this.sizeInterval = setInterval(() => {
      this.checkParentSize();
    }, 750);
    this.checkParentSize();
    //this.loadCallouts();
  }

  preloadImages() {
    console.log("PRELOADING IMAGES");
    var img = []
    const { map } = this.props;
    for (var i = 1; i < this.props.mapData.floors.length; i++) {
      img[i] = new Image();
      img[i].src = process.env.PUBLIC_URL + `/img/maps/${map}/${map}-${i}.png`
    }
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this._handleKeyDown);
    clearInterval(this.sizeInterval);
  }

  checkParentSize = () => {
    if (this.layerRef) {
      const layer = this.layerRef.getLayer();
      const image = layer.children[0];
      const width = image.getAttr("width");
      const height = image.getAttr("height");
      const { stageWidth, imageWidth, imageHeight } = this.state;
      if (
        stageWidth !== window.innerWidth ||
        imageWidth !== width ||
        imageHeight !== height
      ) {
        console.log("window changed");
        this.setState({
          stageWidth: window.innerWidth,
          imageWidth: width,
          imageHeight: height
        })
      }
    }
  }

  imageLoadedCallback = () => {
    this.setState({
      baseImageLoaded: true,
    })
    this.checkParentSize();
    console.log("centered: ", this.state.centered);
    if (this.state.centered === false) {
      setTimeout(() => {
        console.log("centering");
        this.centerOnBuilding();
      }, 100)
    }
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
      case 67:
        this.centerOnBuilding();
        return;
      case 88:
        var stage = this.stageRef.getStage();
        var x = stage.x();
        var y = stage.y();
        var scale = stage.scaleX();
        console.log(this.state.stageWidth);
        console.log(this.state.stageHeight);
        console.log(`"center": {"scale": "${scale}", "x": "${x}", "y": "${y}"}`)
        return;
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
        <Dimmer active={!this.state.baseImageLoaded}>
          <Loader />
        </Dimmer>
        <Stage
          ref={node => {
            this.stageRef = node;
          }}
          visible={this.state.baseImageLoaded}
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