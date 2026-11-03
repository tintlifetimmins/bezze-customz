import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const RT = 3.9;
const RB = 3.7;
const HB = 20.4;

function sampleColor(source) {
  const probe = document.createElement('canvas');
  probe.width = 4;
  probe.height = 4;
  const g = probe.getContext('2d', { willReadFrequently: true });
  const sy = Math.floor(source.height * 0.9);
  const sh = Math.max(1, Math.floor(source.height * 0.08));
  g.drawImage(source, source.width * 0.25, sy, source.width * 0.5, sh, 0, 0, 4, 4);
  const pixel = g.getImageData(1, 1, 1, 1).data;
  return new THREE.Color(pixel[0] / 255, pixel[1] / 255, pixel[2] / 255);
}

function roughnessMap() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const g = canvas.getContext('2d');
  const img = g.createImageData(256, 256);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 190 + Math.random() * 55;
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  return tex;
}

function studioEnvironment(renderer) {
  const env = new THREE.Scene();
  env.background = new THREE.Color(0x2a2730);
  const panelMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(1, 1, 1).multiplyScalar(8),
    side: THREE.DoubleSide,
  });
  for (const [x, z, w] of [[-14, 12, 3], [16, 8, 1.6], [0, -18, 6]]) {
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(w, 40), panelMat);
    panel.position.set(x, 10, z);
    panel.lookAt(0, 10, 0);
    env.add(panel);
  }
  const pmrem = new THREE.PMREMGenerator(renderer);
  const texture = pmrem.fromScene(env, 0.04).texture;
  pmrem.dispose();
  return texture;
}

function buildTumbler(texture, rough) {
  const satin = new THREE.MeshPhysicalMaterial({
    map: texture,
    roughnessMap: rough,
    metalness: 0,
    roughness: 0.5,
    clearcoat: 0.35,
    clearcoatRoughness: 0.3,
    envMapIntensity: 0.6,
  });
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(RT - 0.0016, RB + 0.02, 19.2, 128, 1, true, Math.PI, Math.PI * 2),
    satin,
  );
  body.position.y = 0.5 + 9.6;
  body.castShadow = true;

  const basePoints = [new THREE.Vector2(0, 0.02)];
  for (let i = 0; i <= 12; i += 1) {
    const t = (i / 12) * Math.PI / 2;
    basePoints.push(new THREE.Vector2(RB + 0.02 - 0.5 + Math.sin(t) * 0.5, 0.5 - Math.cos(t) * 0.5));
  }
  const baseMat = new THREE.MeshPhysicalMaterial({
    color: 0x7a0040,
    roughness: 0.4,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
  });
  const base = new THREE.Mesh(new THREE.LatheGeometry(basePoints, 96), baseMat);
  base.castShadow = true;

  const rimPoints = [new THREE.Vector2(RT, 19.7)];
  for (let i = 0; i <= 10; i += 1) {
    const t = (i / 10) * Math.PI;
    rimPoints.push(new THREE.Vector2(RT - 0.09 + Math.sin(t) * 0.09, 19.7 + (0.5 * i) / 10 + Math.sin(t) * 0.02));
  }
  rimPoints.push(new THREE.Vector2(RT - 0.18, HB));
  rimPoints.push(new THREE.Vector2(RT - 0.25, 19.5));
  const steel = new THREE.MeshPhysicalMaterial({ color: 0xe2e2e6, metalness: 1, roughness: 0.16 });
  const rim = new THREE.Mesh(new THREE.LatheGeometry(rimPoints, 96), steel);
  rim.castShadow = true;

  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xdfe6ea,
    metalness: 0,
    roughness: 0.05,
    transparent: true,
    opacity: 0.28,
    ior: 1.49,
    depthWrite: false,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    specularIntensity: 1,
    envMapIntensity: 2.5,
    side: THREE.DoubleSide,
  });
  const lidPoints = [[RT - 0.3, 19.6], [RT - 0.3, 20.3], [RT + 0.06, 20.32], [RT + 0.1, 20.45], [RT + 0.1, 20.95], [RT + 0.04, 21.05], [RT - 0.15, 21.08], [RT - 0.3, 20.9], [RT - 0.45, 20.85], [0.01, 20.85]]
    .map(([x, y]) => new THREE.Vector2(x, y));
  const lid = new THREE.Mesh(new THREE.LatheGeometry(lidPoints, 96), glass);
  const slider = new THREE.Mesh(new RoundedBoxGeometry(2.0, 0.18, 1.0, 3, 0.08), glass);
  slider.position.set(0, 20.97, 1.9);
  const sip = new THREE.Mesh(
    new RoundedBoxGeometry(1.3, 0.06, 0.42, 2, 0.03),
    new THREE.MeshPhysicalMaterial({ color: 0x0a0a0a, roughness: 0.5 }),
  );
  sip.position.set(0, 20.9, 2.75);
  const edge = new THREE.Mesh(
    new THREE.TorusGeometry(RT + 0.08, 0.05, 12, 80),
    new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, roughness: 0.05, envMapIntensity: 3 }),
  );
  edge.rotation.x = Math.PI / 2;
  edge.position.y = 20.95;
  const inner = new THREE.Mesh(
    new THREE.CylinderGeometry(RT - 0.3, RT - 0.3, 1.2, 64, 1, false),
    new THREE.MeshPhysicalMaterial({ color: 0x9a9aa0, metalness: 1, roughness: 0.35 }),
  );
  inner.position.y = 19.9;

  const group = new THREE.Group();
  group.add(body, base, rim, lid, slider, sip, inner, edge);
  return { group, baseMat, satin };
}

export class TumblerViewer {
  constructor(canvas, { spin = false, distance = 74, exposure = 0.95, maxPixelRatio = 1.75 } = {}) {
    this.canvas = canvas;
    this.spin = spin;
    this.distance = distance;
    this.maxPixelRatio = maxPixelRatio;
    this.angle = 0.08;
    this.dragging = false;
    this.moved = false;
    this.onRelease = null;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.trimmed = false;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = exposure;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.environment = studioEnvironment(this.renderer);
    this.scene.environmentIntensity = 0.95;
    this.scene.environmentRotation = new THREE.Euler(0, 0.6, 0);

    this.buffer = document.createElement('canvas');
    this.buffer.width = 1024;
    this.buffer.height = 882;
    const seed = this.buffer.getContext('2d');
    seed.fillStyle = '#c2006b';
    seed.fillRect(0, 0, this.buffer.width, this.buffer.height);
    this.texture = new THREE.CanvasTexture(this.buffer);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.flipY = true;
    this.texture.wrapS = THREE.ClampToEdgeWrapping;
    this.texture.wrapT = THREE.ClampToEdgeWrapping;
    this.texture.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
    if (!spin) {
      this.texture.generateMipmaps = false;
      this.texture.minFilter = THREE.LinearFilter;
      this.texture.magFilter = THREE.LinearFilter;
    }
    this.applyCrop(false);

    const { group, baseMat } = buildTumbler(this.texture, roughnessMap());
    this.group = group;
    this.baseMat = baseMat;
    this.group.rotation.y = this.angle;
    this.scene.add(group);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ opacity: 0.38 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    const blobCanvas = document.createElement('canvas');
    blobCanvas.width = 256;
    blobCanvas.height = 256;
    const bg = blobCanvas.getContext('2d');
    const rad = bg.createRadialGradient(128, 128, 10, 128, 128, 128);
    rad.addColorStop(0, 'rgba(0,0,0,.85)');
    rad.addColorStop(0.45, 'rgba(0,0,0,.45)');
    rad.addColorStop(1, 'rgba(0,0,0,0)');
    bg.fillStyle = rad;
    bg.fillRect(0, 0, 256, 256);
    const blob = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(blobCanvas), transparent: true, depthWrite: false }),
    );
    blob.rotation.x = -Math.PI / 2;
    blob.position.y = 0.02;
    this.scene.add(blob);

    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(-8, 28, 18);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.radius = 6;
    key.shadow.bias = -0.001;
    Object.assign(key.shadow.camera, { left: -12, right: 12, top: 24, bottom: -4, near: 1, far: 80 });
    this.scene.add(key);
    this.scene.add(new THREE.HemisphereLight(0xfff4f8, 0x12080e, 0.45));

    const rim = new THREE.SpotLight(0xff3d9a, 80, 80, 0.55, 0.8, 1.2);
    rim.position.set(18, 22, -16);
    rim.target.position.set(0, 12, 0);
    this.scene.add(rim, rim.target);
    const fill = new THREE.SpotLight(0xffffff, 40, 80, 0.6, 1, 1.2);
    fill.position.set(-16, 16, 14);
    fill.target.position.set(0, 10, 0);
    this.scene.add(fill, fill.target);

    this.camera = new THREE.PerspectiveCamera(24, 1, 0.1, 200);
    this.camera.position.set(0, 11, distance);
    this.camera.lookAt(0, 10.5, 0);

    this.lastX = 0;
    canvas.addEventListener('pointerdown', (event) => {
      this.dragging = true;
      this.moved = false;
      this.lastX = event.clientX;
      canvas.setPointerCapture?.(event.pointerId);
    });
    canvas.addEventListener('pointermove', (event) => {
      if (!this.dragging) return;
      const dx = event.clientX - this.lastX;
      if (Math.abs(dx) > 2) this.moved = true;
      this.angle += dx * 0.01;
      this.lastX = event.clientX;
      this.group.rotation.y = this.angle;
      if (!this.spin) this.render();
    });
    const end = () => {
      if (!this.dragging) return;
      const moved = this.moved;
      this.dragging = false;
      if (this.onRelease) this.onRelease({ moved });
    };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);

    this._last = performance.now();
    if (spin) {
      const loop = (now) => {
        const dt = now - this._last;
        this._last = now;
        if (!this.dragging && !this.reduced) {
          this.angle += dt * 0.000045;
          this.group.rotation.y = this.angle;
        }
        this.render();
        this._raf = requestAnimationFrame(loop);
      };
      this._raf = requestAnimationFrame(loop);
    }
    this.resize();
  }

  applyCrop(trimmed) {
    this.trimmed = trimmed;
    if (trimmed) {
      this.texture.repeat.set(1, 1);
      this.texture.offset.set(0, 0);
    } else {
      this.texture.repeat.set(246 / 252, 211 / 217);
      this.texture.offset.set(3 / 252, 3 / 217);
    }
  }

  setWrap(source, { trimmed = false } = {}) {
    if (!source || !source.width || !source.height) return;
    this.buffer.getContext('2d').drawImage(source, 0, 0, this.buffer.width, this.buffer.height);
    this.applyCrop(trimmed);
    this.texture.needsUpdate = true;
    this.baseMat.color.copy(sampleColor(this.buffer));
    if (!this.spin) this.render();
  }

  turn(delta) {
    this.angle += delta;
    this.group.rotation.y = this.angle;
    if (!this.spin) this.render();
  }

  resize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (!w || !h) return;
    const pr = Math.min(window.devicePixelRatio || 1, this.maxPixelRatio || 1.75);
    this.renderer.setPixelRatio(pr);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.position.set(0, 11, this.distance);
    this.camera.lookAt(0, 10.5, 0);
    this.camera.updateProjectionMatrix();
    if (!this.spin) this.render();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    cancelAnimationFrame(this._raf);
    this.renderer.dispose();
  }
}
