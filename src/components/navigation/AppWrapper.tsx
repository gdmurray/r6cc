import React, { ReactNode } from "react";
import { Layout, Menu } from "antd";
import styled from "@emotion/styled";
import { connect } from "react-redux";
import { FirebaseReducer } from "react-redux-firebase";
import { push } from "connected-react-router";
import { logoutUser } from "../../store/actions/auth";
import Header, { IHeaderProps } from "./Header";
import Footer from "./Footer";

const { Content } = Layout;

interface IAppWrapperProps extends IHeaderProps {
    children: React.PropsWithChildren<ReactNode>;

    withFooter: boolean;

    login;
}

const AppWrapper = (props: IAppWrapperProps) => {
    let ContentStyle = {
        minHeight: "calc(100vh - 64px)",
        height: "auto",
    } as React.CSSProperties;

    const renderFooter = (): JSX.Element => {
        if (props.withFooter) {
            return <Footer {...props} />;
        }
        return <></>;
    };
    if (props.withFooter) {
        ContentStyle = Object.assign(ContentStyle, {
            padding: "1rem 3rem 4rem 3rem",
        });
    }
    return (
        <Layout>
            <Header {...props} />
            <Layout>
                <Content style={ContentStyle}>{props.children}</Content>
            </Layout>
            {renderFooter()}
        </Layout>
    );
};

AppWrapper.defaultProps = {
    withFooter: false,
};

const mapStateToProps = ({ firebase: { auth } }) => ({
    auth,
});

const mapDispatchToProps = (dispatch) => ({
    goToRoute: (route) => {
        dispatch(push(route));
    },
    logout: () => {
        dispatch(logoutUser());
    },
});
export default connect(mapStateToProps, mapDispatchToProps)(AppWrapper);
