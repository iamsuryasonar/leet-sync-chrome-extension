export default defineContentScript({
  matches: ["https://leetcode.com/*"],
  main() {

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
  },
});

