"use client";
import Project from "./Project";
import { projects } from "@/app/data/info";
import { useState, useEffect } from "react";
import { motion, useSpring, useScroll } from "motion/react";

export default function Timeline() {
    // keep track of whether or not they're on desktop for the purposes of resizing the project card view
    const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
    useEffect(() => {
        function handleResize() {
            setIsDesktop(window.innerWidth > 1000);
        }
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const { scrollYProgress } = useScroll();
    const scaleY = useSpring(scrollYProgress, {
        stiffness: 600,
        damping: 40,
        restDelta: 0.001,
    });
    if (isDesktop === null) return null;

    if (!isDesktop) {
        // if it's not desktop, don't alternate sides
        return (
            <section className="relative mx-auto max-w-6xl px-4 py-12 mt-4">
                {/* vertical timeline */}
                <div className="absolute left-4 top-0 h-full w-[3px] rounded-full -translate-x-1/2 bg-textbrown/30" />

                <div className="space-y-12">
                    {projects.map((project, index) => {
                        return (
                            <div
                                key={project.name ?? index}
                                className="relative grid grid-cols-1 md:grid-cols-2 items-center"
                            >
                                <span className="absolute left-0 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-textbrown bg-background" />

                                <div className={`pl-8 w-full`}>
                                    <Project {...project} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        );
    } else {
        return (
            <>
                <section className="relative mx-auto max-w-6xl px-4 py-12 mt-6">
                    {/* vertical timeline that fills in with scroll */}
                    <div className="absolute left-1/2 top-0 h-full w-[3px] rounded-full -translate-x-1/2 bg-lightred/30">
                        <motion.div
                            id="scroll-indicator"
                            style={{
                                scaleY,
                                position: "fixed",
                                width: 3,
                                height: "100%",
                                originY: 0,
                                backgroundColor: "#a3002c",
                                zIndex: 20,
                            }}
                        />
                    </div>

                    <div className="space-y-20">
                        {projects.map((project, index) => {
                            const isLeft = index % 2 === 0;

                            return (
                                <div
                                    key={project.name ?? index}
                                    className="relative grid grid-cols-1 md:grid-cols-2 items-center"
                                >
                                    <span className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-darkburgundy/80 bg-background" />

                                    <div
                                        className={`${
                                            isLeft
                                                ? "md:col-start-1 md:pr-10 md:justify-self-end"
                                                : "md:col-start-2 md:pl-10 md:justify-self-start"
                                        } md:self-center w-full flex flex-row items-center`}
                                    >
                                        <Project {...project} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </>
        );
    }
}
