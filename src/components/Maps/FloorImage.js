/*
FloorImage.js

This Component handles the rendering of the floor image
Caches the images as theyre loaded for performance when switching floors.


*/
import React, { Component } from "react";
import { Stage, Layer, Image, Text } from 'react-konva';

export default class FloorImage extends Component {
    cache = {

    }
    state = {
        image: null,
        loaded: false,
        aspectRatio: null,
        width: null,
        height: null,
        originalWidth: null,
        originalHeight: null,
    }

    componentDidMount() {
        const { map, floor } = this.props;
        this.loadImage(map, floor);
    }

    componentWillUnmount() {
        this.image.removeEventListener('load', this.handleLoad);
    }

    componentWillReceiveProps(newprops) {
        if (this.props.floor !== newprops.floor) {
            this.loadImage(newprops.map, newprops.floor);
            this.imageNode.getLayer().batchDraw();
            
        }else if(this.props.canvasWidth !== newprops.canvasWidth){
            // If the Canvas Width has Changed, recalculate image size
            let width = newprops.canvasWidth;
            let { aspectRatio, height } = this.calculateHeight(this.image, width);
            this.setState({
                width: width,
                height: height
            })
        }
    }

    getImage(){
        return this.image
    }
    calculateHeight(image, width) {
        let aspectRatio = (image.width / image.height);
        let height = Math.round((width / aspectRatio));
        return { aspectRatio, height }
    }
    loadImage(map, floor) {
        // save to "this" to remove "load" handler on unmount
        if (this.cache[floor] === undefined) {
            this.image = new window.Image();
            this.image.src = process.env.PUBLIC_URL + `/img/maps/${map}/${map}-${floor}.png`
            this.image.addEventListener('load', this.handleLoad);
        } else {
            console.log("Cache hit: ", this.cache[floor]);
            this.image = this.cache[floor];
            let width = this.props.canvasWidth;
            let { aspectRatio, height } = this.calculateHeight(this.image, width);
            this.setState({
                image: this.image,
                loaded: true,
                aspectRatio: aspectRatio,
                width: width,
                height: height
            })
        }
    }

    handleLoad = () => {
        // after setState react-konva will update canvas and redraw the layer
        // because "image" property is changed
        console.log(`Setting ${this.props.floor} in cache`);
        this.cache[this.props.floor] = this.image;
        let width = this.props.canvasWidth;
        let { aspectRatio, height } = this.calculateHeight(this.image, width);
        this.setState({
            image: this.image,
            loaded: true,
            aspectRatio: aspectRatio,
            width: width,
            height: height,
        });
        this.props.imageLoadedCallback();

        // if you keep same image object during source updates
        // you will have to update layer manually:
        // this.imageNode.getLayer().batchDraw();
    };

    render() {
        if (this.image) {
            //let aspectRatio = (this.image.width / this.image.height);
            //let width = this.props.canvasWidth;
            //let height = Math.round(( width / aspectRatio));
            return (
                <Image
                    //x={this.props.x}
                    //y={this.props.y}
                    name={"mapImg"}
                    width={this.state.width}
                    height={this.state.height}
                    image={this.state.image}
                    ref={node => {
                        this.imageNode = node;
                    }}
                />
            );
        } else {
            return (
                <Text text="Loading" />
            )
        }

    }
}