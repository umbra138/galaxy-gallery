/* ================================================================
   GALAXY GALLERY — script.js
   ================================================================
   SUBSTITUIR FOTOS: coloque photo1.jpg ~ photo6.jpg na pasta assets/
   SUBSTITUIR MUSICA: coloque music.mp3 na pasta assets/
   SUBSTITUIR POEMAS: edite o array POEMS abaixo
   ================================================================ */

// ========== CONFIG ==========
var IS_MOBILE = window.innerWidth < 700;
var STAR_COUNT = IS_MOBILE ? 3000 : 8000;
var TUNNEL_PARTICLES = IS_MOBILE ? 600 : 1500;
var HEART_PARTICLES = IS_MOBILE ? 2000 : 5000;

// ========== POEMAS (edite aqui) ==========
var POEMS = [
  {
    img: 'assets/photo1.svg',
    title: 'Memoria 1',
    poem: 'Voce e a luz que nao se apaga,\nquando tudo ao redor escurece.\nOnde voce esta,\no universo inteiro brilha.'
  },
  {
    img: 'assets/photo2.svg',
    title: 'Memoria 2',
    poem: 'Se eu pudesse guardar\num momento para sempre,\nseria aquele em que voce\nsorriu pra mim pela primeira vez.'
  },
  {
    img: 'assets/photo3.svg',
    title: 'Memoria 3',
    poem: 'Nao e o universo que e grande demais.\nE voce que cabe em cada cantinho\ndo meu coracao.'
  },
  {
    img: 'assets/photo4.svg',
    title: 'Memoria 4',
    poem: 'Entre bilhoes de estrelas,\nvoce e a unica\nque eu sei de cor.'
  },
  {
    img: 'assets/photo5.svg',
    title: 'Memoria 5',
    poem: 'Cada vez que te olho,\ntudo faz sentido.\nVoce e o motivo\nde tudo isso existir.'
  },
  {
    img: 'assets/photo6.svg',
    title: 'Memoria 6',
    poem: 'Eu nao preciso de mais nada.\nSo do seu abrigo.\nDo seu calor.\nDa sua presenca.'
  }
];

// ========== THREE.JS SETUP ==========
var canvas = document.getElementById('scene');
var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000008);

var scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000008, 0.0008);

var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 0, 30);

var clock = new THREE.Clock();
var mouse = { x: 0, y: 0, tx: 0, ty: 0 };

// ========== STATE ==========
var state = 'loading'; // loading -> intro -> tunnel -> gallery -> viewing
var tunnelProgress = 0;
var galleryAlpha = 0;

// ========== LIGHTS ==========
var ambientLight = new THREE.AmbientLight(0x332244, 0.6);
scene.add(ambientLight);

var dirLight = new THREE.DirectionalLight(0xffddee, 0.8);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

var pointLight = new THREE.PointLight(0xff88cc, 0.6, 100);
pointLight.position.set(0, 2, 5);
scene.add(pointLight);

// ========== STARFIELD ==========
function createStarfield() {
  var geo = new THREE.BufferGeometry();
  var pos = new Float32Array(STAR_COUNT * 3);
  var col = new Float32Array(STAR_COUNT * 3);
  var sizes = new Float32Array(STAR_COUNT);
  for (var i = 0; i < STAR_COUNT; i++) {
    var i3 = i * 3;
    var r = 200 + Math.random() * 800;
    var theta = Math.random() * Math.PI * 2;
    var phi = Math.acos(2 * Math.random() - 1);
    pos[i3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i3 + 2] = r * Math.cos(phi);
    var c = new THREE.Color().setHSL(0.7 + Math.random() * 0.15, 0.3 + Math.random() * 0.4, 0.6 + Math.random() * 0.4);
    col[i3] = c.r; col[i3 + 1] = c.g; col[i3 + 2] = c.b;
    sizes[i] = 0.5 + Math.random() * 2;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  var mat = new THREE.PointsMaterial({ size: 1.5, vertexColors: true, transparent: true, opacity: 0.8, sizeAttenuation: true });
  var stars = new THREE.Points(geo, mat);
  scene.add(stars);
  return stars;
}
var starfield = createStarfield();

// ========== CUTE CHARACTERS (intro scene) ==========
var characters = new THREE.Group();
scene.add(characters);

function createCharacter(xOffset, leanAngle) {
  var group = new THREE.Group();

  // Body
  var bodyGeo = new THREE.SphereGeometry(0.8, 16, 16);
  bodyGeo.scale(1, 1.2, 0.9);
  var bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6, metalness: 0.05 });
  var body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = -0.3;
  group.add(body);

  // Head
  var headGeo = new THREE.SphereGeometry(0.55, 16, 16);
  var head = new THREE.Mesh(headGeo, bodyMat);
  head.position.y = 1.0;
  group.add(head);

  // Eyes
  var eyeGeo = new THREE.SphereGeometry(0.08, 8, 8);
  var eyeMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
  var eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.18, 1.05, 0.45);
  group.add(eyeL);
  var eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeR.position.set(0.18, 1.05, 0.45);
  group.add(eyeR);

  // Blush
  var blushGeo = new THREE.SphereGeometry(0.1, 8, 8);
  var blushMat = new THREE.MeshStandardMaterial({ color: 0xffaaaa, transparent: true, opacity: 0.4 });
  var blushL = new THREE.Mesh(blushGeo, blushMat);
  blushL.position.set(-0.35, 0.9, 0.4);
  blushL.scale.set(1, 0.6, 0.5);
  group.add(blushL);
  var blushR = new THREE.Mesh(blushGeo, blushMat);
  blushR.position.set(0.35, 0.9, 0.4);
  blushR.scale.set(1, 0.6, 0.5);
  group.add(blushR);

  // Arms (rounded cylinders)
  var armGeo = new THREE.CapsuleGeometry(0.15, 0.6, 4, 8);
  var armL = new THREE.Mesh(armGeo, bodyMat);
  armL.position.set(-0.75, 0.0, 0.3);
  armL.rotation.z = 0.6;
  armL.rotation.x = -0.3;
  group.add(armL);
  var armR = new THREE.Mesh(armGeo, bodyMat);
  armR.position.set(0.75, 0.0, 0.3);
  armR.rotation.z = -0.6;
  armR.rotation.x = -0.3;
  group.add(armR);

  // Legs
  var legGeo = new THREE.CapsuleGeometry(0.18, 0.4, 4, 8);
  var legL = new THREE.Mesh(legGeo, bodyMat);
  legL.position.set(-0.3, -1.3, 0.1);
  group.add(legL);
  var legR = new THREE.Mesh(legGeo, bodyMat);
  legR.position.set(0.3, -1.3, 0.1);
  group.add(legR);

  // Ears
  var earGeo = new THREE.SphereGeometry(0.15, 8, 8);
  earGeo.scale(0.7, 1, 0.7);
  var earL = new THREE.Mesh(earGeo, bodyMat);
  earL.position.set(-0.35, 1.5, 0);
  group.add(earL);
  var earR = new THREE.Mesh(earGeo, bodyMat);
  earR.position.set(0.35, 1.5, 0);
  group.add(earR);

  group.position.x = xOffset;
  group.rotation.y = leanAngle;
  return group;
}

var char1 = createCharacter(-0.9, 0.15);
var char2 = createCharacter(0.9, -0.15);
characters.add(char1);
characters.add(char2);
characters.position.set(0, -2, 0);

// ========== FLOATING HEARTS (intro) ==========
var floatingHearts = [];
function spawnHeart() {
  var shape = new THREE.Shape();
  var s = 0.12;
  shape.moveTo(0, s * 0.3);
  shape.bezierCurveTo(-s, -s * 0.3, -s, s * 0.4, 0, s);
  shape.bezierCurveTo(s, s * 0.4, s, -s * 0.3, 0, s * 0.3);
  var geo = new THREE.ShapeGeometry(shape);
  var mat = new THREE.MeshBasicMaterial({ color: 0xff88aa, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
  var mesh = new THREE.Mesh(geo, mat);
  mesh.position.set((Math.random() - 0.5) * 3, 1 + Math.random() * 2, (Math.random() - 0.5) * 2);
  mesh.userData = { vy: 0.3 + Math.random() * 0.3, vx: (Math.random() - 0.5) * 0.2, life: 1 };
  scene.add(mesh);
  floatingHearts.push(mesh);
}

// ========== TUNNEL ==========
var tunnelGroup = new THREE.Group();
scene.add(tunnelGroup);
var tunnelParticles = [];
function createTunnel() {
  var geo = new THREE.BufferGeometry();
  var pos = new Float32Array(TUNNEL_PARTICLES * 3);
  var col = new Float32Array(TUNNEL_PARTICLES * 3);
  var speeds = new Float32Array(TUNNEL_PARTICLES);
  for (var i = 0; i < TUNNEL_PARTICLES; i++) {
    var i3 = i * 3;
    var angle = Math.random() * Math.PI * 2;
    var radius = 3 + Math.random() * 12;
    var depth = Math.random() * 200 - 100;
    pos[i3] = Math.cos(angle) * radius;
    pos[i3 + 1] = Math.sin(angle) * radius;
    pos[i3 + 2] = depth;
    var c = new THREE.Color().setHSL(0.75 + Math.random() * 0.15, 0.6, 0.5 + Math.random() * 0.4);
    col[i3] = c.r; col[i3 + 1] = c.g; col[i3 + 2] = c.b;
    speeds[i] = 2 + Math.random() * 5;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  var mat = new THREE.PointsMaterial({ size: 1.2, vertexColors: true, transparent: true, opacity: 0, sizeAttenuation: true });
  var points = new THREE.Points(geo, mat);
  tunnelGroup.add(points);
  tunnelParticles.push({ geo: geo, speeds: speeds });
}
createTunnel();
tunnelGroup.visible = false;

// ========== PARTICLE HEART (gallery) ==========
var heartGroup = new THREE.Group();
scene.add(heartGroup);
heartGroup.visible = false;

function heartX(t) { return 16 * Math.pow(Math.sin(t), 3); }
function heartY(t) { return -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)); }

function createParticleHeart() {
  var geo = new THREE.BufferGeometry();
  var pos = new Float32Array(HEART_PARTICLES * 3);
  var col = new Float32Array(HEART_PARTICLES * 3);
  var sizes = new Float32Array(HEART_PARTICLES);
  for (var i = 0; i < HEART_PARTICLES; i++) {
    var t = Math.random() * Math.PI * 2;
    var scale = 0.5 + Math.random() * 0.5;
    var px = heartX(t) * scale;
    var py = heartY(t) * scale;
    var pz = (Math.random() - 0.5) * 4 * scale;
    var i3 = i * 3;
    pos[i3] = px; pos[i3 + 1] = py; pos[i3 + 2] = pz;
    var hue = 0.88 + Math.random() * 0.12;
    var c = new THREE.Color().setHSL(hue, 0.5 + Math.random() * 0.3, 0.5 + Math.random() * 0.3);
    col[i3] = c.r; col[i3 + 1] = c.g; col[i3 + 2] = c.b;
    sizes[i] = 0.3 + Math.random() * 0.8;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  var mat = new THREE.PointsMaterial({ size: 0.4, vertexColors: true, transparent: true, opacity: 0.85, sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false });
  var points = new THREE.Points(geo, mat);
  heartGroup.add(points);
  return { geo: geo, mat: mat, points: points };
}
var heartData = createParticleHeart();

// ========== PHOTO ORBITS ==========
var photoGroup = new THREE.Group();
scene.add(photoGroup);
photoGroup.visible = false;

var photoMeshes = [];
var textureLoader = new THREE.TextureLoader();

function createPhotoOrbit(poemData, index, total) {
  var group = new THREE.Group();

  // Circular frame
  var ringGeo = new THREE.RingGeometry(1.3, 1.5, 32);
  var ringMat = new THREE.MeshBasicMaterial({ color: 0xcc99ff, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
  var ring = new THREE.Mesh(ringGeo, ringMat);
  group.add(ring);

  // Photo plane
  var planeGeo = new THREE.CircleGeometry(1.28, 32);
  var planeMat = new THREE.MeshBasicMaterial({ color: 0x443366, side: THREE.DoubleSide });
  var plane = new THREE.Mesh(planeGeo, planeMat);
  plane.position.z = 0.01;
  group.add(plane);

  // Try load texture
  textureLoader.load(poemData.img, function(tex) {
    tex.minFilter = THREE.LinearFilter;
    planeMat.map = tex;
    planeMat.color.set(0xffffff);
    planeMat.needsUpdate = true;
  }, undefined, function() {
    // placeholder colored circle
    var hue = index / total;
    planeMat.color.set(new THREE.Color().setHSL(hue, 0.4, 0.3));
  });

  // Glow
  var glowGeo = new THREE.CircleGeometry(1.8, 32);
  var glowMat = new THREE.MeshBasicMaterial({ color: 0xaa66dd, transparent: true, opacity: 0.08, side: THREE.DoubleSide });
  var glow = new THREE.Mesh(glowGeo, glowMat);
  glow.position.z = -0.05;
  group.add(glow);

  // Orbit params
  var angle = (index / total) * Math.PI * 2;
  var orbitR = 12 + Math.random() * 5;
  var orbitTilt = (Math.random() - 0.5) * 0.6;
  var orbitSpeed = 0.08 + Math.random() * 0.06;
  var yOff = (Math.random() - 0.5) * 6;

  group.userData = {
    angle: angle, orbitR: orbitR, orbitTilt: orbitTilt,
    speed: orbitSpeed, yOff: yOff, poem: poemData,
    baseScale: 0.8 + Math.random() * 0.3, glowMat: glowMat
  };

  photoGroup.add(group);
  photoMeshes.push(group);
}

POEMS.forEach(function(p, i) { createPhotoOrbit(p, i, POEMS.length); });

// ========== RAYCASTER ==========
var raycaster = new THREE.Raycaster();
var pointer = new THREE.Vector2();
var hoveredPhoto = null;

canvas.addEventListener('pointermove', function(e) {
  mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.ty = -(e.clientY / window.innerHeight) * 2 + 1;
  pointer.x = mouse.tx;
  pointer.y = mouse.ty;
});

canvas.addEventListener('pointerdown', function(e) {
  if (state !== 'gallery') return;
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  var hits = raycaster.intersectObjects(photoMeshes, true);
  if (hits.length > 0) {
    var obj = hits[0].object;
    while (obj.parent && !obj.userData.poem) obj = obj.parent;
    if (obj.userData.poem) openPoem(obj);
  }
});

// ========== POEM MODAL ==========
var poemModal = document.getElementById('poem-modal');
var poemPhoto = document.getElementById('poem-photo');
var poemTitle = document.getElementById('poem-title');
var poemBody = document.getElementById('poem-body');

function openPoem(photoObj) {
  var d = photoObj.userData.poem;
  poemPhoto.src = d.img;
  poemTitle.textContent = d.title;
  poemBody.textContent = d.poem;
  poemModal.classList.add('show');
  state = 'viewing';
}
document.getElementById('poem-close').addEventListener('click', function() {
  poemModal.classList.remove('show');
  state = 'gallery';
});

// ========== MUSIC ==========
var audio = new Audio('assets/music.mp3');
audio.loop = true;
audio.volume = 0.6;
var musicPlaying = false;

var musicToggle = document.getElementById('music-toggle');
var musicVolume = document.getElementById('music-volume');
var musicCtrl = document.getElementById('music-ctrl');

function tryPlayMusic() {
  if (musicPlaying) return;
  audio.play().then(function() {
    musicPlaying = true;
    musicToggle.classList.add('playing');
  }).catch(function() {});
}

musicToggle.addEventListener('click', function() {
  if (musicPlaying) {
    audio.pause();
    musicPlaying = false;
    musicToggle.classList.remove('playing');
  } else {
    tryPlayMusic();
  }
});
musicVolume.addEventListener('input', function() {
  audio.volume = this.value / 100;
});

// ========== START ==========
var startBtn = document.getElementById('start-btn');
var introUI = document.getElementById('intro-ui');
startBtn.addEventListener('click', function() {
  tryPlayMusic();
  state = 'tunnel';
  tunnelProgress = 0;
  introUI.classList.remove('show');
  tunnelGroup.visible = true;
  characters.visible = false;
});

// ========== RESIZE ==========
window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  IS_MOBILE = window.innerWidth < 700;
});

// ========== LOADER CALLBACK ==========
window._onLoaded = function() {
  state = 'intro';
  introUI.classList.add('show');
  musicCtrl.classList.add('show');
};

// ========== ANIMATION ==========
function animate() {
  requestAnimationFrame(animate);
  var dt = Math.min(clock.getDelta(), 0.05);
  var t = clock.getElapsedTime();

  // Smooth mouse
  mouse.x += (mouse.tx - mouse.x) * 0.03;
  mouse.y += (mouse.ty - mouse.y) * 0.03;

  // Camera subtle parallax (gallery)
  if (state === 'gallery' || state === 'viewing') {
    camera.position.x += (mouse.x * 3 - camera.position.x) * 0.02;
    camera.position.y += (mouse.y * 2 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);
  } else if (state === 'intro') {
    camera.position.x += (mouse.x * 1 - camera.position.x) * 0.01;
    camera.position.y += (mouse.y * 0.5 + 1 - camera.position.y) * 0.01;
    camera.lookAt(0, 0, 0);
  }

  // Stars slow rotation
  starfield.rotation.y += dt * 0.01;
  starfield.rotation.x += dt * 0.005;

  // ---- INTRO ----
  if (state === 'intro' || state === 'loading') {
    characters.visible = true;
    // Breathing animation
    var breathe = Math.sin(t * 1.5) * 0.03;
    char1.scale.y = 1 + breathe;
    char2.scale.y = 1 + breathe;
    // Head lean
    char1.children[1].rotation.z = Math.sin(t * 0.8) * 0.05;
    char2.children[1].rotation.z = Math.sin(t * 0.8 + 0.5) * 0.05 + 0.1;
    // Head touch
    char2.children[1].position.x = 0.55 + Math.sin(t * 0.6) * 0.02;
    // Arm caress
    if (char2.children[5]) char2.children[5].rotation.z = -0.6 + Math.sin(t * 0.7) * 0.1;
    // Spawn hearts
    if (Math.random() < dt * 0.3 && floatingHearts.length < 15) spawnHeart();
    // Update hearts
    for (var i = floatingHearts.length - 1; i >= 0; i--) {
      var h = floatingHearts[i];
      h.position.y += h.userData.vy * dt;
      h.position.x += h.userData.vx * dt;
      h.userData.life -= dt * 0.15;
      h.material.opacity = h.userData.life * 0.5;
      h.rotation.z = Math.sin(t * 2 + i) * 0.3;
      if (h.userData.life <= 0) {
        scene.remove(h);
        floatingHearts.splice(i, 1);
      }
    }
  }

  // ---- TUNNEL ----
  if (state === 'tunnel') {
    tunnelProgress += dt * 0.4;
    // Move camera forward
    camera.position.z = 30 - tunnelProgress * 80;
    // Animate tunnel particles
    tunnelGroup.visible = true;
    var tps = tunnelParticles[0];
    var tPos = tps.geo.attributes.position.array;
    for (var i = 0; i < TUNNEL_PARTICLES; i++) {
      tPos[i * 3 + 2] += tps.speeds[i] * dt * 30;
      if (tPos[i * 3 + 2] > 100) tPos[i * 3 + 2] -= 200;
    }
    tps.geo.attributes.position.needsUpdate = true;
    tunnelGroup.children[0].material.opacity = Math.min(1, tunnelProgress * 2) * (tunnelProgress < 3 ? 1 : Math.max(0, 4 - tunnelProgress));

    if (tunnelProgress > 4) {
      state = 'gallery';
      tunnelGroup.visible = false;
      heartGroup.visible = true;
      photoGroup.visible = true;
      camera.position.set(0, 0, 30);
    }
  }

  // ---- GALLERY ----
  if (state === 'gallery' || state === 'viewing') {
    // Heart pulse
    var pulse = 1 + Math.sin(t * 1.5) * 0.06;
    heartGroup.scale.set(pulse, pulse, pulse);
    heartGroup.rotation.y = t * 0.1;

    // Photo orbits
    photoMeshes.forEach(function(p) {
      var ud = p.userData;
      ud.angle += ud.speed * dt;
      var x = Math.cos(ud.angle) * ud.orbitR;
      var z = Math.sin(ud.angle) * ud.orbitR;
      var y = ud.yOff + Math.sin(ud.angle * 0.5) * 2;
      p.position.set(x, y, z);
      p.rotation.y = -ud.angle * 0.3;
      var s = ud.baseScale * (1 + Math.sin(t * 0.5 + ud.angle) * 0.05);
      p.scale.set(s, s, s);
      // Glow pulse
      ud.glowMat.opacity = 0.06 + Math.sin(t * 2 + ud.angle) * 0.03;
    });

    // Hover effect
    raycaster.setFromCamera(pointer, camera);
    var hits = raycaster.intersectObjects(photoMeshes, true);
    canvas.style.cursor = hits.length > 0 ? 'pointer' : 'default';
  }

  renderer.render(scene, camera);
}
animate();
