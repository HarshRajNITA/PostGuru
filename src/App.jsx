import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLinkedin, faGithub } from "@fortawesome/free-brands-svg-icons";
import "./dark-mode.css";

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${
  import.meta.env.VITE_GEMINI_API_KEY
}`;

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("twitter");
  const [tone, setTone] = useState("professional");
  const [variations, setVariations] = useState("1");
  const [includeThread, setIncludeThread] = useState(false);
  const [includeHashtags, setIncludeHashtags] = useState(false);
  const [includeEmojis, setIncludeEmojis] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPosts, setGeneratedPosts] = useState([]);
  const [error, setError] = useState(null);

  //  Load Theme from LocalStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  //  Toggle Theme
  const toggleTheme = () => {
    const newTheme = !darkMode ? "dark" : "light";
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  //  Generate Prompt
  // const createPrompt = () => {
  //   let prompt = `Generate ${variations} engaging social media post${
  //     variations > 1 ? "s" : ""
  //   } for ${platform} about: ${topic}\n\n`;
  //   prompt += `Tone: ${tone}\n`;
  //   if (includeThread)
  //     prompt += "Format as a thread (multiple connected posts)\n";
  //   if (includeHashtags) prompt += "Include relevant and trending hashtags\n";
  //   if (includeEmojis) prompt += "Include appropriate and engaging emojis\n";
  //   if (platform === "twitter")
  //     prompt += "Keep each post within 280 characters\n";
  //   return prompt;
  // };

  const createPrompt = () => {
  let prompt = `Generate ${variations} engaging text-only social media post${
    variations > 1 ? "s" : ""
  } for ${platform} about: ${topic}\n\n`;

  prompt += `Tone: ${tone}\n`;

  if (includeThread)
    prompt += "Format as a thread (multiple connected posts)\n";

  if (includeHashtags)
    prompt += "Include relevant and trending hashtags\n";

  if (includeEmojis)
    prompt += "Include appropriate and engaging emojis\n";

  if (platform === "twitter")
    prompt += "Keep each post within 280 characters\n";

  if (platform === "instagram")
    prompt += "Do not include any image suggestions or photo descriptions. Only generate caption text.\n";

  return prompt;
};


  //  Generate AI Posts
  const generatePosts = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic for your post");
      return;
    }

    setIsLoading(true);
    setGeneratedPosts([]);
    setError(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: createPrompt() }] }],
        }),
      });

      const data = await response.json();
      console.log("Full API Response:", data);

      if (data.candidates?.length > 0) {
        const content = data.candidates[0].content.parts[0].text;
        console.log("AI Response Content:", content);

        const rawPosts = content
          .split(/\*\*Post \d+:\*\*/g)
          .map((post) => post.trim())
          .filter((post) => post.length > 0);

        const structuredPosts = rawPosts.map((text, index) => ({
          title: `Post ${index + 1}`,
          content: text,
        }));

        setGeneratedPosts(structuredPosts);
      } else {
        throw new Error("No response from API");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Error generating posts. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  //  Copy to Clipboard
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      setError("Failed to copy to clipboard");
      return false;
    }
  };

  return (
    <div className="container min-h-screen p-4 md:p-8">
      {/*  Theme Toggle */}
      <div className="flex justify-end mb-4">
        <label className="relative inline-block w-14 h-8">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={darkMode}
            onChange={toggleTheme}
          />
          <span className="absolute inset-0 bg-slate-300 rounded-full peer-checked:bg-indigo-600 transition-all"></span>
          <span className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full peer-checked:translate-x-6 transition-all"></span>
        </label>
        <span className="ml-2">{darkMode ? "Dark" : "Light"} Mode</span>
      </div>

      <div className="max-w-4xl mx-auto">
        {/*  Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-indigo-500 to-indigo-700 bg-clip-text text-transparent animate-bounce">
            PostGuru
          </h1>
          <p className="mt-2 text-lg opacity-80">
            Craft Your Perfect Post with AI Magic ✨
          </p>
        </header>

        {/*  Input Section */}
        <div className="section card p-6 md:p-10 mb-10 rounded-xl border">
          <p className="font-semibold text-lg mb-3 ml-2">
            What's on your mind?
          </p>
          <textarea
            placeholder="Enter your topic or idea."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full min-h-[120px] p-4 mb-6 rounded-xl border-2 border-black dark:border-white bg-white/90 dark:bg-slate-700 text-slate-800 dark:text-white placeholder:text-slate-400"
          />

          {/*  Dropdowns */}
          <div className="grid gap-6 md:grid-cols-3 mb-6">
            {[
              {
                label: "Choose Platform",
                value: platform,
                setValue: setPlatform,
                options: ["twitter", "linkedin", "facebook", "instagram"],
              },
              {
                label: "Select Tone",
                value: tone,
                setValue: setTone,
                options: ["professional", "casual", "friendly", "humorous"],
              },
              {
                label: "Post Variations",
                value: variations,
                setValue: setVariations,
                options: ["1", "2", "3"],
              },
            ].map(({ label, value, setValue, options }) => (
              <div
                key={label}
                className="flex flex-col gap-2 p-4 border rounded-xl"
              >
                <label className="font-semibold text-sm">{label}</label>
                <select
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="rounded-lg p-2 border border-black dark:border-slate-600 bg-white dark:bg-slate-800 text-black dark:text-white"
                >
                  {options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/*  Toggles */}
          <div className="grid md:grid-cols-3 gap-4 p-6 border rounded-xl">
            {[
              {
                label: "Create Thread",
                value: includeThread,
                setValue: setIncludeThread,
              },
              {
                label: "Add Hashtags",
                value: includeHashtags,
                setValue: setIncludeHashtags,
              },
              {
                label: "Add Emojis",
                value: includeEmojis,
                setValue: setIncludeEmojis,
              },
            ].map((opt) => (
              <div
                key={opt.label}
                className="flex justify-between items-center"
              >
                <label className="text-sm font-medium">{opt.label}</label>
                <label className="relative inline-block w-14 h-8">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={opt.value}
                    onChange={() => opt.setValue(!opt.value)}
                  />
                  <span className="absolute inset-0 bg-slate-300 rounded-full peer-checked:bg-indigo-600 transition-all"></span>
                  <span className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full peer-checked:translate-x-6 transition-all"></span>
                </label>
              </div>
            ))}
          </div>

          <button
            onClick={generatePosts}
            disabled={isLoading}
            className="mt-6 w-full py-3 px-6 rounded-xl font-semibold bg-indigo-600 text-white hover:shadow-lg transition"
          >
            ✨ Generate Magic Posts
          </button>
        </div>

        {/*  Output Section */}
        <div className="output card p-6 md:p-10 rounded-xl">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 text-indigo-500 font-semibold">
              <span>Crafting your perfect posts...</span>
              <span className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
            </div>
          )}

          {error && (
            <div className="text-red-600 bg-red-100 p-4 rounded-xl border mt-4">
              {error}
            </div>
          )}

          {generatedPosts.map((post, index) => (
            <div
              key={index}
              className="card p-4 border rounded-xl my-4 hover:-translate-y-1 transition"
            >
              <h2 className="font-semibold text-indigo-600 mb-2">
                {post.title}
              </h2>
              <p className="mb-2 leading-relaxed">{post.content}</p>
              <button
                onClick={async () => {
                  const success = await copyToClipboard(post.content);
                  if (success) alert("Copied to clipboard!");
                }}
                className="text-sm border border-indigo-500 px-4 py-2 rounded-md hover:bg-indigo-500 hover:text-white transition"
              >
                Copy
              </button>
            </div>
          ))}
        </div>

        {/* ℹ️ About Section */}
        <section className="mb-10 mt-16 text-center px-4 md:px-0">
          <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
            About PostGuru
          </h2>
          <p className="text-base text-slate-700 dark:text-slate-500 max-w-3xl mx-auto leading-relaxed">
            <strong>PostGuru</strong> is your intelligent assistant for
            crafting professional, engaging, and personalized social media
            posts. Just enter a topic, choose the tone and platform — and let
            the AI do the magic! Whether you want to post on Twitter, LinkedIn,
            or Instagram, PostGen AI generates high-quality content in seconds.
          </p>
        </section>

        {/*  Footer */}
        <footer className="mt-12 text-center pt-6 border-t">
          <p className="text-sm text-slate-500">
            Developed by <strong>Harsh Raj</strong>
          </p>
          <div className="flex justify-center gap-4 mt-3 text-xl text-slate-500">
            <a
              href="https://www.linkedin.com/in/harsh-raj-78a3a414b/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FontAwesomeIcon icon={faLinkedin} />
            </a>
            <a
              href="https://github.com/HarshRajNITA"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FontAwesomeIcon icon={faGithub} />
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
