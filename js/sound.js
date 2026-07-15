// LEVEL 3 REALISM ENGINE — sound.js
// Hybrid horror sound system: breathing, rumble, footsteps, screech, creaks, slams

export function initSoundSystem() {

  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  // ---------- MASTER GAIN ----------
  const masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.9;
  masterGain.connect(audioCtx.destination);

  // ---------- SOUND HELPERS ----------
  function makeOsc(freq, type = "sine") {
    const osc = audioCtx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;

    const gain = audioCtx.createGain();
    gain.gain.value = 0;

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start();

    return { osc, gain };
  }

  // ---------- SOUND SOURCES ----------
  const breathing = makeOsc(55, "sine");      // monster breathing
  const rumble = makeOsc(28, "sine");         // low-frequency horror rumble
  const screech = makeOsc(420, "sawtooth");   // monster screech
  const creak = makeOsc(180, "triangle");     // door creak
  const slam = makeOsc(60, "square");         // door slam impact

  // ---------- PUBLIC API ----------
  return {

    // MONSTER BREATHING
    breath(intensity = 0.4, duration = 1.2) {
      breathing.gain.gain.cancelScheduledValues(audioCtx.currentTime);
      breathing.gain.gain.setValueAtTime(0, audioCtx.currentTime);
      breathing.gain.gain.linearRampToValueAtTime(intensity, audioCtx.currentTime + 0.2);
      breathing.gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration);
    },

    // HORROR RUMBLE
    rumble(intensity = 0.3, duration = 1.5) {
      rumble.gain.gain.cancelScheduledValues(audioCtx.currentTime);
      rumble.gain.gain.setValueAtTime(0, audioCtx.currentTime);
      rumble.gain.gain.linearRampToValueAtTime(intensity, audioCtx.currentTime + 0.1);
      rumble.gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration);
    },

    // MONSTER SCREECH
    screech(intensity = 0.7, duration = 0.6) {
      screech.gain.gain.cancelScheduledValues(audioCtx.currentTime);
      screech.gain.gain.setValueAtTime(0, audioCtx.currentTime);
      screech.gain.gain.linearRampToValueAtTime(intensity, audioCtx.currentTime + 0.05);
      screech.gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration);
    },

    // DOOR CREAK
    creak(intensity = 0.4, duration = 0.8) {
      creak.gain.gain.cancelScheduledValues(audioCtx.currentTime);
      creak.gain.gain.setValueAtTime(0, audioCtx.currentTime);
      creak.gain.gain.linearRampToValueAtTime(intensity, audioCtx.currentTime + 0.05);
      creak.gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration);
    },

    // DOOR SLAM
    slam(intensity = 0.8, duration = 0.4) {
      slam.gain.gain.cancelScheduledValues(audioCtx.currentTime);
      slam.gain.gain.setValueAtTime(0, audioCtx.currentTime);
      slam.gain.gain.linearRampToValueAtTime(intensity, audioCtx.currentTime + 0.02);
      slam.gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration);
    },

    // PLAYER FOOTSTEPS
    footstep(intensity = 0.25) {
      const fs = makeOsc(90, "triangle");
      fs.gain.gain.setValueAtTime(0, audioCtx.currentTime);
      fs.gain.gain.linearRampToValueAtTime(intensity, audioCtx.currentTime + 0.05);
      fs.gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.25);
      setTimeout(() => fs.osc.stop(), 300);
    },

    // DISTANCE-BASED AUDIO PRESSURE
    proximity(distance) {
      const pressure = Math.max(0, 1 - distance / 12);
      breathing.gain.gain.value = pressure * 0.45;
      rumble.gain.gain.value = pressure * 0.35;
    }
  };
}

// ---------- UPDATE SOUND SYSTEM ----------
export function updateSound(player, ui) {

  // Sound meter UI
  const soundLevel = player.soundLevel * (1 - player.soundMuffle);
  ui.soundMeter.textContent = `Sound: ${soundLevel.toFixed(2)}`;
}
