import styled from "@emotion/styled";
import React from "react";
import { IHeaderProps } from "./Header";

export interface IFooterProps extends IHeaderProps {}

const Footer = (props: IFooterProps) => {
    const R6CCFooter = styled.footer({
        padding: "0px",
        display: "flex",
        flexDirection: "column",
        color: "white",
        "&>div": {
            display: "flex",
            flexDirection: "row",
        },
        ".upper-footer": {
            padding: "2rem 4rem",
            backgroundColor: "#001529",
            "&>div": {
                flex: 1,
                strong: {
                    color: "rgba(255, 255, 255, 0.65)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    fontSize: "0.8rem",
                },
            },
            p: {
                marginBottom: "0.3rem",
            },
            "p:not(.no-click)": {
                cursor: "pointer",
            },
        },
        ".lower-footer": {
            display: "flex",
            justifyContent: "space-between",
            padding: "2rem 4rem",
            backgroundColor: "#141414",
            ".logo": {
                fontWeight: 700,
                cursor: "pointer",
            },
            ".legal": {
                flex: 1,
                display: "flex",
                justifyContent: "space-evenly",
                maxWidth: "400px",
                "&>span": {
                    cursor: "pointer",
                },
            },
        },
    });
    const adminSection = (): JSX.Element => {
        const { auth } = props;
        if (auth.isLoaded) {
            if (!auth.isEmpty) {
                return (
                    <>
                        <p className="no-click">{auth.email}</p>
                        <p onClick={props.logout}>Logout</p>
                    </>
                );
            }
        }
        return <p onClick={() => props.goToRoute("/login")}>Login</p>;
    };
    return (
        <R6CCFooter className="ant-layout-footer">
            <div className="upper-footer">
                <div>
                    <strong>R6CC</strong>
                    <p>FAQs</p>
                </div>
                <div>
                    <strong>Contact</strong>
                    <p>Twitter</p>
                </div>
                <div>
                    <strong>Administration</strong>
                    {adminSection()}
                </div>
            </div>
            <div className="lower-footer">
                <div className="logo">R6CC</div>
                <div className="legal">
                    <span>Privacy Policy</span>
                    <span>Terms of Service</span>
                </div>
            </div>
        </R6CCFooter>
    );
};

export default Footer;
