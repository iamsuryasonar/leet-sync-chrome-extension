import { languageExtensions } from "./constants";

// Helper to create GitHub API headers
export const getGithubHeaders = (token: string) => ({
    Authorization: `token ${token}`,
    Accept: "application/vnd.github.v3+json",
});

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
