import { languageExtensions } from "../constants";

export function getLanguageExt(language: string) {
    return languageExtensions[language.toLowerCase()] || "txt";
}

export const getReadableTimestamp12h = () => {
    const now = new Date();
    const pad = (n: number, digits = 2) => n.toString().padStart(digits, '0');

    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());

    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());
    const milliseconds = pad(now.getMilliseconds(), 3);

    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}-${milliseconds}${ampm}`;
};

export const getLeetCodeQuestionName = (url: string) => {
    const pathname = new URL(url).pathname;
    const parts = pathname.split("/");
    return parts[2] || "";
};

export async function getGithubUsername() {
    const result = await browser.storage.local.get("GITHUB_USERNAME");
    return result['GITHUB_USERNAME'] || "";
}

export const getGithubToken = async (): Promise<string> => {
    const result = await browser.storage.local.get("githubAccessToken");
    const githubToken = result.githubAccessToken;
    if (!githubToken) throw new Error("GitHub token not found");
    return githubToken;
};
