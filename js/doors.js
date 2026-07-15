// LEVEL 3 REALISM ENGINE — doors.js
// Realistic heavy doors: slow opening, creaking, slamming, muffling

import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

export function buildDoors(scene) {

  const doorMat = new THREE.MeshStandardMaterial({
    color: 0x2d2d2d,
    roughness: 0.85,
    metalness: 0.1
  });

  function makeDoor(x, y, z, rotY = 0) {
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 2.4, 0.15),
      doorMat
    );
    door.position.set(x, y, z);
    door.rotation.y = rotY;
    door.castShadow = true;
    door.receiveShadow = true;

    // Door state
    door.isOpen = false;
    door.openAmount = 0; // 0 = closed, 1 = fully open
    door.targetOpen = 0;
    door.speed = 0.9; // slow heavy door
    door.creakCooldown = 0;

    scene.add(door);
    return door;
  }

  // Doors placed around the house
  const doors = {
    livingRoom: makeDoor(2, 1.2, -3, Math.PI / 2),
    kitchen: makeDoor(-12, 1.2, 6, 0),
    bedroom: makeDoor(10, 1.2, 4, Math.PI / 2),
    bathroom: makeDoor(-4, 1.2, 15, 0),

    // Basement door (special)
    basement: makeDoor(0, 1.2, 11.5, 0)
  };

  return doors;
}

export function updateDoors(doors, player, sound) {

  const playerPos = player.controls.getObject().position;

  for (const key in doors) {
    const door = doors[key];

    // Distance check
    const dist = door.position.distanceTo(playerPos);

    // Player interaction
    if (dist < 2.2 && player.interactPressed) {
      door.targetOpen = door.isOpen ? 0 : 1;
      door.isOpen = !door.isOpen;

      // Sound
      if (door.isOpen) {
        sound.creak(0.4, 1.2);
      } else {
        sound.creak(0.5, 1.4);
      }
    }

    // Monster interaction hook
    if (door.monsterForceOpen) {
      door.targetOpen = 1;
      door.isOpen = true;
      sound.slam(0.7, 1.8);
      door.monsterForceOpen = false;
    }

    // Smooth heavy door movement
    door.openAmount += (door.targetOpen - door.openAmount) * door.speed * 0.05;

    // Apply rotation
    const maxAngle = Math.PI / 2;
    door.rotation.y = door.rotation.y + (door.openAmount * maxAngle);

    // Sound muffling logic
    if (key === "basement") {
      if (door.openAmount < 0.2) {
        player.soundMuffle = 0.55; // heavy muffling
      } else {
        player.soundMuffle = 0.0;
      }
    }
  }

  // Reset interaction flag
  player.interactPressed = false;
}
