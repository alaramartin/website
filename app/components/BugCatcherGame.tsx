"use client";
import { useState, useEffect, useRef } from "react";
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
    const playerXRef = useRef(playerX); // use Ref to keep an up-to-date reference to the playerX
    useEffect(() => {
        playerXRef.current = playerX;
    }, [playerX]);

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
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, []);

    // bugs spawn every few seconds  - so that bugs only fall when it's not game over
    useEffect(() => {
        if (gameOver) return;

        const spawn = setInterval(() => {
            const newSpawnedBug: Bug = {
                id: crypto.randomUUID(), // unique id
                x: Math.random() * 90,
                y: 0,
                type: Math.random() < 0.85 ? "warning" : "fatal",
            };
            setBugs((bugs) => [...bugs, newSpawnedBug]);
        }, 3000);

        // cleanup
        return () => clearInterval(spawn);
    }, [gameOver]);

    // bugs falling and collision detection
    useEffect(() => {
        if (gameOver) return;

        const fallingInterval = setInterval(() => {
            setBugs((bugs) => {
                const remaining: Bug[] = [];

                for (const bug of bugs) {
                    // make it move dwn
                    const newY = bug.y + 5;
                    // check if reached the bottom and the player missed it
                    if (newY > 100) {
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
                    if (newY >= 86 && Math.abs(bug.x - playerX) < 10) {
                        setScore((currentScore) => currentScore + 1);
                        continue;
                    }
                    remaining.push({ ...bug, y: newY });
                }

                return remaining;
            });
        }, 350);

        // cleanup
        return () => clearInterval(fallingInterval);
    }, [gameOver]);

    return (
        <>
            <div className="flex flex-col items-center justify-center">
                <div
                    className="relative border-2 border-lightred-80 rounded-lg"
                    style={{
                        width: "200px",
                        height: "300px",
                        overflow: "hidden",
                    }}
                >
                    {bugs.map((bug) => (
                        <div
                            key={bug.id}
                            className="absolute"
                            style={{
                                left: `${bug.x}%`,
                                top: `${bug.y}%`,
                                transform: "translate(-50%, 0)",
                            }}
                        >
                            {bug.type === "fatal" ? (
                                <BugBeetleIcon color="red" />
                            ) : (
                                <BugIcon color="gold" />
                            )}
                        </div>
                    ))}

                    <div
                        className="absolute bottom-2"
                        style={{
                            left: `${playerX}%`,
                            transform: "translateX(-50%)",
                        }}
                    >
                        <PersonSimpleIcon />
                    </div>
                </div>

                <div className="mt-2 text-center">
                    <p>Score: {score}</p>
                    <p>Warnings: {numWarnings}</p>
                </div>

                {gameOver && (
                    <div
                        className="inline-flex cursor-pointer items-center border-2 border-lightred rounded-xl p-3 gap-2 hover:bg-lightred/20 transition-all duration-200"
                        onClick={() => {
                            setGameOver(false);
                            setScore(0);
                            setNumWarnings(0);
                            setBugs([]);
                        }}
                    >
                        <ArrowClockwiseIcon /> Restart?
                    </div>
                )}
            </div>
        </>
    );
}
