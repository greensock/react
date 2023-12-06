// Type definitions for @gsap/react
// https://gsap.com
// Definitions by: Jack Doyle <https://github.com/jackdoyle>
// Copyright 2008-2023, GreenSock. All rights reserved.
// Definitions: https://github.com/greensock/react

/// <reference path="../node_modules/gsap/types/index.d.ts"/>

type ContextSafeFunc = (func: Function) => Function;
type ContextFunc = (context: gsap.Context, contextSafe?: ContextSafeFunc) => Function | any | void;

interface ReactRef {
  current: any | null;
}

interface useGSAPReturn {
  context: gsap.Context;
  contextSafe: ContextSafeFunc;
}

interface useGSAPConfig {
  scope?: ReactRef | Element | string;
  dependencies?: unknown[];
  revertOnUpdate?: boolean;
}

/**
 * Drop-in replacement for React's useLayoutEffect(); falls back to useEffect() if "window" is not defined (for SSR environments). Handles cleanup of GSAP objects that were created during execution of the supplied function.
 * @param {ContextFunc | useGSAPConfig} func
 * @param {Array | useGSAPConfig} [dependencies]
 * @returns {useGSAPReturn} Object with "context" and "contextSafe" properties
*/
export function useGSAP(func?: ContextFunc | useGSAPConfig, dependencies?: unknown[] | useGSAPConfig): useGSAPReturn;