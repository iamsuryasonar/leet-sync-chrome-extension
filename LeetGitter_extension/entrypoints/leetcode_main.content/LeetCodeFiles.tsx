import React, { useEffect, useState } from "react";
import { CiEdit } from "react-icons/ci";
import { SiTicktick } from "react-icons/si";
import { MdOutlineCancel } from "react-icons/md";
import { fetchFolderFiles, renameFileOnGithub } from "~/utils/githubApi";
import { getGithubToken } from '@/utils/utility';

export default function LeetCodeFiles({ folderPath }: { folderPath: string }) {
    const [files, setFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingFile, setEditingFile] = useState<string | null>(null);
    const [newFileName, setNewFileName] = useState("");

    const fetchFiles = async () => {
        try {
            setLoading(true);
            setError(null);

            const githubToken = await getGithubToken();
            if (!githubToken) throw new Error("GitHub token not found");

            const folderFiles = await fetchFolderFiles(githubToken, folderPath);
            setFiles(folderFiles);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, [folderPath]);

    const handleSave = async (file: any) => {
        if (!newFileName.trim() || newFileName === file.name) {
            setEditingFile(null);
            return;
        }

        try {
            const githubToken = await getGithubToken();
            if (!githubToken) throw new Error("GitHub token not found");

            await renameFileOnGithub(githubToken, file, newFileName);
            setEditingFile(null);
            await fetchFiles();
        } catch (err) {
            console.error("Failed to rename file:", err);
        }
    };

    if (loading) return <p>Loading files...</p>;
    if (error) return <p className="text-red-600">Error: {error}</p>;

    return (
        <div className="space-y-2">
            {files?.length > 0 ? (
                files.map((file) => (
                    <FileItem
                        key={file.path}
                        file={file}
                        editingFile={editingFile}
                        newFileName={newFileName}
                        setEditingFile={setEditingFile}
                        setNewFileName={setNewFileName}
                        handleSave={handleSave}
                    />
                ))
            ) : (
                <div className="text-center text-gray-600 italic p-4 border rounded-md bg-gray-50">
                    <p>Once you solve and upload your solution, it’ll appear here.</p>
                </div>
            )}
        </div>
    );
}

function FileItem({
    file,
    editingFile,
    newFileName,
    setEditingFile,
    setNewFileName,
    handleSave,
}: {
    file: any;
    editingFile: string | null;
    newFileName: string;
    setEditingFile: (val: string | null) => void;
    setNewFileName: (val: string) => void;
    handleSave: (file: any) => Promise<void>;
}) {
    const [saving, setSaving] = useState(false);
    const isEditing = editingFile === file.name;

    const onSave = async () => {
        setSaving(true);
        try {
            await handleSave(file);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="border rounded-lg flex items-center justify-between shadow-sm hover:shadow-md transition-shadow bg-white">
            {isEditing ? (
                <div className="p-1 flex items-center w-full gap-1">
                    <input
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                onSave();
                            }
                        }}
                        className="flex-grow border px-3 py-2 rounded-md text-sm outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-600"
                        autoFocus
                    />
                    {saving ? (
                        <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                    ) : (
                        <button
                            onClick={onSave}
                            title="Save"
                            className="p-1 bg-green-100 text-[#333] hover:text-white rounded-full hover:bg-green-600 transition-colors cursor-pointer"
                        >
                            <SiTicktick size={16} />
                        </button>
                    )}

                    <button
                        onClick={() => setEditingFile(null)}
                        title="Cancel"
                        className="p-1 bg-slate-100 text-[#333] rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                        <MdOutlineCancel size={16} />
                    </button>
                </div>
            ) : (
                <div className="p-2 flex justify-between w-full items-center">
                    <a
                        href={file.download_url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 font-medium truncate hover:underline"
                    >
                        {file.name}
                    </a>
                    <button
                        onClick={() => {
                            setEditingFile(file.name);
                            setNewFileName(file.name);
                        }}
                        title="Edit filename"
                        className="p-1 text-[#333] bg-slate-100 hover:bg-blue-200 rounded-full transition-colors cursor-pointer"
                    >
                        <CiEdit size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}
