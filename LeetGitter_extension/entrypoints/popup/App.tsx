import { useEffect, useState } from "react";
import {
  GithubAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signOut,
} from "firebase/auth/web-extension";
import { auth } from "@/firebase";
import { FaGithub } from "react-icons/fa";
import { motion } from 'framer-motion';
import { fetchGithubUsername } from '@/utils/githubApi';
import logo from '@/public/icon/128.png';

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
    function openPopUpForAuth() {
      const width = 500;
      const height = 500;

      // Calculate center position relative to the screen
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;

      // Open the popup centered
      window.open(
        import.meta.env.VITE_SIGN_IN_URL,
        "GitHub Login",
        `width=${width},height=${height},left=${left},top=${top}`
      );
    }

    openPopUpForAuth();

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
        await signInWithCredential(auth, credential);
        const username = await fetchGithubUsername(githubAccessToken);
        browser.storage.local.set({ ['GITHUB_USERNAME']: username });

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
      browser.storage.local.remove(["GITHUB_USERNAME", "sidebarButtonPosition"]);
      console.log("User logged out");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-80 p-6 text-center font-sans border border-gray-200 rounded-2xl shadow-lg bg-gradient-to-b from-white to-gray-50"
    >
      {/* Header */}
      <div className="flex flex-col items-center mb-5">
        <motion.img
          initial={{ rotate: -10, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          src={logo}
          alt="LeetGitter Logo"
          className="w-14 h-14 mb-2 drop-shadow-sm"
        />
        <h1 className="text-3xl font-bold text-gray-800">LeetGitter</h1>
        <p className="text-gray-500 text-sm">by <a href="http://stackbits.in/" target="_blank">Stackbits</a></p>
      </div>

      {/* Body */}
      <div className="flex flex-col items-center gap-4">
        {loading ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-500 text-sm"
          >
            Loading...
          </motion.p>
        ) : user ? (
          <>
            <motion.img
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              src={user.photoURL || "https://via.placeholder.com/60"}
              alt="Profile"
              className="w-16 h-16 rounded-full border border-gray-300 shadow-sm"
            />
            <h3 className="text-md font-semibold text-gray-800 truncate">
              {user.displayName || user.email}
            </h3>
            <p className="text-gray-500 text-sm truncate">{user.email}</p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-md font-semibold shadow hover:bg-red-600 transition cursor-pointer"
            >
              Log Out
            </motion.button>
          </>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogIn}
            className="flex items-center justify-center w-full gap-2 px-4 py-2 bg-gray-900 text-white rounded-md font-semibold shadow hover:bg-gray-800 transition cursor-pointer"
          >
            <FaGithub size={20} />
            Log In with GitHub
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

export default App;
