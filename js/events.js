// LEVEL 3 REALISM ENGINE — events.js
// Cinematic horror events: silhouettes, window scares, basement scares, light flickers

import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

export function updateEvents(scene, sound, ui) {

  const eventType = Math.random();

  // ----------------------------------------------------------
  // WINDOW SILHOUETTE EVENT
  // ----------------------------------------------------------
  if (eventType < 0.25) {
    ui.message.textContent = "";

    const silhouette = makeSilhouette(scene, 8, 2, -18);

    sound.breath(0.45, 1.4);
    sound.rumble(0.35, 1.2);

    setTimeout(() => {
      scene.remove(silhouette);
    }, 1500);
  }

  // ----------------------------------------------------------
  // STAIRCASE TOP SILHOUETTE
  // ----------------------------------------------------------
  else if (eventType < 0.50) {
    const silhouette = makeSilhouette(scene, 0, 2.5, 10);

    sound.breath(0.55, 1.6);
    sound.rumble(0.45, 1.4);

    setTimeout(() => {
      scene.remove(silhouette);
    }, 1800);
  }

  // ----------------------------------------------------------
  // BASEMENT CORNER SILHOUETTE
  // ----------------------------------------------------------
  else if (eventType < 0.75) {
    const silhouette = makeSilhouette(scene, -7, -3, 26);

    sound.breath(0.6, 1.8);
    sound.rumble(0.5, 1.6);

    setTimeout(() => {
      scene.remove(silhouette);
    }, 2000);
  }

  // ----------------------------------------------------------
  // LIGHT FLICKER BURST
  // ----------------------------------------------------------
  else {
    flickerLights(scene);

    sound.rumble(0.4, 1.0);
    sound.breath(0.3, 1.0);

    ui.message.textContent = "";
  }
}

// ----------------------------------------------------------
// SILHOUETTE BUILDER
// ----------------------------------------------------------
function makeSilhouette(scene, x, y, z) {
  const mat = new THREE.MeshStandardMaterial({
    color: 0x000000,
    roughness: 1.0,
    metalness: 0.0
  });

  const silhouette = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 2.8, 0.6),
    mat
  );

  silhouette.position.set(x, y, z);
  silhouette.castShadow = true;

  scene.add(silhouette);
  return silhouette;
}

// ----------------------------------------------------------
// LIGHT FLICKER
// ----------------------------------------------------------
function flickerLights(scene) {
  const lights = [];

  scene.traverse((obj) => {
    if (obj.isLight) lights.push(obj);
  });

  let t = 0;
  const interval = setInterval(() => {
    t++;

    lights.forEach((L) => {
      L.intensity = Math.random() * 2.0;
    });

    if (t > 6) {
      clearInterval(interval);
      lights.forEach((L) => {
        L.intensity = 1.6;
      });
    }
  }, 80);
}
