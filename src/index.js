import { useEffect, useLayoutEffect } from "react";
import gsap from "gsap";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export const useGSAP = (callback, dependencies = [], scope) => {
  (typeof callback !== "function") && console.warn("Callback must be a function");
  const context = gsap.context(() => { }, scope),
        contextSafe = (func) => context.add(null, func);

  useIsomorphicLayoutEffect(() => {
    context.add(callback, scope);
    return () => context.revert();
  }, dependencies);
  return { context, contextSafe };
};
