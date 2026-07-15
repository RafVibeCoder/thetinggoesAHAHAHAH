// LEVEL 3 REALISM ENGINE — util.js
// Math helpers, easing, randomness, smoothing

// Clamp a value between min and max
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Linear interpolation
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Vector3 interpolation
export function lerpVec(a, b, t) {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    z: lerp(a.z, b.z, t)
  };
}

// Random float between min and max
export function rand(min, max) {
  return Math.random() * (max - min) + min;
}

// Random integer between min and max
export function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

// Smoothstep easing
export function smoothstep(edge0, edge1, x) {
  x = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return x * x * (3 - 2 * x);
}

// Noise-like jitter (for breathing, flicker, fear shake)
export function jitter(amount = 0.02) {
  return (Math.random() - 0.5) * amount;
}
