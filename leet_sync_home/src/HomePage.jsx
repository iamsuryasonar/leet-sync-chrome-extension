import { motion } from "framer-motion";
import Nav from "./components/Nav";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 py-12 px-6 lg:px-24">
      <Nav />

      <main className="max-w-6xl mx-auto mt-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <section className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <h2 className="text-4xl font-extrabold">
              LeetSync - Automatically Upload Your Accepted LeetCode Solutions
            </h2>
            <p className="text-slate-600 mt-3">
              LeetSync seamlessly backs up your accepted LeetCode solutions to
              GitHub. Each problem is organized by folder (Question ID + Name),
              so you can track your progress, maintain a clean workflow, and
              revisit your solutions anytime.
            </p>
          </motion.div>

          <motion.div
            className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.12 }}
          >
            <FeatureCard
              title="Auto Upload"
              desc="Accepted solutions are instantly uploaded to your GitHub repo without any manual steps."
            />
            <FeatureCard
              title="Organized Folders"
              desc="Each problem gets a dedicated folder named with the Question ID and title for easy navigation."
            />
            <FeatureCard
              title="Track Progress"
              desc="View a complete history of all uploaded problems with timestamps and details."
            />
            <FeatureCard
              title="GitHub Integration"
              desc="Securely connect your GitHub account once and LeetSync handles the rest."
            />
            <FeatureCard
              title="Multi-Language Support"
              desc="Supports JavaScript, Python, C++, Java, and more - your code stays organized regardless of language."
            />
            <FeatureCard
              title="Privacy-First"
              desc="Your code is only uploaded to your GitHub repository - nothing is sent elsewhere."
            />
          </motion.div>

          <motion.div className="mt-6 p-6 bg-white rounded-2xl shadow">
            <h3 className="text-lg font-semibold">Why Use LeetSync?</h3>
            <p className="text-slate-600 mt-2">
              Many developers struggle to keep track of their LeetCode
              solutions. Local folders and downloads can quickly become messy.
              LeetSync ensures every accepted solution is backed up, organized,
              and easily accessible on GitHub, saving you time and reducing
              frustration.
            </p>
          </motion.div>

          <motion.div className="mt-6 flex gap-3">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://chrome.google.com/webstore/detail/leet-sync/your-extension-id"
              className="px-4 py-2 bg-slate-900 text-white rounded-md cursor-pointer"
            >
              Get the Extension
            </a>
          </motion.div>
        </section>

        <section className="space-y-6">
          <div className="p-6 bg-white rounded-2xl shadow space-y-4">
            <h3 className="text-lg font-semibold">How It Works</h3>
            <ul className="list-disc pl-5 text-slate-600 space-y-2">
              <li>Accept a problem on LeetCode and submit your solution.</li>
              <li>LeetSync detects your accepted submission automatically.</li>
              <li>
                The solution is uploaded to your GitHub repo in a folder named
                after the problem.
              </li>
              <li>
                All your solutions are safely stored and organized for future
                reference.
              </li>
            </ul>
          </div>

          <footer className="text-sm text-slate-500">
            <div className="flex items-center justify-end">
              <div>
                © {new Date().getFullYear()} LeetSync by Stackbits - Built with
                ❤️
              </div>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}

function FeatureCard({ title, desc }) {
  return (
    <div className="p-4 bg-white rounded-xl shadow-sm">
      <div className="font-semibold text-slate-800">{title}</div>
      <div className="text-sm text-slate-500 mt-1">{desc}</div>
    </div>
  );
}
