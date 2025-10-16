import { useEffect } from "react";
import { motion } from "framer-motion";

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
        const scope = "repo read:user";

        const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&scope=${encodeURIComponent(scope)}`;

        window.location.href = authUrl;
      }
    };

    handleGitHubCallback();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center gap-4 bg-gray-50">
      <motion.h1
        className="text-3xl font-bold text-gray-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Logging in with GitHub...
      </motion.h1>

      <motion.p
        className="text-gray-600 text-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        Please wait while we complete authentication.
      </motion.p>

      <motion.div
        className="mt-6 w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );
}

export default SignInPage;
