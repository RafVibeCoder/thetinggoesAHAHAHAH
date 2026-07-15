// LEVEL 3 REALISM ENGINE — engine.js
// Core engine: renderer, camera, post-processing, main loop, module loading

import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { PointerLockControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/PointerLockControls.js";
import { EffectComposer } from "https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/ShaderPass.js";
import { FilmShader } from "https://unpkg.com/three@0.160.0/examples/jsm/shaders/FilmShader.js";
import { CopyShader } from "https://unpkg.com/three@0.160.0/examples/jsm/shaders/CopyShader.js";

// ENGINE MODULES
import { buildRooms } from "./rooms.js";
import { buildDoors, updateDoors } from "./doors.js";
import { initSoundSystem, updateSound } from "./sound.js";
import { initPlayer, updatePlayer } from "./player.js";
import { buildMonster, updateMonsterVisual } from "./monster.js";
import { updateAI } from "./ai.js";
import { updateEvents } from "./events.js";
import { clamp } from "./util.js";

// MAIN ENGINE ENTRY POINT
export function startEngine(config) {
  const canvas = config.canvas;
  const ui = config.ui;

  // SCENE
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050608);
  scene.fog = new THREE.FogExp2(0x050608, 0.03);

  // RENDERER
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.4;

  // CAMERA
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  );
  camera.position.set(5, 1.7, -10);

  // CONTROLS
  const controls = new PointerLockControls(camera, document.body);
  scene.add(controls.getObject());

  document.body.addEventListener("click", () => controls.lock());
  controls.addEventListener("lock", () => {
    ui.message.textContent = "";
  });
  controls.addEventListener("unlock", () => {
    ui.message.textContent =
      "Click to lock mouse. WASD to move, Ctrl to crouch, E to hide.";
  });

  // POST-PROCESSING
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.8,
    0.9,
    0.0
  );
  composer.addPass(bloomPass);

  const filmPass = new ShaderPass(FilmShader);
  filmPass.uniforms["grayscale"].value = 0;
  filmPass.uniforms["nIntensity"].value = 0.4;
  filmPass.uniforms["sIntensity"].value = 0.6;
  filmPass.uniforms["sCount"].value = 800;
  composer.addPass(filmPass);

  composer.addPass(new ShaderPass(CopyShader));

  // LIGHTING
  scene.add(new THREE.AmbientLight(0x202030, 0.9));

  function makeLight(x, y, z, color, intensity, dist) {
    const L = new THREE.PointLight(color, intensity, dist);
    L.position.set(x, y, z);
    L.castShadow = true;
    scene.add(L);
    return L;
  }

  const mainLight = makeLight(0, 4, 0, 0xfff2e0, 1.8, 40);

  // MODULE INITIALIZATION
  const rooms = buildRooms(scene);
  const doors = buildDoors(scene);
  const sound = initSoundSystem();
  const player = initPlayer(controls, ui);
  const monster = buildMonster(scene);
  const aiState = {
    active: false,
    prepTime: 60,
    nextEventTime: 8 + Math.random() * 10
  };

  // GAME LOOP STATE
  let lastTime = performance.now();
  let jumpscareActive = false;
  let jumpscareTime = 0;

  // MAIN UPDATE LOOP
  function update(delta) {
    // PREP TIMER
    if (!aiState.active) {
      aiState.prepTime -= delta;
      if (aiState.prepTime <= 0) {
        aiState.active = true;
        ui.message.textContent = "He is in the house.";
        sound.rumble(0.3, 2.0);
        sound.breath(0.35, 1.8);
      }
      ui.prepTimer.textContent =
        `Boiled One arrives in: ${aiState.prepTime.toFixed(1)}`;
    } else {
      ui.prepTimer.textContent = "He is here.";
    }

    // RANDOM EVENTS
    aiState.nextEventTime -= delta;
    if (aiState.nextEventTime <= 0 && aiState.active && !jumpscareActive) {
      updateEvents(scene, sound, ui);
      aiState.nextEventTime = 8 + Math.random() * 10;
    }

    // LIGHT FLICKER
    if (aiState.active) {
      const t = performance.now() * 0.001;
      mainLight.intensity = 1.6 + Math.sin(t * 9.0) * 0.15;
    }

    // PLAYER UPDATE
    updatePlayer(player, delta, ui, sound);

    // DOORS UPDATE
    updateDoors(doors, player, sound);

    // AI UPDATE
    updateAI(aiState, monster, player, sound, ui);

    // MONSTER VISUAL UPDATE
    updateMonsterVisual(monster, player);

    // SOUND UPDATE
    updateSound(player, ui);

    // JUMPSCARE CAMERA EFFECT
    if (player.jumpscare) {
      jumpscareActive = true;
      jumpscareTime += delta;
      camera.fov = 75 + Math.sin(jumpscareTime * 20) * 12;
      camera.updateProjectionMatrix();
    }
  }

  // ANIMATION LOOP
  function animate() {
    const now = performance.now();
    const delta = (now - lastTime) / 1000;
    lastTime = now;

    update(delta);
    composer.render();

    requestAnimationFrame(animate);
  }
  animate();

  // RESIZE HANDLER
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
  });
}
