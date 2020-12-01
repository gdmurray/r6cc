import React from "react";
import BaseMapView, {
    BaseMapProps,
    BaseMapState,
} from "../../../components/maps/BaseMapView";
import { Button, Dimmer, Loader } from "semantic-ui-react";
import { Group, Layer, Stage } from "react-konva";
import FloorImageV2 from "../../../components/maps/FloorImageV2";
import MapViewCallout from "./Callouts/MapViewCallout";
import styled from "@emotion/styled";
import { MENU_HEIGHT } from "../../../constants";

const _ = require("lodash");

interface MapViewCanvasState extends BaseMapState {
    centered: boolean;
    baseImageLoaded: boolean;
    preLoadedImages: HTMLImageElement[];
}

interface MapViewCanvasProps extends BaseMapProps {}

export default class MapViewCanvas extends BaseMapView<
    MapViewCanvasProps,
    MapViewCanvasState
> {
    getInitialState(): any {
        const initialState = super.getInitialState();
        return {
            ...initialState,
            centered: false,
            baseImageLoaded: true,
            preLoadedImages: [],
        };
    }

    constructor(props) {
        super(props);
    }

    // centerOnBuilding = () => {
    //     console.log("CENTERING ON BUILDING");
    //     const { center } = this.props.mapData;
    //
    //     const stage = this.stageRef.getStage();
    //     var x = stage.x();
    //     var y = stage.y();
    //     const { stageWidth, stageHeight } = this.state;
    //     console.log(stageWidth, stageHeight);
    //     var xFactor = stageWidth / DEFAULT_ZOOM_WIDTH;
    //     var yFactor = stageHeight / DEFAULT_ZOOM_HEIGHT;
    //
    //     stage.scale({ x: center.scale, y: center.scale });
    //     var centerX = Math.round(center.x, 4);
    //     var centerY = Math.round(center.y, 4);
    //     console.log("factors: ", xFactor, yFactor);
    //     console.log("stage: ", x, y);
    //     console.log("original: ", centerX, centerY);
    //
    //     var newX = centerX * xFactor;
    //     var newY = centerY * yFactor;
    //     console.log("new: ", newX, newY);
    //     this.setState({
    //         stageScale: Math.round(center.scale, 4),
    //         stageX: newX,
    //         stageY: newY,
    //         centered: true,
    //     });
    //     stage.x(newX);
    //     stage.y(newY);
    // };
    // imageLoadedCallback = () => {
    //     console.log("Image Loaded Callback");
    //     this.setState({
    //         baseImageLoaded: true,
    //     });
    //     this.checkParentSize();
    //     console.log("centered: ", this.state.centered);
    //     if (this.state.centered === false) {
    //         setTimeout(() => {
    //             //console.log("centering");
    //             //this.centerOnBuilding();
    //         }, 100);
    //     }
    // };

    componentWillReceiveProps(nextProps: Readonly<any>, nextContext: any) {
        const changedProps = _.reduce(
            this.props,
            function (result, value, key) {
                return _.isEqual(value, nextProps[key])
                    ? result
                    : result.concat(key);
            },
            []
        );
        console.log("changedProps: ", changedProps);
        changedProps.forEach((elem) => {
            console.log(nextProps[elem]);
        });
    }

    preloadImages() {
        let preloadedImages: HTMLImageElement[] = [];
        const { map } = this.props;
        const { short_code } = map;

        map.floors.forEach((floor) => {
            console.log(floor);
        });
        for (let i = 0; i < map.floors.length; i++) {
            preloadedImages[i] = new Image();
            preloadedImages[i].src =
                process.env.PUBLIC_URL +
                `/img/maps/${short_code}/${short_code}-${i}.png`;
        }
        console.log(preloadedImages);
    }

    componentDidMount() {
        this.preloadImages();

        this.setState({
            baseImageLoaded: true,
        });
    }

    imageLoadedCallback = () => {
        console.log("Callback");
        this.setState({
            baseImageLoaded: true,
        });
    };

    checkParentSize = () => {
        const layerRef = this.layerRef.current;
        if (layerRef) {
            const layer = layerRef.getLayer();
            const image = layer.children[0];
            // const width = image.getAttr("width");
            // const height = image.getAttr("height");
            const { stageWidth } = this.state;
            if (stageWidth !== window.innerWidth) {
                console.log(this.state);
                console.log("window changed");
                this.setState({
                    stageWidth: window.innerWidth,
                });
            }
        }
    };

    dragBoundaryFunc = (pos) => {
        const stageRef = this.stageRef.current;
        const imageObj = this.imageObj.current;
        if (stageRef && imageObj) {
            const stage = stageRef.getStage();

            const xScale = stage.scaleX();
            const yScale = stage.scaleY();

            const imgWidth = imageObj.state.width;
            const imgHeight = imageObj.state.height;
            const widthDiff = window.innerWidth - imgWidth;
            const heightDiff = window.innerHeight - MENU_HEIGHT - imgHeight;
            let x = pos.x;
            let y = pos.y;

            if (xScale > 1 || yScale > 1) {
                const divX = pos.x / xScale;
                const divY = pos.y / yScale;

                const scaledImgWidth = imgWidth * xScale;
                const scaledWindowWidth = window.innerWidth - scaledImgWidth;

                const scaledImgHeight = imgHeight * yScale;
                const scaledWindowHeight =
                    window.innerHeight - MENU_HEIGHT - scaledImgHeight;

                if (divX >= 0) {
                    x = 0;
                }

                if (x < scaledWindowWidth) {
                    x = scaledWindowWidth;
                }

                if (divY >= 0) {
                    y = 0;
                }

                if (y < scaledWindowHeight) {
                    y = scaledWindowHeight;
                }

                return {
                    x: x,
                    y: y,
                };
            }

            if (x < widthDiff) {
                x = widthDiff;
            }
            if (x > 0) {
                x = 0;
            }
            if (y < -heightDiff) {
                y = -heightDiff;
            }
            if (y > 0) {
                y = 0;
            }
            return {
                x: x,
                y: y,
            };
        }
        return {
            x: pos.x,
            y: pos.y,
        };
    };

    handleClick = (e) => {
        const stageRef = this.stageRef.current;
        if (stageRef) {
            //console.log(this.getAbsolutePosition());
            console.log(stageRef.getStage().getPointerPosition());
            const trans = this.getTranslatedPosition();
            console.log(this.convertPointToCanvasPosition(trans));
        }
    };

    render() {
        const imageObj = this.imageObj.current;
        const imgWidth = imageObj ? imageObj.state.width : 1440;
        const imgHeight = imageObj ? imageObj.state.height : 1000;
        const { activeCallouts } = this.props;
        return (
            <div>
                <Dimmer active={!this.state.baseImageLoaded}>
                    <Loader />
                </Dimmer>
                <Stage
                    ref={this.stageRef}
                    draggable={true}
                    dragBoundFunc={this.dragBoundaryFunc}
                    width={window.innerWidth}
                    height={this.getInnerHeight()}
                    onWheel={this.handleScrollWheel}
                    scaleX={this.state.stageScale}
                    scaleY={this.state.stageScale}
                    x={this.state.stageX}
                    y={this.state.stageY}
                    onContentClick={this.handleClick}
                >
                    <Layer ref={this.layerRef}>
                        <FloorImageV2
                            ref={this.imageObj}
                            map={this.props.map}
                            floor={this.props.activeFloor}
                            canvasHeight={this.state.stageHeight}
                            canvasWidth={this.state.stageWidth}
                            imageLoadedCallback={this.imageLoadedCallback}
                        />
                    </Layer>
                    <Layer>
                        {activeCallouts.map((shape, index) => {
                            const layerRef = this.layerRef.current;
                            if (layerRef) {
                                return (
                                    <Group key={"group-" + shape.id}>
                                        <MapViewCallout
                                            activeFloor={this.props.activeFloor}
                                            imageWidth={imgWidth}
                                            imageHeight={imgHeight}
                                            imageLayer={layerRef}
                                            callout={shape}
                                        />
                                    </Group>
                                );
                            }
                            return null;
                        })}
                    </Layer>
                </Stage>
            </div>
        );
    }
}

// const ViewerDetailOverlay = () => {
//     const DetailOverlay = styled.div({
//         float: "left",
//         position: "absolute",
//         zIndex: 99,
//     });
//     return (
//         <DetailOverlay>
//             <div className="floor-controls">
//                 <Button>Up</Button>
//                 <Button>Down</Button>
//             </div>
//         </DetailOverlay>
//     );
// };
