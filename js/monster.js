// LEVEL 3 REALISM ENGINE — monster.js
// Boiled One model, breathing animation, stalking posture, eye glow, silhouette mode

import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

export function buildMonster(scene) {

  // ---------- MATERIALS ----------
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0x2a1f1f,
    roughness: 0.95,
    metalness: 0.0
  });

  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0xff3b3b,
    emissive: 0xff0000,
    emissiveIntensity: 1.5
  });

  // ---------- BODY PARTS ----------
  const monster = new THREE.Group();

  // Torso
  const torso = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 2.2, 0.8),
    skinMat
  );
  torso.position.set(0, 1.5, 0);
  torso.castShadow = true;
  monster.add(torso);

  // Head
  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 1.0, 0.9),
    skinMat
  );
  head.position.set(0, 2.7, 0);
  head.castShadow = true;
  monster.add(head);

  // Eyes
  const leftEye = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 16, 16),
    eyeMat
  );
  leftEye.position.set(-0.22, 2.75, 0.45);
  monster.add(leftEye);

  const rightEye = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 16, 16),
    eyeMat
  );
  rightEye.position.set(0.22, 2.75, 0.45);
  monster.add(rightEye);

  // Arms
  const leftArm = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 1.8, 0.35),
    skinMat
  );
  leftArm.position.set(-0.9, 1.5, 0);
  leftArm.castShadow = true;
  monster.add(leftArm);

  const rightArm = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 1.8, 0.35),
    skinMat
  );
  rightArm.position.set(0.9, 1.5, 0);
  rightArm.castShadow = true;
  monster.add(rightArm);

  // Legs
  const leftLeg = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 2.0, 0.45),
    skinMat
  );
  leftLeg.position.set(-0.4, 0.0, 0);
  leftLeg.castShadow = true;
  monster.add(leftLeg);

  const rightLeg = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 2.0, 0.45),
    skinMat
  );
  rightLeg.position.set(0.4, 0.0, 0);
  rightLeg.castShadow = true;
  monster.add(rightLeg);

  // ---------- INITIAL POSITION ----------
  monster.position.set(0, 0, 25); // basement start
  monster.visible = false; // hidden until AI activates

  // Animation state
  monster.anim = {
    breathe: 0,
    stalk: 0,
    chase: 0,
    silhouette: false
  };

  scene.add(monster);
  return monster;
}

// ---------- MONSTER VISUAL UPDATE ----------
export function updateMonsterVisual(monster, player) {

  if (!monster.visible) return;

  const anim = monster.anim;

  // ---------- BREATHING ----------
  anim.breathe += 0.03;
  const breatheScale = Math.sin(anim.breathe) * 0.05;

  monster.children[0].scale.y = 1 + breatheScale; // torso breathing
  monster.children[1].scale.y = 1 + breatheScale * 0.5; // head slight movement

  // ---------- HEAD TRACKING ----------
  const playerPos = player.controls.getObject().position;
  const head = monster.children[1];

  const dx = playerPos.x - monster.position.x;
  const dz = playerPos.z - monster.position.z;

  head.rotation.y = Math.atan2(dx, dz);

  // ---------- STALKING POSTURE ----------
  if (anim.stalk > 0) {
    const torso = monster.children[0];
    torso.rotation.x = -0.3 * anim.stalk;
    monster.position.y = -0.2 * anim.stalk;
  }

  // ---------- CHASE POSTURE ----------
  if (anim.chase > 0) {
    const torso = monster.children[0];
    torso.rotation.x = -0.6 * anim.chase;
    monster.position.y = -0.4 * anim.chase;
  }

  // ---------- SILHOUETTE MODE ----------
  if (anim.silhouette) {
    monster.children.forEach((part) => {
      part.material.color.set(0x000000);
      part.material.emissiveIntensity = 0;
    });
  }
}
