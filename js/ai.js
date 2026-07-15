// LEVEL 3 REALISM ENGINE — ai.js
// Boiled One AI: stalking, chasing, sound detection, door interaction, kill logic

import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

export function updateAI(ai, monster, player, sound, ui) {

  if (!ai.active) return;

  const playerPos = player.controls.getObject().position;
  const monsterPos = monster.position;

  // ---------- DISTANCE ----------
  const dx = playerPos.x - monsterPos.x;
  const dz = playerPos.z - monsterPos.z;
  const dist = Math.sqrt(dx * dx + dz * dz);

  // ---------- SOUND DETECTION ----------
  const soundLevel = player.soundLevel * (1 - player.soundMuffle);

  if (soundLevel > 0.25 && dist > 6) {
    // Monster hears you
    ai.state = "investigate";
    ai.target = playerPos.clone();
  }

  // ---------- LINE OF SIGHT ----------
  const los = dist < 10;

  if (los && soundLevel < 0.2) {
    // Stalking mode
    ai.state = "stalk";
  }

  if (los && soundLevel > 0.2) {
    // Chase mode
    ai.state = "chase";
  }

  // ---------- STATE MACHINE ----------
  switch (ai.state) {

    // ----------------------------------------------------------
    // INVESTIGATE
    // ----------------------------------------------------------
    case "investigate":
      monster.visible = true;

      // Move slowly toward last heard sound
      moveMonsterToward(monster, ai.target, 0.02);

      monster.anim.stalk = 0.4;
      monster.anim.chase = 0;

      sound.breath(0.25, 1.2);

      break;

    // ----------------------------------------------------------
    // STALK
    // ----------------------------------------------------------
    case "stalk":
      monster.visible = true;

      // Slow movement toward player
      moveMonsterToward(monster, playerPos, 0.018);

      monster.anim.stalk = 1.0;
      monster.anim.chase = 0;

      sound.breath(0.35, 1.4);
      sound.rumble(0.25, 1.2);

      break;

    // ----------------------------------------------------------
    // CHASE
    // ----------------------------------------------------------
    case "chase":
      monster.visible = true;

      // Fast movement toward player
      moveMonsterToward(monster, playerPos, 0.045);

      monster.anim.stalk = 0;
      monster.anim.chase = 1.0;

      sound.breath(0.55, 1.0);
      sound.rumble(0.45, 1.0);

      // Door slamming
      if (dist < 4 && Math.random() < 0.02) {
        monster.monsterForceOpen = true;
      }

      break;
  }

  // ---------- KILL LOGIC ----------
  if (dist < 1.2 && !player.hiding) {
    player.jumpscare = true;
    ui.message.textContent = "He got you.";
  }

  // ---------- BASEMENT EMERGENCE ----------
  if (monsterPos.z > 20 && ai.state === "investigate") {
    // Monster climbs stairs
    monster.position.y += 0.02;
  }

  // ---------- SILHOUETTE EVENTS ----------
  if (dist > 12 && Math.random() < 0.005) {
    monster.anim.silhouette = true;
    setTimeout(() => {
      monster.anim.silhouette = false;
    }, 1500);
  }

  // ---------- PROXIMITY AUDIO ----------
  sound.proximity(dist);
}

// ---------- MOVEMENT HELPER ----------
function moveMonsterToward(monster, target, speed) {
  const dx = target.x - monster.position.x;
  const dz = target.z - monster.position.z;

  const angle = Math.atan2(dx, dz);

  monster.position.x += Math.sin(angle) * speed;
  monster.position.z += Math.cos(angle) * speed;
}
