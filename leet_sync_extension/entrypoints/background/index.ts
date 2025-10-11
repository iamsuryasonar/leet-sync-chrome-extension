export default defineBackground(() => {
    const BRANCH = "main";
    const REPO_NAME = "leet-sync";

    // Helper to create GitHub API headers
    const getGithubHeaders = (token: string) => ({
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
    });

    browser.webRequest.onBeforeRequest.addListener(
        (details: any): any => {
            if (details.method === "POST" && details.url.includes("/submit/")) {
                try {
                    const rawData = (details.requestBody as any)?.raw?.[0]?.bytes;
                    if (!rawData) return;

                    const bodyText = new TextDecoder("utf-8").decode(rawData);
                    const body = JSON.parse(bodyText);

                    const code = body.typed_code;
                    const language = body.lang;
                    const question_id = body.question_id;
                    const timestamp = body.timestamp;

                    browser.storage.local.set({
                        lastSubmission: { question_id, language, code, timestamp },
                    });
                } catch (err) {
                    console.error("Error parsing request body:", err);
                }
            }

            return;
        },
        { urls: ["https://leetcode.com/problems/*/submit/"] },
        ["requestBody"]
    );

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
                    description: "LeetSync solutions repo",
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

    // Upload code to the repo
    const uploadCodeToRepo = async (fileName: string, fullRepoName: string, code: string, token: string) => {
        const content = btoa(unescape(encodeURIComponent(code)));

        const res = await fetch(`https://api.github.com/repos/${fullRepoName}/contents/${fileName}`, {
            method: "PUT",
            headers: getGithubHeaders(token),
            body: JSON.stringify({
                message: `Add LeetCode solution ${fileName}`,
                content,
                branch: BRANCH,
            }),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(`GitHub upload failed: ${err.message}`);
        } else {
            console.log('Code pushed successfully')
        }
    };

    // Background listener
    browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
        if (message.type !== "UPLOAD_CODE") return;
        try {
            const { code, questionName, questionId, language } = message;

            function getLanguageExt(language: string) {
                return 'js'
            }

            const fileName = `${questionId}_${questionName}.${getLanguageExt(language)}`;

            const result = await browser.storage.local.get("githubAccessToken");
            const githubToken = result.githubAccessToken;

            if (!githubToken) throw new Error("GitHub token not found");

            const username = await getGithubUsername(githubToken);
            const fullRepoName = await ensureRepoExists(username, githubToken);
            await uploadCodeToRepo(fileName, fullRepoName, code, githubToken);

            sendResponse({ success: true });
        } catch (e: any) {
            console.error("Upload process failed:", e, e.message || e);
            sendResponse({ success: false, error: e.message || String(e) });
        }

        // Keep message channel open for async response
        return true;
    });
});
