"use client";
import Project from "./Project";
import { projects } from "@/app/data/info";
import { motion, useSpring, useScroll } from "motion/react";

export default function Timeline() {
    const { scrollYProgress } = useScroll();
    const scaleY = useSpring(scrollYProgress, {
        stiffness: 600,
        damping: 40,
        restDelta: 0.001,
    });

    return (
        <section className="relative mx-auto max-w-6xl px-4 py-12 mt-6">
            {/* desktop timeline */}
            <div className="hidden md:block absolute left-1/2 top-0 h-full w-[3px] rounded-full -translate-x-1/2 bg-lighthighlight/30">
                <motion.div
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
            {/* mobile */}
            <div className="md:hidden absolute left-4 top-0 h-full w-[3px] rounded-full -translate-x-1/2 bg-lighthighlight/30">
                <motion.div
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

            <div className="space-y-12 md:space-y-20">
                {projects.map((project, index) => {
                    const isLeft = index % 2 === 0;
                    return (
                        <div
                            key={project.name ?? index}
                            className="relative grid grid-cols-1 md:grid-cols-2 items-center"
                        >
                            <span className="absolute -left-2 md:left-1/2 top-1/2 h-4 w-4 md:-translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent/80" />{" "}
                            <div
                                className={`pl-8 md:pl-0 w-full ${
                                    isLeft
                                        ? "md:col-start-1 md:pr-10 md:justify-self-end"
                                        : "md:col-start-2 md:pl-10 md:justify-self-start"
                                } md:self-center flex flex-row items-center`}
                            >
                                <Project {...project} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
