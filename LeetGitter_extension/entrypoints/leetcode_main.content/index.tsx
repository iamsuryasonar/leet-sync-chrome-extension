import React from "react";
import ReactDOM from "react-dom/client";
import "~/assets/tailwind.css";
import Sidebar from "./Sidebar";
import { getGithubToken } from '@/utils/utility';

export default defineContentScript({
  matches: ["https://leetcode.com/*"],
  cssInjectionMode: "ui",
  async main(ctx: any) {
    let githubToken: string | undefined;
    let ui: any = null;
    let script: HTMLScriptElement | null = null;
    let messageListener: ((event: MessageEvent) => void) | null = null;

    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "SOLUTION_ACCEPTED") {
        window.postMessage({ type: "SOLUTION_ACCEPTED" }, "*");
      }
    });

    const mountSidebar = async () => {
      if (!ui) {
        ui = await createShadowRootUi(ctx, {
          name: "leetcode-main",
          position: "inline",
          anchor: "body",
          onMount: (container: HTMLElement) => {
            const root = ReactDOM.createRoot(container);
            root.render(<Sidebar />);
            return root;
          },
          onRemove: (root: any) => root?.unmount(),
        });
        ui.mount();
      }
    };

    const unmountSidebar = () => {
      if (ui) {
        ui.remove();
        ui = null;
      }
    };

    const injectScript = () => {
      if (!script) {
        script = document.createElement("script");
        script.src = browser.runtime.getURL("/injected.js");
        script.type = "module";
        script.onload = () => script?.remove();
        (document.head || document.documentElement).appendChild(script);
      }
    };

    const removeInjectedScript = () => {
      if (script) {
        script.remove();
        script = null;
      }
    };

    const addMessageListener = () => {
      if (!messageListener) {
        messageListener = (event: MessageEvent) => {
          if (event.source !== window) return;
          if (event.data?.type === "SUBMISSION_COMPLETE") {
            browser.runtime.sendMessage({
              type: "UPLOAD_CODE",
              lastSubmission: event.data.lastSubmission,
            });
          }
        };
        window.addEventListener("message", messageListener);
      }
    };

    const removeMessageListener = () => {
      if (messageListener) {
        window.removeEventListener("message", messageListener);
        messageListener = null;
      }
    };

    const activateFeatures = async () => {
      await mountSidebar();
      injectScript();
      addMessageListener();
    };

    const deactivateFeatures = () => {
      unmountSidebar();
      removeInjectedScript();
      removeMessageListener();
    };

    githubToken = await getGithubToken();

    if (githubToken) {
      await activateFeatures();
    }

    browser.storage.onChanged.addListener(async (changes, areaName) => {
      if (areaName === "local" && changes.githubAccessToken) {
        githubToken = changes.githubAccessToken.newValue;

        if (githubToken) {
          await activateFeatures();
        } else {
          deactivateFeatures();
        }
      }
    });
  },
});
