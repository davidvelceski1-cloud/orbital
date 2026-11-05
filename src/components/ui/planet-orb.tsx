import type { CelestialObject } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * A lightweight, illustrated sphere for any object (lists, cards, comparisons).
 * Pure CSS gradients — no textures — so it renders instantly everywhere.
 */
export function PlanetOrb({
  object,
  size = 40,
  className,
  style,
}: {
  object: Pick<CelestialObject, "id" | "color" | "colorAlt" | "hasRings" | "kind">;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const alt = object.colorAlt ?? object.color;
  const banded = ["jupiter", "saturn"].includes(object.id);
  const isSun = object.kind === "star";
  const background = isSun
    ? `radial-gradient(circle at 40% 38%, #FFFBEB 0%, #FDE68A 35%, #FDBA74 75%, #FB923C 100%)`
    : banded
      ? `radial-gradient(circle at 32% 30%, rgba(255,255,255,.55), transparent 45%), repeating-linear-gradient(170deg, ${object.color} 0 9%, ${alt} 9% 15%, ${object.color} 15% 22%), ${object.color}`
      : object.id === "earth"
        ? `radial-gradient(circle at 32% 30%, rgba(255,255,255,.6), transparent 42%), radial-gradient(circle at 62% 58%, #86EFAC 0 18%, transparent 19%), radial-gradient(circle at 34% 64%, #86EFAC 0 11%, transparent 12%), radial-gradient(circle at 50% 50%, #60A5FA, #3B82F6)`
        : `radial-gradient(circle at 32% 30%, rgba(255,255,255,.65), transparent 45%), radial-gradient(circle at 50% 50%, ${alt}, ${object.color} 70%)`;

  return (
    <span
      className={cn("relative inline-block shrink-0", className)}
      style={{ width: size, height: size, ...style }}
      aria-hidden
    >
      {object.hasRings && object.id === "saturn" && (
        <span
          className="absolute left-1/2 top-1/2 rounded-[50%] border-[3px] border-[#E7D3A8]/90"
          style={{ width: size * 1.9, height: size * 0.5, transform: "translate(-50%,-50%) rotate(-18deg)" }}
        />
      )}
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background,
          boxShadow: isSun
            ? `0 0 ${size * 0.5}px ${size * 0.08}px rgba(253,186,116,.55)`
            : `inset ${-size * 0.12}px ${-size * 0.1}px ${size * 0.25}px rgba(15,23,42,.18)`,
        }}
      />
      {object.hasRings && object.id === "saturn" && (
        <span
          className="absolute left-1/2 top-1/2 rounded-[50%] border-[3px] border-[#E7D3A8]"
          style={{ width: size * 1.9, height: size * 0.5, transform: "translate(-50%,-50%) rotate(-18deg)", clipPath: "inset(50% 0 0 0)" }}
        />
      )}
    </span>
  );
}
