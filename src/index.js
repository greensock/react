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

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect,
      isConfig = value => value && !Array.isArray(value) && typeof(value) === "object",
      emptyArray = [],
      defaultConfig = {};

export const useGSAP = (callback, dependencies = emptyArray) => {
  let config = defaultConfig;
  if (isConfig(callback)) {
    config = callback;
    callback = null;
    dependencies = "dependencies" in config ? config.dependencies : emptyArray;
  } else if (isConfig(dependencies)) {
    config = dependencies;
    dependencies = "dependencies" in config ? config.dependencies : emptyArray;
  }
  let { scope, revertOnUpdate } = config;
  (callback && typeof callback !== "function") && console.warn("First parameter must be a function or config object");
  const context = gsap.context(() => { }, scope),
        contextSafe = (func) => context.add(null, func),
        cleanup = () => context.revert(),
        deferCleanup = dependencies && dependencies.length && !revertOnUpdate;
  useIsomorphicLayoutEffect(() => {
    callback && context.add(callback, scope);
    if (!deferCleanup) {
      return cleanup;
    }
  }, dependencies);
  deferCleanup && useIsomorphicLayoutEffect(() => cleanup, emptyArray);
  return { context, contextSafe };
};
