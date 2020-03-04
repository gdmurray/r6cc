import React, { Component } from "react";
import {Transformer } from "react-konva";

class TransformerComponent extends Component {
    constructor(props){
        super(props);
        this.checkNode = this.checkNode.bind(this);
    }
    componentDidMount() {
        this.checkNode();
    }
    componentDidUpdate() {
        this.checkNode();
    }

    checkNode() {
        const { selectedShape } = this.props;
        if (selectedShape) {
            const selectedNode = selectedShape.shapeRef.current;
            if (selectedNode === this.transformer.node()) {
                return;
            }
            if (selectedNode) {
                this.transformer.attachTo(selectedNode);
            } else {
                this.transformer.detach();
            }
        }else{
            this.transformer.detach();
        }
        this.transformer.getLayer().batchDraw();
        return;
    }

    render() {
        return (
            <Transformer
                ref={node => {
                    this.transformer = node;
                }}
            />
        );
    }
}

export default TransformerComponent;
