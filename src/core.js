import { Engine, Render, Runner, Bodies, Composite, Body, Events } from 'matter-js';
import Balloon from './Balloon.js';

function draw(world) {
  const ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });
  const top = Bodies.rectangle(400, 0, 810, 10, { 
    restitution: 0.9, // 弹性
    isStatic: true });
  const left = Bodies.rectangle(0, 0, 10, 1200 , { isStatic: true});
  const right = Bodies.rectangle(800, 0, 10, 1200 , { isStatic: true});
  Composite.add(world, [ground, top, left, right]);

  // const balloon = new Balloon(400, 300, 50);
  // balloon.add(world);
  const balloons = [];
  const balloonCount = 10;

  for (let i = 0; i < balloonCount; i++) {
    const x = Math.random() * 800;
    const y = 300 + Math.random() * 100;
    const radius = 20 + Math.random() * 30; // 随机半径(20-50)
    const color = `hsl(${Math.random() * 360}, 100%, 70%)`; // 随机颜色
    const balloon = new Balloon(x, y, radius, color);

    balloon.add(world);
    balloons.push(balloon);
  }

  console.log("draw()执行")
  return balloons;
}

function setup(engine, render) {
  // 配置重力
  engine.gravity.y = 0;
  // 运行 renderer
  Render.run(render);
  // 创建 runner 实例
  const runner = Runner.create()
  // 运行引擎实例 engine
  Runner.run(runner, engine);
  console.log("引擎初始化")
  return runner;
}

function main() {
  const engine = Engine.create();
  const render = Render.create({
  element: document.body.querySelector('.main-container'),
  engine: engine,
  options: {
    width: 800,
    height: 600,
    wireframes: false, // 线框模式 true不渲染颜色
    background: '#d4d4d4',
  }
  })
  const balloons = draw(engine.world);
  const runner = setup(engine, render);

  // 在每一帧中调用随机力应用函数
  // 每帧为气球添加轻微随机扰动
  const applyRandomForces = () => {
    balloons.forEach((balloon) => {
      const forceMagnitude = 0.0005;
      Body.applyForce(balloon.body, balloon.body.position, {
        x: (Math.random() - 0.5) * forceMagnitude,
        y: (Math.random() - 0.5) * forceMagnitude,
      })
    })
  }
  Events.on(engine, "beforeUpdate", () => {
    applyRandomForces();
  })

  const toggleButton = document.getElementById("toggle-gravity");
  let gravityEnabled = false;

  toggleButton.addEventListener("click", () => {
    if (!gravityEnabled) {
      // 启用重力
      gravityEnabled = true;
      engine.gravity.y = -0.05;
      toggleButton.textContent = "禁用重力";

      // 为每个气球设置爆炸计时器
      balloons.forEach((balloon) => {
        const explodeTime = 5000 + Math.random() * 10000;
        setTimeout(() => {
          balloon.explode();
        }, explodeTime);
      });
    } else {
      // 禁用重力
      gravityEnabled = false;
      engine.gravity.y = 0;
      toggleButton.textContent = "启用重力";
    }
  })
}

export default main;