"use client";
import { useState, useRef, useEffect } from "react";

interface TextProps {
    textToScramble: string;
    intervalsBetween?: number; // interval between each character change in ms
    duration?: number; // total duration of the animation in ms
}

const TextScramble = ({
    textToScramble,
    duration,
    intervalsBetween,
}: TextProps) => {
    const [text, setText] = useState(textToScramble);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    if (!intervalsBetween) intervalsBetween = 50;
    if (!duration) duration = 10 * intervalsBetween;

    const scramble = (text: string) =>
        text
            .split("")
            .map((char) =>
                char === " "
                    ? " "
                    : String.fromCharCode(
                          Math.floor(Math.random() * (64 - 33)) + 33,
                      ),
            )
            .join("");

    const handleScramble = () => {
        let i = 0;
        intervalRef.current = setInterval(() => {
            setText(scramble(textToScramble));
            if (i++ >= duration / intervalsBetween) {
                restoreText();
            }
        }, intervalsBetween);
    };

    const restoreText = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setText(textToScramble);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(handleScramble, 0);
        return () => {
            clearTimeout(timeout);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    return <span>{text}</span>;
};

export default TextScramble;
