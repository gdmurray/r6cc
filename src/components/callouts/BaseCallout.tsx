import React from "react";
import { IBaseCalloutProps, ICalloutObject } from "./callouts.interfaces";

export default class BaseCallout<
    P extends IBaseCalloutProps,
    S
> extends React.Component<P, S> {
    public callout: ICalloutObject;

    constructor(props) {
        super(props);
        this.callout = props.callout;
    }
}
