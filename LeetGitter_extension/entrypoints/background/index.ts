import { BRANCH, REPO_NAME } from "@/constants";
import { getGithubHeaders, getLanguageExt, getReadableTimestamp12h } from "@/utility";

export default defineBackground(() => {

    // Get the authenticated GitHub username
    const getGithubUsername = async (token: string) => {
        const res = await fetch("https://api.github.com/user", {
            headers: getGithubHeaders(token),
        });
        if (!res.ok) throw new Error("Failed to fetch GitHub username");
        const data = await res.json();
        return data.login;
    };

    // Ensure the repo exists, create if missing
    const ensureRepoExists = async (username: string, token: string) => {
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

    // Upload code to the repo with versioning and duplicate detection
    const uploadCodeToRepo = async (
        fileName: string,
        fileExt: string,
        fullRepoName: string,
        code: string,
        token: string
    ) => {
        const encodedContent = btoa(unescape(encodeURIComponent(code)));
        const folderPath = fileName; // Each question gets its own folder

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

        // Check if code already exists in any previous file
        for (const file of existingFiles) {
            if (!file.download_url) continue;
            const existingCode = await fetch(file.download_url).then(r => r.text());
            if (existingCode.trim() === code.trim()) {
                console.log("Code identical to existing version — skipping upload");
                return;
            }
        }

        // Generate unique, readable filename using timestamp
        const formattedTime = getReadableTimestamp12h();

        const newFileName = `${fileName}-${formattedTime}.${fileExt}`;

        console.log('new file path:', `https://api.github.com/repos/${fullRepoName}/contents/${folderPath}/${newFileName}`);

        // Upload new file
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

        console.log(`Code pushed successfully as ${newFileName}`);
    };

    // Background listener
    browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
        if (message.type !== "UPLOAD_CODE") return;

        const processUpload = async (submission: any) => {
            try {
                console.log('Code update initiated...');

                const code = submission.code;
                const questionId = submission.question_id;
                const language = submission.language;
                const question_slug = submission.question_slug;

                const fileExt = getLanguageExt(language);

                const fileName = `${questionId}_${question_slug}`;

                const result = await browser.storage.local.get("githubAccessToken");
                const githubToken = result.githubAccessToken;

                if (!githubToken) throw new Error("GitHub token not found");

                const username = await getGithubUsername(githubToken);
                const fullRepoName = await ensureRepoExists(username, githubToken);
                await uploadCodeToRepo(fileName, fileExt, fullRepoName, code, githubToken);

                sendResponse({ success: true });
            } catch (e: any) {
                console.error("Upload process failed:", e, e.message || e);
                sendResponse({ success: false, error: e.message || String(e) });
            }
        }

        if (message?.lastSubmission) {
            await processUpload(message.lastSubmission);
        }
        // Keep message channel open for async response
        return true;
    });
});
