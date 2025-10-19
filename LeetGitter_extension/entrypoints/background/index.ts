import { ensureRepoExists, uploadCodeToRepo } from "@/utils/githubApi";
import { getLanguageExt, getGithubToken } from "@/utils/utility";

export default defineBackground(() => {
    browser.runtime.onInstalled.addListener((details) => {
        if (details.reason === "install") {
            browser.tabs.query({ url: "*://leetcode.com/*" }, (tabs: any) => {
                tabs.forEach((tab: any) => browser.tabs.reload(tab.id));
            });

            browser.tabs.create({
                url: "http://leetgitter.stackbits.in",
            });
        }
    });

    browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
        if (message.type !== "UPLOAD_CODE") return;

        const processUpload = async (submission: any) => {
            try {
                const code = submission.code;
                const questionId = submission.question_id;
                const questionName = submission.question_slug;
                const language = submission.language;

                const fileExt = getLanguageExt(language);
                const fileName = `${questionId}_${questionName}`;

                const githubToken = await getGithubToken();
                if (!githubToken) throw new Error("GitHub token not found");

                const fullRepoName = await ensureRepoExists(githubToken);
                await uploadCodeToRepo(githubToken, fullRepoName, questionName, fileName, fileExt, code);

                console.log("Code uploaded successfully");

                browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (tabs[0]?.id) {
                        browser.tabs.sendMessage(tabs[0].id, {
                            type: "SOLUTION_ACCEPTED",
                        });
                    }
                });
                sendResponse({ success: true });
            } catch (e: any) {
                console.error("Upload process failed:", e, e.message || e);
                sendResponse({ success: false, error: e.message || String(e) });
            }
        };

        if (message?.lastSubmission) {
            await processUpload(message.lastSubmission);
        }

        // Keep message channel open for async response
        return true;
    });
});
