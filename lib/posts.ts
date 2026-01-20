import fs from 'fs';
import path from 'path';
import matter from 'gray-matter'
import { remark } from 'remark';
import html from 'remark-html';

const postsDir = path.join(process.cwd(), 'posts');

export async function getSortedBlogPosts() {
    const fileNames = fs.readdirSync(postsDir);
    const allPostsData = await Promise.all(fileNames.map(async (filename) => {
        // get id by removing .md extension
        const id = filename.replace(/\.md$/, '');

        // get md file contents
        const fullPath = path.join(postsDir, filename);
        const fileContents = fs.readFileSync(fullPath, 'utf8');

        // get file metadata (title, date)
        const matterResult = matter(fileContents);
        const data = matterResult.data as { date?: string; title?: string; description?: string; [key: string]: any };

        return {
            id,
            date: data.date ?? '',
            title: data.title ?? '',
            description: data.description ?? ''
        };
    }));

    // sort by date
    return allPostsData.sort((a, b) => {
        if (a.date < b.date) {
            return 1;
        }
        else {
            return -1;
        }
    });
}

export async function getPostData(id: string) {
    const fullPath = path.join(postsDir, `${id}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
 
    const matterResult = matter(fileContents);
    const data = matterResult.data as { date?: string; title?: string; description?: string; [key: string]: any };
    const processedHTML = await remark()
        .use(html)
        .process(matterResult.content);
    const contentHTML = processedHTML.toString();
 
    return {
        id,
        contentHTML,
        ...data,
    };
}