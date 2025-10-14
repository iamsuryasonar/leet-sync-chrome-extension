// githubApi.ts
import { BRANCH, REPO_NAME } from "@/constants";

const getGithubHeaders = (token: string) => ({
    Authorization: `token ${token}`,
    Accept: "application/vnd.github.v3+json",
});

export const getGithubUsername = async (token: string) => {
    const res = await fetch("https://api.github.com/user", {
        headers: getGithubHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch GitHub username");
    const data = await res.json();
    return data.login as string;
};

// Ensure that the repository exists. Creates it if missing.
export const ensureRepoExists = async (token: string) => {
    const username = await getGithubUsername(token);
    const fullRepoName = `${username}/${REPO_NAME}`;

    const repoRes = await fetch(`https://api.github.com/repos/${fullRepoName}`, {
        headers: getGithubHeaders(token),
    });

    if (repoRes.status === 404) {
        // Create repo if not found
        const createRes = await fetch("https://api.github.com/user/repos", {
            method: "POST",
            headers: getGithubHeaders(token),
            body: JSON.stringify({
                name: REPO_NAME,
                description: "LeetGitter solutions repo",
                private: false,
                auto_init: true,
            }),
        });

        if (!createRes.ok) {
            const err = await createRes.json();
            throw new Error(`Failed to create repo: ${err.message}`);
        }

        console.log(`Repo '${REPO_NAME}' created successfully`);
    } else if (!repoRes.ok) {
        const err = await repoRes.json();
        throw new Error(`Error checking repo: ${err.message}`);
    } else {
        console.log(`Repo '${REPO_NAME}' already exists`);
    }

    return fullRepoName;
};

// Upload code to a folder in the repository, with duplicate detection and timestamped filename.
export const uploadCodeToRepo = async (
    token: string,
    fullRepoName: string,
    questionName: string,
    fileName: string,
    fileExt: string,
    code: string
) => {
    const encodedContent = btoa(unescape(encodeURIComponent(code)));
    const folderPath = questionName; // each question gets its own folder

    // Fetch existing files in the folder
    let existingFiles: any[] = [];
    const listRes = await fetch(
        `https://api.github.com/repos/${fullRepoName}/contents/${folderPath}`,
        { headers: getGithubHeaders(token) }
    );

    if (listRes.status === 200) {
        existingFiles = await listRes.json();
    } else if (listRes.status !== 404) {
        const err = await listRes.json();
        throw new Error(`Failed to check existing files: ${err.message}`);
    }

    // Skip upload if code already exists
    for (const file of existingFiles) {
        if (!file.download_url) continue;
        const existingCode = await fetch(file.download_url).then((r) => r.text());
        if (existingCode.trim() === code.trim()) {
            console.log("Code identical to existing version — skipping upload");
            return;
        }
    }

    // Generate unique timestamped filename
    const { getReadableTimestamp12h } = await import("@/utils/utility");
    const formattedTime = getReadableTimestamp12h();
    const newFileName = `${fileName}-${formattedTime}.${fileExt}`;

    const res = await fetch(
        `https://api.github.com/repos/${fullRepoName}/contents/${folderPath}/${newFileName}`,
        {
            method: "PUT",
            headers: getGithubHeaders(token),
            body: JSON.stringify({
                message: `Add LeetCode solution ${newFileName}`,
                content: encodedContent,
                branch: BRANCH,
            }),
        }
    );

    if (!res.ok) {
        const err = await res.json();
        throw new Error(`GitHub upload failed: ${err.message}`);
    }

    console.log(`Code uploaded successfully as ${newFileName}`);
};

// Fetch folder contents from GitHub with cache-busting
export const fetchFolderFiles = async (token: string, folderPath: string) => {
    const username = await getGithubUsername(token);
    const fullRepoName = `${username}/${REPO_NAME}`;
    const apiUrl = `https://api.github.com/repos/${fullRepoName}/contents/${folderPath}?ref=${BRANCH}&t=${Date.now()}`;

    const res = await fetch(apiUrl, { headers: getGithubHeaders(token) });
    if (!res.ok && res.status === 404) return [];
    if (!res.ok) throw new Error("Failed to fetch folder contents from GitHub");

    const data: any[] = await res.json();
    return data;
};

// Rename a file on GitHub
export const renameFileOnGithub = async (token: string, file: any, newName: string) => {
    const username = await getGithubUsername(token);
    const repo = `${username}/${REPO_NAME}`;
    const oldPath = file.path;
    const newPath = oldPath.replace(file.name, newName);

    const contentResponse = await fetch(file.download_url);
    const content = await contentResponse.text();

    // Delete old file
    await fetch(`https://api.github.com/repos/${repo}/contents/${oldPath}`, {
        method: "DELETE",
        headers: getGithubHeaders(token),
        body: JSON.stringify({
            message: `Delete old file: ${file.name}`,
            sha: file.sha,
        }),
    });

    // Upload new file
    await fetch(`https://api.github.com/repos/${repo}/contents/${newPath}`, {
        method: "PUT",
        headers: getGithubHeaders(token),
        body: JSON.stringify({
            message: `Rename file to ${newName}`,
            content: btoa(content),
        }),
    });
};
