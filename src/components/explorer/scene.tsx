"use client";

/**
 * The 3D solar system (React Three Fiber). Loaded client-only and lazily from the explorer page.
 * Positions are recomputed every frame from the mutable sim clock; React only re-renders on
 * layer/scale/focus changes.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { CameraControls, Line } from "@react-three/drei";
import { labelElements, labelSpecs, removeLabel, upsertLabel } from "@/components/explorer/scene-labels";
import { DWARF_PLANETS, PLANETS, SUN, getObject, moonsOf } from "@/data/objects";
import { SPACECRAFT } from "@/data/missions";
import { moonOffsetKm, orbitPath, sceneHelioAu, spacecraftAu, type Vec3 } from "@/lib/ephemeris";
import { SPEEDS, useExplorer, useProgress, type ScaleMode } from "@/lib/store";
import type { CelestialObject, Spacecraft } from "@/lib/types";
import { displayRadius, mapDistance, mapHelio, moonOrbitRadius, viewDistance } from "@/components/explorer/scale";
import { simClock } from "@/components/explorer/sim-clock";
import { glowTexture, planetTexture, ringTexture } from "@/components/explorer/textures";

/** Live scene objects by id, so the camera rig can find what to fly to. */
const registry = new Map<string, THREE.Object3D>();
const register = (id: string) => (o: THREE.Object3D | null) => {
  if (o) registry.set(id, o);
  else registry.delete(id);
};

const BODIES = [...PLANETS, ...DWARF_PLANETS];

export default function SolarSystemScene({ lowPower }: { lowPower: boolean }) {
  const focus = useExplorer((s) => s.focus);
  return (
    <Canvas
      gl={{ antialias: !lowPower, alpha: true, logarithmicDepthBuffer: true, powerPreference: lowPower ? "low-power" : "high-performance" }}
      dpr={lowPower ? [1, 1.25] : [1, 2]}
      camera={{ position: [0, 32, 62], fov: 45, near: 0.00001, far: 1e6 }}
      onPointerMissed={(e) => {
        if (e.type === "click") focus(null);
      }}
      aria-label="Interactive 3D model of the solar system"
    >
      <ambientLight intensity={0.85} />
      <hemisphereLight args={["#ffffff", "#c7d2fe", 0.5]} />
      <pointLight position={[0, 0, 0]} intensity={2.2} decay={0} color="#fff4e6" />
      <ClockDriver />
      <Starfield count={lowPower ? 500 : 1400} />
      <SceneContents lowPower={lowPower} />
      <CameraRig />
      <LabelProjector />
    </Canvas>
  );
}

function SceneContents({ lowPower }: { lowPower: boolean }) {
  const scale = useExplorer((s) => s.scale);
  const layers = useExplorer((s) => s.layers);
  return (
    <>
      <SunBody scale={scale} />
      {BODIES.map((b) => (
        <Body key={b.id} object={b} scale={scale} showOrbit={layers.orbits} showLabel={layers.labels} showMoons={layers.moons} />
      ))}
      {layers.asteroids && <Belt kind="asteroid" scale={scale} count={lowPower ? 600 : 1800} />}
      {layers.kuiper && <Belt kind="kuiper" scale={scale} count={lowPower ? 500 : 1500} />}
      {layers.spacecraft && SPACECRAFT.map((c) => <Craft key={c.id} craft={c} scale={scale} showLabel={layers.labels} />)}
    </>
  );
}

/** Advances simulated time and syncs it to React a few times per second. */
function ClockDriver() {
  const last = useRef(0);
  useFrame((_, delta) => {
    const { speed, setTime } = useExplorer.getState();
    const daysPerSec = SPEEDS.find((s) => s.id === speed)?.daysPerSec ?? 0;
    simClock.t += Math.min(delta, 0.1) * daysPerSec * 86_400_000;
    last.current += delta;
    if (last.current > 0.25) {
      last.current = 0;
      setTime(simClock.t);
    }
  });
  return null;
}

function Starfield({ count }: { count: number }) {
  const group = useRef<THREE.Group>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = Math.random() * 2 - 1;
      const th = Math.random() * Math.PI * 2;
      const r = 4000;
      const s = Math.sqrt(1 - u * u);
      arr.set([r * s * Math.cos(th), r * u, r * s * Math.sin(th)], i * 3);
    }
    return arr;
  }, [count]);
  // Keep the stars centered on the camera so they read as "infinitely far away".
  useFrame(({ camera }) => group.current?.position.copy(camera.position));
  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#a5b4fc" size={1.6} sizeAttenuation={false} transparent opacity={0.55} depthWrite={false} />
      </points>
    </group>
  );
}

function useClickable(id: string) {
  const focus = useExplorer((s) => s.focus);
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hovered]);
  return {
    hovered,
    handlers: {
      onClick: (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        focus(id);
      },
      onPointerOver: (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHovered(true);
      },
      onPointerOut: () => setHovered(false),
    },
  };
}

function SunBody({ scale }: { scale: ScaleMode }) {
  const r = displayRadius(SUN, scale);
  const { handlers } = useClickable("sun");
  const showLabel = useExplorer((s) => s.layers.labels);
  return (
    <group ref={register("sun")}>
      <mesh {...handlers}>
        <sphereGeometry args={[r, 48, 32]} />
        <meshBasicMaterial map={planetTexture(SUN)} />
      </mesh>
      <sprite scale={[r * 5.5, r * 5.5, 1]}>
        <spriteMaterial map={glowTexture()} transparent depthWrite={false} />
      </sprite>
      <BodyLabel id="sun" name="Sun" offset={r * 1.25} show={showLabel} dot={false} />
    </group>
  );
}

function Body({
  object,
  scale,
  showOrbit,
  showLabel,
  showMoons,
}: {
  object: CelestialObject;
  scale: ScaleMode;
  showOrbit: boolean;
  showLabel: boolean;
  showMoons: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Mesh>(null);
  const focusedId = useExplorer((s) => s.focusedId);
  const { hovered, handlers } = useClickable(object.id);
  const r = displayRadius(object, scale);
  const texture = useMemo(() => planetTexture(object), [object]);
  const tilt = ((object.axialTiltDeg ?? 0) * Math.PI) / 180;
  const moons = useMemo(() => moonsOf(object.id), [object.id]);
  const moonFocused = focusedId ? getObject(focusedId)?.parentId === object.id : false;
  const isFocusContext = focusedId === object.id || moonFocused;

  const orbit = useMemo(
    () => orbitPath(object, new Date(simClock.t), object.kind === "dwarf" ? 360 : 256).map((p) => mapHelio(p, scale)),
    [object, scale],
  );

  useFrame((_, delta) => {
    if (!group.current) return;
    const p = mapHelio(sceneHelioAu(object, new Date(simClock.t)), scale);
    group.current.position.set(p[0], p[1], p[2]);
    if (spin.current) spin.current.rotation.y += delta * 0.25 * Math.sign(object.dayLengthHours || 1);
  });

  return (
    <>
      {showOrbit && (
        <Line
          points={orbit}
          color={isFocusContext ? "#818cf8" : object.kind === "dwarf" ? "#e2c6f0" : "#c7d2fe"}
          lineWidth={isFocusContext ? 1.6 : 1}
          transparent
          opacity={object.kind === "dwarf" ? 0.5 : 0.75}
          dashed={object.kind === "dwarf"}
          dashSize={mapDistance(1, scale) * 0.2}
          gapSize={mapDistance(1, scale) * 0.15}
        />
      )}
      <group ref={group}>
        <group ref={register(object.id)} />
        <group rotation={[0, 0, tilt]}>
          <mesh ref={spin} {...handlers} scale={hovered ? 1.08 : 1}>
            <sphereGeometry args={[r, 48, 32]} />
            <meshStandardMaterial map={texture} roughness={0.85} metalness={0} />
          </mesh>
          {object.hasRings && <Rings id={object.id} radius={r} />}
        </group>
        <BodyLabel id={object.id} name={object.name} offset={r * (object.hasRings ? 1.6 : 1.35)} show={showLabel} dot={scale === "realistic"} />
        {showMoons && moons.map((m) => <MoonBody key={m.id} moon={m} scale={scale} showLabel={showLabel && isFocusContext} showOrbit={isFocusContext} />)}
      </group>
    </>
  );
}

function Rings({ id, radius }: { id: string; radius: number }) {
  const [inner, outer] = id === "saturn" ? [1.24, 2.27] : [1.6, 2.0];
  const geometry = useMemo(() => {
    const g = new THREE.RingGeometry(radius * inner, radius * outer, 128, 1);
    // Re-map UVs radially so the 1D ring texture runs from inner to outer edge.
    const pos = g.attributes.position;
    const uv = g.attributes.uv;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const t = (v.length() - radius * inner) / (radius * (outer - inner));
      uv.setXY(i, t, 0.5);
    }
    return g;
  }, [radius, inner, outer]);
  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
      <meshBasicMaterial map={ringTexture(id)} side={THREE.DoubleSide} transparent depthWrite={false} />
    </mesh>
  );
}

function MoonBody({ moon, scale, showLabel, showOrbit }: { moon: CelestialObject; scale: ScaleMode; showLabel: boolean; showOrbit: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const { hovered, handlers } = useClickable(moon.id);
  const focusedId = useExplorer((s) => s.focusedId);
  const r = displayRadius(moon, scale);
  const orbitR = moonOrbitRadius(moon, scale);
  const texture = useMemo(() => planetTexture(moon), [moon]);

  const orbitPts = useMemo(() => {
    const period = Math.abs(moon.orbitalPeriodDays ?? 1);
    const pts: Vec3[] = [];
    for (let k = 0; k <= 96; k++) {
      const o = moonOffsetKm(moon, new Date(simClock.t + (k / 96) * period * 86_400_000));
      const len = Math.hypot(...o) || 1;
      pts.push([(o[0] / len) * orbitR, (o[1] / len) * orbitR, (o[2] / len) * orbitR]);
    }
    return pts;
  }, [moon, orbitR]);

  useFrame(() => {
    if (!ref.current) return;
    const o = moonOffsetKm(moon, new Date(simClock.t));
    const len = Math.hypot(...o) || 1;
    ref.current.position.set((o[0] / len) * orbitR, (o[1] / len) * orbitR, (o[2] / len) * orbitR);
  });

  return (
    <>
      {showOrbit && <Line points={orbitPts} color="#c4b5fd" lineWidth={0.8} transparent opacity={0.55} />}
      <group ref={ref}>
        <group ref={register(moon.id)} />
        <mesh {...handlers} scale={hovered ? 1.15 : 1}>
          <sphereGeometry args={[r, 24, 16]} />
          <meshStandardMaterial map={texture} roughness={0.9} />
        </mesh>
        <BodyLabel id={moon.id} name={moon.name} offset={r * 1.6} show={showLabel || focusedId === moon.id} dot={scale === "realistic" && showOrbit} small />
      </group>
    </>
  );
}

/** Registers an anchor point for a DOM label (see scene-labels.tsx); renders nothing visible itself. */
function BodyLabel({ id, name, offset, show, dot, small }: { id: string; name: string; offset: number; show: boolean; dot: boolean; small?: boolean }) {
  const anchor = useRef<THREE.Group>(null);
  useEffect(() => {
    const a = anchor.current;
    if (!a || (!show && !dot)) return;
    upsertLabel({ id, name, show, dot, small: Boolean(small), anchor: a });
    return () => removeLabel(id, a);
  }, [id, name, show, dot, small]);
  return <group ref={anchor} position={[0, offset, 0]} />;
}

/** Projects every registered label anchor to screen space each frame and moves its DOM button. */
function LabelProjector() {
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, size }) => {
    for (const [id, spec] of labelSpecs()) {
      const el = labelElements.get(id);
      if (!el) continue;
      spec.anchor.getWorldPosition(v).project(camera);
      if (v.z > 1 || v.z < -1) {
        el.style.visibility = "hidden"; // behind the camera
        continue;
      }
      const x = (v.x * 0.5 + 0.5) * size.width;
      const y = (-v.y * 0.5 + 0.5) * size.height;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -100%)`;
      el.style.visibility = "visible";
    }
  });
  return null;
}

function Belt({ kind, scale, count }: { kind: "asteroid" | "kuiper"; scale: ScaleMode; count: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const [min, max, thick] = kind === "asteroid" ? [2.2, 3.3, 0.12] : [30, 50, 0.18];
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const au = min + Math.random() * (max - min);
      const a = Math.random() * Math.PI * 2;
      const tilt = (Math.random() - 0.5) * thick * au;
      const p = mapHelio([au * Math.cos(a), tilt, au * Math.sin(a)], scale);
      arr.set(p, i * 3);
    }
    return arr;
  }, [kind, scale, count]);
  const periodDays = kind === "asteroid" ? 1_680 : 90_000;
  useFrame(() => {
    if (ref.current) ref.current.rotation.y = -((simClock.t / 86_400_000) / periodDays) * Math.PI * 2;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={kind === "asteroid" ? "#b8a99a" : "#a5b4fc"}
        size={scale === "readable" ? 0.09 : kind === "asteroid" ? 0.6 : 4}
        sizeAttenuation
        transparent
        opacity={0.65}
        depthWrite={false}
      />
    </points>
  );
}

function Craft({ craft, scale, showLabel }: { craft: Spacecraft; scale: ScaleMode; showLabel: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const { handlers } = useClickable(craft.id);
  const size = scale === "readable" ? 0.18 : 0.02;
  useFrame(() => {
    if (!ref.current) return;
    const p = mapHelio(spacecraftAu(craft, new Date(simClock.t)), scale);
    ref.current.position.set(p[0], p[1], p[2]);
    ref.current.rotation.y += 0.01;
  });
  return (
    <group ref={ref}>
      <group ref={register(craft.id)} />
      <mesh {...handlers}>
        <octahedronGeometry args={[size, 0]} />
        <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.4} />
      </mesh>
      <BodyLabel id={craft.id} name={`🛰 ${craft.name}`} offset={size * 2.5} show={showLabel} dot />
    </group>
  );
}

/** Smooth fly-to on focus, then follows the object as it orbits. */
function CameraRig() {
  const controls = useRef<CameraControls>(null);
  const focusedId = useExplorer((s) => s.focusedId);
  const scale = useExplorer((s) => s.scale);
  const markExplored = useProgress((s) => s.markExplored);
  const { camera } = useThree();
  // Frames left in the current fly-to. Counting frames (not wall time) keeps the flight
  // complete even when the browser throttles rendering.
  const flyFrames = useRef(0);
  const lastTarget = useRef(new THREE.Vector3());
  const dir = useRef(new THREE.Vector3(0.35, 0.45, 1).normalize());

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    if (focusedId) {
      markExplored(focusedId);
      const obj = registry.get(focusedId);
      if (obj) {
        const p = obj.getWorldPosition(new THREE.Vector3());
        // Approach from the camera's current side, lifted slightly above the ecliptic.
        const d = camera.position.clone().sub(p).normalize();
        d.y = Math.max(d.y, 0.25);
        dir.current.copy(d.normalize());
      }
      flyFrames.current = 90;
    } else {
      c.minDistance = 0.001;
      const far = scale === "readable" ? new THREE.Vector3(0, 32, 62) : new THREE.Vector3(0, 140, 260);
      void c.setLookAt(far.x, far.y, far.z, 0, 0, 0, true);
    }
  }, [focusedId, scale, camera, markExplored]);

  useFrame(() => {
    const c = controls.current;
    if (!c || !focusedId) return;
    const obj = registry.get(focusedId);
    if (!obj) return;
    const p = obj.getWorldPosition(new THREE.Vector3());
    const data = getObject(focusedId);
    const dist = data ? viewDistance(data, scale) : scale === "readable" ? 1.5 : 0.05;
    c.minDistance = data ? displayRadius(data, scale) * 1.3 : 0.001;
    if (flyFrames.current > 0) {
      flyFrames.current--;
      const cam = p.clone().add(dir.current.clone().multiplyScalar(dist));
      void c.setLookAt(cam.x, cam.y, cam.z, p.x, p.y, p.z, true);
    } else if (!p.equals(lastTarget.current)) {
      void c.moveTo(p.x, p.y, p.z, false);
    }
    lastTarget.current.copy(p);
  });

  return <CameraControls ref={controls} makeDefault smoothTime={0.6} maxDistance={20_000} dollySpeed={0.6} />;
}
