import React, { Component } from 'react';
import RectHotSpot from './RectHotSpot';
import { HOTSPOTS } from "../../constants";
import PolygonHotSpot from './PolygonHotSpot';

const HotSpotComponent = (props) => {
  function handleHover(hotspot) {
    console.log(hotspot.callout);
  }

  if (props.activeFloor === props.floor) {
    if (props.shape.type === HOTSPOTS.RECTANGLE) {
      return <RectHotSpot {...props} 
        handleHover={handleHover}
        />
    }else if(props.shape.type === HOTSPOTS.POLYGON){
      return <PolygonHotSpot {...props} 
        handleHover={handleHover}
         />
    }
  }
  // Don't Render if the floor isnt the same, prevents the lag time rendering
  return (null);

}

export default HotSpotComponent;