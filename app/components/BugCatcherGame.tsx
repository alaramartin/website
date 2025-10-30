"use client";
import { useState, useEffect, useRef } from "react";
/*  game for 404 page: catch the falling bugs
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

    const [firstGame, setFirstGame] = useState(true); // keep track of if it's the first game
    const [score, setScore] = useState(0);
    // if the user hits 3 warnings, it's game over
    const [numWarnings, setNumWarnings] = useState(0);
    const [gameOver, setGameOver] = useState(true);
    const [bugs, setBugs] = useState<Bug[]>([]);
    const fallingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    // make sure bugs aren't processedm multiple times
    const processedBugsRef = useRef<Set<string>>(new Set());

    // add listener for the arrow keys to move the user
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") {
                // stop them from moving beyond the edge of the area
                setPlayerX((x) => Math.max(x - 5, 5));
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
                id:
                    typeof crypto !== "undefined" && (crypto as any).randomUUID
                        ? (crypto as any).randomUUID()
                        : Math.random().toString(36).slice(2, 9), // unique id with fallback
                x: Math.random() * 90,
                y: 0,
                type: Math.random() < 0.8 ? "warning" : "fatal",
            };
            setBugs((bugs) => [...bugs, newSpawnedBug]);
        }, 1200 + Math.random() * 800);

        // cleanup
        return () => clearInterval(spawn);
    }, [gameOver]);

    // bugs falling and collision detection
    useEffect(() => {
        if (gameOver) {
            if (fallingIntervalRef.current) {
                clearInterval(fallingIntervalRef.current);
                fallingIntervalRef.current = null;
            }
            return;
        }

        // stop duplicates
        if (fallingIntervalRef.current) return;

        fallingIntervalRef.current = setInterval(() => {
            setBugs((bugs) => {
                const remaining: Bug[] = [];
                let scoreIncrement = 0;
                let warningsIncrement = 0;
                let lost = false;

                for (const bug of bugs) {
                    // check if already processed
                    if (processedBugsRef.current.has(bug.id)) {
                        continue;
                    }

                    // check if player caught it
                    if (
                        bug.y >= 86 &&
                        bug.y <= 94 &&
                        Math.abs(bug.x - playerXRef.current) < 7
                    ) {
                        scoreIncrement += 1;
                        processedBugsRef.current.add(bug.id);
                        continue;
                    }

                    // check if reached the bottom and the player missed it
                    if (bug.y > 100) {
                        if (bug.type === "fatal") {
                            lost = true;
                            processedBugsRef.current.add(bug.id);
                        } else {
                            warningsIncrement = 1;
                            processedBugsRef.current.add(bug.id);
                        }
                        continue;
                    }

                    // make it move down
                    const newY = bug.y + 5;

                    // a bug is remaining if it didn't hit the ground or the player
                    remaining.push({ ...bug, y: newY });
                }

                if (warningsIncrement > 0) {
                    setNumWarnings((warnings) => {
                        const newWarnings = warnings + warningsIncrement;
                        if (newWarnings >= 3) {
                            setGameOver(true);
                        }
                        return newWarnings;
                    });
                }

                if (lost) {
                    setGameOver(true);
                }

                if (scoreIncrement > 0) {
                    setScore((currentScore) => currentScore + scoreIncrement);
                }

                return remaining;
            });
        }, 300);

        // cleanup
        return () => {
            if (fallingIntervalRef.current) {
                clearInterval(fallingIntervalRef.current);
                fallingIntervalRef.current = null;
            }
        };
    }, [gameOver]);

    return (
        <div className="mt-10">
            <div className="flex flex-col items-center justify-center">
                <div
                    className="relative border-2 border-lightred-80 rounded-lg bg-white"
                    style={{
                        width: "400px",
                        height: "500px",
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
                                <BugBeetleIcon
                                    color="red"
                                    size={26}
                                    weight="fill"
                                />
                            ) : (
                                <BugIcon color="gold" size={26} weight="fill" />
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
                        <PersonSimpleIcon size={30} color="#a3002c" />
                    </div>

                    {gameOver && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-[#a3002b]">
                            <div>
                                {!firstGame && (
                                    <p className="mb-2">Game Over!</p>
                                )}
                            </div>

                            <div
                                className="inline-flex cursor-pointer items-center border-2 border-lightred rounded-xl p-3 gap-2 bg-lightred/10 hover:bg-lightred/20 transition-all duration-200"
                                onClick={() => {
                                    setFirstGame(false);
                                    setGameOver(false);
                                    setScore(0);
                                    setNumWarnings(0);
                                    setBugs([]);
                                    // clear the handled set so the next game starts fresh
                                    processedBugsRef.current.clear();
                                }}
                            >
                                {firstGame ? (
                                    <p>Play</p>
                                ) : (
                                    <div>
                                        <p className="inline-flex items-center gap-2">
                                            <ArrowClockwiseIcon /> Replay
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div>
                                {firstGame && (
                                    <p className="text-center m-4 text-[#a3002b]">
                                        Catch the bugs! If you miss three
                                        warnings &#40;yellow&#41; or one fatal
                                        error &#40;red&#41;, it's game over.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-2 text-center">
                    <p>Score: {score}</p>
                    <p>Warnings: {numWarnings}</p>
                </div>
            </div>
        </div>
    );
}
