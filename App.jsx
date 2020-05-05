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
import { setProvidesAudioData } from "expo/build/AR";

const { width, height } = Dimensions.get("screen");
const boxSize = Math.trunc(Math.max(width, height) * 0.075);
const radius = Math.trunc(Math.max(width, height) * 0.075) * 0.5;
const engine = Matter.Engine.create({ enableSleeping: true });
const world = engine.world;
const floor = Matter.Bodies.rectangle(
  width / 2,
  height - boxSize,
  width,
  boxSize,
  { isStatic: true }
);
const wallWidth = 10;
const leftWall = Matter.Bodies.rectangle(0, height / 2, wallWidth, height, {
  isStatic: true,
});

const rightWall = Matter.Bodies.rectangle(
  width,
  height / 2,
  wallWidth,
  height,
  { isStatic: true }
);

const obstacleHeight = 30;
const obstacle = Matter.Bodies.rectangle(
  width/2,
  0,
  width/ 2,
  obstacleHeight,
  {
    isStatic: true
  }
);
Matter.Body.setVelocity(obstacle, { x: 0, y: 10 });

Matter.World.add(world, [floor, leftWall, rightWall, obstacle]);

const Physics = (entities, { time }) => {
  let engine = entities["physics"].engine;
  Matter.Engine.update(engine, time.delta);
  return entities;
};

let boxIds = 0;

export default class App extends React.Component {
  state = {
    count: 0,
    entities: {
      physics: {
        engine: engine,
        world: world,
      },
      floor: {
        body: floor,
        size: [width, boxSize],
        color: "green",
        renderer: Box,
      },
      obstacle: {
        body: obstacle,
        size: [width/2, obstacleHeight],
        renderer: Box,
      },
      leftWall: {
        body: leftWall,
        size: [wallWidth, height],
        renderer: Box,
      },
      rightWall: {
        body: rightWall,
        size: [wallWidth, height],
        renderer: Box,
      },
    },
    running: true
  };

  constructor(props) {
    super(props);
    this.gameEngine = null;
    this.setup = this.setup.bind(this);
    this.setup()
  }

  setup = () => {
    this.initiateBall = this.initiateBall.bind(this);
    const mainBall = this.initiateBall();
    this.state.entities["mainBall"] = mainBall;

    Matter.Events.on(engine, "collisionStart", (event) => {
      let pairs = event.pairs;

      pairs.forEach(pair => {
        console.log(pair)
        if (pair.bodyA === obstacle || pair.bodyB === obstacle) {
          this.gameEngine.dispatch({type: "game-over"})
        }
      })
    })
  }

  initiateBall = () => {
    const entities = this.state.entities;
    let world = entities["physics"].world;
    let radius = Math.trunc(Math.max(width, height) * 0.075) * 0.5;
    let body = Matter.Bodies.circle(width / 2, height - 3 * boxSize, radius, {
      frictionAir: 0.0001,
      restitution: 1,
    });

    Matter.World.add(world, [body]);

    let newObject = {
      body: body,
      radius: radius,
      color: boxIds % 2 == 0 ? "pink" : "#B8E986",
      renderer: Circle,
    };

    entities[(++boxIds).toString()] = newObject;

    return newObject;
  };

  removeCircle = (entities, { touches, screen }) => {
    let world = entities["physics"].world;
    const width = screen.width,
      height = screen.height;
    let removeIds = [];
    Object.keys(entities).forEach((key) => {
      let v = entities[key];
      if (
        v &&
        v.body &&
        (v.body.position.x > width ||
          v.body.position.x < 0 ||
          v.body.position.y > height ||
          v.body.position.y < 0)
      ) {
        removeIds.push(v.body.id);
      }
    });
    removeIds.forEach((id) => {
      let body = null;
      Object.keys(entities).forEach((e) => {
        if (entities[e] && entities[e].body && entities[e].body.id == id) {
          body = entities[e].body;
          delete entities[e];
        }
      });
      Matter.World.remove(world, body);
    });
    return entities;
  };

  touchToMove = (entities, { touches, screen, time }) => {
    let world = entities["physics"].world;
    let mainBall = entities["mainBall"];
    let radius =
      Math.trunc(Math.max(screen.width, screen.height) * 0.075) * 0.5;
    touches
      .filter((t) => t.type === "press")
      .forEach((t) => {
        let x = 0.075;
        
        if (t.event.pageX > width / 2) {
          x = x;
        } else {
          x = -x;
        }

        Matter.Body.setVelocity(mainBall.body, { x: 0, y: 0 });

        Matter.Body.applyForce(
          mainBall.body,
          mainBall.body.position,
          { x: x, y: -0.1 }
        );
        // let body = Matter.Bodies.circle(t.event.pageX, t.event.pageY, radius, {
        //   frictionAir: 0.0001,
        //   restitution: 1,
        // });

        // Matter.World.add(world, [body]);

        // let newObject = {
        //   body: body,
        //   radius: radius,
        //   color: boxIds % 2 == 0 ? "pink" : "#B8E986",
        //   renderer: Circle,
        // };
        // entities[++boxIds] = newObject;
      });

    const body = entities["obstacle"].body;
    // Matter.Body.setVelocity(body, { x: 0, y: 0.01 });
    Matter.Body.setPosition(body, { x: body.position.x, y: body.position.y + 1 });
    // this.setState({ count: Object.keys(entities).length - 2 });

    return entities;
  };

  onEvent = (e) => {
    if(e.type == 'game-over') {
      this.setState({
        running: false
      })
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <GameEngine
          ref={(ref) => { this.gameEngine = ref; }}
          style={styles.gameContainer}
          systems={[Physics, this.touchToMove]}
          entities={this.state.entities}
          running={this.state.running}
          onEvent={this.onEvent}
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
    display: "flex",
    justifyContent: "center",
    alignContent: "center",
  },
  labelContainer: {
    paddingTop: 40,
  },
  labelText: {
    color: "black",
    fontSize: 48,
    textAlign: "center",
  },
});
