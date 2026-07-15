// LEVEL 3 REALISM ENGINE — rooms.js (REALISTIC VERSION)
// Builds a realistic multi-room house + real staircase + basement

import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

export function buildRooms(scene) {

  // ---------- MATERIALS ----------
  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x2b2b2b,
    roughness: 0.92,
    metalness: 0.0
  });

  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x1c1a18,
    roughness: 0.88,
    metalness: 0.05
  });

  const propMat = new THREE.MeshStandardMaterial({
    color: 0x3a3a3a,
    roughness: 0.85,
    metalness: 0.05
  });

  // ---------- HELPERS ----------
  function wall(w, h, d, x, y, z) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    scene.add(m);
    return m;
  }

  function floor(w, d, x, y, z) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), floorMat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, y, z);
    m.receiveShadow = true;
    scene.add(m);
    return m;
  }

  function prop(geo, x, y, z) {
    const m = new THREE.Mesh(geo, propMat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    scene.add(m);
    return m;
  }

  // ---------- MAIN FLOOR ----------
  floor(45, 45, 0, 0, 0);

  // Outer shell
  wall(45, 3, 0.3, 0, 1.5, -22);
  wall(45, 3, 0.3, 0, 1.5, 22);
  wall(0.3, 3, 45, -22, 1.5, 0);
  wall(0.3, 3, 45, 22, 1.5, 0);

  // ---------- LIVING ROOM ----------
  wall(20, 3, 0.3, 8, 1.5, -6);
  const couch = prop(new THREE.BoxGeometry(3.2, 1, 1.4), 6, 0.5, -10);
  const coffeeTable = prop(new THREE.BoxGeometry(2.2, 0.4, 1.2), 3, 0.2, -7);
  prop(new THREE.BoxGeometry(3, 1.4, 0.7), 10, 0.7, -5);

  // ---------- KITCHEN ----------
  wall(18, 3, 0.3, -10, 1.5, 10);
  const counter = prop(new THREE.BoxGeometry(7, 1, 1.4), -12, 0.5, 10);
  prop(new THREE.BoxGeometry(1.4, 2.6, 1.2), -16, 1.3, 7);
  prop(new THREE.BoxGeometry(3, 1, 1.8), -10, 0.5, 5);

  // ---------- HALLWAY ----------
  wall(0.3, 3, 20, -5, 1.5, -12);

  // ---------- BEDROOM ----------
  wall(0.3, 3, 18, 14, 1.5, 5);
  const bed = prop(new THREE.BoxGeometry(2.8, 0.6, 2), 14, 0.3, 7);
  const wardrobe = prop(new THREE.BoxGeometry(2, 2.6, 0.9), 16, 1.3, 4);

  // ---------- BATHROOM ----------
  const tub = prop(new THREE.BoxGeometry(2.8, 0.8, 1.4), -3, 0.4, 18);

  // ---------- BASEMENT STAIRCASE (REALISTIC STEPS) ----------
  const stepCount = 8;
  const stepWidth = 3;
  const stepDepth = 0.5;
  const stepHeight = 0.35;

  for (let i = 0; i < stepCount; i++) {
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(stepWidth, stepHeight, stepDepth),
      floorMat
    );
    step.position.set(
      0,
      -stepHeight * i,
      12 + stepDepth * i
    );
    step.castShadow = true;
    step.receiveShadow = true;
    scene.add(step);
  }

  // Stair opening frame
  wall(3.2, 0.2, 0.2, 0, 0.1, 12);

  // ---------- BASEMENT ----------
  floor(25, 25, 0, -4, 22);

  // Basement walls
  wall(25, 3, 0.3, 0, -2.5, 10);
  wall(25, 3, 0.3, 0, -2.5, 34);
  wall(0.3, 3, 25, -12.5, -2.5, 22);
  wall(0.3, 3, 25, 12.5, -2.5, 22);

  // Basement props
  const boiler = prop(new THREE.BoxGeometry(2.2, 3.2, 2.2), -7, -3, 26);
  const shelves = prop(new THREE.BoxGeometry(3.2, 2.2, 1.2), 7, -3, 20);
  const waterHeater = prop(new THREE.BoxGeometry(1.6, 2.8, 1.6), 3, -3, 28);

  // ---------- RETURN OBJECTS ----------
  return {
    couch,
    coffeeTable,
    counter,
    bed,
    wardrobe,
    tub,
    boiler,
    shelves,
    waterHeater
  };
}
