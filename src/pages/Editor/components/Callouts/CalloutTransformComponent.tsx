import React from "react";
import { Transformer as ITransformer } from "konva/types/shapes/Transformer";
import { Transformer } from "react-konva";
import MapEditRectCallout from "./MapEditRectCallout";
import MapEditPolygonCallout from "./MapEditPolygonCallout";
import { TOOLS } from "../../../../constants";

interface ICalloutTransformProps {
    selectedShape: MapEditRectCallout | MapEditPolygonCallout | null;
    tool: number;
}

export default class CalloutTransformComponent extends React.Component<
    ICalloutTransformProps,
    any
> {
    public transformer: React.RefObject<ITransformer>;

    constructor(props) {
        super(props);
        this.checkNode = this.checkNode.bind(this);
        this.transformer = React.createRef();
    }

    componentDidMount() {
        this.checkNode();
    }

    componentDidUpdate(
        prevProps: Readonly<any>,
        prevState: Readonly<any>,
        snapshot?: any
    ) {
        this.checkNode();
    }

    checkNode() {
        const { selectedShape, tool } = this.props;
        const transformer = this.transformer.current;
        if (transformer && tool === TOOLS.TRANSFORM) {
            if (selectedShape) {
                const selectedNode = selectedShape.shapeRef.current;
                if (selectedNode === transformer.getNode()) {
                    return;
                }
                if (selectedNode) {
                    transformer.attachTo(selectedNode);
                } else {
                    transformer.detach();
                }
            } else {
                transformer.detach();
            }
            const layer = transformer.getLayer();
            if (layer) {
                layer.batchDraw();
            }
        }

        return;
    }

    render() {
        return <Transformer ref={this.transformer} />;
    }
}
