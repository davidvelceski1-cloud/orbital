"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Box, HelpCircle, List } from "lucide-react";
import { Segmented, Skeleton } from "@/components/ui/primitives";
import { InfoPanel } from "@/components/explorer/info-panel";
import { LayersMenu, TimeControls } from "@/components/explorer/controls";
import { ScaleExplainer } from "@/components/explorer/scale-explainer";
import { ExplorerListView } from "@/components/explorer/list-view";
import { SceneLabels } from "@/components/explorer/scene-labels";
import { useExplorer } from "@/lib/store";
import { useLowPowerDevice } from "@/lib/hooks";
import { cn } from "@/lib/utils";

// Three.js is heavy: load it only on this page, only in the browser.
const Scene = dynamic(() => import("@/components/explorer/scene"), {
  ssr: false,
  loading: () => <SceneSkeleton />,
});

function SceneSkeleton() {
  return (
    <div className="absolute inset-0 grid place-items-center" role="status" aria-label="Loading the 3D solar system">
      <div className="relative size-64">
        {[1, 0.72, 0.46].map((s, i) => (
          <div key={i} className="absolute inset-0 m-auto rounded-full border border-dashed border-primary/25" style={{ width: `${s * 100}%`, height: `${s * 100}%` }} />
        ))}
        <Skeleton className="absolute inset-0 m-auto size-12 rounded-full" />
      </div>
    </div>
  );
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function Explorer() {
  const params = useSearchParams();
  const { view, setView, scale, setScale, focus } = useExplorer();
  const lowPower = useLowPowerDevice();
  const [explainer, setExplainer] = useState(false);
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    const ok = hasWebGL();
    setWebgl(ok);
    if (!ok) setView("list");
  }, [setView]);

  useEffect(() => {
    const id = params.get("focus");
    if (id) focus(id);
  }, [params, focus]);

  return (
    <div
      className="relative h-[calc(100dvh-4rem)] overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 40%, var(--canvas-top), var(--bg) 55%, var(--canvas-bottom))" }}
    >
      {view === "3d" && webgl ? (
        <>
          <Scene lowPower={lowPower} />
          <SceneLabels />
        </>
      ) : (
        <ExplorerListView />
      )}

      {/* Top-left controls */}
      <div className="pointer-events-none absolute inset-x-4 top-4 z-10 flex flex-wrap items-start gap-2">
        <div className="pointer-events-auto glass rounded-full shadow-soft">
          <Segmented
            label="Explorer view"
            size="sm"
            value={view}
            onChange={(v) => setView(v)}
            options={[
              { value: "3d", label: <span className="inline-flex items-center gap-1"><Box className="size-3.5" /> 3D</span> },
              { value: "list", label: <span className="inline-flex items-center gap-1"><List className="size-3.5" /> List</span> },
            ]}
            className="border-none bg-transparent"
          />
        </div>
        {view === "3d" && (
          <div className="pointer-events-auto glass flex items-center rounded-full pr-1 shadow-soft">
            <Segmented
              label="Scale"
              size="sm"
              value={scale}
              onChange={(v) => {
                setScale(v);
                if (v === "realistic") setExplainer(true);
              }}
              options={[
                { value: "readable", label: "Readable scale" },
                { value: "realistic", label: "Realistic scale" },
              ]}
              className="border-none bg-transparent"
            />
            <button type="button" onClick={() => setExplainer(true)} className="grid size-7 place-items-center rounded-full text-muted hover:text-ink" aria-label="Why is real scale hard to show?">
              <HelpCircle className="size-4" />
            </button>
          </div>
        )}
        <div className={cn("pointer-events-auto ml-auto", view !== "3d" && "hidden")}>
          <LayersMenu />
        </div>
      </div>

      {view === "3d" && (
        <div className="absolute inset-x-0 bottom-24 z-10 flex justify-center px-3 lg:bottom-5">
          <TimeControls className="max-w-full" />
        </div>
      )}

      <ScaleExplainer open={explainer} onClose={() => setExplainer(false)} />
      <InfoPanel />

      <p className="sr-only" aria-live="polite">
        Tip: use the List view for a keyboard and screen-reader friendly list of every object.
      </p>
    </div>
  );
}
