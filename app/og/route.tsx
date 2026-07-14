import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

// Site palette (see app/ui/globals.css)
const BG = "#fff8f6"; // --background (light)
const ACCENT = "#a3002c"; // --color-accent (red)
const PINK = "#ed8c91"; // --color-lightpink

export async function GET(request: NextRequest) {
    try {
        const urlParams = request.nextUrl.searchParams;
        // get the title
        const title = decodeURIComponent(urlParams.get("title") || "");
        const hasTitle = title?.trim() !== "";
        // Optional eyebrow above the title (e.g. "Writing" on a writing-piece page).
        // Only writing-slug pages pass it, so only they get the top kicker.
        const label = decodeURIComponent(urlParams.get("label") || "");
        const hasLabel = label.trim() !== "" && hasTitle;

        // Title stays dead-center of the image; shrink it as it gets longer so a long
        // (multi-line) blog title never wraps down into the bottom name. Short page
        // titles (Writing / Projects / Contact Me) stay big.
        const len = title.trim().length;
        const titleSize =
            len <= 16 ? 96 : len <= 30 ? 76 : len <= 46 ? 62 : 52;

        // get the fonts
        const italiana = await fetch(
            new URL("./Italiana-Regular.ttf", import.meta.url),
        ).then((res) => res.arrayBuffer());
        const mono = await fetch(
            new URL("./SpaceMono-Regular.ttf", import.meta.url),
        ).then((res) => res.arrayBuffer());

        return new ImageResponse(
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    WebkitFontSmoothing: "antialiased",
                    position: "relative",
                    userSelect: "none",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: hasLabel
                        ? "space-between"
                        : hasTitle
                          ? "flex-end"
                          : "center",
                    alignItems: "center",
                    textAlign: "center",
                    padding: "1rem",
                    background: BG,
                }}
            >
                {/* Eyebrow (writing pieces only): "Writing" at the top, mono/accent, smaller
                    than the title. paddingTop mirrors the name's paddingBottom so it sits the
                    same distance from the top as ALARA MARTIN does from the bottom. */}
                {hasLabel && (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            color: ACCENT,
                            fontSize: 40,
                            letterSpacing: "0.02em",
                            paddingTop: "14px",
                            fontFamily: "Space Mono",
                        }}
                    >
                        {label}
                    </div>
                )}

                {/* Page title (Writing / Projects / Contact ...): mono, centered dead-center
                    of the whole image (absolute, so the bottom name doesn't shift it up). */}
                {hasTitle && (
                    <div
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: ACCENT,
                            fontSize: titleSize,
                            lineHeight: 1.1,
                            letterSpacing: "-0.01em",
                            // Bottom padding lifts the centered title up a touch so it reads
                            // optically centered against the big Italiana name at the bottom.
                            padding: "0 4rem 48px",
                            fontFamily: "Space Mono",
                        }}
                    >
                        {title}
                    </div>
                )}

                {/* ALARA MARTIN: pinned near the bottom (like the landing hero), a hair off the
                    edge. Weight is faked with a thin text stroke — Italiana ships in 400 only. */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "center",
                        fontFamily: "Italiana",
                        paddingBottom: hasTitle ? "8px" : "0px",
                    }}
                >
                    {/* ALARA (144) + MARTIN (112). Satori doesn't align real text baselines
                        across flex items, so we align the em boxes at the bottom (flex-end,
                        lineHeight 1) and nudge MARTIN down by the descent difference so the
                        cap BOTTOMS line up. NUDGE is tuned to these two fixed font sizes —
                        re-measure if either size changes. */}
                    <p
                        style={{
                            fontSize: 144,
                            lineHeight: 1,
                            whiteSpace: "nowrap",
                            color: ACCENT,
                            paddingRight: "1.25rem",
                            margin: 0,
                            WebkitTextStrokeWidth: "1.4px",
                            WebkitTextStrokeColor: ACCENT,
                        }}
                    >
                        ALARA
                    </p>
                    <p
                        style={{
                            fontSize: 112,
                            lineHeight: 1,
                            whiteSpace: "nowrap",
                            color: PINK,
                            margin: 0,
                            transform: "translateY(-5px)",
                            WebkitTextStrokeWidth: "1.1px",
                            WebkitTextStrokeColor: PINK,
                        }}
                    >
                        MARTIN
                    </p>
                </div>
            </div>,
            {
                width: 1200,
                height: 630,
                fonts: [
                    {
                        name: "Italiana",
                        data: await italiana,
                        style: "normal",
                        weight: 400,
                    },
                    {
                        name: "Space Mono",
                        data: await mono,
                        style: "normal",
                        weight: 400,
                    },
                ],
            },
        );
    } catch (err) {
        console.error(err);
        return new Response("Error generating OG image", { status: 500 });
    }
}
