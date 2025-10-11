export default defineContentScript({
  matches: ["https://leetcode.com/*"],
  main() {
    // Function to handle submit button click
    const handleSubmitClick = async () => {
      const resultEl = document.querySelector(
        '[data-e2e-locator="submission-result"]'
      ) as HTMLElement | null;

      if (!resultEl) return;

      const resultText = resultEl.innerText.trim();
      if (resultText !== "Accepted") return; // only for Accepted submissions

      try {
        // get question name from title
        const fullTitle = document.title;
        const questionName = fullTitle.replace(/\s-\sLeetCode$/, "");

        // Retrieve last submission from local storage
        const result = await browser.storage.local.get("lastSubmission");
        const submission = result.lastSubmission;
        if (!submission) {
          console.warn("No lastSubmission found in local storage");
          return;
        }

        // Send message to background to upload code to GitHub
        await browser.runtime.sendMessage({
          type: "UPLOAD_CODE",
          questionName,
          code: submission.code,
          questionId: submission.question_id,
          language: submission.language
        });

        console.log("Submission code sent to background for GitHub upload");

        // Disconnect observer after successful detection
        observer.disconnect();
      } catch (err) {
        console.error("Error processing submission:", err);
      }
    };

    // Function to attach listener to a button
    const attachListener = (button: HTMLButtonElement) => {
      if (!button.dataset.listenerAttached) {
        button.addEventListener("click", handleSubmitClick);
        button.dataset.listenerAttached = "true"; // prevent duplicate listeners
      }
    };

    // Create a MutationObserver to watch for dynamically added submit buttons
    const observer = new MutationObserver(() => {
      const buttons = document.querySelectorAll<HTMLButtonElement>(
        'button[data-e2e-locator="console-submit-button"]'
      );
      buttons.forEach(attachListener);
    });

    // Start observing
    observer.observe(document.body, { childList: true, subtree: true });

    // Attach immediately if button already exists
    const existingButton = document.querySelector<HTMLButtonElement>(
      'button[data-e2e-locator="console-submit-button"]'
    );
    if (existingButton) attachListener(existingButton);
  },
});
