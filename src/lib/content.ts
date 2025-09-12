import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";


export type ProjectMeta = {
slug: string;
title: string;
year: number;
tags: string[];
summary: string;
links?: { repo?: string; live?: string };
cover?: string;
};


const ROOT = process.cwd();
const WORK_DIR = path.join(ROOT, "content", "work");


export function getProjectSlugs(): string[] {
if (!fs.existsSync(WORK_DIR)) return [];
return fs.readdirSync(WORK_DIR).filter((f) => f.endsWith(".mdx"))
.map((f) => f.replace(/\.mdx$/, ""));
}


export function getProjectSource(slug: string) {
const file = path.join(WORK_DIR, `${slug}.mdx`);
const raw = fs.readFileSync(file, "utf8");
const { data, content } = matter(raw);
const meta = normalizeMeta({ ...data, slug }) as ProjectMeta;
return { meta, content };
}


export function getAllProjects(): ProjectMeta[] {
return getProjectSlugs()
.map((slug) => getProjectSource(slug).meta)
.sort((a, b) => b.year - a.year);
}


function normalizeMeta(data: any): ProjectMeta {
return {
slug: String(data.slug),
title: String(data.title),
year: Number(data.year),
tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
summary: String(data.summary || ""),
links: data.links || {},
cover: data.cover || undefined,
};
}