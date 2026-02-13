import { NextResponse } from "next/server";
import { Octokit } from "@octokit/core";

export async function GET() {
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
        return NextResponse.json({error: "github api error"}, {status: res.status});
    }

    // get recent commits
    const commits = await res.data;
    const commit = commits[0];

    return NextResponse.json({
        sha: commit.sha,
        url: commit.html_url,
    });
}