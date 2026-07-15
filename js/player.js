// LEVEL 3 REALISM ENGINE — player.js
// Realistic movement, crouching, camera sway, sound generation, hiding system

import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

export function initPlayer(controls, ui) {

  const player = {
    controls,
    velocity: new THREE.Vector3(),
    direction: new THREE.Vector3(),
    speed: 4.2,
    crouchSpeed: 2.0,
    isCrouching: false,
    soundLevel: 0,
    soundMuffle: 0,
    interactPressed: false,
    hideTimer: 0,
    hiding: false,
    jumpscare: false,
    headBob: 0,
    fearShake: 0
  };

  // ---------- INPUT ----------
  const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    ctrl: false,
    e: false
  };

  document.addEventListener("keydown", (e) => {
    if (e.key === "w") keys.w = true;
    if (e.key === "a") keys.a = true;
    if (e.key === "s") keys.s = true;
    if (e.key === "d") keys.d = true;
    if (e.key === "Control") keys.ctrl = true;
    if (e.key === "e") keys.e = true;
  });

  document.addEventListener("keyup", (e) => {
    if (e.key === "w") keys.w = false;
    if (e.key === "a") keys.a = false;
    if (e.key === "s") keys.s = false;
    if (e.key === "d") keys.d = false;
    if (e.key === "Control") keys.ctrl = false;
    if (e.key === "e") keys.e = false;
  });

  return player;
}

// ---------- UPDATE PLAYER ----------
export function updatePlayer(player, delta, ui, sound) {

  const controls = player.controls;

  // ---------- CROUCH ----------
  if (player.isCrouching !== player.keys?.ctrl) {
    player.isCrouching = player.keys?.ctrl;
    controls.getObject().position.y = player.isCrouching ? 1.0 : 1.7;
  }

  // ---------- MOVEMENT ----------
  player.direction.set(0, 0, 0);

  if (player.keys?.w) player.direction.z -= 1;
  if (player.keys?.s) player.direction.z += 1;
  if (player.keys?.a) player.direction.x -= 1;
  if (player.keys?.d) player.direction.x += 1;

  player.direction.normalize();

  const speed = player.isCrouching ? player.crouchSpeed : player.speed;

  player.velocity.x += player.direction.x * speed * delta * 6;
  player.velocity.z += player.direction.z * speed * delta * 6;

  // Friction
  player.velocity.x *= 0.85;
  player.velocity.z *= 0.85;

  controls.moveRight(player.velocity.x * delta);
  controls.moveForward(player.velocity.z * delta);

  // ---------- SOUND LEVEL ----------
  const movementIntensity = Math.abs(player.velocity.x) + Math.abs(player.velocity.z);
  player.soundLevel = movementIntensity * (player.isCrouching ? 0.3 : 1.0);

  // Footstep sound
  if (movementIntensity > 0.2 && !player.isCrouching) {
    if (Math.random() < 0.03) {
      sound.footstep(0.25);
    }
  }

  // ---------- CAMERA SWAY ----------
  player.headBob += movementIntensity * 0.1;
  const sway = Math.sin(player.headBob * 8) * 0.02;
  controls.getObject().rotation.z = sway;

  // ---------- FEAR SHAKE ----------
  if (player.jumpscare) {
    player.fearShake += delta * 12;
    controls.getObject().rotation.x = Math.sin(player.fearShake * 20) * 0.1;
  }

  // ---------- INTERACTION ----------
  if (player.keys?.e) {
    player.interactPressed = true;
  }

  // ---------- HIDING ----------
  if (player.hiding) {
    player.hideTimer += delta;
    ui.hideTimer.textContent = `Hiding: ${player.hideTimer.toFixed(1)}`;
  } else {
    ui.hideTimer.textContent = "";
  }
}
