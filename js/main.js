import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* ================= palette (from the portfolio CSS) ================= */
const C = {
  bg:0x0a0e1a, bgSoft:0x0d1220, card:0x10152a, field:0x0b0f1e,
  text:0xe8edf5, dim:0x8b93a7, dimmer:0x5c6577,
  accent:0xff8a5c, key:0x8ab4f8, str:0xf4a583
};

/* ================= renderer / scene / camera ================= */
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;

const scene = new THREE.Scene();
scene.background = new THREE.Color(C.bg);
scene.fog = new THREE.Fog(C.bg, 13, 30);

const camera = new THREE.PerspectiveCamera(55, innerWidth/innerHeight, .1, 100);
camera.position.set(4.6, 3.0, 6.0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.4, -1);
controls.enableDamping = true;
controls.dampingFactor = .06;
controls.minDistance = 2.2;
controls.maxDistance = 13;
controls.maxPolarAngle = Math.PI * .495;
controls.minPolarAngle = .12;
controls.enablePan = false;

/* ================= lights ================= */
scene.add(new THREE.AmbientLight(0x3a4a6e, 3.4));
scene.add(new THREE.HemisphereLight(0x2b3a5e, 0x0c1020, 1.2));
const moon = new THREE.DirectionalLight(0x8ab4f8, .85);
moon.position.set(4, 7, 5);
scene.add(moon);
const deskFill = new THREE.PointLight(0x9db4e8, 5, 10, 2);
deskFill.position.set(0, 3.6, -.5);
scene.add(deskFill);

const lampLight = new THREE.PointLight(C.accent, 14, 7.5, 2);
lampLight.position.set(-3.55, 2.05, -2.9);
lampLight.castShadow = true;
lampLight.shadow.mapSize.set(1024, 1024);
scene.add(lampLight);

const screenGlow = new THREE.PointLight(C.key, 5, 3.4, 2);
screenGlow.position.set(0, 1.8, -1.9);
scene.add(screenGlow);

/* ================= material helpers ================= */
const mat = (color, rough=.85, metal=.05) =>
  new THREE.MeshStandardMaterial({color, roughness:rough, metalness:metal});
function box(w,h,d,color,x,y,z, rough, metal){
  const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat(color,rough,metal));
  m.position.set(x,y,z); m.castShadow = true; m.receiveShadow = true;
  return m;
}

/* ================= room shell ================= */
const floor = new THREE.Mesh(new THREE.PlaneGeometry(11,9), mat(0x141c38, .95));
floor.rotation.x = -Math.PI/2; floor.receiveShadow = true;
scene.add(floor);

function wall(w,h,x,y,z,ry){
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w,h), mat(0x182040, .95));
  m.position.set(x,y,z); m.rotation.y = ry; m.receiveShadow = true;
  scene.add(m);
}
wall(11, 4.6,  0,   2.3, -4.5, 0);          // back
wall(9,  4.6, -5.5, 2.3,  0,   Math.PI/2);   // left
wall(9,  4.6,  5.5, 2.3,  0,  -Math.PI/2);   // right

// red carpet
const carpetTex = new THREE.TextureLoader().load('carpet.jpg');
carpetTex.colorSpace = THREE.SRGBColorSpace;
carpetTex.anisotropy = 8;
const rug = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 5.6),
  new THREE.MeshStandardMaterial({map:carpetTex, emissive:0xffffff, emissiveMap:carpetTex, emissiveIntensity:.3, roughness:1}));
rug.rotation.x = -Math.PI/2; rug.position.set(0,.012,-.6); rug.receiveShadow = true;
scene.add(rug);

/* ================= desk + monitor (PROJECTS) ================= */
const desk = new THREE.Group();
desk.add(box(3.4,.09,1.3, 0x141a2e, 0,1.0,0, .6,.2));
desk.add(box(.09,1,.09, 0x0d1220, -1.55,.5,-.5));
desk.add(box(.09,1,.09, 0x0d1220,  1.55,.5,-.5));
desk.add(box(.09,1,.09, 0x0d1220, -1.55,.5,.5));
desk.add(box(.09,1,.09, 0x0d1220,  1.55,.5,.5));
desk.position.set(0,0,-2.9);
scene.add(desk);

const monitor = new THREE.Group();
monitor.add(box(.1,.4,.1, 0x1a2138, 0,.2,-.05));                 // stand
monitor.add(box(.5,.05,.3, 0x1a2138, 0,.02,0));                   // base
monitor.add(box(1.7,1,.06, 0x05070d, 0,.85,0, .4,.4));            // body
// screen with live "code" texture
const scr = document.createElement('canvas'); scr.width = 512; scr.height = 300;
{
  const g = scr.getContext('2d');
  g.fillStyle = '#05070d'; g.fillRect(0,0,512,300);
  g.font = '15px "Courier New", monospace';
  const line = (segs, y) => { let x = 22; for (const [t,c] of segs){ g.fillStyle=c; g.fillText(t,x,y); x += g.measureText(t).width; } };
  line([['const ', '#8ab4f8'], ['yazed', '#e8edf5'], [' = {', '#8b93a7']], 50);
  line([['  role', '#8ab4f8'], [': ', '#8b93a7'], ['"Full-Stack Dev"', '#f4a583'], [',', '#8b93a7']], 82);
  line([['  focus', '#8ab4f8'], [': ', '#8b93a7'], ['"Clean UI + Data"', '#f4a583'], [',', '#8b93a7']], 114);
  line([['  stack', '#8ab4f8'], [': [', '#8b93a7'], ['"React"', '#f4a583'], [', ', '#8b93a7'], ['"Laravel"', '#f4a583'], [', ', '#8b93a7'], ['"SQL"', '#f4a583'], ['],', '#8b93a7']], 146);
  line([['  openToWork', '#8ab4f8'], [': ', '#8b93a7'], ['true', '#ff8a5c']], 178);
  line([['};', '#8b93a7']], 210);
  line([['render', '#ff8a5c'], ['(yazed.projects);', '#8b93a7']], 250);
  g.fillStyle = '#ff8a5c'; g.fillRect(22, 268, 9, 16); // cursor
}
const scrTex = new THREE.CanvasTexture(scr);
const screenFace = new THREE.Mesh(
  new THREE.PlaneGeometry(1.58,.88),
  new THREE.MeshStandardMaterial({color:0x000000, emissive:0xffffff, emissiveMap:scrTex, emissiveIntensity:.85})
);
screenFace.position.set(0,.85,.031);
monitor.add(screenFace);
monitor.position.set(0,1.045,-3.15);
scene.add(monitor);

// keyboard + mug + phone
desk.add(box(.95,.035,.32, 0x1a2138, -.15,1.07,-.15, .5,.3));
const mug = new THREE.Mesh(new THREE.CylinderGeometry(.06,.05,.12,18), mat(C.accent,.6));
mug.position.set(-1.25,1.1,-3); mug.castShadow = true; scene.add(mug);

const phone = new THREE.Group();
phone.add(box(.17,.02,.34, 0x05070d, 0,0,0, .35,.5));
const phoneScr = new THREE.Mesh(new THREE.PlaneGeometry(.14,.3),
  new THREE.MeshStandardMaterial({color:0x000000, emissive:C.accent, emissiveIntensity:.55}));
phoneScr.rotation.x = -Math.PI/2; phoneScr.position.y = .011;
phone.add(phoneScr);
phone.position.set(1.05,1.06,-2.85);
scene.add(phone);

/* ================= coffee cup (desk) ================= */
const cup = new THREE.Group();
const cupBody = new THREE.Mesh(new THREE.CylinderGeometry(.07,.055,.11,20), mat(0xe8edf5,.4,.05));
cupBody.position.y=.055; cupBody.castShadow=true; cup.add(cupBody);
const coffee = new THREE.Mesh(new THREE.CircleGeometry(.062,20), new THREE.MeshStandardMaterial({color:0x2a1608, roughness:.3}));
coffee.rotation.x=-Math.PI/2; coffee.position.y=.099; cup.add(coffee);
const handle = new THREE.Mesh(new THREE.TorusGeometry(.04,.011,8,16), mat(0xe8edf5,.4,.05));
handle.position.set(.085,.058,0); cup.add(handle);
const saucer = new THREE.Mesh(new THREE.CylinderGeometry(.12,.1,.012,24), mat(0xe8edf5,.4,.05));
saucer.position.y=.006; cup.add(saucer);
cup.position.set(-1.0,1.05,-2.65);
scene.add(cup);


/* ================= Saul mug + 3 business cards (desk) ================= */
{
  const lt = new THREE.TextureLoader();
  const mugG = new THREE.Group();
  const yel = new THREE.MeshStandardMaterial({color:0xf2c800, roughness:.35, metalness:.1});
  const body = new THREE.Mesh(new THREE.CylinderGeometry(.062,.048,.17,32), yel);
  body.position.y=.105; body.castShadow=true; mugG.add(body);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(.049,.049,.02,32), mat(0xb8bcc4,.3,.8));
  base.position.y=.01; mugG.add(base);
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(.066,.066,.025,32), mat(0x2b2d31,.6,.1));
  lid.position.y=.2; mugG.add(lid);
  const lidTop = new THREE.Mesh(new THREE.CylinderGeometry(.052,.058,.015,32), mat(0x1c1d20,.6,.1));
  lidTop.position.y=.22; mugG.add(lidTop);
  const labTex = lt.load('2-mug-label.jpg'); labTex.colorSpace = THREE.SRGBColorSpace;
  const lab = new THREE.Mesh(new THREE.CylinderGeometry(.0625,.0485,.17,32,1,true,-Math.PI*0.375, Math.PI*0.75),
    new THREE.MeshStandardMaterial({map:labTex, emissive:0xffffff, emissiveMap:labTex, emissiveIntensity:.25, roughness:.4}));
  lab.scale.set(1.004,1,1.004); lab.position.y=.105; lab.rotation.y = 0; mugG.add(lab);
  mugG.position.set(-1.45,1.045,-2.45);
  mugG.rotation.y = 0.15;
  scene.add(mugG);

  const cardTex = lt.load('3-card.jpg'); cardTex.colorSpace = THREE.SRGBColorSpace; cardTex.anisotropy = 8;
  [[.15,-2.5,.12],[.5,-2.55,-.18],[.85,-2.45,.3]].forEach(([x,z,r],i)=>{
    const c = new THREE.Mesh(new THREE.BoxGeometry(.34,.004,.214),
      [0,1,2,3,4,5].map(k=> k===2 ? new THREE.MeshStandardMaterial({map:cardTex, emissive:0xffffff, emissiveMap:cardTex, emissiveIntensity:.35, roughness:.5}) : mat(0xf0e6c0,.6,0)));
    c.position.set(x,1.047+i*.0015,z); c.rotation.y=r; c.receiveShadow=true; scene.add(c);
  });
}

/* ================= bookshelf (SKILLS) ================= */
const shelf = new THREE.Group();
const shelfW = 1.7, shelfH = 2.3, shelfD = .42;
shelf.add(box(.07,shelfH,shelfD, 0x141a2e, -shelfW/2, shelfH/2, 0));
shelf.add(box(.07,shelfH,shelfD, 0x141a2e,  shelfW/2, shelfH/2, 0));
shelf.add(box(shelfW,.07,shelfD, 0x141a2e, 0, shelfH, 0));
shelf.add(box(shelfW,.07,shelfD, 0x141a2e, 0, .035, 0));
const shelfYs = [.72, 1.38, 2.04];
for (const y of shelfYs) shelf.add(box(shelfW-.1,.05,shelfD-.04, 0x141a2e, 0, y, 0));
const bookCols = [C.accent, C.key, C.str, C.dim, C.dimmer, 0xb56a4a, 0x4a6b8a];
let seed = 7;
const rnd = () => (seed = (seed*16807) % 2147483647) / 2147483647;
for (const baseY of [.1, .745, 1.405, 2.065]) {
  let x = -shelfW/2 + .12;
  while (x < shelfW/2 - .18) {
    const w = .05 + rnd()*.05, h = .3 + rnd()*.18;
    if (rnd() > .12) {
      const b = box(w,h,shelfD-.14, bookCols[Math.floor(rnd()*bookCols.length)], x+w/2, baseY+.025+h/2, 0, .9);
      b.rotation.z = rnd() > .9 ? .06 : 0;
      shelf.add(b);
    }
    x += w + .015;
  }
}
shelf.position.set(3.6, 0, -3.9);
scene.add(shelf);

/* ================= poster (ABOUT) ================= */
const poster = new THREE.Group();
poster.add(box(1.5,1.9,.04, C.card, 0,0,0, .8));
const pc = document.createElement('canvas'); pc.width = 400; pc.height = 506;
{
  const g = pc.getContext('2d');
  g.fillStyle = '#10152a'; g.fillRect(0,0,400,506);
  g.strokeStyle = '#ff8a5c'; g.lineWidth = 5; g.strokeRect(14,14,372,478);
  g.textAlign = 'center';
  g.fillStyle = '#e8edf5'; g.font = '700 62px "Segoe UI", system-ui, sans-serif';
  g.fillText('YAZED', 200, 120);
  g.fillStyle = '#ff8a5c'; g.fillRect(130,142,140,5);
  g.fillStyle = '#8b93a7'; g.font = '19px "Segoe UI", system-ui, sans-serif';
  g.fillText('Full-Stack Dev &', 200, 195);
  g.fillText('Data Analyst', 200, 222);
  g.textAlign = 'left'; g.font = '15px "Courier New", monospace';
  g.fillStyle = '#8ab4f8'; g.fillText('"education":', 60, 300);
  g.fillStyle = '#f4a583'; g.fillText('"BIS @ Helwan"', 60, 326);
  g.fillStyle = '#8ab4f8'; g.fillText('"location":', 60, 372);
  g.fillStyle = '#f4a583'; g.fillText('"Egypt"', 60, 398);
  g.fillStyle = '#5c6577'; g.font = '13px "Courier New", monospace';
  g.fillText('// code. data. design.', 60, 452);
}
const posterTex = new THREE.CanvasTexture(pc);
const posterFace = new THREE.Mesh(new THREE.PlaneGeometry(1.4,1.8),
  new THREE.MeshStandardMaterial({map:posterTex, roughness:.9}));
posterFace.position.z = .021;
poster.add(posterFace);
poster.position.set(-2.7, 2.45, -4.44);
scene.add(poster);

/* ================= poster gallery (left wall) ================= */
const gallery = new THREE.Group();
const texLoader = new THREE.TextureLoader();
const POSTERS = [
  {f:'poster-1.jpg', ar:736/1308, z: 2.9},
  {f:'poster-2.jpg', ar:569/879,  z: 1.0},
  {f:'poster-3.jpg', ar:736/981,  z:-0.95},
  {f:'poster-4.jpg', ar:736/1104, z:-2.9},
  {f:'poster-5.jpg', ar:736/1104, back:-.75},
  {f:'poster-6.jpg', ar:736/920,  back: .75},
  {f:'poster-7.jpg', ar:736/1104, z: 1.0, right:true},
  {f:'poster-8.jpg', ar:474/670,  z:-1.0, right:true},
];
const PH = 1.65;
for (const p of POSTERS){
  const g = new THREE.Group();
  const ph = p.back!==undefined ? 1.3 : PH;
  const w = ph*p.ar;
  g.add(box(.035, ph+.1, w+.1, 0x0d1220, 0,0,0, .6,.2));          // frame
  const tex = texLoader.load(p.f);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w, ph),
    new THREE.MeshStandardMaterial({map:tex, emissive:0xffffff, emissiveMap:tex, emissiveIntensity:.4, roughness:.85}));
  face.rotation.y = Math.PI/2;
  face.position.x = .02;
  g.add(face);
  if (p.back!==undefined){ g.rotation.y = -Math.PI/2; g.position.set(p.back, 3.3, -4.47); }
  else if (p.right){ g.rotation.y = Math.PI; g.position.set(5.47, 2.15, p.z); }
  else g.position.set(-5.47, 2.15, p.z);
  gallery.add(g);
}
scene.add(gallery);
const galLight2 = new THREE.PointLight(0xffe6d0, 6, 8, 2);
galLight2.position.set(3.6, 3.6, 0);
scene.add(galLight2);
const galLight = new THREE.PointLight(0xffe6d0, 6, 8, 2);
galLight.position.set(-3.6, 3.6, 0);
scene.add(galLight);

/* ================= lamp / plant / chair / clutter ================= */
const lampG = new THREE.Group();
lampG.add(box(.34,.04,.34, 0x1a2138, 0,.02,0));
const pole = new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,1.9,10), mat(0x1a2138,.5,.4));
pole.position.y = .97; lampG.add(pole);
const shade = new THREE.Mesh(new THREE.ConeGeometry(.24,.3,20,1,true),
  new THREE.MeshStandardMaterial({color:0x1a2138, roughness:.6, side:THREE.DoubleSide}));
shade.position.y = 2.0; lampG.add(shade);
const bulb = new THREE.Mesh(new THREE.SphereGeometry(.07,12,12),
  new THREE.MeshStandardMaterial({color:0x000000, emissive:C.accent, emissiveIntensity:2.2}));
bulb.position.y = 1.92; lampG.add(bulb);
lampG.position.set(-3.55,0,-2.9);
scene.add(lampG);

const plant = new THREE.Group();
const pot = new THREE.Mesh(new THREE.CylinderGeometry(.17,.13,.26,14), mat(0xb56a4a,.8));
pot.position.y = .13; pot.castShadow = true; plant.add(pot);
for (let i=0;i<3;i++){
  const leaf = new THREE.Mesh(new THREE.ConeGeometry(.16-i*.03,.55-i*.1,8), mat(0x3d6b52,.9));
  leaf.position.set((i-1)*.07, .5+i*.16, (i%2?-.04:.04));
  leaf.rotation.z = (i-1)*.15; leaf.castShadow = true; plant.add(leaf);
}
plant.position.set(-4.5,0,-3.6);
scene.add(plant);

const chair = new THREE.Group();
chair.add(box(.55,.06,.55, 0x1a2138, 0,.55,0));
chair.add(box(.55,.7,.06, 0x1a2138, 0,1.05,.26));
chair.add(box(.05,.55,.05, 0x0d1220, 0,.27,0));
chair.position.set(.3,0,-1.2); chair.rotation.y = -.35;
scene.add(chair);

/* ================= dust particles ================= */
const pGeo = new THREE.BufferGeometry();
{
  const n = 160, arr = new Float32Array(n*3);
  for (let i=0;i<n;i++){ arr[i*3]=(Math.random()-.5)*9; arr[i*3+1]=Math.random()*4; arr[i*3+2]=-4+Math.random()*7; }
  pGeo.setAttribute('position', new THREE.BufferAttribute(arr,3));
}
const dust = new THREE.Points(pGeo, new THREE.PointsMaterial({
  color:C.accent, size:.022, transparent:true, opacity:.35,
  blending:THREE.AdditiveBlending, depthWrite:false}));
scene.add(dust);

/* ================= interactivity ================= */
const HOTSPOTS = [
  {key:'projects', obj:monitor, tip:'Projects', label:'the monitor'},
  {key:'skills',   obj:shelf,   tip:'Skills',   label:'the bookshelf'},
  {key:'about',    obj:poster,  tip:'About',    label:'the poster'},
  {key:'contact',  obj:phone,   tip:'Contact',  label:'the phone'},
];
for (const h of HOTSPOTS) h.obj.traverse(m => { if (m.isMesh) m.userData.key = h.key; });
const hotMeshes = [];
for (const h of HOTSPOTS) h.obj.traverse(m => { if (m.isMesh) hotMeshes.push(m); });

const VIEWS = {
  home:     {pos:[4.6,3.0,6.0],  look:[0,1.3,-1]},
  projects: {pos:[0,1.95,-.4],   look:[0,1.85,-3.2]},
  skills:   {pos:[2.1,1.8,-1.3], look:[3.6,1.35,-3.9]},
  about:    {pos:[-2.7,2.35,-1.6],look:[-2.7,2.45,-4.4]},
  contact:  {pos:[1.5,1.8,-1.2], look:[1.05,1.1,-2.85]},
};
let fly = null, flyTimer = null;
function flyTo(v){
  fly = {pos:new THREE.Vector3(...v.pos), look:new THREE.Vector3(...v.look)};
  clearTimeout(flyTimer);
  flyTimer = setTimeout(() => {
    if (!fly) return;
    camera.position.copy(fly.pos); controls.target.copy(fly.look); fly = null;
  }, 1600);
}

const ray = new THREE.Raycaster();
const ptr = new THREE.Vector2(-2,-2);
const tooltip = document.getElementById('tooltip');
const hint = document.getElementById('hint');
let hoveredKey = null;

function setGlow(key, on){
  for (const h of HOTSPOTS) if (h.key === key) h.obj.traverse(m => {
    if (!m.isMesh) return;
    if (!m.userData.origEm) m.userData.origEm = m.material.emissive ? m.material.emissive.getHex() : null;
    if (m.material.emissive){
      if (on){ m.material.emissive.setHex(C.accent); m.material.emissiveIntensity = Math.max(m.material.emissiveIntensity||0, .3); }
      else if (m.userData.origEm !== null){ m.material.emissive.setHex(m.userData.origEm); }
    }
  });
}

function updateHover(){
  ray.setFromCamera(ptr, camera);
  const hit = ray.intersectObjects(hotMeshes, false)[0];
  const key = hit ? hit.object.userData.key : null;
  if (key !== hoveredKey){
    if (hoveredKey) setGlow(hoveredKey, false);
    if (key){
      setGlow(key, true);
      const h = HOTSPOTS.find(x => x.key === key);
      tooltip.innerHTML = `<b>${h.tip}</b> — click ${h.label}`;
      tooltip.style.display = 'block';
      hint.classList.add('gone');
    } else {
      tooltip.style.display = 'none';
    }
    hoveredKey = key;
    document.body.style.cursor = key ? 'pointer' : 'default';
  }
}
addEventListener('pointermove', e => {
  if (e.target !== canvas){ ptr.set(-2,-2); updateHover(); return; }
  ptr.x = (e.clientX/innerWidth)*2-1;
  ptr.y = -(e.clientY/innerHeight)*2+1;
  tooltip.style.left = (e.clientX+16)+'px';
  tooltip.style.top  = (e.clientY+10)+'px';
  updateHover();
});

let downAt = null;
addEventListener('pointerdown', e => {
  if (e.target !== canvas){ downAt = null; return; }
  ptr.x = (e.clientX/innerWidth)*2-1;
  ptr.y = -(e.clientY/innerHeight)*2+1;
  updateHover();
  downAt = {x:e.clientX, y:e.clientY, key:hoveredKey};
});
addEventListener('pointerup', e => {
  if (!downAt) return;
  const moved = Math.hypot(e.clientX-downAt.x, e.clientY-downAt.y);
  if (moved < 7 && downAt.key && downAt.key === hoveredKey) openSection(downAt.key);
  downAt = null;
});

/* ================= panels ================= */
const CONTENT = {
  projects: {
    title:'Selected <span>Works.</span>', sub:'What the monitor is shipping',
    body:`<div class="cards">
      <div class="mini"><h3>VANTA<em>Web</em></h3><p>A concept online store for a high-fashion streetwear brand. A complete shopping experience, from browse to checkout.</p><a class="detbtn" href="https://yazedhamdy62-wq.github.io/portfolio/vanta.html" target="_blank" rel="noopener">Details →</a></div>
      <div class="mini"><h3>Colleague<em>Web</em></h3><p>A web platform that helps Egyptian high-school students choose the right college and major.</p><a class="detbtn" href="https://yazedhamdy62-wq.github.io/portfolio/colleage.html" target="_blank" rel="noopener">Details →</a></div>
      <div class="mini"><h3>SINNARTY<em>Web</em></h3><p>A smart fishing platform selling smart rods that detect fish, with an online store experience.</p><a class="detbtn" href="https://yazedhamdy62-wq.github.io/portfolio/sinnarty.html" target="_blank" rel="noopener">Details →</a></div>
      <div class="mini"><h3>Sign In<em>UI</em></h3><p>A clean authentication flow design with a focus on simple, friendly UX.</p><a class="detbtn" href="https://yazedhamdy62-wq.github.io/portfolio/SGIN%20IN%20BACKEND.html" target="_blank" rel="noopener">Details →</a></div>
      <div class="mini"><h3>Market Sales<em>Power BI</em></h3><p>A data analysis and visualization dashboard for enterprise sales performance.</p><a class="detbtn" href="https://yazedhamdy62-wq.github.io/portfolio/analysis%201.html" target="_blank" rel="noopener">Details →</a></div>
      <div class="mini"><h3>Samsung Sales<em>Power BI</em></h3><p>A dashboard analyzing Samsung's sales data with interactive visuals.</p><a class="detbtn" href="https://yazedhamdy62-wq.github.io/portfolio/analysis%202.html" target="_blank" rel="noopener">Details →</a></div>
      <div class="mini"><h3>Bike Sales<em>Power BI</em></h3><p>An interactive Power BI dashboard exploring bike store sales trends.</p><a class="detbtn" href="https://yazedhamdy62-wq.github.io/portfolio/bike%20analysis.html" target="_blank" rel="noopener">Details →</a></div>
      <div class="mini"><h3>Coffee Sales<em>Power BI</em></h3><p>An interactive dashboard analyzing coffee shop sales across products and time.</p><a class="detbtn" href="https://yazedhamdy62-wq.github.io/portfolio/coffee%20sales.html" target="_blank" rel="noopener">Details →</a></div>
    </div>`
  },
  skills: {
    title:'Skill<span>shelf.</span>', sub:'Every book on this shelf is earned',
    body:`
    <div class="skillgroup"><h3>Web Development · Core</h3><div class="tags">
      <span>HTML</span><span>CSS</span><span>JavaScript</span><span>Responsive Design</span><span>React</span><span>PHP</span><span>Laravel</span>
    </div></div>
    <div class="skillgroup"><h3>Data Analysis · Learning</h3><div class="tags">
      <span>SQL</span><span>Excel</span><span>Power BI</span><span>Python</span><span>Pandas</span>
    </div></div>
    <div class="skillgroup"><h3>Tools · Workflow</h3><div class="tags">
      <span>Figma</span><span>Git &amp; GitHub</span><span>VS Code</span><span>Supabase</span><span>Firebase</span>
    </div></div>`
  },
  about: {
    title:'About <span>Me.</span>', sub:'The poster on the wall says it best',
    body:`
    <p class="about-p">Currently pursuing a degree in Business Information Systems, I exist at the intersection of business logic and technical execution. My journey started with a fascination for how data shapes decisions, and evolved into a passion for building the interfaces that make that data accessible.</p>
    <p class="about-p">I don't just write code; I engineer solutions. Whether it's architecting a scalable web application or deriving insights from complex datasets, I approach every problem with a methodical, detail-oriented mindset.</p>
    <div class="code">{
  <span class="k">"role"</span>:     <span class="s">"Full-Stack Dev &amp; Data Analyst"</span>,
  <span class="k">"education"</span>: <span class="s">"BIS at Helwan University"</span>,
  <span class="k">"focus"</span>:     <span class="s">"Clean data &amp; user interfaces"</span>,
  <span class="k">"location"</span>:  <span class="s">"Egypt"</span>,
  <span class="k">"openToWork"</span>: <span class="a">true</span>
}</div>`
  },
  contact: {
    title:'Initiate <span>Contact.</span>', sub:'The phone on the desk is always on',
    body:`
    <a class="chan" href="mailto:yazedhamdy62@gmail.com">
      <div class="ic">✉️</div><div><b>Email</b><span>yazedhamdy62@gmail.com</span></div>
    </a>
    <a class="chan" href="https://github.com/yazedhamdy62-wq" target="_blank" rel="noopener">
      <div class="ic">🐙</div><div><b>GitHub</b><span>github.com/yazedhamdy62-wq</span></div>
    </a>
    <a class="chan" href="https://yazedhamdy62-wq.github.io/portfolio/" target="_blank" rel="noopener">
      <div class="ic">🌐</div><div><b>Portfolio</b><span>yazedhamdy62-wq.github.io/portfolio</span></div>
    </a>
    <p class="about-p" style="margin-top:14px">Whether it's a question, a project inquiry, or just a talk about atmospheric design — drop a message.</p>`
  }
};

const panel = document.getElementById('panel');
const backdrop = document.getElementById('backdrop');
const panelBody = document.getElementById('panelBody');

function openSection(key){
  const c = CONTENT[key]; if (!c) return;
  flyTo(VIEWS[key]);
  panelBody.innerHTML = `<h2>${c.title}</h2><p class="sub">${c.sub}</p>${c.body}`;
  backdrop.style.display = 'block';
  panel.style.display = 'block';
  hint.classList.add('gone');
}
function closePanel(){ panel.style.display = 'none'; backdrop.style.display = 'none'; }
panel.querySelector('.close').addEventListener('click', closePanel);
backdrop.addEventListener('click', closePanel);
addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });

document.querySelectorAll('[data-open]').forEach(a =>
  a.addEventListener('click', e => { e.preventDefault(); openSection(a.dataset.open); }));
document.getElementById('brandHome').addEventListener('click', e => {
  e.preventDefault(); closePanel(); flyTo(VIEWS.home);
});

/* ================= animate ================= */
const clock = new THREE.Clock();
let firstFrame = true;
function animate(){
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  if (fly){
    camera.position.lerp(fly.pos, .055);
    controls.target.lerp(fly.look, .055);
    if (camera.position.distanceTo(fly.pos) < .05) fly = null;
  }
  // gentle life
  lampLight.intensity = 14 + Math.sin(t*7)*.5 + Math.sin(t*13.7)*.3;
  screenGlow.intensity = 5 + Math.sin(t*2.2)*.8;
  dust.rotation.y = t*.02;
  dust.position.y = Math.sin(t*.3)*.05;
  phoneScr.material.emissiveIntensity = .45 + (Math.sin(t*1.6)+1)*.15;

  controls.update();
  renderer.render(scene, camera);

  if (firstFrame){
    firstFrame = false;
    document.getElementById('loader').classList.add('done');
    setTimeout(() => hint.classList.add('gone'), 9000);
  }
}
animate();

// debug / deep-link handle
window.__room = {camera, controls, openSection, VIEWS, THREE};

addEventListener('resize', () => {
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
