import { Drawer, Typography, Button, Collapse, Input, List } from "antd";
import React from "react";
import styled from "@emotion/styled";
import { SiegeMap } from "../../../../components/maps/BaseMapView";
import {
    ArrowDownOutlined,
    ArrowUpOutlined,
    CloseOutlined,
    LeftOutlined,
} from "@ant-design/icons";
import { Floor, ICalloutActions } from "../MapEditor";
import CalloutListItem from "./CalloutListItem";
import MapEditRectCallout from "../Callouts/MapEditRectCallout";
import MapEditPolygonCallout from "../Callouts/MapEditPolygonCallout";
import { MENU_HEIGHT } from "../../../../constants";
import { ICalloutObject } from "../../../../components/callouts/callouts.interfaces";

const _ = require("lodash");

const { Title } = Typography;
const { Panel } = Collapse;
const { Search } = Input;

export interface IDetailDrawerProps {
    open: boolean;
    map: SiegeMap;
    floor: number;
    callouts: ICalloutObject[];
    selectedShape: MapEditRectCallout | MapEditPolygonCallout | null;
    store: any;

    handleShapeSelect(shape: MapEditRectCallout | MapEditPolygonCallout): void;

    toggleDrawer(): void;

    calloutActions: ICalloutActions;

    moveFloor(direction: number): void;
}

export interface IDetailDrawerState {
    activePanes: string[];
}

/*
The Drawer should:

Be able to list, edit, delete, save callouts.
Open up to the editing of a selected Callout.

Edit Focal Point

Navigate Floors
 */
export default class DetailDrawer extends React.Component<
    IDetailDrawerProps,
    IDetailDrawerState
> {
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
        const ignored = ["calloutActions", "moveFloor", "store"];
        changedProps.forEach((elem) => {
            if (
                typeof nextProps[elem] !== "function" &&
                ignored.indexOf(elem) === -1
            ) {
                console.log(elem, nextProps[elem]);
            }
        });
    }

    constructor(props) {
        super(props);
        this.state = {
            activePanes: ["callouts"],
        };
    }

    componentDidMount() {
        console.log("%cDrawer Mounted", "color: purple;");
    }

    componentWillUnmount() {
        console.log("%cDrawer Unmounted", "color: purple;");
    }

    shouldComponentUpdate(
        nextProps: Readonly<IDetailDrawerProps>,
        nextState: Readonly<any>,
        nextContext: any
    ): boolean {
        const propAttrs = ["open", "callouts", "floor", "map", "selectedShape"];
        const stateAttrs = ["activePanes"];
        for (let index = 0; index < propAttrs.length; index += 1) {
            const prop = propAttrs[index];
            if (!_.isEqual(this.props[prop], nextProps[prop])) {
                return true;
            }
        }
        for (let index = 0; index < stateAttrs.length; index += 1) {
            const state = stateAttrs[index];
            if (!_.isEqual(this.state[state], nextState[state])) {
                return true;
            }
        }
        return false;
    }

    onCollapseChange = (key) => {
        this.setState({ activePanes: key });
    };

    cancelSelectedShape = () => {
        this.props.store.setSelectedShape(null);
    };

    renderContent = () => {
        const { calloutActions, store } = this.props;
        if (this.props.selectedShape) {
            const { callout } = this.props.selectedShape;
            return (
                <div className="shape-selected">
                    <div className="cancel">
                        <CloseOutlined onClick={this.cancelSelectedShape} />
                    </div>
                    <List>
                        <CalloutListItem
                            callout={callout}
                            calloutActions={calloutActions}
                            updateCallout={calloutActions.update}
                            deleteCallout={calloutActions.delete}
                            handleHover={() => {
                                return null;
                            }}
                        />
                    </List>
                </div>
            );
        }
        const calloutList = {
            listStyle: "none",
            paddingLeft: "0px",
        } as React.CSSProperties;
        return (
            <Collapse
                activeKey={this.state.activePanes}
                onChange={this.onCollapseChange}
            >
                <Panel header="Focal Point" key="focal" className="focal-panel">
                    <div>Some content</div>
                </Panel>
                <Panel
                    header="Callouts"
                    key="callouts"
                    className="callouts-panel"
                >
                    <div className="search-wrapper">
                        <Search placeholder={"Search Callouts"} />
                    </div>
                    <div className="callouts-wrapper">
                        <ul style={calloutList}>
                            {[...this.props.callouts].map((callout) => {
                                return (
                                    <CalloutListItem
                                        key={callout.id}
                                        callout={callout}
                                        calloutActions={calloutActions}
                                        handleHover={store.setHoveredShapeId}
                                    />
                                );
                            })}
                        </ul>
                    </div>
                </Panel>
            </Collapse>
        );
    };

    render() {
        const DrawerStyled = styled.div({
            ".ant-drawer": {
                marginTop: `${MENU_HEIGHT + 44}px`,
                height: `calc(100% - ${MENU_HEIGHT + 44}px)`,
                transition: "none !important",
                webkitTransition: "none !important",
            },
            ".ant-drawer-close": {
                padding: "8px",
            },
            ".ant-drawer-content-wrapper": {
                width: "280px",
                //marginTop: "122px",
                cursor: "default",
                transition: "none !important",
            },
            ".ant-drawer-body": {
                // overflowY: "hidden",
                padding: "unset",
                ".drawer-header": {
                    display: "flex",
                    color: "rgba(0,0,0,.85)",
                    flexDirection: "column",
                    justifyContent: "space-evenly",
                    padding: "5px 3rem 5px 1rem",
                    height: "80px",
                    background: "#fafafa",
                    // borderBottom: "1px solid #d9d9d9",
                    // alignItems: "center",
                    h3: {
                        marginBottom: "0px",
                    },

                    ".floor-control": {
                        color: "rgba(0,0,0,.45)",
                        fontWeight: 700,
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "baseline",

                        ".floor-buttons": {
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-evenly",
                            width: "80px",
                        },
                    },
                },
                ".drawer-content": {
                    ".ant-collapse-header": {
                        paddingTop: "5px",
                        paddingBottom: "5px",
                    },
                    ".ant-collapse-arrow": {
                        top: "11px",
                    },
                    ".callouts-panel": {
                        ".ant-collapse-content-box": {
                            padding: "0rem",
                        },
                        ".search-wrapper": {
                            padding: "0.5rem",
                        },
                        ".callouts-wrapper": {},
                    },
                    ".cancel": {
                        textAlign: "right",
                        paddingTop: "0.5rem",
                        paddingRight: "0.5rem",
                    },
                },
            },
        });
        const EditorSidebar = styled.div({
            float: "left",
            width: "280px",
            position: "absolute",
            background: "white",
            transition: "all .75s ease",
            zIndex: 100,
            height: `calc(100% - ${MENU_HEIGHT + 44}px)`,
            ":not(.visible)": {
                left: "-280px",
            },
            ".visible": {},
            ".drawer-header": {
                display: "flex",
                color: "rgba(0,0,0,.85)",
                flexDirection: "column",
                justifyContent: "space-evenly",
                padding: "5px 3rem 5px 1rem",
                height: "100px",
                background: "#fafafa",
                // borderBottom: "1px solid #d9d9d9",
                // alignItems: "center",
                ".title": {
                    alignItems: "center",
                    display: "flex",
                    justifyContent: "space-between",
                    h3: {
                        marginBottom: "0px",
                    },
                    span: {
                        cursor: "pointer",
                        fontSize: "16px",
                        position: "relative",
                        left: "20px",
                        float: "right",
                    },
                },

                ".floor-control": {
                    color: "rgba(0,0,0,.45)",
                    fontWeight: 700,
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "baseline",

                    ".floor-buttons": {
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-evenly",
                        width: "80px",
                    },
                },
            },
            ".drawer-content": {
                ".ant-collapse-header": {
                    paddingTop: "5px",
                    paddingBottom: "5px",
                },
                ".ant-collapse-arrow": {
                    top: "11px !important",
                },
                ".callouts-panel": {
                    ".ant-collapse-content-box": {
                        padding: "0rem",
                    },
                    ".search-wrapper": {
                        padding: "0.5rem",
                    },
                    ".callouts-wrapper": {},
                },
                ".cancel": {
                    textAlign: "right",
                    paddingTop: "0.5rem",
                    paddingRight: "0.5rem",
                },
            },
        });
        const { map, floor } = this.props;
        const calloutList = {
            listStyle: "none",
            paddingLeft: "0px",
        } as React.CSSProperties;

        return (
            <DrawerStyled>
                <Drawer
                    placement="left"
                    visible={this.props.open}
                    onClose={this.props.toggleDrawer}
                    maskClosable={false}
                    mask={false}
                    getContainer={false}
                >
                    <div className="drawer-header">
                        <div>
                            <Title level={3}>{map.name}</Title>
                        </div>
                        <div className="floor-control">
                            <p>Floor: {floor}</p>
                            <div className="floor-buttons">
                                <Button
                                    //size="small"
                                    shape={"circle"}
                                    onClick={() =>
                                        this.props.moveFloor(Floor.UP)
                                    }
                                    icon={<ArrowUpOutlined />}
                                />
                                <Button
                                    //size="small"
                                    shape={"circle"}
                                    onClick={() =>
                                        this.props.moveFloor(Floor.DOWN)
                                    }
                                    icon={<ArrowDownOutlined />}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="drawer-content">{this.renderContent()}</div>
                </Drawer>
            </DrawerStyled>
        );
    }
}

// return (
//     <DrawerStyled>
//         <Drawer
//             placement="left"
//             forceRender={true}
//             destroyOnClose={false}
//             visible={this.props.open}
//             onClose={this.props.toggleDrawer}
//             maskClosable={false}
//             mask={false}
//             getContainer={false}
//         >

//         </Drawer>
//     </DrawerStyled>
// );

// <Collapse
//     activeKey={this.state.activePanes}
//     onChange={this.onCollapseChange}
// >
//     <Panel header="Focal Point" key="focal" className="focal-panel">
//         <div>Some content</div>
//     </Panel>
//     <Panel
//         header="Callouts"
//         key="callouts"
//         className="callouts-panel"
//     >

//     </Panel>
// </Collapse>

// <EditorSidebar className={this.props.open ? "visible" : ""}>
//     <div className="drawer-header">
//         <div className="title">
//             <Title level={3}>{map.name}</Title>
//             <CloseOutlined onClick={this.props.toggleDrawer} />
//         </div>
//         <div className="floor-control">
//             <p>Floor: {floor}</p>
//             <div className="floor-buttons">
//                 <Button
//                     //size="small"
//                     shape={"circle"}
//                     onClick={() => this.props.moveFloor(Floor.UP)}
//                     icon={<ArrowUpOutlined />}
//                 />
//                 <Button
//                     //size="small"
//                     shape={"circle"}
//                     onClick={() => this.props.moveFloor(Floor.DOWN)}
//                     icon={<ArrowDownOutlined />}
//                 />
//             </div>
//         </div>
//     </div>
//     <div className="drawer-content">

// </EditorSidebar>
