// Hero animation: a simulated camera explores a room and builds a point map.
// Mirror surfaces are kept, false depth behind the mirror is rejected and a moving
// person never enters the map. All of it is generated here, it is not recorded data.
type Vec3 = [number, number, number];
type Kind = 0 | 1 | 2 | 3;

const STATIC = 0, MIRROR = 1, GHOST = 2, DYNAMIC = 3;
const CYCLE_SECONDS = 42;
const MAP_END = 0.8;
const TAU = Math.PI * 2;

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: Vec3): Vec3 => {
  const l = Math.hypot(...a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

function viewProjection(eye: Vec3, target: Vec3, aspect: number, fov: number) {
  const f = norm(sub(target, eye));
  const s = norm(cross(f, [0, 1, 0]));
  const u = cross(s, f);
  const t = 1 / Math.tan(fov / 2);
  const near = 0.1, far = 60;
  const a = (far + near) / (near - far), b = (2 * far * near) / (near - far);
  const v = [s[0], u[0], -f[0], 0, s[1], u[1], -f[1], 0, s[2], u[2], -f[2], 0, -dot(s, eye), -dot(u, eye), dot(f, eye), 1];
  const p = [t / aspect, 0, 0, 0, 0, t, 0, 0, 0, 0, a, -1, 0, 0, b, 0];
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) out[c * 4 + r] += p[k * 4 + r] * v[c * 4 + k];
  return out;
}

function mulberry(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function cameraAt(u: number) {
  const a = u * TAU * 1.08 - 0.5;
  const eye: Vec3 = [Math.cos(a) * 2.5 - 0.1, 1.5 + Math.sin(a * 2.3) * 0.22, Math.sin(a) * 1.65 + 0.1];
  const look: Vec3 = [Math.cos(a + 1.05) * 3.4, 1.15 + Math.sin(a * 1.4) * 0.3, Math.sin(a + 1.05) * 2.4];
  return { eye, look };
}

const walker = (t: number): Vec3 => [1.15 + Math.sin(t * TAU * 1.4) * 1.55, 0, 0.75 + Math.cos(t * TAU) * 1.05];

function buildScene(budget: number) {
  const rand = mulberry(7);
  const out: { p: Vec3; kind: Kind }[] = [];
  const add = (p: Vec3, kind: Kind = STATIC) => out.push({ p, kind });
  const j = (a = 0.012) => (rand() - 0.5) * a;
  const rows = (v: number, step: number) => Math.round(v / step) * step;

  const box = (c: Vec3, size: Vec3, count: number, kind: Kind = STATIC) => {
    const areas = [size[1] * size[2], size[0] * size[2], size[0] * size[1]];
    const total = areas[0] + areas[1] + areas[2];
    for (let i = 0; i < count; i++) {
      const pick = rand() * total;
      const axis = pick < areas[0] ? 0 : pick < areas[0] + areas[1] ? 1 : 2;
      const p: Vec3 = [(rand() - 0.5) * size[0], (rand() - 0.5) * size[1], (rand() - 0.5) * size[2]];
      p[axis] = (rand() < 0.5 ? -0.5 : 0.5) * size[axis];
      add([c[0] + p[0] + j(), c[1] + p[1] + j(), c[2] + p[2] + j()], kind);
    }
  };

  const n = budget;
  for (let i = 0; i < n * 0.27; i++) add([rows(-4 + rand() * 8, 0.09) + j(), j(0.008), rows(-3 + rand() * 6, 0.09) + j()]);
  for (let i = 0; i < n * 0.2; i++) add([-4 + rand() * 8 + j(), rows(rand() * 3, 0.075), -3 + j()]);
  for (let i = 0; i < n * 0.14; i++) add([-4 + j(), rows(rand() * 3, 0.075), -3 + rand() * 6 + j()]);
  for (let i = 0; i < n * 0.1; i++) {
    const y = rows(rand() * 3, 0.075), z = -3 + rand() * 6;
    if (!(y > 0.5 && y < 2.5 && Math.abs(z) < 1.4)) add([4 + j(), y, z + j()]);
  }
  box([-1.5, 0.3, -2.45], [3.2, 0.6, 0.95], n * 0.05);
  box([-1.5, 0.72, -2.84], [3.2, 0.5, 0.26], n * 0.022);
  box([-2.2, 0.42, 0.7], [1.25, 0.05, 0.8], n * 0.018);
  for (const x of [-2.73, -1.67]) for (const z of [0.36, 1.04]) box([x, 0.2, z], [0.04, 0.4, 0.04], n * 0.002);
  for (const y of [0.03, 0.6, 1.17, 1.74, 2.3]) box([2.6, y, -2.72], [1.15, 0.03, 0.42], n * 0.005);
  for (const x of [2.04, 3.16]) for (const z of [-2.92, -2.52]) box([x, 1.17, z], [0.03, 2.34, 0.03], n * 0.002);
  for (let i = 0; i < n * 0.075; i++) add([4 + j(0.006), 0.5 + rand() * 2, -1.4 + rand() * 2.8], MIRROR);
  for (let i = 0; i < n * 0.05; i++) {
    const d = 0.25 + rand() * 2.1, spread = 1 - d * 0.1;
    add([4 + d, 1.5 + (rand() - 0.5) * 2 * spread, (rand() - 0.5) * 2.8 * spread], GHOST);
  }
  const person = Math.round(n * 0.04);
  for (let i = 0; i < person; i++) {
    const a = rand() * TAU, y = rand();
    const r = y > 0.84 ? 0.11 : y > 0.5 ? 0.21 : 0.13;
    const legs = y < 0.46 ? (rand() < 0.5 ? -0.1 : 0.1) : 0;
    add([Math.cos(a) * r + legs, y * 1.75, Math.sin(a) * r * 0.75], DYNAMIC);
  }
  return out;
}

function program(gl: WebGLRenderingContext, vertex: string, fragment: string) {
  const prog = gl.createProgram() as WebGLProgram;
  for (const [type, source] of [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, fragment]] as const) {
    const shader = gl.createShader(type) as WebGLShader;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(prog, shader);
  }
  gl.linkProgram(prog);
  return prog;
}

const POINT_VS = `
attribute vec3 a_pos; attribute float a_reveal, a_kind, a_seed;
uniform mat4 u_vp; uniform float u_t, u_size, u_fade; uniform vec2 u_shift; uniform vec3 u_walker;
varying vec4 v_color;
void main() {
  vec3 p = a_pos; vec3 c; float a;
  float r = smoothstep(a_reveal, a_reveal + .012, u_t);
  float flash = r * (1. - smoothstep(a_reveal + .004, a_reveal + .05, u_t));
  if (a_kind < .5) {
    c = mix(vec3(.42,.5,.58), vec3(.86,.9,.93), clamp(p.y / 3., 0., 1.) * .55 + a_seed * .45);
    a = r * .74;
  } else if (a_kind < 1.5) { c = vec3(.95,.17,.38); a = r; }
  else if (a_kind < 2.5) { c = vec3(.95,.17,.38); a = r * (1. - smoothstep(a_reveal + .03, a_reveal + .09, u_t)) * .8; }
  else { p += u_walker; c = vec3(.73,.87,.2); a = .95; flash = 0.; }
  c = mix(c, vec3(1.), flash * .75);
  gl_Position = u_vp * vec4(p, 1.);
  gl_Position.xy += u_shift * gl_Position.w;
  gl_PointSize = u_size * (a_kind > .5 && a_kind < 1.5 ? 1.3 : 1.) * (1. + flash * 1.3) / gl_Position.w;
  v_color = vec4(c, a * u_fade);
}`;
const POINT_FS = `
precision mediump float; varying vec4 v_color;
void main() {
  float m = smoothstep(.5, .25, length(gl_PointCoord - .5));
  gl_FragColor = vec4(v_color.rgb, v_color.a * m);
}`;
const LINE_VS = `
attribute vec3 a_pos; attribute float a_t;
uniform mat4 u_vp; uniform float u_t; uniform vec2 u_shift;
varying float v_on;
void main() {
  v_on = a_t <= u_t ? 1. : 0.;
  gl_Position = u_vp * vec4(a_pos, 1.);
  gl_Position.xy += u_shift * gl_Position.w;
}`;
const LINE_FS = `
precision mediump float; uniform vec4 u_color; varying float v_on;
void main() { if (v_on < .5) discard; gl_FragColor = u_color; }`;

function start(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl', { antialias: true, alpha: false, powerPreference: 'low-power' });
  if (!gl) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = innerWidth < 760;
  const scene = buildScene(small ? 7000 : 15000);
  const steps = 240;
  const rand = mulberry(21);

  // Work out when the simulated camera first sees each point.
  const tan = { h: Math.tan((64 * Math.PI) / 360), v: Math.tan((48 * Math.PI) / 360) };
  const frames = Array.from({ length: steps + 1 }, (_, k) => {
    const { eye, look } = cameraAt(k / steps);
    const f = norm(sub(look, eye));
    const s = norm(cross(f, [0, 1, 0]));
    return { eye, f, s, u: cross(s, f) };
  });
  const data = new Float32Array(scene.length * 6);
  const mapped: number[] = [];
  let rejected = 0;
  scene.forEach(({ p, kind }, i) => {
    let reveal = 3;
    if (kind !== DYNAMIC) {
      const seen = kind === GHOST ? ([4, p[1], p[2]] as Vec3) : p;
      for (let k = 0; k <= steps; k++) {
        const c = frames[k];
        const d = sub(seen, c.eye);
        const z = dot(d, c.f);
        if (z < 0.3 || z > 6.8) continue;
        if (Math.abs(dot(d, c.s)) < z * tan.h && Math.abs(dot(d, c.u)) < z * tan.v) {
          reveal = (k / steps) * MAP_END;
          break;
        }
      }
    }
    if (reveal < 3 && kind !== GHOST) mapped.push(reveal);
    if (reveal < 3 && kind === GHOST) rejected++;
    data.set([p[0], p[1], p[2], reveal, kind, rand()], i * 6);
  });
  mapped.sort((a, b) => a - b);

  const points = program(gl, POINT_VS, POINT_FS);
  const lines = program(gl, LINE_VS, LINE_FS);
  const pointBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  const path = new Float32Array((steps + 1) * 4);
  frames.forEach((c, k) => path.set([c.eye[0], c.eye[1], c.eye[2], (k / steps) * MAP_END], k * 4));
  const pathBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, pathBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, path, gl.STATIC_DRAW);
  const frustumData = new Float32Array(16 * 4);
  const frustumBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, frustumBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, frustumData, gl.DYNAMIC_DRAW);

  const u = (prog: WebGLProgram, name: string) => gl.getUniformLocation(prog, name);
  const pu = { vp: u(points, 'u_vp'), t: u(points, 'u_t'), size: u(points, 'u_size'), fade: u(points, 'u_fade'), shift: u(points, 'u_shift'), walker: u(points, 'u_walker') };
  const lu = { vp: u(lines, 'u_vp'), t: u(lines, 'u_t'), shift: u(lines, 'u_shift'), color: u(lines, 'u_color') };
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0.043, 0.055, 0.067, 1);

  let width = 1, height = 1, ratio = 1;
  const resize = () => {
    ratio = Math.min(devicePixelRatio || 1, 2);
    width = canvas.clientWidth || 1;
    height = canvas.clientHeight || 1;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (paused || reduced) draw(clock);
  };

  const pointerTarget = { x: 0, y: 0 }, pointer = { x: 0, y: 0 };
  if (!reduced && matchMedia('(pointer: fine)').matches) {
    addEventListener('pointermove', (e) => {
      pointerTarget.x = e.clientX / innerWidth - 0.5;
      pointerTarget.y = e.clientY / innerHeight - 0.5;
    }, { passive: true });
  }

  const hud = {
    points: document.querySelector('[data-hud=points]'),
    rejected: document.querySelector('[data-hud=rejected]'),
  };
  let hudAt = -1;
  const updateHud = (t: number) => {
    let lo = 0, hi = mapped.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (mapped[mid] <= t) lo = mid + 1;
      else hi = mid;
    }
    if (hud.points) hud.points.textContent = lo.toLocaleString('en-US');
    if (hud.rejected) hud.rejected.textContent = Math.round(rejected * Math.min(1, t / MAP_END)).toLocaleString('en-US');
  };

  let clock = reduced ? 0.86 : 0.04;
  function draw(t: number) {
    const wide = width > 900;
    const aspect = width / height;
    const orbit = (wide ? -0.5 : -0.34) + Math.sin(t * TAU) * 0.2 + pointer.x * 0.22;
    const dist = wide ? 15.6 : 21;
    const eye: Vec3 = [Math.sin(orbit) * dist + 0.8, 5.1 - pointer.y * 1.1, Math.cos(orbit) * dist];
    const vp = viewProjection(eye, [0.9, 0.95, -0.2], aspect, (40 * Math.PI) / 180);
    const shift = wide ? [0.47, 0.28] : [0, 0.64];
    const fade = 1 - Math.max(0, (t - 0.95) / 0.05);
    const intro = Math.min(1, t / 0.02);
    gl!.clear(gl!.COLOR_BUFFER_BIT);

    gl!.useProgram(points);
    gl!.bindBuffer(gl!.ARRAY_BUFFER, pointBuffer);
    const stride = 24;
    [['a_pos', 3, 0], ['a_reveal', 1, 12], ['a_kind', 1, 16], ['a_seed', 1, 20]].forEach(([name, size, offset]) => {
      const at = gl!.getAttribLocation(points, name as string);
      gl!.enableVertexAttribArray(at);
      gl!.vertexAttribPointer(at, size as number, gl!.FLOAT, false, stride, offset as number);
    });
    gl!.uniformMatrix4fv(pu.vp, false, vp);
    gl!.uniform1f(pu.t, t);
    gl!.uniform1f(pu.size, (wide ? 30 : 25) * ratio * (height / 800));
    gl!.uniform1f(pu.fade, fade * intro);
    gl!.uniform2f(pu.shift, shift[0], shift[1]);
    gl!.uniform3fv(pu.walker, walker(t));
    gl!.drawArrays(gl!.POINTS, 0, scene.length);

    const u01 = Math.min(1, t / MAP_END);
    const c = cameraAt(u01);
    const f = norm(sub(c.look, c.eye));
    const s = norm(cross(f, [0, 1, 0]));
    const up = cross(s, f);
    const depth = 0.62;
    const corner = (a: number, b: number): Vec3 => [0, 1, 2].map((i) => c.eye[i] + f[i] * depth + s[i] * a * depth * tan.h + up[i] * b * depth * tan.v) as Vec3;
    const q = [corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)];
    const seg: Vec3[] = [c.eye, q[0], c.eye, q[1], c.eye, q[2], c.eye, q[3], q[0], q[1], q[1], q[2], q[2], q[3], q[3], q[0]];
    seg.forEach((v, i) => frustumData.set([v[0], v[1], v[2], -1], i * 4));

    gl!.useProgram(lines);
    const posAt = gl!.getAttribLocation(lines, 'a_pos'), tAt = gl!.getAttribLocation(lines, 'a_t');
    gl!.enableVertexAttribArray(posAt);
    gl!.enableVertexAttribArray(tAt);
    gl!.uniformMatrix4fv(lu.vp, false, vp);
    gl!.uniform1f(lu.t, t);
    gl!.uniform2f(lu.shift, shift[0], shift[1]);
    gl!.bindBuffer(gl!.ARRAY_BUFFER, pathBuffer);
    gl!.vertexAttribPointer(posAt, 3, gl!.FLOAT, false, 16, 0);
    gl!.vertexAttribPointer(tAt, 1, gl!.FLOAT, false, 16, 12);
    gl!.uniform4f(lu.color, 1, 1, 1, 0.55 * fade);
    gl!.drawArrays(gl!.LINE_STRIP, 0, steps + 1);
    gl!.bindBuffer(gl!.ARRAY_BUFFER, frustumBuffer);
    gl!.bufferSubData(gl!.ARRAY_BUFFER, 0, frustumData);
    gl!.vertexAttribPointer(posAt, 3, gl!.FLOAT, false, 16, 0);
    gl!.vertexAttribPointer(tAt, 1, gl!.FLOAT, false, 16, 12);
    gl!.uniform4f(lu.color, 1, 1, 1, 0.92 * fade);
    gl!.drawArrays(gl!.LINES, 0, 16);
  }

  let paused = false, visible = true, last = 0, raf = 0;
  const loop = (now: number) => {
    raf = 0;
    if (paused || !visible || document.hidden) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    clock = (clock + dt / CYCLE_SECONDS) % 1;
    pointer.x += (pointerTarget.x - pointer.x) * 0.04;
    pointer.y += (pointerTarget.y - pointer.y) * 0.04;
    draw(clock);
    if (now - hudAt > 180) {
      hudAt = now;
      updateHud(clock);
    }
    raf = requestAnimationFrame(loop);
  };
  const play = () => {
    if (!raf && !reduced) {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }
  };

  new ResizeObserver(resize).observe(canvas);
  resize();
  draw(clock);
  updateHud(clock);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    play();
  }).observe(canvas);
  document.addEventListener('visibilitychange', play);

  const pause = document.querySelector<HTMLButtonElement>('[data-hero-pause]');
  if (pause) {
    if (reduced) pause.hidden = true;
    pause.addEventListener('click', () => {
      paused = !paused;
      pause.textContent = paused ? 'Play' : 'Pause';
      play();
    });
  }
  play();
}

const canvas = document.querySelector<HTMLCanvasElement>('[data-slam]');
if (canvas) start(canvas);
