import React from "react";
import { StyleSheet, Dimensions, StatusBar } from "react-native";
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
const initialCircle = Matter.Bodies.circle(
  width / 2,
  height / 2,
  radius
);
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

// const CreateBox = (entities, { touches, screen }) => {
//   let world = entities["physics"].world;
//   let boxSize = Math.trunc(Math.max(screen.width, screen.height) * 0.075);
//   touches
//     .filter((t) => t.type === "press")
//     .forEach((t) => {
//       let body = Matter.Bodies.rectangle(
//         t.event.pageX,
//         t.event.pageY,
//         boxSize,
//         boxSize,
//         {
//           frictionAir: 0.021,
//           restitution: 1.5,
//         }
//       );

//       Matter.World.add(world, [body]);

//       entities[++boxIds] = {
//         body: body,
//         size: [boxSize, boxSize],
//         color: boxIds % 2 == 0 ? "pink" : "#B8E986",
//         renderer: Box,
//       };
//     });
//   return entities;
// };

const CreateCircle = (entities, { touches, screen }) => {
  let world = entities["physics"].world;
  let radius = Math.trunc(Math.max(screen.width, screen.height) * 0.075) * 0.5;
  touches
    .filter((t) => t.type === "press")
    .forEach((t) => {
      let body = Matter.Bodies.circle(
        t.event.pageX,
        t.event.pageY,
        radius,
        {
          frictionAir: 0.021,
          restitution: 1.5,
        }
      );

      Matter.World.add(world, [body]);

      entities[++boxIds] = {
        body: body,
        radius: radius,
        color: boxIds % 2 == 0 ? "pink" : "#B8E986",
        renderer: Circle,
      };
    });
  return entities;
};

export default class App extends React.Component {
  render() {
    return (
      <GameEngine
        style={styles.container}
        systems={[Physics, CreateCircle]}
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
      </GameEngine>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
