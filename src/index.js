/*!
 * @gsap/react 2.1.1
 * https://gsap.com
 *
 * Copyright 2008-2024, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license or for
 * Club GSAP members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
*/
/* eslint-disable */
import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import Flip from "gsap/Flip";

let useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect,
    isConfig = value => value && !Array.isArray(value) && typeof(value) === "object",
    emptyArray = [],
    defaultConfig = {},
    _gsap = gsap; // accommodates situations where different versions of GSAP may be loaded, so a user can gsap.registerPlugin(useGSAP);

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
  (callback && typeof callback !== "function") && console.warn("First parameter must be a function or config object");
  const { scope, revertOnUpdate } = config,
        mounted = useRef(false),
        context = useRef(_gsap.context(() => { }, scope)),
        contextSafe = useRef((func) => context.current.add(null, func)),
        deferCleanup = dependencies && dependencies.length && !revertOnUpdate;
  useIsomorphicLayoutEffect(() => {
    callback && context.current.add(callback, scope);
    if (!deferCleanup || !mounted.current) { // React renders bottom-up, thus there could be hooks with dependencies that run BEFORE the component mounts, thus cleanup wouldn't occur since a hook with an empty dependency Array would only run once the component mounts.
      return () => context.current.revert();
    }
  }, dependencies);
  deferCleanup && useIsomorphicLayoutEffect(() => {
      mounted.current = true;
      return () => context.current.revert();
    }, emptyArray);
  return { context: context.current, contextSafe: contextSafe.current };
};
useGSAP.register = core => { _gsap = core; };
useGSAP.headless = true; // doesn't require the window to be registered.

export const useFlip = (
    target,
    options
) => {
    const [isFlipped, setIsFlipped] = useState(false)
    const flipStateRef = useRef(null)
    const scopeRef = useRef(null)

    const { props, simple, revertOnUpdate, ...vars } = options

    const captureState = useCallback(() => {
        const mergedVars = { props, simple, targets: target }
        flipStateRef.current = Flip.getState(target, mergedVars)
    }, [target, props, simple])

    const flip = useCallback(() => {
        captureState()
        setIsFlipped((prev) => !prev)
    }, [captureState])

    useGSAP(
        () => {
            if (flipStateRef.current) {
                Flip.from(flipStateRef.current, vars)
                flipStateRef.current = null
            }
        },
        {
            scope: scopeRef,
            dependencies: [isFlipped],
            revertOnUpdate: revertOnUpdate,
        }
    )

    return { isFlipped, flip, scopeRef }
}
