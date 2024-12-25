import { Bodies, Composite, Vector, Body } from "matter-js";
import myAvatar from '../assets/avatars/myAvatar.png';

// 随机向量生成函数
function randomVector() {
  const angle = Math.random() * Math.PI * 2;
  return Vector.create(Math.cos(angle), Math.sin(angle));
}

class Balloon {
  constructor(x, y, radius, color = 'red') {
    this.body = Bodies.circle(x, y, radius, {
      friction: 0.02,
      frictionAir: 0.03, // 空气阻力
      restitution: 0.8, // 弹性
      render: {
        fillStyle: color,
        strokeStyle: 'black',
        lineWidth: 0,
      },
    });
    this.world = null; // 存储当前世界的引用
    this.container = null; // 存储所属父容器
    this.isExploded = false; // 标记气球是否已经爆炸

    // 创建 DOM 元素
    this.element = document.createElement("div");
    this.element.style.width = `${radius * 2}px`;
    this.element.style.height = `${radius * 2}px`;
    this.element.style.backgroundColor = color;
    this.element.style.border = "1px solid";
    this.element.style.borderRadius = "50%";
    this.element.style.position = "absolute";
    this.element.style.transform = "translate(-50%, -50%)";
    this.element.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
    this.element.style.cursor = "pointer";
    // this.element.style.backgroundImage = `url(${myAvatar})`;
    // this.element.style.backgroundSize = "cover";
    // this.element.style.backgroundPosition = "center";
    // this.element.style.backgroundRepeat = "no-repeat";

    // 添加点击事件
    this.element.addEventListener("click", () => this.explode());
    // 回调函数
    this.callbacks = [];
  }
  add (world, container) {
    this.world = world;
    this.container = container;
    Composite.add(world, this.body);
    document.body.querySelector(this.container).appendChild(this.element);
  };

  // 更新气球 DOM 元素的位置
  updatePosition () {
    if (!this.body) return;

    // 获取 Matter.js 中气球的位置
    const {x, y} = this.body.position;
    // 获取容器的绝对位置偏移量
    const container = document.body.querySelector(this.container); // 父容器对象
    const containerRect = container.getBoundingClientRect();

    // 修正 DOM 元素的位置, 加入页面滚动偏移量
    const absoluteLeft = containerRect.left + window.scrollX;
    const absoluteTop = containerRect.top + window.scrollY;

    this.element.style.left = `${absoluteLeft + x}px`;
    this.element.style.top = `${absoluteTop + y}px`;
    this.element.style.transform = `translate(-50%, -50%) rotate(${this.body.angle}rad)`;
  }

  // 注册爆炸事件的回调
  onExplode(callback) {
    if (typeof callback === 'function') {
      this.callbacks.push(callback);
    }
  }
  async explode (forceMagnitude = 5, radius = 400, fragmentCount = 25) {
    if (!this.world) {
      console.error("气球尚未被添加到物理世界中, 无法爆炸");
      return null;
    }
    if (this.isExploded) return; // 如果已经爆炸
    this.isExploded = true;
    console.log("气球爆炸了💥")
    // 调用所有注册的回调函数
    this.callbacks.forEach((callback) => callback(this));

    // 移除 DOM 以免影响动画
    this.element.remove();

    // 模拟膨胀
    await new Promise((resolve) => {
      const steps = 5; // 分5步膨胀
      const stepTime = 250 / steps;
      let currentScale = 1;
      const expand = () => {
        if (currentScale >= 1.2) {
          resolve(); // 完成膨胀后结束
          return;
        }
        const nextScale = Math.min(1.2, currentScale + 0.04);
        const scaleFactor = nextScale / currentScale;
        currentScale = nextScale;
        Body.scale(this.body, scaleFactor, scaleFactor);
        setTimeout(expand, stepTime);
      };
      expand();
    })
    // for (let scale = 1; scale <= 1.2; scale += 0.05) {
    //   Body.scale(this.body, scale, scale); // 放大气球
    //   await new Promise((resolve) => setTimeout(resolve, 50)); // 模拟时间延迟
    // }

    // 添加碎片
    const { x, y } = this.body.position;
    for ( let i = 0; i < fragmentCount; i++) {
      const direction = randomVector();
      const position = Vector.add({ x, y }, Vector.mult(direction, radius / 7));
      const fragment = Bodies.circle(position.x, position.y, 2, {
        render: {
          fillStyle: "gray",
          strokeStyle: "orange",
          lineWidth: 1
        }
      });
      Composite.add(this.world, fragment);
      // 给碎片施加初速度
      const velocity = Vector.mult(direction, forceMagnitude );
      Body.setVelocity(fragment, velocity);
    }
    
    // 施加冲击力
    // 遍历物理世界中的所有物体
    const bodies = Composite.allBodies(this.world);

    bodies.forEach((body) => {
      // 计算当前物体与气球的距离
      const distance = Vector.magnitude(Vector.sub(body.position, {x, y}));
      if (distance < radius && body !== this.body) {
        // 计算方向和冲击力
        const direction = Vector.normalise(Vector.sub(body.position, {x, y}));
        const force = Vector.mult(direction, forceMagnitude / distance);
        // 应用爆炸力
        Body.applyForce(body, body.position, force);
      }
    })
    // 从物理世界中移除气球
    // this.element.remove();
    Composite.remove(this.world, this.body);
  };

  resize (newRadius) {
    const { x, y } = this.body.position;
    Composite.remove(this.world, this.body); // 从当前物理世界移除原气球
    // 创建新气球并添加到世界中
    this.body =Bodies.circle(x, y, newRadius, {
      render: this.body.render
    });
    Composite.add(this.world, this.body);
  }
}

export default Balloon;