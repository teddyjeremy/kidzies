"use client";

import { useEffect, useState } from "react";

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches || window.localStorage.getItem("kidzies-motion") === "reduced");
    update();
    mq.addEventListener("change", update);
    window.addEventListener("kidzies-motion", update);
    return () => {
      mq.removeEventListener("change", update);
      window.removeEventListener("kidzies-motion", update);
    };
  }, []);
  return reduced;
}

export function setMotionPreference(reduced: boolean) {
  window.localStorage.setItem("kidzies-motion", reduced ? "reduced" : "full");
  window.dispatchEvent(new Event("kidzies-motion"));
}

export type WebGLSupport = "checking" | "full" | "low" | "none";

/** Detects WebGL and picks a lighter rendering mode for small or low-memory devices. */
export function useWebGLSupport(): WebGLSupport {
  const [support, setSupport] = useState<WebGLSupport>("checking");
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- capability detection must run in the browser after mount */
    try {
      if (new URLSearchParams(window.location.search).get("lite") === "1") {
        setSupport("none");
        return;
      }
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
      if (!gl) {
        setSupport("none");
        return;
      }
      const nav = navigator as Navigator & { deviceMemory?: number };
      const small = window.innerWidth < 768;
      const weak = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
      setSupport(small || weak ? "low" : "full");
    } catch {
      setSupport("none");
    }
  }, []);
  return support;
}
