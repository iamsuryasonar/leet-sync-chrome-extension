import { useEffect } from "react";

function SignInPage() {
  useEffect(() => {
    const handleGitHubCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      // If "code" exists, it means GitHub redirected back
      if (code) {
        try {
          // Exchange code for access token via your backend
          const res = await fetch(import.meta.env.VITE_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          });

          const { access_token } = await res.json();
          if (!access_token) throw new Error("No access token received");

          // Send access token back to the extension popup
          if (window.opener) {
            window.opener.postMessage(
              { action: "github-token", access_token },
              "*"
            );
          }

          // Give a moment for message to be received, then close
          setTimeout(() => window.close(), 1000);
        } catch (err) {
          console.error("GitHub login failed:", err);
        }
      } else {
        // If no code, start OAuth flow automatically
        const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
        const redirectUri = import.meta.env.VITE_REDIRECT_URL;
        const scope = "repo user";

        const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&scope=${encodeURIComponent(scope)}`;

        window.location.href = authUrl;
      }
    };

    handleGitHubCallback();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
        textAlign: "center",
        gap: "10px",
      }}
    >
      <h1>Logging in with GitHub...</h1>
      <p>Please wait while we complete authentication.</p>
    </div>
  );
}

export default SignInPage;
