/**
 * Procedural planet textures drawn on small canvases at runtime.
 * They're a few KB of GPU memory each, need no downloads, and keep the soft, illustrated look.
 */
import * as THREE from "three";
import type { CelestialObject } from "@/lib/types";

const cache = new Map<string, THREE.Texture>();

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function mix(a: string, b: string, t: number) {
  const ca = new THREE.Color(a);
  const cb = new THREE.Color(b);
  return `#${ca.lerp(cb, t).getHexString()}`;
}

export function planetTexture(obj: CelestialObject): THREE.Texture {
  const hit = cache.get(obj.id);
  if (hit) return hit;
  const W = 256;
  const H = 128;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const rand = rng([...obj.id].reduce((s, c) => s * 31 + c.charCodeAt(0), 7) % 2147483646 || 1);
  const base = obj.color;
  const alt = obj.colorAlt ?? mix(obj.color, "#ffffff", 0.25);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);

  const gas = ["jupiter", "saturn", "uranus", "neptune"].includes(obj.id);
  if (obj.kind === "star") {
    // Soft granulation: warm cells over a pale-gold base.
    ctx.fillStyle = "#FFDCA8";
    ctx.fillRect(0, 0, W, H);
    for (let k = 0; k < 420; k++) {
      ctx.fillStyle = rand() > 0.5 ? "rgba(255, 244, 222, 0.55)" : "rgba(251, 176, 110, 0.35)";
      ctx.beginPath();
      ctx.arc(rand() * W, rand() * H, 1.5 + rand() * 4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (gas) {
    // Soft horizontal bands
    let y = 0;
    while (y < H) {
      const h = 3 + rand() * (obj.id === "jupiter" ? 12 : 9);
      ctx.fillStyle = mix(base, alt, rand() * (obj.id === "uranus" ? 0.25 : 0.9));
      ctx.globalAlpha = 0.65;
      ctx.fillRect(0, y, W, h);
      y += h;
    }
    ctx.globalAlpha = 1;
    if (obj.id === "jupiter") {
      ctx.fillStyle = "#E3A07A";
      ctx.beginPath();
      ctx.ellipse(W * 0.62, H * 0.64, 14, 7, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (obj.id === "earth") {
    ctx.fillStyle = "#5B9CF2";
    ctx.fillRect(0, 0, W, H);
    for (let k = 0; k < 22; k++) {
      ctx.fillStyle = rand() > 0.3 ? "#8FD9A8" : "#E9D8A6";
      ctx.beginPath();
      ctx.ellipse(rand() * W, H * 0.2 + rand() * H * 0.6, 8 + rand() * 26, 5 + rand() * 14, rand() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillRect(0, 0, W, 8);
    ctx.fillRect(0, H - 8, W, 8);
    for (let k = 0; k < 30; k++) {
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.beginPath();
      ctx.ellipse(rand() * W, rand() * H, 10 + rand() * 20, 2 + rand() * 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Rocky/icy: blotches and craters
    for (let k = 0; k < 70; k++) {
      ctx.fillStyle = mix(base, k % 3 ? alt : "#000000", rand() * 0.25);
      ctx.globalAlpha = 0.35 + rand() * 0.3;
      ctx.beginPath();
      ctx.arc(rand() * W, rand() * H, 2 + rand() * 12, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (obj.id === "mars") {
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fillRect(0, 0, W, 5);
      ctx.fillRect(0, H - 4, W, 4);
    }
    if (obj.id === "pluto") {
      ctx.fillStyle = "#FBF3EA";
      ctx.beginPath();
      ctx.ellipse(W * 0.5, H * 0.55, 22, 18, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  cache.set(obj.id, tex);
  return tex;
}

export function ringTexture(id: string): THREE.Texture {
  const key = `ring-${id}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const W = 256;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = 4;
  const ctx = canvas.getContext("2d")!;
  const rand = rng(42);
  for (let x = 0; x < W; x++) {
    const t = x / W;
    // Saturn: C ring faint, B ring dense, Cassini division gap, A ring medium
    let a =
      id === "saturn"
        ? t < 0.2
          ? 0.18
          : t < 0.55
            ? 0.75 + rand() * 0.2
            : t < 0.6
              ? 0.06
              : t < 0.92
                ? 0.5 + rand() * 0.2
                : 0.12
        : 0.25 * (Math.sin(t * 40) > 0.6 ? 1 : 0.1);
    a = Math.max(0, Math.min(1, a));
    ctx.fillStyle = id === "saturn" ? `rgba(228, 206, 160, ${a})` : `rgba(200, 220, 230, ${a})`;
    ctx.fillRect(x, 0, 1, 4);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  cache.set(key, tex);
  return tex;
}

export function glowTexture(): THREE.Texture {
  const hit = cache.get("glow");
  if (hit) return hit;
  const S = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = S;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, "rgba(255, 220, 170, 0.95)");
  g.addColorStop(0.25, "rgba(253, 186, 116, 0.55)");
  g.addColorStop(0.6, "rgba(249, 168, 212, 0.15)");
  g.addColorStop(1, "rgba(249, 168, 212, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  cache.set("glow", tex);
  return tex;
}
