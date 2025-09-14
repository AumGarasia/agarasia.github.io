export default async function sitemap() {
    const base = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
    const routes = ["", "/work", "/about", "/contact"].map((p) => ({ url: base + p, lastModified: new Date() }));
    return routes;
    }