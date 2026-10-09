"use client";
import { useEffect } from "react";
import { animate, useMotionValue, useReducedMotion } from "motion/react";

// a 0 -> 1 growth value for plants that aren't scroll-driven: grows while
// `when` is true, retracts when it turns false. with reduced motion the plant
// is simply drawn fully grown.
export default function useBloom(
    when: boolean,
    { duration = 0.9, delay = 0 }: { duration?: number; delay?: number } = {},
) {
    const reduceMotion = useReducedMotion();
    const bloom = useMotionValue(reduceMotion ? 1 : 0);

    useEffect(() => {
        if (reduceMotion) {
            bloom.set(1);
            return;
        }
        const controls = animate(bloom, when ? 1 : 0, {
            duration: when ? duration : duration * 0.6,
            // only stagger the way in; retract together
            delay: when ? delay : 0,
            ease: "easeOut",
        });
        return () => controls.stop();
    }, [when, reduceMotion, duration, delay, bloom]);

    return bloom;
}
