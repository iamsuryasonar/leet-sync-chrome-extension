import { useEffect } from "react";

function App() {
  useEffect(() => {
    const handleGitHubCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (!code) return;

      try {
        // Exchange code for access token via backend
        const res = await fetch("http://localhost:3001/github/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        const { access_token } = await res.json();
        if (!access_token) throw new Error("No access token received");

        // Send access token back to the opener (extension popup)
        if (window.opener) {
          window.opener.postMessage(
            { action: "github-token", access_token },
            "*"
          );

          // Wait for confirmation from opener
          const handleConfirmation = (event) => {
            if (event.data?.action === "github-token-received") {
              window.close(); // Close popup after confirmation
            }
          };

          window.addEventListener("message", handleConfirmation, {
            once: true,
          });
        }
      } catch (err) {
        console.error("GitHub login failed:", err);
      }
    };

    handleGitHubCallback();
  }, []);

  const handleLogin = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_API_URL;
    const scope = "repo user";

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${encodeURIComponent(scope)}`;

    // Open in a popup instead of redirecting current page
    window.open(authUrl, "GitHub Login", "width=600,height=700");
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>GitHub Login</h1>
      <button
        onClick={handleLogin}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          borderRadius: "5px",
          cursor: "pointer",
          backgroundColor: "#24292e",
          color: "white",
          border: "none",
        }}
      >
        Log in with GitHub
      </button>
    </div>
  );
}

export default App;
