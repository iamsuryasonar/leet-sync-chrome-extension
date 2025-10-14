let lastSubmission = null;

const originalFetch = window.fetch;
window.fetch = async (...args) => {
    const [input, init] = args;

    let urlString;
    if (typeof input === "string") {
        urlString = input;
    } else if (input instanceof Request) {
        urlString = input.url;
    } else {
        console.warn("Unknown fetch input type:", input);
        return originalFetch(...args);
    }

    // Capture /submit/ POST request body
    if (urlString.includes("/submit/") && (init?.method === "POST" || (input instanceof Request && input.method === "POST"))) {
        try {
            let bodyText = "";

            if (init?.body) {
                bodyText = typeof init.body === "string" ? init.body : await init.body.text();
            } else if (input instanceof Request && !input.bodyUsed && input.body) {
                bodyText = await input.text();
            }

            if (bodyText) {
                const body = JSON.parse(bodyText);
                const pathParts = new URL(urlString, location.origin).pathname.split("/");
                const questionSlug = pathParts[2];

                lastSubmission = {
                    question_slug: questionSlug,
                    question_id: body.question_id,
                    language: body.lang,
                    code: body.typed_code,
                };
            }
        } catch (err) {
            console.error("Error parsing submission request body:", err);
        }
    }

    // Perform the actual fetch
    const response = await originalFetch(...args);

    // Capture /submit/ response body to get submission_id
    if (urlString.includes("/submit/") && (init?.method === "POST" || (input instanceof Request && input.method === "POST"))) {
        try {
            const clone = response.clone();
            const data = await clone.json();

            if (lastSubmission && data?.submission_id) {
                lastSubmission.submission_id = data.submission_id.toString();
            }
        } catch (err) {
            console.error("Error reading /submit/ response body:", err);
        }
    }

    // Intercept /submissions/detail/.../check responses
    if (urlString.includes("/submissions/detail/") && urlString.includes("/check/")) {
        try {
            const clone = response.clone();
            const data = await clone.json();

            if (lastSubmission && data?.status_msg === "Accepted" && data?.submission_id === lastSubmission.submission_id) {
                window.postMessage({ type: "SUBMISSION_COMPLETE", lastSubmission }, "*");
            }
        } catch (err) {
            console.error("Error parsing /check/ response body:", err);
        }
    }

    return response;
};
