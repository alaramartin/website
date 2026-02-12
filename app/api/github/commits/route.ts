import { NextResponse } from "next/server";
import { Octokit } from "@octokit/core";
import { unstable_cache } from "next/cache";

const getCachedCommit = unstable_cache(
    async () => {
        const octokit = new Octokit({
            auth: process.env.GITHUB_TOKEN
        });

        const res = await octokit.request('GET /repos/alaramartin/website/commits', {
        owner: 'alaramartin',
        repo: 'website',
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    });

        if (res.status != 200) {
        throw new Error("github api commit error");
    }

        const commits = await res.data;
        const commit = commits[0];
        return {
            sha: commit.sha,
            url: commit.html_url,
        };
    },
    ['github-commit'],
    { revalidate: false }
);

export async function GET() {    
    try {
        const commit = await getCachedCommit();
        return NextResponse.json(commit);
    } catch {
        return NextResponse.json({error: "github api commit error"}, {status: 500});
    }
}