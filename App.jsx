import React from "react";
import {
  StyleSheet,
  Dimensions,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import Matter from "matter-js";
import Box from "./src/Box";
import Circle from "./src/Circle";
import { GameEngine } from "react-native-game-engine";

const { width, height } = Dimensions.get("screen");
const boxSize = Math.trunc(Math.max(width, height) * 0.075);
const radius = Math.trunc(Math.max(width, height) * 0.075) * 0.5;
const engine = Matter.Engine.create({ enableSleeping: false });
const world = engine.world;
// const initialBox = Matter.Bodies.rectangle(
//   width / 2,
//   height / 2,
//   boxSize,
//   boxSize
// );
const initialCircle = Matter.Bodies.circle(width / 2, height / 2, radius);
const floor = Matter.Bodies.rectangle(
  width / 2,
  height - boxSize,
  width,
  boxSize,
  { isStatic: true }
);
Matter.World.add(world, [initialCircle, floor]);

const Physics = (entities, { time }) => {
  let engine = entities["physics"].engine;
  Matter.Engine.update(engine, time.delta);
  return entities;
};

let boxIds = 0;

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      count: 1,
      entities: []
    };
  }

  removeCircle = (entities, {touches, screen}) => {
    let world = entities["physics"].world;
    const width = screen.width, height = screen.height;
    let removeIds = [];
    this.state.entities.forEach((v) => {
      if(v.body.position.x > width || v.body.position.x < 0 ||
        v.body.position.y > height || v.body.position.y < 0) {
        removeIds.push(v.body.id);
      }
    })
    let removedEntities = this.state.entities.filter(e => removeIds.includes(e.body.id))
    removedEntities.forEach((v) => {
      Object.keys(entities).forEach(e => {
        if(entities[e] && entities[e].body && entities[e].body.id == v.body.id) {
          delete entities[e];
        }
      });
      Matter.World.remove(world, v.body)
    })

    this.setState({entities: this.state.entities.filter(e => !removeIds.includes(e.body.id))})
    return entities
  }

  createCircle = (entities, { touches, screen }) => {
    let world = entities["physics"].world;
    let radius = Math.trunc(Math.max(screen.width, screen.height) * 0.075) * 0.5;
    touches
      .filter((t) => t.type === "press")
      .forEach((t) => {
        let body = Matter.Bodies.circle(t.event.pageX, t.event.pageY, radius, {
          frictionAir: 0.021,
          restitution: 1.5,
        });
  
        Matter.World.add(world, [body]);
  
        let newObject = {
          body: body,
          radius: radius,
          color: boxIds % 2 == 0 ? "pink" : "#B8E986",
          renderer: Circle,
        };
        this.state.entities.push(newObject)
        entities[++boxIds] = newObject;
      });

    this.setState({count: Object.keys(entities).length - 2})

    return entities;
  };

  render() {
    return (
      <View style={styles.container}>
        <GameEngine
          style={styles.gameContainer}
          systems={[Physics, this.createCircle, this.removeCircle]}
          entities={{
            physics: {
              engine: engine,
              world: world,
            },
            initialCircle: {
              body: initialCircle,
              radius: radius,
              color: "red",
              renderer: Circle,
            },
            floor: {
              body: floor,
              size: [width, boxSize],
              color: "green",
              renderer: Box,
            },
          }}
        >
          <StatusBar hidden={true} />
          <View style={styles.labelContainer}>
            <Text style={styles.labelText}>{this.state.count}</Text>
          </View>
        </GameEngine>
        
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  gameContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center'
  },
  labelContainer: {
    paddingTop: 40
  },
  labelText: {
    color: 'black',
    fontSize: 48,
    textAlign: 'center'
  },
});
