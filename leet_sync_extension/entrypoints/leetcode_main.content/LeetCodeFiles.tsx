import React, { useEffect, useState } from "react";
import { BRANCH, REPO_NAME } from "@/constants";

interface GitHubFile {
    name: string;
    path: string;
    type: string;
    download_url: string | null;
}

const getGithubHeaders = (token: string) => ({
    Authorization: `token ${token}`,
    Accept: "application/vnd.github.v3+json",
});

const getGithubUsername = async (token: string) => {
    const res = await fetch("https://api.github.com/user", {
        headers: getGithubHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to fetch GitHub username");
    const data = await res.json();
    return data.login as string;
};

const checkFolderFiles = async (token: string, folderPath: string) => {
    const username = await getGithubUsername(token);
    const fullRepoName = `${username}/${REPO_NAME}`;
    const apiUrl = `https://api.github.com/repos/${fullRepoName}/contents/${folderPath}?ref=${BRANCH}`;
    console.log('apiurl', apiUrl);

    const res = await fetch(apiUrl, { headers: getGithubHeaders(token) });
    if (!res.ok) throw new Error("Failed to fetch folder contents from GitHub");

    const data: GitHubFile[] = await res.json();
    return data;
};

export default function LeetCodeFiles({ folderPath }: { folderPath: string }) {
    const [files, setFiles] = useState<GitHubFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                setLoading(true);
                setError(null);

                // Get token from extension storage
                const result = await browser.storage.local.get("githubAccessToken");
                const githubToken = result.githubAccessToken;
                if (!githubToken) throw new Error("GitHub token not found");

                const folderFiles = await checkFolderFiles(githubToken, folderPath);
                setFiles(folderFiles);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFiles();
    }, [folderPath]);

    if (loading) return <p>Loading files...</p>;
    if (error) return <p className="text-red-600">Error: {error}</p>;

    return (
        <div className="space-y-2">
            {files.map((file) => (
                <div key={file.path} className="p-2 border rounded hover:bg-gray-50">
                    <a
                        href={file.download_url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600"
                    >
                        {file.name}
                    </a>
                </div>
            ))}
        </div>
    );
}
