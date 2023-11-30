# @gsap/react for using GSAP in React

[![Using GSAP in React](https://gsap.com/_img/github/gsap-react-main.png)](https://gsap.com/resources/React)

<a href="https://gsap.com">GSAP</a> itself is **completely framework-agnostic** so you can use it anywhere (vanilla JS, Vue, Angular, React, etc.) without any special wrappers or dependencies, but we created this package to solve a few **React-specific** friction points.

## `useGSAP()`

A drop-in replacement for <a href="https://react.dev/reference/react/useEffect">`useEffect()`</a> or <a href="https://react.dev/reference/react/useLayoutEffect">`useLayoutEffect()`</a> that automatically handles cleanup using <a href="https://gsap.com/docs/v3/GSAP/gsap.context()">`gsap.context()`</a>

### ❌ OLD
```javascript
import { useEffect, useLayoutEffect } from "react";
import gsap from "gsap";

// for server-side rendering apps, useEffect() must be used instead of useLayoutEffect()
const useIsomorphicLayoutEffect = (typeof window !== "undefined") ? useLayoutEffect : useEffect;
const container = useRef();
useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
	    // gsap code here...
        }, container); // <-- scope for selector text
    return () => ctx.revert(); // <-- cleanup
}, []); // <-- empty dependency Array so it doesn't get called on every render
```

### ✅ NEW
```javascript 
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const container = useRef();
useGSAP(() => {
    // gsap code here...
}, [], container); // <-- scope for selector text (optional)
```

### Benefits
- Automatically handles cleanup using <a href="https://gsap.com/docs/v3/GSAP/gsap.context()">`gsap.context()`</a>
- Implements `useIsomorphicLayoutEffect()` technique, preferring React's `useLayoutEffect()` but falling back to `useEffect()` if `window` isn't defined, making it safe to use in server-side rendering environments.
- Optionally define a `scope` for selector text, making it safer/easier to write code that doesn't require you to create a useRef() for each and every element you want to animate.
- Defaults to using an empty dependency Array in its simplest form, like `useGSAP(() => {...})` It was common for developers to forget to include that on React's `useLayoutEffect(() => {...}, [])` which resulted in the code being executed on every component render.
- Exposes convenient references to the `context` instance and the `contextSafe()` function as method parameters as well as object properties that get returned by the `useGSAP()` hook. 


### Install
```bash
npm install @gsap/react
```

### Using callbacks or event listeners? Use `contextSafe()` and clean up!

All GSAP animations, ScrollTriggers, Draggables, and SplitText instances that are created while the `useGSAP()` function executes will automatically get recorded and cleaned up because they're in the <a href="https://gsap.com/docs/v3/GSAP/gsap.context()">`gsap.context()`</a> that's created internally, and any selector text will use the same `scope` as was defined for that context (if any). **HOWEVER**, if you set up callbacks or event listeners or other code that gets called *LATER* (after the `useGSAP()` function finishes executing), **those won't get added to the context** for automatic cleanup unless you wrap them in the `contextSafe()` function. Anything inside the contextSafe() function will also use the same `scope` for selector text (see below). Don't forget to return a cleanup function where you remove your event listeners. There are two ways to access the `contextSafe()` function: 

#### 1) Using the 2nd parameter (for inside `useGSAP()` function)

```javascript
useGSAP((context, contextSafe) => { // <-- there it is
	
    // ✅ safe, created during execution
    gsap.to(".good", {x: 100}); 
    
    // ❌ DANGER! This animation is created in an event handler that executes AFTER the useGSAP() executes, thus it's not added to the context so it won't get cleaned up (reverted). The event listener isn't removed in cleanup function below either, so it persists between component renders (bad).
    badRef.current.addEventListener("click", () => {
        gsap.to(".bad", {y: 100}); 
    });
	
    // ✅ safe, wrapped in contextSafe() function and we remove the event listener in the cleanup function below. 👍
    const onClickGood = contextSafe(() => {
                gsap.to(".good", {rotation: 180});
            });
    goodRef.current.addEventListener("click", onClickGood);
	
    return () => { // <-- cleanup function (remove listeners here)
        goodRef.current.removeEventListener("click", onClickGood);
    };
});
```

#### 2) Using the returned object property (for outside `useGSAP()` function)

```JSX
const container = useRef();

const { contextSafe } = useGSAP(() => {
        // ✅ any GSAP stuff created during execution here is safe (gets cleaned up)
        gsap.to(".good", {x: 100});
    }, [], container);

// ❌ DANGER! Not wrapped in contextSafe() so GSAP-related objects created inside this function won't be bound to the context for automatic cleanup when it's reverted. Selector text isn't scoped to the container either.
const onClickBad = () => {
        gsap.to(".bad", {y: 100});
    };

// ✅ wrapped in contextSafe() so GSAP-related objects here will be bound to the context and automatically cleaned up when the context gets reverted, plus selector text is scoped properly to the container.
const onClickGood = contextSafe(() => {
        gsap.to(".good", {rotation: 180});
    });

return (
    <div ref={container}>
        <button onClick={onClickBad} className="bad"></button>
        <button onClick={onClickGood} className="good"></button>
    </div>
);
```

### Scoped selector text

You can optionally pass in a <a href="https://react.dev/reference/react/useRef">React Ref</a> as the `scope` (3rd parameter) and then all the selector text in the `useGSAP()` function will be scoped to that particular Ref, meaning selector text will be limited to **descendants** of that element. This can greatly simplify your code. No more creating a Ref for every element you want to animate!

#### Example using Refs (tedious) 😩
```JSX
const container = useRef();
const box1 = useRef(); // ugh, so many refs!
const box2 = useRef();
const box3 = useRef();

useGSAP(() => {
    gsap.from([box1, box2, box3], {opacity: 0, stagger: 0.1});
});

return (
    <div ref={container}>
        <div ref={box1} className="box"></div>
        <div ref={box2} className="box"></div>
        <div ref={box3} className="box"></div>
    </div>
);
```

#### Example using scoped selector text (simple) 🙂
```JSX
// we only need one ref, the container. Use selector text for the rest (scoped to only find descendants of container).
const container = useRef();

useGSAP(() => {
    gsap.from(".box", {opacity: 0, stagger: 0.1});
}, [], container); // <-- scope, 3rd parameter

return (
    <div ref={container}>
        <div className="box"></div>
        <div className="box"></div>
        <div className="box"></div>
    </div>
);
```

## Demos and starter templates
<a href="https://stackblitz.com/@GreenSockLearning/collections/gsap-react-starters">https://stackblitz.com/@GreenSockLearning/collections/gsap-react-starters</a>


### Need help?
Ask in the friendly <a href="https://gsap.com/community/">GSAP forums</a>. Or share your knowledge and help someone else - it's a great way to sharpen your skills! Report any bugs there too (or <a href="https://github.com/greensock/GSAP/issues">file an issue here</a> if you prefer).

### License
GreenSock's standard "no charge" license can be viewed at <a href="https://gsap.com/standard-license">https://gsap.com/standard-license</a>. <a href="https://gsap.com/pricing/">Club GSAP</a> members are granted additional rights. See <a href="https://gsap.com/licensing/">https://gsap.com/licensing/</a> for details. Why doesn't GSAP use an MIT (or similar) open source license, and why is that a **good** thing? This article explains it all: <a href="https://gsap.com/why-license/" target="_blank">https://gsap.com/why-license/</a>

Copyright (c) 2008-2023, GreenSock. All rights reserved. 