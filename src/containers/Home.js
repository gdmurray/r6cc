import React, {Component} from "react";
import Navigation from "../containers/Navigation";

export default class Home extends Component{
    render(){
        return(
            <div>
                <Navigation />
                Hello this is home
            </div>
        )
    }
}