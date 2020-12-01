import styled from "@emotion/styled";
import React, { ReactNode } from "react";
import { FirebaseReducer } from "react-redux-firebase";

export interface IHeaderProps {
    auth: FirebaseReducer.AuthState;

    goToRoute(route: string): void;

    logout(): void;
}

const Header = (props) => {
    const R6CCHeader = styled.header({
        ".logo": {
            float: "left",
            color: "white",
            cursor: "pointer",
            fontWeight: 700,
        },
        ".header-content": {
            color: "white",
            display: "flex",
            float: "right",
            "&>div": {
                marginLeft: "5px",
            },
            ".email": {
                fontWeight: 500,
            },
        },
    });

    const headerContent = (): JSX.Element => {
        const { auth } = props;
        if (auth.isLoaded) {
            if (!auth.isEmpty) {
                return (
                    <>
                        <div className="email">{auth.email}</div>
                        <div>
                            <a onClick={props.logout}>Logout</a>
                        </div>
                    </>
                );
            }
        }
        return <></>;
    };

    return (
        <R6CCHeader className="ant-layout-header">
            <div className="logo" onClick={() => props.goToRoute("/")}>
                R6CC
            </div>
            <div className="header-content">{headerContent()}</div>
        </R6CCHeader>
    );
};

export default Header;
