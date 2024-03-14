import { Rect } from "react-konva";
import React from "react";
import CalculatedText from "../../../../components/callouts/CalculatedText";
import BaseRectCallout from "../../../../components/callouts/BaseRectCallout";
import {
    BaseRectProps,
    BaseRectState,
} from "../../../../components/callouts/callouts.interfaces";

export default class MapViewRectCallout extends BaseRectCallout<
    BaseRectProps,
    BaseRectState
> {
    // componentWillReceiveProps(nextProps: Readonly<any>, nextContext: any) {
    //     const changedProps = _.reduce(
    //         this.props,
    //         function (result, value, key) {
    //             return _.isEqual(value, nextProps[key])
    //                 ? result
    //                 : result.concat(key);
    //         },
    //         []
    //     );
    //     changedProps.forEach((elem) => {
    //         console.log(elem, nextProps[elem]);
    //         //if (typeof nextProps[elem] !== "function") {
    //         //   console.log(nextProps[elem]);
    //         //}
    //     });
    // }

    render() {
        const { x, y, w, h } = this.convertToCanvasSize();
        return (
            <React.Fragment>
                <Rect
                    key={"rect-" + this.callout.id}
                    ref={this.shapeRef}
                    // onClick={() => this.props.onSelect(this)}
                    // onMouseOver={this.handleHover}
                    draggable={false}
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    fill={"white"}
                    opacity={0.5}
                />
                <CalculatedText
                    parent={this}
                    onSelect={(shape) => {
                        return null;
                    }}
                    shape={{ x, y, w, h }}
                    callout={this.callout.callout}
                />
            </React.Fragment>
        );
    }
}
