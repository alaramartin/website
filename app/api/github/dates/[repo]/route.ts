import { NextResponse } from "next/server";
import { getRepoCreatedAt } from "@/lib/github";

export async function GET(
    request: Request,
    context: { params: Promise<{ repo: string }> }
) {
    const { repo } = await context.params;

    try {
        const date = await getRepoCreatedAt(repo);
        return NextResponse.json({ date });
    } catch {
        return NextResponse.json({ date: "DEFAULT" }, { status: 200 });
    }
}
