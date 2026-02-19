import { NextResponse } from "next/server";
import { Octokit } from "@octokit/core";
import { unstable_cache } from "next/cache";

const getCachedDate = unstable_cache(
    async (repo: string) => {
        const octokit = new Octokit({
            auth: process.env.GITHUB_TOKEN
        });

        // todo: make this for not just /alaramartin/ repos
        const res = await octokit.request(`GET /repos/alaramartin/${repo}`, {
            owner: 'alaramartin',
            repo: repo,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });

        if (res.status != 200) {
            throw new Error("github api dates error");
        }

        return res.data.created_at;
    },
    ['github-date'],
    { revalidate: false }
);

export async function GET(
    request: Request, 
    context: { params: Promise<{ repo: string }> }
) {
    const { repo } = await context.params;
    
    try {
        const date = await getCachedDate(repo);
        return NextResponse.json({ date });
    } catch {
        return NextResponse.json({ date: "DEFAULT" }, { status: 200 });
    }
}