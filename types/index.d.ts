// Type definitions for @gsap/react
// https://gsap.com
// Definitions by: Jack Doyle <https://github.com/jackdoyle>
// Definitions: https://github.com/greensock/react

/// <reference path="../node_modules/gsap/types/index.d.ts"/>

type ContextSafeFunc = (func: Function) => Function;
type ContextFunc = (context: gsap.Context, contextSafe?: ContextSafeFunc) => Function | any | void;

interface useGSAPReturn {
  context: gsap.Context;
  contextSafe: ContextSafeFunc;
}

/**
 * Drop-in replacement for React's useLayoutEffect(); falls back to useEffect() if "window" is not defined (for SSR environments). Handles cleanup of GSAP objects that were created during execution of the supplied function.
 * @param {ContextFunc} [func]
 * @param {Array} [Dependencies]
 * @param {Element | string | object} [scope]
 * @returns {useGSAPReturn} Object with "context" and "contextSafe" properties
*/
export function useGSAP(func: ContextFunc, Dependencies?: unknown[], scope?: Element | string | object): useGSAPReturn;