import fs from "fs";
import path from "path";
import matter from "gray-matter";


const contentDir = path.join(process.cwd(), "content/work");


export function getWorkSlugs() {
return fs.readdirSync(contentDir).filter((f) => f.endsWith(".mdx"));
}


export function getWorkBySlug(slug: string) {
const realSlug = slug.replace(/\.mdx$/, "");
const fullPath = path.join(contentDir, `${realSlug}.mdx`);
const file = fs.readFileSync(fullPath, "utf8");
const { data, content } = matter(file);
return { frontmatter: data as any, slug: realSlug, content };
}


export function getAllWork() {
return getWorkSlugs().map((slug) => getWorkBySlug(slug));
}