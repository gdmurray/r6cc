import React, { useEffect, useState } from "react";
import { Form, Input, Select, Button } from "antd";
import { connect } from "react-redux";
import styled from "@emotion/styled";
import { DeleteFilled, EditFilled, SaveFilled } from "@ant-design/icons";
import { ICalloutActions } from "../MapEditor";
import {
    insertCallouts,
    updateCallouts,
} from "../../../../store/actions/callouts";
import { ORDER_OPTIONS } from "../../../../constants";
import { ICalloutObject } from "../../../../components/callouts/callouts.interfaces";

const _isEqual = require("lodash/isEqual");
const _cloneDeep = require("lodash/cloneDeep");

export interface ICalloutListItemState {
    isDelete: boolean;
    isEdit: boolean;
    data: EditableCalloutData;
}

interface ICalloutListItemProps {
    callout: ICalloutObject;
    calloutActions: ICalloutActions;

    handleHover(calloutId: string | null): void;

    insertCallouts(callouts: ICalloutObject[]): void;

    updateCallouts(callouts: ICalloutObject[]): void;
}

interface EditableCalloutData {
    callout: string;
    callout_alt: string;
    order: number;
}

const CalloutListItem = (props: ICalloutListItemProps) => {
    let calloutStartValues: EditableCalloutData | null = null;
    const [isEdit, setEdit] = useState<boolean>(false);
    const [isDelete, setDelete] = useState<boolean>(false);
    const [form] = Form.useForm();
    const [data, setData] = useState<EditableCalloutData>({
        callout: "",
        callout_alt: "",
        order: 0,
    });

    useEffect(() => {
        const { callout } = props;
        console.log("props.callout changed? ");
        setData({
            callout: callout.callout,
            callout_alt: callout.callout_alt,
            order: callout.order ? callout.order : 0,
        });
    }, [props.callout]);

    const CalloutListElement = styled.li({
        border: "1px solid #d9d9d9",
        borderRadius: "5px",
        padding: "0.25rem",
        paddingLeft: "0.3rem",
        marginRight: "6px",
        marginLeft: "6px",
        marginBottom: "3px",
        transition: "box-shadow 0.3s",
        "&.edit-mode": {
            border: "1px solid #40a9ff",
        },
        "&:hover": {
            cursor: "pointer",
            boxShadow:
                "0 1px 2px -2px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12), 0 5px 12px 4px rgba(0, 0, 0, 0.09)",
        },
        ".callout-header": {
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "3px",
            alignItems: "center",
            width: "247px",
            ".callout-id": {
                fontSize: "9px",
                b: {
                    fontSize: "11px",
                },
            },
            ".callout-actions": {
                //width: "50px",
                display: "flex",
                justifyContent: "space-between",
                button: {
                    marginLeft: "1px",
                    marginRight: "1px",
                },
            },
        },
        ".callout-form": {
            ".ant-form-item": {
                marginBottom: "5px",
                ".ant-form-item-label": {
                    paddingBottom: "0px",
                    fontWeight: 600,
                    label: {
                        fontSize: "12px",
                    },
                },
            },
        },
        ".non-editable-callout": {
            "& > div": {
                span: {
                    fontWeight: 500,
                    fontSize: "12px",
                    color: "rgba(0, 0, 0, 0.45)",
                },
                p: {
                    height: "20px",
                    lineHeight: "18px",
                    fontSize: "18px",
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "3px",
                },
            },
        },
        ".delete-callout": {
            padding: "1rem 0.5rem 0.5rem 1.5rem",
            h4: {
                color: "rgba(0, 0, 0, 0.85)",
                fontWeight: 400,
                marginBottom: "0.75rem",
            },
            div: {
                display: "flex",
                justifyContent: "flex-end",
                button: {
                    marginLeft: "5px",
                },
            },
        },
    });

    const handleDeleteCallout = () => {
        const { id } = props.callout;
        props.calloutActions.delete(id);
    };

    const renderContent = () => {
        if (isDelete) {
            return (
                <div className="delete-callout">
                    <h4>Delete Callout?</h4>
                    <div>
                        <Button onClick={() => setDelete(false)} size="small">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeleteCallout}
                            size="small"
                            type="primary"
                            danger
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            );
        }
        if (isEdit) {
            return (
                <Form
                    form={form}
                    layout={"vertical"}
                    className={"callout-form"}
                    initialValues={{
                        callout: data.callout,
                        callout_alt: data.callout_alt,
                        order: data.order,
                    }}
                >
                    <Form.Item label={"Callout"} name={"callout"}>
                        <Input
                            onBlur={onFocusOut}
                            onFocus={onFocusIn}
                            name={"callout"}
                            placeholder="Callout Name"
                        />
                    </Form.Item>
                    <Form.Item
                        label={"Callout Alternative"}
                        name={"callout_alt"}
                    >
                        <Input
                            onBlur={onFocusOut}
                            onFocus={onFocusIn}
                            name={"callout_alt"}
                            placeholder="Callout Alternative"
                        />
                    </Form.Item>
                    <Form.Item label={"Order"} name={"order"}>
                        <Select
                            defaultValue={data.order}
                            options={ORDER_OPTIONS}
                        />
                    </Form.Item>
                </Form>
            );
        }
        return (
            <div className="non-editable-callout">
                <div>
                    <span>Callout</span>
                    <p>{data.callout ? data.callout : <span>None</span>}</p>
                </div>
                <div>
                    <span>Callout Alternative</span>
                    <p>
                        {data.callout_alt ? (
                            data.callout_alt
                        ) : (
                            <span>None</span>
                        )}
                    </p>
                </div>
                <div>
                    <span>Order</span>
                    <p>{data.order ? data.order : 0}</p>
                </div>
            </div>
        );
    };

    const saveCallout = () => {
        const values = form.getFieldsValue();
        console.log("Can Save");
        console.log(values);
        console.log(data);
        console.log(_isEqual(values, data));
        if (!_isEqual(values, data)) {
            const updatedCallout = Object.assign(props.callout, values);
            console.log(updatedCallout);
            console.log("Using dispatch");
            // TODO: HANDLE .TMP ID
            if (!props.callout.id.startsWith("tmp-")) {
                props.updateCallouts([updatedCallout]);
            }
            setData(values);
        } else {
            console.log("No changes detected, cannot save");
        }
    };

    /**
     * When the user clicks an input
     * Caches the current state of the values for the undo/redo stack
     */
    const onFocusIn = () => {
        calloutStartValues = _cloneDeep(form.getFieldsValue());
    };

    /**
     * Returns an updated Callout Object to avoid Object.Assign Errors for undo stack
     * @param values {EditableCalloutData} The form data
     * @return {ICalloutObject} The updated object.
     */
    const updatedCalloutObject = (values): ICalloutObject => {
        const { callout } = props;
        return {
            callout: values.callout,
            callout_alt: values.callout_alt,
            order: values.order,

            id: callout.id,
            floor: callout.floor,
            map: callout.map,
            shape: callout.shape,
        };
    };

    /**
     * When the user deselects an input
     * Adds the current changes to the undo/redo stack
     */
    const onFocusOut = () => {
        const values = form.getFieldsValue();
        if (!_isEqual(calloutStartValues, values)) {
            const previousCallout = updatedCalloutObject(calloutStartValues);
            const updatedCallout = updatedCalloutObject(values);
            props.calloutActions.transform(previousCallout, updatedCallout);
            setData({ ...values });
        }
    };

    const canSaveCallout = () => {
        const values = form.getFieldsValue();

        return true;
    };

    const handleClick = () => {
        // console.log(props.callout);
    };

    return (
        <CalloutListElement
            key={`li-${props.callout.id}`}
            className={isEdit ? "edit-mode" : ""}
            onMouseLeave={() => {
                props.handleHover(null);
            }}
            onMouseEnter={() => {
                props.handleHover(props.callout.id);
            }}
            onClick={handleClick}
        >
            <div className="callout-header">
                <div className="callout-id">
                    id: <b>{props.callout.id}</b>
                </div>
                <div className={"callout-actions"}>
                    <Button
                        htmlType={"submit"}
                        onClick={saveCallout}
                        hidden={!isEdit}
                        type={"dashed"}
                        icon={<SaveFilled />}
                        shape={"circle"}
                        size={"small"}
                    />
                    <Button
                        onClick={() => setEdit(!isEdit)}
                        type={isEdit ? "default" : "primary"}
                        size={"small"}
                        shape={"circle"}
                        icon={<EditFilled />}
                    />
                    <Button
                        onClick={() => setDelete(!isDelete)}
                        type={"primary"}
                        danger
                        size={"small"}
                        shape={"circle"}
                        icon={<DeleteFilled />}
                    />
                </div>
            </div>
            {renderContent()}
        </CalloutListElement>
    );
};

// const mapStateToProps = (state) => ({
//     inserting: state.callouts.inserting,
//     updating: state.callouts.updating,
// });

const mapDispatchToProps = (dispatch) => ({
    insertCallouts: (callouts) => {
        dispatch(insertCallouts(callouts));
    },
    updateCallouts: (callouts) => {
        dispatch(updateCallouts(callouts));
    },
});
export default connect(null, mapDispatchToProps)(CalloutListItem);
