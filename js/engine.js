// LEVEL 3 REALISM ENGINE — engine.js
// Core renderer, camera, lighting, post-processing, main loop

import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { PointerLockControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/PointerLockControls.js";
import { EffectComposer } from "https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/ShaderPass.js";
import { FilmShader } from "https://unpkg.com/three@0.160.0/examples/jsm/shaders/FilmShader.js";
import { CopyShader } from "https://unpkg.com/three@0.160.0/examples/jsm/shaders/CopyShader.js";

import { buildRooms } from "./rooms.js";
import { buildDoors, updateDoors } from "./doors.js";
import { initSoundSystem, updateSound } from "./sound.js";
import { initPlayer, updatePlayer } from "./player.js";
import { buildMonster, updateMonsterVisual } from "./monster.js";
import { updateAI } from "./ai.js";
import { updateEvents } from "./events.js";
import { clamp } from "./util.js";

export function startEngine(config) {
  const canvas = config.canvas;
  const ui = config.ui;

  // Renderer
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  // Scene & camera
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 1.7, 5);

  // Controls
  const controls = new PointerLockControls(camera, document.body);
  scene.add(controls.getObject());

  document.body.addEventListener("click", () => {
    controls.lock();
  });

  // Lights
  const mainLight = new THREE.PointLight(0xffffff, 1.6, 60);
  mainLight.position.set(0, 6, 0);
  mainLight.castShadow = true;
  scene.add(mainLight);

  const ambient = new THREE.AmbientLight(0x404040, 0.6);
  scene.add(ambient);

  // Fog
  scene.fog = new THREE.FogExp2(0x000000, 0.035);

  // Post-processing
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.8,
    0.4,
    0.85
  );
  composer.addPass(bloomPass);

  const filmPass = new ShaderPass(FilmShader);
  filmPass.uniforms["nIntensity"].value = 0.35;
  filmPass.uniforms["sIntensity"].value = 0.4;
  filmPass.uniforms["sCount"].value = 512;
  composer.addPass(filmPass);

  const copyPass = new ShaderPass(CopyShader);
  composer.addPass(copyPass);

  // World
  const rooms = buildRooms(scene);
  const doors = buildDoors(scene);
  const sound = initSoundSystem();
  const player = initPlayer(controls, ui);
  const monster = buildMonster(scene);

  // AI state
  const ai = {
    active: false,
    state: "idle",
    target: null
  };

  // Prep timer
  let prepTime = 60.0;
  ui.prepTimer.textContent = `Boiled One arrives in: ${prepTime.toFixed(1)}`;

  // Resize
  window.addEventListener("resize", () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    composer.setSize(w, h);
  });

  // Main loop
  let lastTime = performance.now();

  function loop(now) {
    const delta = (now - lastTime) / 1000;
    lastTime = now;

    // Prep countdown
    if (!ai.active) {
      prepTime = clamp(prepTime - delta, 0, 60);
      ui.prepTimer.textContent = `Boiled One arrives in: ${prepTime.toFixed(1)}`;

      if (prepTime <= 0) {
        ai.active = true;
        ai.state = "investigate";
        ui.prepTimer.textContent = "He is here.";
      }
    }

    // Update systems
    updatePlayer(player, delta, ui, sound);
    updateDoors(doors, player, sound);
    updateAI(ai, monster, player, sound, ui);
    updateMonsterVisual(monster, player);
    updateSound(player, ui);
    updateEvents(scene, sound, ui);

    // Render
    composer.render();

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}
