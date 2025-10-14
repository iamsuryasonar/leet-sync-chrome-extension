import React, { useState } from "react";
import icon from '../../public/icon/128.png';
import LeetCodeFiles from './LeetCodeFiles';

export default function Sidebar() {
    const [open, setOpen] = useState(false);

    return (
        <>
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    className="fixed right-0 top-[90%] -translate-y-1/2 z-[9999] px-4 py-2 text-2xl border-none rounded-l-[30px] bg-blue-600 text-white shadow-md cursor-pointer"
                >
                    &#9776;
                </button>
            )}

            {/* Sidebar panel */}
            <div
                className={`fixed top-0 right-0 h-screen w-80 bg-white shadow-lg z-[2147483646] p-4 transition-all duration-300 ${open ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Header with title and close button */}
                <div className="flex items-center justify-between mb-5 relative">
                    <img
                        src={icon}
                        alt="LeetSync Logo"
                        className="w-8 h-8 mr-2 rounded-full"
                    />
                    <span className="text-lg font-bold text-gray-800 flex-grow">
                        LeetSync
                    </span>
                    <button
                        onClick={() => setOpen(false)}
                        className="text-2xl text-red-600 bg-transparent border-none cursor-pointer"
                    >
                        ×
                    </button>
                </div>

                {/* Sidebar content */}
                <div>
                    {/* <LeetCodeFiles folderPath={folderPath} /> */}
                </div>
            </div>
        </>
    );
}
