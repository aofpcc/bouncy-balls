import React, { Component } from "react";
import { View } from "react-native";
import { number, object, string } from 'prop-types';

export default class Circle extends Component {
  render() {
    const radius = this.props.radius;
    const x = this.props.body.position.x - radius;
    const y = this.props.body.position.y - radius;
    
    return (
      <View
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: radius * 2,
          height: radius * 2,
          borderRadius: '100%',
          backgroundColor: this.props.color || "pink"
        }}
      />
    );
  }
}

Circle.propTypes = {
    radius: number,
    body: object, 
    color: string
}