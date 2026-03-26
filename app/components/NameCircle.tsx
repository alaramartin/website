"use client";
import {
    motion,
    useMotionValueEvent,
    useScroll,
    useTransform,
} from "motion/react";
import { useMemo, useState } from "react";

const TITLES = [
    "LARA MARTIN",
    "programmer",
    "boyfriend lover",
    "girl who codes",
    "cat petter",
    "n academic weapon",
    "procrastinator",
    "sweet treat lover",
];
const PIVOT = "A";

const normalizeDeg = (deg: number) => ((deg % 360) + 360) % 360;
const angularDistance = (a: number, b: number) => {
    const d = Math.abs(normalizeDeg(a) - normalizeDeg(b));
    return Math.min(d, 360 - d);
};

export default function NameCircle() {
    const { scrollYProgress } = useScroll();
    const rotate = useTransform(scrollYProgress, [0, 0.53], [0, 360]);

    const [rotationDeg, setRotationDeg] = useState(0);
    useMotionValueEvent(rotate, "change", (v) =>
        setRotationDeg(normalizeDeg(v)),
    );

    const rays = useMemo(() => {
        const step = 360 / TITLES.length;
        return TITLES.map((title, i) => ({
            title,
            angle: i * step,
        }));
    }, []);

    const activeWindow = 180 / TITLES.length;

    return (
        <div
            style={{
                position: "relative",
                width: 320,
                height: 320,
                margin: "0 auto",
            }}
        >
            <span
                style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    lineHeight: 1,
                    zIndex: 1,
                    fontSize: "3.6rem",
                    fontWeight: 600,
                    color: "var(--scroll-nav)",
                    letterSpacing: "0.05em",
                }}
            >
                {PIVOT}
            </span>

            <motion.div
                style={{
                    position: "absolute",
                    inset: 0,
                    rotate,
                    transformOrigin: "center",
                    willChange: "transform",
                }}
            >
                {rays.map(({ title, angle }) => {
                    const worldAngle = normalizeDeg(angle + rotationDeg);
                    const distance = angularDistance(worldAngle, 0);

                    const isActive = distance <= activeWindow;

                    // LARA MARTIN: 20 when active, grows to 50 as it leaves
                    // Others: 35 when active, grows to 50 as they leave
                    const minRadius = title === "LARA MARTIN" ? 20 : 45;
                    const currentRadius =
                        minRadius +
                        (Math.min(distance, activeWindow) / activeWindow) *
                            (70 - minRadius);

                    const opacity = distance <= activeWindow ? 1 : 0.7;

                    return (
                        <span
                            key={title}
                            style={{
                                position: "absolute",
                                left: "50%",
                                top: "50%",
                                width: 0,
                                height: 0,
                                transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(${currentRadius}px)`,
                                transformOrigin: "center",
                            }}
                        >
                            <span
                                style={{
                                    position: "absolute",
                                    left: 0,
                                    top: 0,
                                    transform: "translateY(-50%)",
                                    transformOrigin: "left center",
                                    display: "inline-block",
                                    whiteSpace: "nowrap",
                                    lineHeight: 1,
                                    letterSpacing: "0.02em",
                                    fontSize:
                                        title === "LARA MARTIN" && isActive
                                            ? "3.2rem"
                                            : isActive
                                              ? "1.7rem"
                                              : "1.3rem",
                                    fontWeight: isActive ? 600 : 600,
                                    color: isActive
                                        ? "var(--scroll-nav)"
                                        : "var(--color-verylightpink)",
                                    opacity,
                                    transition:
                                        "font-size 120ms ease-out, font-weight 120ms ease-out, opacity 120ms ease-out",
                                }}
                            >
                                {title}
                            </span>
                        </span>
                    );
                })}
            </motion.div>
        </div>
    );
}
