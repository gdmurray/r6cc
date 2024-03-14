import React from "react";
import { Text } from "react-konva";
import { ICalculatedTextProps } from "./callouts.interfaces";

const _isEqual = require("lodash/isEqual");

export default class CalculatedText extends React.Component<
    ICalculatedTextProps,
    any
> {
    public fontFamily: string = "arial";
    public fontStyle: string = "normal";

    shouldComponentUpdate(
        nextProps: Readonly<ICalculatedTextProps>,
        nextState: Readonly<any>,
        nextContext: any
    ): boolean {
        return !_isEqual(this.props, nextProps);
    }

    computeText = () => {
        let { x, y, w, h } = this.props.shape;
        const { callout } = this.props;

        let isVertical = Math.abs(h) > Math.abs(w) * 1.5;

        // Inverts if vertical
        let textW = isVertical ? h : w;
        let textH = isVertical ? w : h;

        let textX = x;
        let textY = y;
        if (isVertical) {
            textX = x + w;
        }

        // Create Canvas in Dom to Draw text on
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        let [calcW, calcH] = [textW, textH];

        // If Height is negative, make it positive for calculations sake.
        if (calcH < 0) {
            calcH = Math.abs(calcH);
        }
        let targetWidth = Math.round(calcW * 0.6);
        let targetHeight = Math.round(calcH * 0.75);

        let fontSize = 2;
        const maxSize = 16;

        if (context) {
            context.font = `${this.fontStyle} ${fontSize}pt ${this.fontFamily}`;
            let metrics = context.measureText(callout);
            let { width } = metrics;
            let actualHeight =
                metrics.actualBoundingBoxAscent +
                metrics.actualBoundingBoxDescent;

            if (width !== 0) {
                do {
                    fontSize += 1;
                    context.font = `normal ${fontSize}pt arial`;
                    metrics = context.measureText(callout);
                    width = metrics.width;
                    actualHeight =
                        metrics.actualBoundingBoxAscent +
                        metrics.actualBoundingBoxDescent;
                } while (
                    width < targetWidth &&
                    fontSize < maxSize &&
                    actualHeight < targetHeight
                );
            }
        }
        if (isVertical) {
            textX = textX - textH;
            textY = textY + textW;
        }
        const rotation = isVertical ? 270 : 0;
        return {
            textX,
            textY,
            textW,
            textH,
            fontSize,
            rotation,
        };
    };

    render() {
        const { callout } = this.props;
        const {
            textX,
            textY,
            textW,
            textH,
            fontSize,
            rotation,
        } = this.computeText();
        return (
            <Text
                onClick={() => this.props.onSelect(this.props.parent)}
                text={callout}
                x={textX}
                y={textY}
                width={textW}
                height={textH}
                fontSize={fontSize}
                fontFamily={this.fontFamily}
                fontStyle={this.fontStyle}
                rotation={rotation}
                verticalAlign={"middle"}
                align={"center"}
            />
        );
    }
}
