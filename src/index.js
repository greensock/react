/*!
 * @gsap/react
 * https://gsap.com
 *
 * Copyright 2008-2023, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license or for
 * Club GSAP members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
*/
/* eslint-disable */
import { useEffect, useLayoutEffect } from "react";
import gsap from "gsap";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export const useGSAP = (callback, dependencies = [], scope) => {
  if (typeof callback !== "function") {
    if (callback && ("current" in callback)) {
      scope = callback;
      callback = null;
    } else {
      console.warn("First parameter must be a function or scope Ref");
    }
  }
  const context = gsap.context(() => { }, scope),
        contextSafe = (func) => context.add(null, func);
  useIsomorphicLayoutEffect(() => {
    callback && context.add(callback, scope);
    return () => context.revert();
  }, dependencies);
  return { context, contextSafe };
};
