import { useEffect } from "react";

type SEOProps = {
    title?: string;
    description?: string;
    name?: string;
    type?: string;
};

function setMeta(selector: string, attr: "name" | "property", key: string, content?: string) {
    if (!content) return;

    let element = document.head.querySelector<HTMLMetaElement>(selector);

    if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attr, key);
        document.head.appendChild(element);
    }

    element.setAttribute("content", content);
}

export default function SEO({ title, description, name, type = "website" }: SEOProps) {
    useEffect(() => {
        if (title) document.title = title;

        setMeta('meta[name="description"]', "name", "description", description);
        setMeta('meta[property="og:type"]', "property", "og:type", type);
        setMeta('meta[property="og:title"]', "property", "og:title", title);
        setMeta('meta[property="og:description"]', "property", "og:description", description);
        setMeta('meta[name="twitter:creator"]', "name", "twitter:creator", name);
        setMeta('meta[name="twitter:card"]', "name", "twitter:card", type);
        setMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
        setMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    }, [description, name, title, type]);

    return null;
}