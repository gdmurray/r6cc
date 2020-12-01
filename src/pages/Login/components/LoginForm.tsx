import { Button, Form, Input } from "antd";
import { connect } from "react-redux";
import React, { useEffect, useState } from "react";
import { loginUser, resetPassword } from "../../../store/actions/auth";
import { push } from "connected-react-router";
import styled from "@emotion/styled";

export interface IAPIError {
    code: string;
    message: string;
}

const LoginForm = (props) => {
    const [form] = Form.useForm();
    const [forgotPassword, setForgotPassword] = useState<boolean>(false);
    const onFinish = (values) => {
        if (forgotPassword) {
            const { email } = values;
            props.resetPassword(email);
        } else {
            const { email, password } = values;
            props.loginUser(email, password);
        }
    };
    const onFinishFailed = (errorInfo) => {
        console.log(errorInfo);
    };
    const LoginContainer = styled.div({
        maxWidth: "450px",
        width: "300px",
        marginTop: "5rem",
        ".button-block": {
            button: {
                marginBottom: "5px",
            },
        },
        ".ant-form-item-label": {
            fontWeight: 600,
            paddingBottom: "5px",
        },
        ".ant-form-item-required::before": {
            display: "none !important",
        },
    });
    const ContentStyle = {
        display: "flex",
        justifyContent: "center",
    } as React.CSSProperties;

    useEffect(() => {
        if (props.error) {
            // const values = form.getFieldsValue();
            const { code, message } = props.error as IAPIError;
            if (code === "auth/wrong-password") {
                form.setFields([
                    {
                        name: "password",
                        errors: [message],
                    },
                ]);
            } else if (code === "auth/too-many-requests") {
                form.setFields([
                    {
                        name: "username",
                        errors: [message],
                    },
                ]);
            } else {
                form.setFields([
                    {
                        name: "password",
                        errors: [message],
                    },
                ]);
            }
        }
    }, [props.error]);

    useEffect(() => {
        if (props.isAuthenticated) {
            props.goToRoute("/");
        }
    }, [props.isAuthenticated]);

    return (
        <div style={ContentStyle}>
            <LoginContainer>
                <h1>
                    {forgotPassword ? "Reset Password" : "Login as R6CC Admin"}
                </h1>
                <Form
                    layout="vertical"
                    form={form}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                >
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            {
                                type: "email",
                                message: "Email is not valid",
                            },
                            {
                                required: true,
                                message: "Please Input Your Email",
                            },
                        ]}
                    >
                        <Input type="email" />
                    </Form.Item>
                    {forgotPassword ? (
                        <></>
                    ) : (
                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: "Please Input your Password!",
                                },
                            ]}
                        >
                            <Input.Password />
                        </Form.Item>
                    )}
                    <Form.Item className="button-block">
                        <Button
                            loading={props.loading}
                            type="primary"
                            htmlType="submit"
                            block
                        >
                            {forgotPassword ? "Submit" : "Login"}
                        </Button>
                        <Button
                            onClick={() => {
                                setForgotPassword(!forgotPassword);
                            }}
                            block
                        >
                            {forgotPassword
                                ? "Back to Login"
                                : "Forgot Password"}
                        </Button>
                    </Form.Item>
                </Form>
            </LoginContainer>
        </div>
    );
};

const mapStateToProps = (state) => ({
    isAuthenticated: state.auth.isAuthenticated,
    loading: state.auth.loading,
    error: state.auth.error,
    resetSuccess: state.auth.resetSuccess,
});

const mapDispatchToProps = (dispatch) => ({
    loginUser: (email, password) => {
        dispatch(loginUser(email, password));
    },
    goToRoute: (route) => {
        dispatch(push(route));
    },
    resetPassword: (email) => {
        dispatch(resetPassword(email));
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);
