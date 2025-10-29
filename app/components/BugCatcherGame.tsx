"use client";
import { useState, useEffect } from "react";
/* todo: game for 404 page

    game idea: catch the falling bugs
    use arrows to move left or right while bugs fall from the sky randomly
    if caught, then get a point.
    if not caught, then lose
    ***have warnings and fatal errors. warnings = 3 makes you lose. fatal errors = lose after 1.
    ^^^ bugicon, yellow, is warning; bugbeetle, red, is fatal
*/

import {
    BugIcon,
    BugBeetleIcon,
    PersonSimpleIcon,
    ArrowClockwiseIcon,
} from "@phosphor-icons/react/dist/ssr";

type Bug = {
    id: string;
    x: number;
    y: number;
    type: "warning" | "fatal";
};

export default function BugCatcherGame() {
    const [playerX, setPlayerX] = useState(50); // keep track of the player position (only moves in x-direction) as a percent
    const [score, setScore] = useState(0);
    // if the user hits 3 warnings, it's game over
    const [numWarnings, setNumWarnings] = useState(0);
    const [gameOver, setGameOver] = useState(true);
    const [bugs, setBugs] = useState<Bug[]>([]);

    // add listneer for the arrow keys to move the user
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") {
                // stop them from moving beyond the edge of the area
                setPlayerX((x) => Math.max(x - 5, 0));
            }
            if (e.key === "ArrowRight") {
                // stop them from moving beyond the edge of the area
                setPlayerX((x) => Math.min(x + 5, 95));
            }
            window.addEventListener("keydown", handleKey);
            return () => window.removeEventListener("keydown", handleKey);
        };
    }, []);

    // so that bugs only fall when it's not game over
    useEffect(() => {
        if (gameOver) return;

        // bugs falling and collision detection
        const fallingInterval = setInterval(() => {
            setBugs((bugs) => {
                const remaining: Bug[] = [];

                for (const bug of bugs) {
                    const newY = bug.y - 5;
                    // check if reached the bottom and the player missed it
                    if (newY < 0) {
                        if (bug.type === "fatal") {
                            setGameOver(true);
                        } else {
                            setNumWarnings((warnings) => {
                                const newWarnings = warnings + 1;
                                // game over if missed 3 or more warnings
                                if (newWarnings >= 3) {
                                    setGameOver(true);
                                }
                                return newWarnings;
                            });
                        }
                    }
                    // check if player caught it
                    if (newY < 10 && Math.abs(bug.x - playerX) < 10) {
                        setScore((currentScore) => currentScore + 1);
                        continue;
                    }
                    remaining.push({ ...bug, y: newY });
                }

                return remaining;
            });
        }, 1000);
    }, [gameOver]);

    return (
        <>
            <div className="flex items-center justify-center align-center">
                <div>
                    <BugIcon />
                    <BugBeetleIcon />
                    <PersonSimpleIcon />
                </div>
                {gameOver && (
                    <div
                        className="inline-flex cursor-pointer items-center border-2 border-lightred rounded-xl p-3 gap-2 hover:bg-lightred/20 transition-all duration-200"
                        onClick={() => setGameOver(false)}
                    >
                        <ArrowClockwiseIcon /> Restart?
                    </div>
                )}
            </div>
        </>
    );
}
