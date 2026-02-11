import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
    try {
        const urlParams = request.nextUrl.searchParams;
        // get the title
        const title = decodeURIComponent(urlParams.get("title") || "");
        const hasTitle = title?.trim() !== "";

        // get the fonts
        const lato = await fetch(
            new URL("./Lato-Regular.ttf", import.meta.url),
        ).then((res) => res.arrayBuffer());
        const italiana = await fetch(
            new URL("./Italiana-Regular.ttf", import.meta.url),
        ).then((res) => res.arrayBuffer());

        return new ImageResponse( // todo: fix font
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    WebkitFontSmoothing: "antialiased",
                    position: "relative",
                    userSelect: "none",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: hasTitle ? "space-between" : "center",
                    textAlign: "center",
                    padding: "1rem",
                    background: "#a3002c",
                }}
            >
                {hasTitle && (
                    <div
                        style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff8f6",
                            fontSize: 56,
                            paddingTop: "200px",
                            fontFamily: "Lato",
                        }}
                    >
                        {title}
                    </div>
                )}

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "Italiana",
                        paddingTop: "0px",
                        paddingBottom: hasTitle ? "80px" : "0px",
                    }}
                >
                    <p
                        style={{
                            fontSize: 144,
                            whiteSpace: "nowrap",
                            color: "#fff8f6",
                            paddingRight: "1.25rem",
                            margin: 0,
                        }}
                    >
                        ALARA
                    </p>
                    <p
                        style={{
                            display: "flex",
                            fontSize: 112,
                            whiteSpace: "nowrap",
                            color: "#ed8c91",
                            justifyContent: "center",
                            margin: 0,
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
                        name: "Lato",
                        data: await lato,
                        style: "normal",
                        weight: 400,
                    },
                    {
                        name: "Italiana",
                        data: await italiana,
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
