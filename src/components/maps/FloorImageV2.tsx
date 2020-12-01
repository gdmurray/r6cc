/*
FloorImage.js

This Component handles the rendering of the floor image
Caches the images as theyre loaded for performance when switching floors.


*/
import React, { Component } from "react";
import { Image as KonvaImage, Text } from "react-konva";
import { Image } from "konva/types/shapes/Image";

interface FloorImageState {
    image: ImageType;
    loaded: boolean;
    width: number;
    height: number;
    aspectRatio: number;
    originalWidth: number;
    originalHeight: number;
}

type ImageType =
    | HTMLImageElement
    | SVGImageElement
    | HTMLVideoElement
    | HTMLCanvasElement
    | OffscreenCanvas
    | undefined;

export default class FloorImageV2 extends Component<any, FloorImageState> {
    public imageNode: React.RefObject<Image>;
    public image: ImageType;
    cache = {};

    componentDidMount() {
        const { map, floor } = this.props;
        console.log(map);
        this.loadImage(map.short_code, floor);
    }

    constructor(props) {
        super(props);
        this.state = {
            image: undefined,
            loaded: false,
            aspectRatio: 0,
            width: 0,
            height: 0,
            originalWidth: 0,
            originalHeight: 0,
        };
        this.imageNode = React.createRef();
    }

    componentWillUnmount() {
        if (this.image) {
            this.image.removeEventListener("load", this.handleLoad);
        }
    }

    componentWillReceiveProps(newprops) {
        if (this.props.floor !== newprops.floor) {
            const { short_code } = newprops.map;
            this.loadImage(short_code, newprops.floor);
            const imageNode = this.imageNode.current;
            if (imageNode) {
                const layer = imageNode.getLayer();
                if (layer) {
                    layer.batchDraw();
                }
            }
            console.log("Drawing");
        } else if (this.props.canvasWidth !== newprops.canvasWidth) {
            // If the Canvas Width has Changed, recalculate image size
            let width = newprops.canvasWidth;
            let { aspectRatio, height } = this.calculateHeight(
                this.image,
                width
            );
            this.setState({
                width: width,
                height: height,
            });
        }
    }

    getImage() {
        return this.image;
    }

    calculateHeight(image, width) {
        let aspectRatio = image.width / image.height;
        let height = Math.round(width / aspectRatio);
        return { aspectRatio, height };
    }

    calculateWidth(image, height) {
        let aspectRatio = image.width / image.height;
        let width = Math.round(height / aspectRatio);
        return { aspectRatio, width };
    }

    loadImage(map, floor) {
        console.log("Image Load");
        console.log(map);
        // save to "this" to remove "load" handler on unmount
        if (this.cache[floor] === undefined) {
            this.image = new window.Image();
            this.image.src =
                process.env.PUBLIC_URL + `/img/maps/${map}/${map}-${floor}.png`;
            this.image.addEventListener("load", this.handleLoad);
        } else {
            console.log("Cache hit: ", this.cache[floor]);
            this.image = this.cache[floor];
            // let width = this.props.canvasWidth;
            // let { aspectRatio, height } = this.calculateHeight(
            //     this.image,
            //     width
            // );
            // console.log(width, height);
            this.setState({
                image: this.image,
                loaded: true,
                // aspectRatio: aspectRatio,
                // width: width,
                // height: height,
            });
        }
    }

    handleLoad = () => {
        // after setState react-konva will update canvas and redraw the layer
        // because "image" property is changed
        console.log("HANDLE LOAD CALLED");
        if (this.props.floor in this.cache) {
            console.log("Image is in cache");
        }

        this.cache[this.props.floor] = this.image;
        const image = this.image;
        if (image) {
            let width = image.width as number;
            let height = image.height as number;
            let aspectRatio = width / height;
            let { canvasWidth, canvasHeight } = this.props;
            if (height > canvasHeight) {
                console.log(
                    "Height is larger than canvas... set height to canvas"
                );
                const scaleRatio = canvasHeight / height;
                // console.log("Before: ", width);
                width = width * scaleRatio;
                height = canvasHeight;
                // console.log("After: ", width);
            }
            if (width < canvasWidth) {
                console.log("Width less than canvas");
                const scaleRatio = canvasWidth / width;
                height = height * scaleRatio;
                width = canvasWidth;
            }
            // console.log(this.props);
            this.setState({
                image: this.image,
                loaded: true,
                aspectRatio: aspectRatio,
                width: width,
                height: height,
            });
            this.props.imageLoadedCallback();
        }

        // if you keep same image object during source updates
        // you will have to update layer manually:
        const imageNode = this.imageNode.current;
        if (imageNode) {
            const layer = imageNode.getLayer();
            if (layer) {
                layer.batchDraw();
            }
        }
    };

    render() {
        if (this.image) {
            //let aspectRatio = (this.image.width / this.image.height);
            //let width = this.props.canvasWidth;
            //let height = Math.round(( width / aspectRatio));
            return (
                <KonvaImage
                    //x={this.props.x}
                    //y={this.props.y}
                    name={"mapImg"}
                    width={this.state.width}
                    height={this.state.height}
                    image={this.image}
                    ref={this.imageNode}
                />
            );
        } else {
            return <Text text="Loading" />;
        }
    }
}
