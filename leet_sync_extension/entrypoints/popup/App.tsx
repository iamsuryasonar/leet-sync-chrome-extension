import { useEffect, useState } from "react";
import {
  GithubAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signOut,
} from "firebase/auth/web-extension";
import { auth } from "@/firebase";

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        browser.storage.local.set({
          firebaseUser: {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
          },
        });
      } else {
        setUser(null);
        browser.storage.local.remove(["githubAccessToken", "firebaseUser"]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogIn = () => {
    window.open(
      "http://localhost:5173/",
      "GitHub Login",
      "width=600,height=700"
    );

    const messageHandler = async (event: MessageEvent<any>) => {
      if (!event.data || event.data.action !== "github-token") return;

      const githubAccessToken = event.data.access_token;
      if (!githubAccessToken) {
        console.error("Token not found");
        return;
      }

      await browser.storage.local.set({ githubAccessToken });

      try {
        const credential = GithubAuthProvider.credential(githubAccessToken);
        const userCredential = await signInWithCredential(auth, credential);
        console.log("Firebase user logged in:", userCredential.user);

        if (event.source && typeof event.origin === "string") {
          (event.source as Window).postMessage(
            { action: "github-token-received" },
            event.origin
          );
        }
      } catch (err) {
        console.error("Firebase login failed:", err);

        if (event.source && typeof event.origin === "string") {
          (event.source as Window).postMessage(
            { action: "github-token-received" },
            event.origin
          );
        }
      }
    };

    window.addEventListener("message", messageHandler, { once: true });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="w-80 p-4 text-center font-sans border border-gray-200 rounded-lg shadow-md bg-white">
      <h1 className="text-2xl font-bold mb-4">Leet Sync</h1>

      <div className="flex flex-col items-center gap-3">
        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : user ? (
          <>
            <img
              src={user.photoURL || "https://via.placeholder.com/60"}
              alt="Profile"
              className="w-16 h-16 rounded-full"
            />
            <h3 className="text-md font-semibold truncate">{user.displayName || user.email}</h3>
            <p className="text-gray-500 text-sm truncate">{user.email}</p>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-md font-semibold hover:bg-red-600 transition"
            >
              Log Out
            </button>
          </>
        ) : (
          <button
            onClick={handleLogIn}
            className="w-full px-4 py-2 bg-gray-900 text-white rounded-md font-semibold hover:bg-gray-800 transition"
          >
            Log In with GitHub
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
