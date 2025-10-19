import icon from "../assets/128.png";

export default function Nav() {
  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow z-50">
      <div className="max-w-6xl mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="rounded-md">
              <img
                alt="leetgitter icon"
                src={icon}
                className="w-6 h-6 aspect-square"
              />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold">Leetgitter</h1>
              <p className="text-xs md:text-sm text-slate-500">
                Automatically upload your accepted LeetCode solutions to GitHub
              </p>
            </div>
          </div>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://chromewebstore.google.com/detail/leetgitter/pmabapfgdcdiohadkdllgoepldackklj"
            className="px-4 py-2 bg-slate-900 text-white rounded-md cursor-pointer"
          >
            Get the Extension
          </a>
        </nav>
      </div>
    </header>
  );
}
