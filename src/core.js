import { Engine, Render, Runner, Bodies, Composite, Body, Events } from 'matter-js';
import Balloon from './Balloon.js';

// 创建物理世界的边界
function createBoundaries (world, width = 800, height = 600) {
  const ground = Bodies.rectangle(width / 2, height + 10, width, 20, { isStatic: true });
  const ceiling = Bodies.rectangle(width / 2, -10, width, 20, { 
    restitution: 0.9, // 弹性
    isStatic: true });
  const leftWall = Bodies.rectangle(-10, height / 2, 20, height, { isStatic: true});
  const rightWall = Bodies.rectangle(width + 10, height / 2, 20, height, { isStatic: true});
  Composite.add(world, [ground, ceiling, leftWall, rightWall]);
  return { ground, ceiling, leftWall, rightWall };
}

// 创建多个气球实例
function createBalloons(world, balloonCount) {
  const balloons = [];
  for (let i = 0; i < balloonCount; i++) {
    const x = Math.random() * 800;
    const y = 300 + Math.random() * 100;
    const radius = 30 + Math.random() * 20; // 随机半径(30-50)
    const color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`; // 随机颜色
    const balloon = new Balloon(x, y, radius, color);

    balloon.add(world);
    balloons.push(balloon);
  }
  return balloons;
}

// 为每个气球添加轻微的扰动
function applyRandomForces(balloons, forceMagnitude = 0.0005) {
  balloons.forEach((balloon) => {
    Body.applyForce(balloon.body, balloon.body.position, {
      x: (Math.random() - 0.5) * forceMagnitude,
      y: (Math.random() - 0.5) * forceMagnitude,
    })
  })
}

// 初始化物理引擎和渲染器
function setupEngineAndRender(selector = '.main-container', width = 800, height = 600) {
  if (!document.body.querySelector(selector) == null) return console.error(`渲染器挂载失败: 没有找到 selector: ${selector}`);
  const engine = Engine.create();
  const render = Render.create({
    element: document.body.querySelector(selector),
    engine: engine,
    options: {
      width: width,
      height: height,
      wireframes: false, // 线框模式 true不渲染颜色
      background: 'transparent', // 透明, 防止遮挡页面其它元素
    }
  });

  // 设置画布样式
  const canvas = render.canvas;
  canvas.style.border = '0';
  canvas.style.borderRadius = '12px';
  // canvas.style.position = 'absolute';
  // canvas.style.top = '0';
  // canvas.style.left = '0';
  // canvas.style.zIndex = '-1';

  engine.gravity.y = 0;
  console.log("渲染器挂载成功");
  return { engine, render };
}

// 初始化按钮逻辑
function setupToggle(engine, balloons) {
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
  });
}

function main() {
  // 初始化物理引擎和渲染器
  const { engine, render } = setupEngineAndRender();
  const world = engine.world
  // 创建物理世界边界
  const { ground, ceiling, leftWall, rightWall } = createBoundaries(world);

  // 创建气球
  const balloons = createBalloons(world, 10);
  // 启动引擎和渲染器
  Render.run(render);
  const runner = Runner.create();
  Runner.run(runner, engine);
  //=========================================== 运行中 ========================================
  // 为每帧添加随机力
  Events.on(engine, "beforeUpdate", () => {
    applyRandomForces(balloons);
  });

  // 更新气球 DOM 的位置
  Events.on(engine, "afterUpdate", () => {
    balloons.forEach((balloon) => balloon.updatePosition());
  })

  // 设置重力切换按钮逻辑
  setupToggle(engine, balloons);
}

export default main;