import React, { useState, useEffect } from "react";
import icon from "../../public/icon/128.png";
import LeetCodeFiles from "./LeetCodeFiles";
import { getLeetCodeQuestionName } from "@/utils/utility";
import { IoMdClose } from "react-icons/io";
import { FiMenu } from "react-icons/fi";
import { IoCheckmarkDoneSharp } from "react-icons/io5";

export default function Sidebar() {
    const [open, setOpen] = useState(false);
    const [questionName, setQuestionName] = useState(() =>
        getLeetCodeQuestionName(window.location.href)
    );
    const [showSidebar, setShowSidebar] = useState(() =>
        window.location.href.includes("/problems/")
    );
    const [solutionAccepted, setSolutionAccepted] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [wasDragged, setWasDragged] = useState(false);
    const [dragStarted, setDragStarted] = useState(false);
    const [buttonPosition, setButtonPosition] = useState<{
        top: string;
        left?: string;
        right?: string;
    }>({
        top: "90%",
        right: "0px",
    });

    const BUTTON_HEIGHT = 48; // px

    useEffect(() => {
        if (browser?.storage?.local) {
            browser.storage.local.get(["sidebarButtonPosition"], (result) => {
                if (result.sidebarButtonPosition) {
                    setButtonPosition(result.sidebarButtonPosition);
                }
            });
        }
    }, []);

    const savePosition = (position: any) => {
        setButtonPosition(position);
        if (browser?.storage?.local) {
            browser.storage.local.set({ sidebarButtonPosition: position });
        }
    };

    useEffect(() => {
        const handleUrlChange = () => {
            const url = window.location.href;
            setShowSidebar(url.includes("/problems/"));
            const newQuestionName = getLeetCodeQuestionName(url);
            if (newQuestionName !== questionName) setQuestionName(newQuestionName);
        };

        const observer = new MutationObserver(handleUrlChange);
        observer.observe(document.body, { childList: true, subtree: true });

        window.addEventListener("popstate", handleUrlChange);
        const originalPushState = history.pushState;
        history.pushState = function (...args) {
            originalPushState.apply(this, args);
            handleUrlChange();
        };

        return () => {
            observer.disconnect();
            window.removeEventListener("popstate", handleUrlChange);
            history.pushState = originalPushState;
        };
    }, [questionName]);

    if (!showSidebar) return null;

    const handleMouseDown = () => {
        setDragActive(true);
        setDragStarted(false);
        setWasDragged(false);
    };

    const handleMouseUp = () => {
        if (dragActive) {
            setDragActive(false);
            if (!dragStarted) {
                setWasDragged(false);
            }
            setTimeout(() => setDragStarted(false), 100);
        }
    };

    useEffect(() => {
        const moveHandler = (e: MouseEvent | TouchEvent) => {
            if (!dragActive) return;

            const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
            const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

            setDragStarted(true);
            setWasDragged(true);

            const width = window.innerWidth;
            const height = window.innerHeight;
            const snapRight = clientX > width / 2;

            // Clamp vertical position
            const halfHeight = BUTTON_HEIGHT / 2;
            const clampedY = Math.max(halfHeight, Math.min(clientY, height - halfHeight));
            const newPosition = {
                top: `${clampedY}px`,
                left: snapRight ? null : "0px",
                right: snapRight ? "0px" : null,
            };

            savePosition(newPosition);
        };

        const upHandler = () => {
            handleMouseUp();
        };

        if (dragActive) {
            window.addEventListener("mousemove", moveHandler);
            window.addEventListener("mouseup", upHandler);
            window.addEventListener("touchmove", moveHandler);
            window.addEventListener("touchend", upHandler);
        }

        return () => {
            window.removeEventListener("mousemove", moveHandler);
            window.removeEventListener("mouseup", upHandler);
            window.removeEventListener("touchmove", moveHandler);
            window.removeEventListener("touchend", upHandler);
        };
    }, [dragActive]);

    const roundedClass = dragActive
        ? "rounded-full"
        : buttonPosition.left === "0px"
            ? "rounded-r-full"
            : buttonPosition.right === "0px"
                ? "rounded-l-full"
                : "rounded-full";

    const handleClick = () => {
        if (!dragActive && !wasDragged) {
            setOpen(true);
        }
    };

    useEffect(() => {
        const handleRefresh = (event: MessageEvent) => {
            if (event.data?.type === "SOLUTION_ACCEPTED") {
                setSolutionAccepted(true);
                const timer = setTimeout(() => setSolutionAccepted(false), 10000);
                return () => clearTimeout(timer);
            }
        };

        window.addEventListener("message", handleRefresh);
        return () => window.removeEventListener("message", handleRefresh);
    }, []);

    return (
        <>
            {/* Toggle Button */}
            {!open && (
                <button
                    onClick={handleClick}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onTouchStart={handleMouseDown}
                    onTouchEnd={handleMouseUp}
                    className={`fixed z-[9999] flex items-center justify-center w-9 h-9 text-white shadow-lg hover:scale-110 transition-transform duration-200 cursor-pointer ${roundedClass} ${dragActive ? "bg-[#e07e00]" : "bg-[#FFA116] hover:bg-[#FF8C00]"
                        } ${solutionAccepted ? "bg-green-600" : "bg-[#FFA116] hover:bg-[#FF8C00]"}`}
                    style={{
                        top: buttonPosition.top,
                        left: buttonPosition.left,
                        right: buttonPosition.right,
                        transform: "translateY(-50%)",
                    }}
                    title="Open LeetSync"
                >
                    {solutionAccepted ? <IoCheckmarkDoneSharp size={18} /> : <FiMenu size={18} />}
                </button>
            )}

            {/* Sidebar Panel */}
            <div
                className={`fixed top-0 right-0 h-screen w-80 bg-white shadow-lg z-[2147483646] p-3 transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center">
                        <img
                            src={icon}
                            alt="LeetSync Logo"
                            className="w-8 h-8 mr-2 rounded-full"
                        />
                        <span className="text-lg font-bold text-gray-800">LeetSync</span>
                    </div>
                    <button
                        onClick={() => setOpen(false)}
                        className="text-gray-400 bg-transparent border-none hover:text-[#333] cursor-pointer"
                        title="Close Sidebar"
                    >
                        <IoMdClose size={24} />
                    </button>
                </div>

                {/* Sidebar Content */}
                <div className="overflow-y-auto h-[calc(100%-56px)]">
                    <LeetCodeFiles folderPath={questionName} solutionAccepted={solutionAccepted} />
                </div>
            </div>
        </>
    );
}