
import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "~/assets/tailwind.css";
import Sidebar from './Sidebar';

export default defineContentScript({
  matches: ["https://leetcode.com/*"],
  cssInjectionMode: "ui",
  async main(ctx: any) {

    // inject script to leet code dom
    const script = document.createElement("script");
    script.src = browser.runtime.getURL("/injected.js");
    script.type = "module";
    script.onload = () => script.remove();
    (document.head || document.documentElement).appendChild(script);

    // listen to message from the injected script
    window.addEventListener("message", (event) => {
      if (event.source !== window) return;
      if (event.data?.type === "SUBMISSION_COMPLETE") {
        browser.runtime.sendMessage({
          type: "UPLOAD_CODE",
          lastSubmission: event.data.lastSubmission
        });
      }
    });

    const ui = await createShadowRootUi(ctx, {
      name: "leetcode-main",
      position: "inline",
      anchor: "body",
      onMount: (container: any) => {
        const root = ReactDOM.createRoot(container);
        root.render(<Sidebar />);
        return root;
      },
      onRemove: (root: any) => {
        root?.unmount();
      },
    });

    ui.mount();
  },
});


