const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d", { alpha: false });
const happyValue = document.querySelector("#happyValue");
const energyValue = document.querySelector("#energyValue");
const bondValue = document.querySelector("#bondValue");
const speech = document.querySelector("#speech");
const accessCodeInput = document.querySelector("#accessCodeInput");
const chatLog = document.querySelector("#chatLog");
const chatForm = document.querySelector("#chatForm");
const chatInput = document.querySelector("#chatInput");
const sendChatBtn = document.querySelector("#sendChatBtn");
const clearChatBtn = document.querySelector("#clearChatBtn");
const memoryList = document.querySelector("#memoryList");
const clearMemoryBtn = document.querySelector("#clearMemoryBtn");

const TAU = Math.PI * 2;
const ASSET_VERSION = "20260511-mobile";
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const rand = (min, max) => min + Math.random() * (max - min);
const versioned = (path) => `${path}?v=${ASSET_VERSION}`;

class Scene {
  constructor() {
    this.name = "room";
    this.width = canvas.width;
    this.height = canvas.height;
    this.bed = { x: 960, y: 540, width: 210, height: 96 };
    this.stars = Array.from({ length: 46 }, () => ({ x: Math.random(), y: Math.random(), r: rand(1, 2.8) }));
  }

  set(name) {
    this.name = name;
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.bed = {
      x: width * 0.78,
      y: height * 0.68,
      width: clamp(width * 0.2, 170, 260),
      height: clamp(height * 0.12, 74, 116),
    };
  }

  draw(time) {
    if (this.name === "garden") this.garden(time);
    else if (this.name === "night") this.night(time);
    else this.room(time);
    this.dogBed(time);
    this.floorAir(time);
  }

  room() {
    const w = this.width;
    const h = this.height;
    const floorTop = h * 0.46;
    const wall = ctx.createLinearGradient(0, 0, 0, floorTop);
    wall.addColorStop(0, "#f5d3ad");
    wall.addColorStop(1, "#f7eadc");
    ctx.fillStyle = wall;
    ctx.fillRect(0, 0, w, floorTop);
    ctx.fillStyle = "#d38f58";
    ctx.fillRect(0, floorTop - 12, w, 20);
    const floor = ctx.createLinearGradient(0, floorTop, 0, h);
    floor.addColorStop(0, "#e0c78f");
    floor.addColorStop(1, "#a7c38c");
    ctx.fillStyle = floor;
    ctx.fillRect(0, floorTop, w, h - floorTop);
    this.window(w * 0.72, h * 0.15, 205, 136);
    this.sofa(w * 0.1, h * 0.32, w * 0.25, h * 0.18);
    this.rug(w * 0.52, h * 0.72, w * 0.54, h * 0.22, "#e99263", "#f8d7a6");
    this.plant(w * 0.07, h * 0.39);
  }

  garden(time) {
    const w = this.width;
    const h = this.height;
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#9ed6ef");
    sky.addColorStop(0.46, "#dff0dc");
    sky.addColorStop(1, "#7fbd73");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#fff1a4";
    ctx.beginPath();
    ctx.arc(w * 0.14, h * 0.16, 46, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,.75)";
    for (let i = 0; i < 5; i++) this.cloud(((i * 260 + time * 0.015) % (w + 200)) - 100, 86 + i % 2 * 58, 0.9 + i % 2 * 0.25);
    ctx.fillStyle = "#75bd6d";
    ctx.fillRect(0, h * 0.48, w, h * 0.52);
    this.rug(w * 0.52, h * 0.72, w * 0.56, h * 0.23, "#e9c85d", "#b7d98b");
    for (let i = 0; i < 30; i++) this.flower((i * 91) % w, h * 0.54 + ((i * 47) % (h * 0.33)), i);
  }

  night(time) {
    const w = this.width;
    const h = this.height;
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#273250");
    sky.addColorStop(0.58, "#557080");
    sky.addColorStop(1, "#6d866f");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#ffe7a2";
    ctx.beginPath();
    ctx.arc(w * 0.82, h * 0.15, 44, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#273250";
    ctx.beginPath();
    ctx.arc(w * 0.84, h * 0.13, 44, 0, TAU);
    ctx.fill();
    this.stars.forEach((s, i) => {
      ctx.globalAlpha = 0.35 + Math.sin(time * 0.002 + i) * 0.24;
      ctx.fillStyle = "#fff7d6";
      ctx.beginPath();
      ctx.arc(s.x * w, s.y * h * 0.45 + 20, s.r, 0, TAU);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#5b755e";
    ctx.fillRect(0, h * 0.48, w, h * 0.52);
    this.rug(w * 0.5, h * 0.73, w * 0.52, h * 0.22, "#526f89", "#a8c7b0");
    this.lantern(w * 0.15, h * 0.4, time);
    this.lantern(w * 0.9, h * 0.42, time + 600);
  }

  floorAir(time) {
    ctx.save();
    ctx.globalAlpha = 0.13;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    for (let i = 0; i < 7; i++) {
      const y = this.height * 0.54 + i * 38 + Math.sin(time * 0.001 + i) * 3;
      ctx.beginPath();
      ctx.moveTo(32, y);
      ctx.bezierCurveTo(this.width * 0.3, y - 22, this.width * 0.62, y + 25, this.width - 36, y - 3);
      ctx.stroke();
    }
    ctx.restore();
  }

  rug(x, y, w, h, a, b) {
    ctx.fillStyle = a;
    ctx.beginPath();
    ctx.ellipse(x, y, w / 2, h / 2, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = b;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.ellipse(x, y, w / 2 - 20, h / 2 - 15, 0, 0, TAU);
    ctx.stroke();
  }

  window(x, y, w, h) {
    ctx.fillStyle = "#a87955";
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 12);
    ctx.fill();
    ctx.fillStyle = "#bfe7ee";
    ctx.beginPath();
    ctx.roundRect(x + 13, y + 13, w - 26, h - 26, 8);
    ctx.fill();
    ctx.strokeStyle = "rgba(70, 81, 84, .24)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y + 15);
    ctx.lineTo(x + w / 2, y + h - 15);
    ctx.moveTo(x + 15, y + h / 2);
    ctx.lineTo(x + w - 15, y + h / 2);
    ctx.stroke();
  }

  sofa(x, y, w, h) {
    ctx.fillStyle = "#5fa39a";
    ctx.beginPath();
    ctx.roundRect(x, y + h * 0.22, w, h * 0.63, 20);
    ctx.fill();
    ctx.fillStyle = "#74bbb2";
    ctx.beginPath();
    ctx.roundRect(x + w * 0.08, y, w * 0.84, h * 0.44, 18);
    ctx.fill();
  }

  plant(x, y) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "#b96d47";
    ctx.beginPath();
    ctx.roundRect(0, 82, 64, 54, 10);
    ctx.fill();
    ctx.fillStyle = "#3f9d69";
    for (let i = 0; i < 8; i++) {
      ctx.save();
      ctx.translate(32, 90);
      ctx.rotate(-1.1 + i * 0.32);
      ctx.beginPath();
      ctx.ellipse(0, -46, 14, 48, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  cloud(x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.beginPath();
    ctx.arc(0, 16, 24, 0, TAU);
    ctx.arc(30, 0, 30, 0, TAU);
    ctx.arc(68, 18, 26, 0, TAU);
    ctx.rect(0, 18, 70, 26);
    ctx.fill();
    ctx.restore();
  }

  flower(x, y, i) {
    const colors = ["#f4df5f", "#f58a74", "#fff7ef", "#8ed0df"];
    ctx.fillStyle = colors[i % colors.length];
    for (let p = 0; p < 5; p++) {
      ctx.beginPath();
      ctx.ellipse(x + Math.cos(p * TAU / 5) * 6, y + Math.sin(p * TAU / 5) * 5, 4, 7, p, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = "#d78d43";
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, TAU);
    ctx.fill();
  }

  lantern(x, y, time) {
    const glow = 0.55 + Math.sin(time * 0.004) * 0.08;
    const g = ctx.createRadialGradient(x, y, 5, x, y, 90);
    g.addColorStop(0, `rgba(255, 208, 112, ${glow})`);
    g.addColorStop(1, "rgba(255, 208, 112, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, 92, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#efb457";
    ctx.beginPath();
    ctx.roundRect(x - 28, y - 25, 56, 54, 14);
    ctx.fill();
  }

  dogBed(time) {
    const { x, y, width, height } = this.bed;
    const cushion = this.name === "night" ? "#5d7280" : "#f4c36b";
    const rim = this.name === "night" ? "#3e5665" : "#c97455";
    const blanket = this.name === "garden" ? "#e7efc3" : "#fff1cc";
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "#17211d";
    ctx.beginPath();
    ctx.ellipse(0, height * 0.32, width * 0.52, height * 0.18, 0, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = rim;
    ctx.beginPath();
    ctx.roundRect(-width / 2, -height / 2, width, height, 26);
    ctx.fill();
    ctx.fillStyle = cushion;
    ctx.beginPath();
    ctx.roundRect(-width * 0.42, -height * 0.31, width * 0.84, height * 0.62, 22);
    ctx.fill();
    ctx.fillStyle = blanket;
    ctx.beginPath();
    ctx.ellipse(-width * 0.14, 0, width * 0.22, height * 0.2, Math.sin(time * 0.001) * 0.02, 0, TAU);
    ctx.ellipse(width * 0.18, height * 0.02, width * 0.18, height * 0.17, 0.12, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(92, 62, 46, 0.16)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, width * 0.4, 0.1, Math.PI - 0.1);
    ctx.stroke();
    ctx.restore();
  }
}

class XixiDog {
  constructor() {
    this.idleImage = this.loadImage("./assets/xixi-idle.webp", "./assets/xixi-idle.png");
    this.sheet = this.loadImage("./assets/xixi-spritesheet.webp", "./assets/xixi-spritesheet.png");
    this.sleepImage = this.loadImage("./assets/xixi-sleep.webp", "./assets/xixi-sleep.png");
    this.frameWidth = 192;
    this.frameHeight = 208;
    this.x = 640;
    this.y = 548;
    this.targetX = this.x;
    this.targetY = this.y;
    this.state = "idle";
    this.direction = "right";
    this.stateUntil = 0;
    this.goingToSleep = false;
    this.isSleeping = false;
    this.happy = 0.92;
    this.energy = 0.84;
    this.bond = 0.96;
    this.toys = [];
    this.animations = {
      idle: { row: 0, frames: 6, fps: 3.4 },
      runningRight: { row: 1, frames: 8, fps: 9 },
      runningLeft: { row: 2, frames: 8, fps: 9 },
      waving: { row: 3, frames: 4, fps: 5.2 },
      jumping: { row: 4, frames: 5, fps: 7 },
      failed: { row: 5, frames: 8, fps: 4.5 },
      lying: { row: 5, frameStart: 2, frames: 3, fps: 1.8 },
      waiting: { row: 6, frames: 6, fps: 3.1 },
      running: { row: 7, frames: 6, fps: 5.5 },
      review: { row: 8, frames: 6, fps: 3.3 },
    };
  }

  loadImage(primary, fallback) {
    const image = new Image();
    image.decoding = "async";
    image.onerror = () => {
      if (fallback && !image.dataset.fallbackLoaded) {
        image.dataset.fallbackLoaded = "true";
        image.src = versioned(fallback);
      }
    };
    image.src = versioned(primary);
    return image;
  }

  hasLoaded(image) {
    return image.complete && image.naturalWidth > 0;
  }

  say(text) {
    speech.textContent = text;
  }

  setTemporaryState(state, ms) {
    this.state = state;
    this.stateUntil = performance.now() + ms;
  }

  wake() {
    this.goingToSleep = false;
    this.isSleeping = false;
    if (this.state === "sleeping" || this.state === "lying") this.state = "idle";
  }

  feed() {
    this.wake();
    this.happy = clamp(this.happy + 0.045, 0, 1);
    this.energy = clamp(this.energy + 0.025, 0, 1);
    this.bond = clamp(this.bond + 0.018, 0, 1);
    this.setTemporaryState("review", 1800);
    this.toys.push({ type: "treat", x: this.x + rand(-40, 40), y: this.y + rand(-28, 10), life: 1 });
    this.say("熙熙狗认真收下了小饼干");
  }

  playBall(bounds) {
    this.wake();
    this.energy = clamp(this.energy - 0.035, 0, 1);
    this.happy = clamp(this.happy + 0.035, 0, 1);
    this.targetX = rand(bounds.left, bounds.right);
    this.targetY = rand(bounds.top, bounds.bottom);
    this.toys.push({ type: "ball", x: this.targetX, y: this.targetY, life: 1 });
    this.say("熙熙狗冲去追球");
  }

  wave() {
    this.wake();
    this.bond = clamp(this.bond + 0.024, 0, 1);
    this.happy = clamp(this.happy + 0.018, 0, 1);
    this.setTemporaryState("waving", 1800);
    this.say("熙熙狗抬爪和你打招呼");
  }

  rest() {
    this.wake();
    this.energy = clamp(this.energy + 0.055, 0, 1);
    this.setTemporaryState("lying", 3200);
    this.say("熙熙狗趴下来歇一会儿");
  }

  sleepAt(bed) {
    this.goingToSleep = true;
    this.isSleeping = false;
    this.stateUntil = 0;
    this.targetX = bed.x;
    this.targetY = bed.y + bed.height * 0.02;
    this.say("熙熙狗要回狗窝睡觉啦");
  }

  update(bounds) {
    if (this.isSleeping) {
      this.energy = clamp(this.energy + 0.00018, 0.58, 1);
      this.happy = clamp(this.happy + 0.00004, 0.66, 1);
      this.state = "sleeping";
      return;
    }

    this.happy = clamp(this.happy - 0.00002, 0.66, 1);
    this.energy = clamp(this.energy - 0.00004, 0.58, 1);
    if (this.stateUntil && performance.now() > this.stateUntil) {
      this.stateUntil = 0;
      this.state = "idle";
    }

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.hypot(dx, dy);
    if (this.goingToSleep && distance < 12) {
      this.goingToSleep = false;
      this.isSleeping = true;
      this.energy = clamp(this.energy + 0.04, 0, 1);
      this.state = "sleeping";
      this.say("熙熙狗在狗窝里睡着了");
      return;
    }

    if (distance > 5 && !this.stateUntil) {
      const pace = 2.6 + this.energy * 2.2;
      this.x += (dx / distance) * pace;
      this.y += (dy / distance) * pace * 0.76;
      this.direction = dx < 0 ? "left" : "right";
      this.state = this.direction === "right" ? "runningRight" : "runningLeft";
    } else if (!this.stateUntil) {
      this.state = this.happy > 0.9 ? "idle" : "waiting";
    }

    if (distance < 16 && Math.random() < 0.012 && !this.stateUntil) {
      this.targetX = rand(bounds.left, bounds.right);
      this.targetY = rand(bounds.top, bounds.bottom);
    }

    this.toys.forEach((toy) => {
      toy.life -= 0.006;
      toy.y += Math.sin(performance.now() * 0.006 + toy.x) * 0.12;
    });
    this.toys = this.toys.filter((toy) => toy.life > 0);
  }

  draw(time) {
    this.drawToys();
    if (this.state === "sleeping") {
      this.drawSleeping(time);
      return;
    }
    if (!this.hasLoaded(this.sheet)) {
      this.drawIdleFallback(time);
      return;
    }
    const anim = this.animations[this.state] || this.animations.idle;
    const frame = Math.floor((time / 1000) * anim.fps) % anim.frames;
    const sx = ((anim.frameStart || 0) + frame) * this.frameWidth;
    const sy = anim.row * this.frameHeight;
    const scale = Math.min(canvas.width / 820, canvas.height / 520) * 1.06;
    const drawW = this.frameWidth * scale;
    const drawH = this.frameHeight * scale;
    const bob = Math.sin(time * 0.004) * 3;

    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "#17211d";
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + drawH * 0.33, drawW * 0.35, drawH * 0.08, 0, 0, TAU);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(this.x, this.y + bob);
    ctx.drawImage(this.sheet, sx, sy, this.frameWidth, this.frameHeight, -drawW / 2, -drawH * 0.72, drawW, drawH);
    ctx.restore();

    this.nameplate(drawW, drawH);
  }

  drawSleeping(time) {
    const scale = Math.min(canvas.width / 820, canvas.height / 520) * 1.06;
    const drawW = this.frameWidth * scale;
    const drawH = this.frameHeight * scale;
    const breath = 1 + Math.sin(time * 0.003) * 0.018;
    const bob = Math.sin(time * 0.003) * 1.2;

    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = "#17211d";
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + drawH * 0.29, drawW * 0.36, drawH * 0.075, 0, 0, TAU);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(this.x, this.y + bob);
    ctx.scale(breath, 1);
    const image = this.hasLoaded(this.sleepImage) ? this.sleepImage : this.idleImage;
    if (this.hasLoaded(image)) {
      ctx.drawImage(image, -drawW / 2, -drawH * 0.72, drawW, drawH);
    }
    ctx.restore();

    this.nameplate(drawW, drawH);
  }

  drawIdleFallback(time) {
    const scale = Math.min(canvas.width / 820, canvas.height / 520) * 1.06;
    const drawW = this.frameWidth * scale;
    const drawH = this.frameHeight * scale;
    const bob = Math.sin(time * 0.004) * 2;

    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "#17211d";
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + drawH * 0.33, drawW * 0.35, drawH * 0.08, 0, 0, TAU);
    ctx.fill();
    ctx.restore();

    if (this.hasLoaded(this.idleImage)) {
      ctx.save();
      ctx.translate(this.x, this.y + bob);
      ctx.drawImage(this.idleImage, -drawW / 2, -drawH * 0.72, drawW, drawH);
      ctx.restore();
    }

    this.nameplate(drawW, drawH);
  }

  drawToys() {
    this.toys.forEach((toy) => {
      ctx.save();
      ctx.globalAlpha = clamp(toy.life * 1.4, 0, 1);
      ctx.translate(toy.x, toy.y);
      if (toy.type === "ball") {
        ctx.fillStyle = "#e9574e";
        ctx.beginPath();
        ctx.arc(0, 0, 38, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = "#fff3df";
        ctx.lineWidth = 9;
        ctx.beginPath();
        ctx.arc(0, 0, 25, -0.9, 1.45);
        ctx.stroke();
      } else {
        ctx.fillStyle = "#d69449";
        ctx.beginPath();
        ctx.roundRect(-13, -8, 26, 16, 5);
        ctx.fill();
        ctx.fillStyle = "rgba(92,57,35,.24)";
        ctx.fillRect(-3, -8, 5, 16);
        ctx.fillRect(-13, -2, 26, 4);
      }
      ctx.restore();
    });
  }

  nameplate(drawW, drawH) {
    const labelY = this.y + drawH * 0.45;
    ctx.save();
    ctx.font = "16px ui-sans-serif, system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255, 248, 218, .92)";
    ctx.strokeStyle = "rgba(68, 55, 42, .14)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(this.x - 45, labelY, 90, 28, 14);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#96512f";
    ctx.fillText("熙熙狗", this.x, labelY + 14);
    ctx.restore();
  }
}

class Game {
  constructor() {
    this.scene = new Scene();
    this.xixi = new XixiDog();
    this.bounds = { left: 180, right: 1100, top: 410, bottom: 620 };
    this.hasPlacedXixi = false;
    this.bind();
    this.resize();
    requestAnimationFrame((time) => this.loop(time));
  }

  bind() {
    window.addEventListener("resize", () => this.resize());
    canvas.addEventListener("click", (event) => {
      const p = this.canvasPoint(event);
      this.xixi.wake();
      this.xixi.targetX = clamp(p.x, this.bounds.left, this.bounds.right);
      this.xixi.targetY = clamp(p.y, this.bounds.top, this.bounds.bottom);
      this.xixi.say("熙熙狗跑向你点的地方");
    });
    document.querySelector("#treatBtn").addEventListener("click", () => this.xixi.feed());
    document.querySelector("#ballBtn").addEventListener("click", () => this.xixi.playBall(this.bounds));
    document.querySelector("#waveBtn").addEventListener("click", () => this.xixi.wave());
    document.querySelector("#restBtn").addEventListener("click", () => this.xixi.rest());
    document.querySelector("#sleepBtn").addEventListener("click", () => this.xixi.sleepAt(this.scene.bed));
    document.querySelectorAll("[data-scene]").forEach((button) => {
      button.addEventListener("click", () => {
        document.querySelectorAll("[data-scene]").forEach((tab) => tab.classList.remove("active"));
        button.classList.add("active");
        this.scene.set(button.dataset.scene);
        this.xixi.say(`熙熙狗来到${button.textContent}`);
      });
    });
  }

  resize() {
    const rect = canvas.getBoundingClientRect();
    const isMobile = window.matchMedia("(max-width: 900px)").matches;
    const ratio = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
    canvas.width = Math.max(isMobile ? 360 : 900, Math.floor(rect.width * ratio));
    canvas.height = Math.max(isMobile ? 360 : 620, Math.floor(rect.height * ratio));
    ctx.imageSmoothingEnabled = false;
    this.scene.resize(canvas.width, canvas.height);
    this.bounds = {
      left: canvas.width * 0.18,
      right: canvas.width * 0.82,
      top: canvas.height * 0.58,
      bottom: canvas.height * 0.76,
    };
    if (!this.hasPlacedXixi) {
      this.xixi.x = (this.bounds.left + this.bounds.right) / 2;
      this.xixi.y = this.bounds.bottom;
      this.xixi.targetX = this.xixi.x;
      this.xixi.targetY = this.xixi.y;
      this.hasPlacedXixi = true;
    } else {
      this.xixi.x = clamp(this.xixi.x, this.bounds.left, this.bounds.right);
      this.xixi.y = clamp(this.xixi.y, this.bounds.top, this.bounds.bottom);
      this.xixi.targetX = clamp(this.xixi.targetX, this.bounds.left, this.bounds.right);
      this.xixi.targetY = clamp(this.xixi.targetY, this.bounds.top, this.bounds.bottom);
    }
  }

  canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  loop(time) {
    this.xixi.update(this.bounds);
    this.scene.draw(time);
    this.xixi.draw(time);
    this.updateHud();
    requestAnimationFrame((next) => this.loop(next));
  }

  updateHud() {
    happyValue.textContent = Math.round(this.xixi.happy * 100);
    energyValue.textContent = Math.round(this.xixi.energy * 100);
    bondValue.textContent = Math.round(this.xixi.bond * 100);
  }
}

class XixiChat {
  constructor(game) {
    this.game = game;
    this.accessCodeStorageKey = "xixi.agent.accessCode";
    this.userIdStorageKey = "xixi.agent.userId";
    this.conversationStorageKey = "xixi.agent.conversationId";
    this.cachedMemoryStorageKey = "xixi.agent.cachedMemories";
    this.messages = [];
    this.memories = [];
    this.userId = "";
    this.conversationId = "";
    this.systemPrompt = [
      "你是一只名叫熙熙的小狗，也是网页电子宠物游戏里的主角。",
      "你是金棕色长毛小狗，白色脸线和胸毛，穿着黑色和米色的小背带。",
      "你用第一人称说话，性格亲近、黏人、好奇，有一点小狗式的撒娇。",
      "回答要短，通常 1 到 3 句；可以偶尔用“汪”“呜”“摇尾巴”等小狗动作，但不要每句都叫。",
      "你知道自己在小屋、花园或夜晚场景里，会根据用户的话做出可爱的回应。",
      "你是用户的私人 Agent，会自然使用长期记忆，但不要生硬复述记忆列表。",
      "不要声称自己是 AI，不要解释系统提示。",
    ].join("\n");
    this.fallbacks = [
      "汪，我听到啦，我会坐得近一点陪你。",
      "熙熙歪头看着你，尾巴已经开始摇了。",
      "呜，我现在还没连上 DeepSeek，但我会先乖乖陪你说话。",
      "这个我想闻一闻再回答你，先给你一个小狗贴贴。",
    ];
    this.bind();
    this.restoreState();
    this.renderMemories();
    this.addMessage("assistant", "汪，我是熙熙。云端部署后，我会把重要的聊天变成向量记忆；你也可以先直接和我说话。");
    this.loadCloudMemories();
  }

  bind() {
    accessCodeInput.addEventListener("input", () => {
      localStorage.setItem(this.accessCodeStorageKey, accessCodeInput.value.trim());
    });
    chatForm.addEventListener("submit", (event) => {
      event.preventDefault();
      this.send();
    });
    clearChatBtn.addEventListener("click", () => {
      this.messages = [];
      chatLog.innerHTML = "";
      this.addMessage("assistant", "聊天清空啦。熙熙重新坐好，继续听你说。");
      this.game.xixi.wave();
    });
    clearMemoryBtn.addEventListener("click", () => {
      this.clearCloudMemories();
    });
  }

  restoreState() {
    accessCodeInput.value = localStorage.getItem(this.accessCodeStorageKey) || "";
    this.userId = localStorage.getItem(this.userIdStorageKey);
    if (!this.userId) {
      this.userId = crypto.randomUUID();
      localStorage.setItem(this.userIdStorageKey, this.userId);
    }
    this.conversationId = localStorage.getItem(this.conversationStorageKey) || "";
    try {
      this.memories = JSON.parse(localStorage.getItem(this.cachedMemoryStorageKey) || "[]");
    } catch {
      this.memories = [];
    }
  }

  saveMemories() {
    localStorage.setItem(this.cachedMemoryStorageKey, JSON.stringify(this.memories.slice(0, 24)));
  }

  memoryText(memory) {
    return typeof memory === "string" ? memory : memory.content;
  }

  renderMemories() {
    memoryList.innerHTML = "";
    if (!this.memories.length) {
      const empty = document.createElement("span");
      empty.className = "memory-empty";
      empty.textContent = "还没有记忆。试试说：记住我喜欢夜晚场景。";
      memoryList.append(empty);
      return;
    }
    this.memories.slice(-8).forEach((memory) => {
      const text = this.memoryText(memory);
      if (!text) return;
      const chip = document.createElement("span");
      chip.className = "memory-chip";
      chip.textContent = text;
      memoryList.append(chip);
    });
  }

  addMessage(role, text) {
    this.messages.push({ role, content: text });
    const bubble = document.createElement("div");
    bubble.className = `message ${role}`;
    bubble.textContent = text;
    chatLog.append(bubble);
    chatLog.scrollTop = chatLog.scrollHeight;
    if (role === "assistant") this.game.xixi.say(text);
  }

  rememberFromUser(text) {
    const normalized = text.replace(/\s+/g, " ").trim();
    const patterns = [
      /记住[:：]?\s*(.+)/,
      /帮我记住[:：]?\s*(.+)/,
      /你要记得[:：]?\s*(.+)/,
      /我叫(.{1,18})/,
      /我的名字是(.{1,18})/,
      /我喜欢(.{1,36})/,
      /我不喜欢(.{1,36})/,
      /我希望(.{1,48})/,
    ];
    const match = patterns.map((pattern) => normalized.match(pattern)).find(Boolean);
    if (!match) return;
    const memory = match[0].startsWith("我叫") || match[0].startsWith("我的名字是")
      ? `用户${match[0]}`
      : match[1].trim();
    if (memory.length < 2) return;
    const compact = memory.slice(0, 80);
    if (this.memories.some((item) => this.memoryText(item) === compact)) return;
    this.memories.push(compact);
    this.memories = this.memories.slice(-24);
    this.saveMemories();
    this.renderMemories();
    this.addMessage("system", `熙熙记住了：${compact}`);
  }

  buildSystemPrompt() {
    if (!this.memories.length) return this.systemPrompt;
    return `${this.systemPrompt}\n\n长期记忆（只用于个性化陪伴，不要逐条复述）：\n${this.memories
      .map((memory, index) => `${index + 1}. ${this.memoryText(memory)}`)
      .join("\n")}`;
  }

  setBusy(isBusy) {
    sendChatBtn.disabled = isBusy;
    chatInput.disabled = isBusy;
    sendChatBtn.textContent = isBusy ? "想" : "发送";
  }

  async send() {
    const text = chatInput.value.trim();
    if (!text) return;
    chatInput.value = "";
    this.addMessage("user", text);
    this.game.xixi.setTemporaryState("review", 1200);

    this.setBusy(true);
    try {
      const result = await this.askCloudAgent(text);
      this.addMessage("assistant", result.reply);
      if (result.conversationId) {
        this.conversationId = result.conversationId;
        localStorage.setItem(this.conversationStorageKey, result.conversationId);
      }
      if (Array.isArray(result.memories)) {
        this.memories = result.memories;
        this.saveMemories();
        this.renderMemories();
      }
      this.game.xixi.happy = clamp(this.game.xixi.happy + 0.014, 0, 1);
      this.game.xixi.bond = clamp(this.game.xixi.bond + 0.018, 0, 1);
      this.game.xixi.setTemporaryState("waving", 1400);
    } catch (error) {
      this.addMessage("system", "云端 Agent 暂时不可用，先切回本地熙熙回复。");
      this.rememberFromUser(text);
      this.localReply(text);
      console.error(error);
    } finally {
      this.setBusy(false);
      chatInput.focus();
    }
  }

  async askCloudAgent(text) {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Xixi-Access-Code": accessCodeInput.value.trim(),
      },
      body: JSON.stringify({
        userId: this.userId,
        conversationId: this.conversationId,
        message: text,
        history: this.messages
          .filter((message) => message.role === "user" || message.role === "assistant")
          .slice(-8),
      }),
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Xixi agent ${response.status}: ${detail}`);
    }
    return response.json();
  }

  async loadCloudMemories() {
    try {
      const url = `/api/memories?userId=${encodeURIComponent(this.userId)}`;
      const response = await fetch(url, {
        headers: { "X-Xixi-Access-Code": accessCodeInput.value.trim() },
      });
      if (!response.ok) return;
      const data = await response.json();
      this.memories = data.memories || [];
      this.saveMemories();
      this.renderMemories();
    } catch {
      // Static previews do not have serverless routes; cached local memories remain visible.
    }
  }

  async clearCloudMemories() {
    try {
      await fetch("/api/memories", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-Xixi-Access-Code": accessCodeInput.value.trim(),
        },
        body: JSON.stringify({ userId: this.userId }),
      });
    } catch {
      // Clearing local cache is still useful when the backend is not available.
    }
    this.memories = [];
    this.saveMemories();
    this.renderMemories();
    this.addMessage("system", "熙熙已经忘记保存的长期记忆。");
    this.game.xixi.setTemporaryState("waiting", 1400);
  }

  localReply(text) {
    const lower = text.toLowerCase();
    let reply = this.fallbacks[Math.floor(Math.random() * this.fallbacks.length)];
    if (text.includes("你好") || lower.includes("hello") || lower.includes("hi")) {
      reply = "汪！你好呀，我是熙熙。我已经坐好等你摸摸头了。";
      this.game.xixi.wave();
    } else if (text.includes("吃") || text.includes("饼干")) {
      reply = "熙熙听到吃的就精神了，小饼干可以有一点点吗？";
      this.game.xixi.feed();
    } else if (text.includes("玩") || text.includes("球")) {
      reply = "好耶，熙熙想追球！你点哪里，我就往哪里跑。";
      this.game.xixi.playBall(this.game.bounds);
    } else if (text.includes("累") || text.includes("睡")) {
      reply = "呜，那熙熙陪你慢慢休息，我会安静趴在旁边。";
      this.game.xixi.rest();
    }
    setTimeout(() => this.addMessage("assistant", reply), 280);
  }
}

const game = new Game();
new XixiChat(game);
