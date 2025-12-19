import { useState, useEffect } from "react";

import TopicSelect from "./components/TopicSelect";
import ModeSelect from "./components/ModeSelect";
import ResultCard from "./components/ResultCard";
import SkeletonCard from "./components/SkeletonCard";
import SubjectSelect from "./components/SubjectSelect";
import HistoryPanel from "./components/HistoryPanel";
import BookmarksPanel from "./components/BookmarksPanel";

import { SUBJECTS } from "./data/subjects";

function App() {
  /* -------------------- STATE -------------------- */

  const [subject, setSubject] = useState("DSA");

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState("viva");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [history, setHistory] = useState(
    JSON.parse(localStorage.getItem("history")) || []
  );

  const [bookmarks, setBookmarks] = useState(
    JSON.parse(localStorage.getItem("bookmarks")) || []
  );

  const [timeLeft, setTimeLeft] = useState(60);

  /* -------------------- EFFECTS -------------------- */

  // Reset when subject changes
  useEffect(() => {
    setTopic("");
    setResult(null);
  }, [subject]);

  // Exam timer
  useEffect(() => {
    if (mode !== "exam" || !result) return;

    setTimeLeft(60);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, result]);

  /* -------------------- HELPERS -------------------- */

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard ✅");
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
  };

  const isBookmarked = (title, content) =>
    bookmarks.some(
      (b) => b.title === title && b.content === content
    );

  const toggleBookmark = (title, content) => {
    const exists = bookmarks.find(
      (b) => b.title === title && b.content === content
    );

    const updated = exists
      ? bookmarks.filter(
          (b) => !(b.title === title && b.content === content)
        )
      : [
          { title, content, timestamp: new Date().toLocaleString() },
          ...bookmarks
        ];

    setBookmarks(updated);
    localStorage.setItem("bookmarks", JSON.stringify(updated));
  };

  const removeBookmark = (title, content) => {
    const updated = bookmarks.filter(
      (b) => !(b.title === title && b.content === content)
    );
    setBookmarks(updated);
    localStorage.setItem("bookmarks", JSON.stringify(updated));
  };

  const clearBookmarks = () => {
    setBookmarks([]);
    localStorage.removeItem("bookmarks");
  };

  /* -------------------- API CALL -------------------- */

  const generateAnswer = async () => {
    if (!topic) {
      alert("Please select a topic");
      return;
    }

    const BASE_URL = import.meta.env.VITE_API_URL;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const endpoint = BASE_URL + SUBJECTS[subject].endpoint;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, mode, subject })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setResult(data.data);

        const newEntry = {
          subject,
          topic,
          mode,
          timestamp: new Date().toLocaleString()
        };

        const filtered = history.filter(
          (h) =>
            !(
              h.subject === subject &&
              h.topic === topic &&
              h.mode === mode
            )
        );

        const updatedHistory = [newEntry, ...filtered].slice(0, 8);
        setHistory(updatedHistory);
        localStorage.setItem("history", JSON.stringify(updatedHistory));
      }
    } catch (err) {
      console.error(err);
      setError(
        BASE_URL.includes("onrender")
          ? "Backend is waking up… please retry in 30 seconds ⏳"
          : "Local backend not reachable. Is Flask running?"
      );
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- UI -------------------- */

  return (
    <div className={`app-container ${darkMode ? "dark" : ""}`}>
      <h1>📘 VivaPrep AI ({subject})</h1>

      {/* Dark Mode */}
      <button
        onClick={toggleDarkMode}
        style={{
          marginBottom: "20px",
          background: darkMode ? "#374151" : "#111827"
        }}
      >
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>

      {/* Controls */}
      <SubjectSelect subject={subject} setSubject={setSubject} />

      <TopicSelect
        topic={topic}
        setTopic={setTopic}
        topics={SUBJECTS[subject].topics}
      />

      <ModeSelect mode={mode} setMode={setMode} />

      <label style={{ display: "block", marginTop: "10px" }}>
        <input
          type="checkbox"
          checked={mode === "exam"}
          onChange={(e) =>
            setMode(e.target.checked ? "exam" : "viva")
          }
        />{" "}
        🎯 Exam Simulation Mode
      </label>

      <br />

      <button
        className="generate-btn"
        onClick={generateAnswer}
        disabled={loading || (mode === "exam" && timeLeft > 0)}
        style={{
          opacity: loading ? 0.7 : 1,
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "Generating..." : "Generate Answer"}
      </button>

      {/* Error */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Loading */}
      {loading && (
        <div style={{ marginTop: "30px" }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* History */}
      <HistoryPanel
        history={history}
        onSelect={(item) => {
          setSubject(item.subject);
          setTopic(item.topic);
          setMode(item.mode);
          setResult(null);
        }}
      />

      {/* Empty */}
      {!loading && !result && !error && (
        <p style={{ marginTop: "30px", opacity: 0.6 }}>
          👆 Select a subject, topic & mode to generate answers
        </p>
      )}

      {/* Timer */}
      {mode === "exam" && result && (
        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            background: "#7c2d12",
            color: "white",
            borderRadius: "6px"
          }}
        >
          ⏱ Time Left: <strong>{timeLeft}s</strong>
        </div>
      )}

      {/* Results */}
      {!loading && result && (
        <div style={{ marginTop: "30px" }}>
          {Object.entries(result).map(([key, value]) => {
            const titles = {
              viva_1_min: "🗣 1-Minute Viva Answer",
              questions: "❓ Examiner Questions",
              hinglish: "🧠 Hinglish Explanation",
              deep: "🔍 If Examiner Goes Deeper",
              exam_answer: "📝 Exam Answer"
            };

            if (!titles[key]) return null;

            const content =
              Array.isArray(value) ? value.join("\n") : value;

            return (
              <ResultCard
                key={key}
                title={titles[key]}
                content={value}
                isList={Array.isArray(value)}
                onCopy={
                  mode === "exam"
                    ? null
                    : () => copyToClipboard(content)
                }
                onBookmark={
                  mode === "exam"
                    ? null
                    : () =>
                        toggleBookmark(titles[key], content)
                }
                isBookmarked={isBookmarked(titles[key], content)}
              />
            );
          })}
        </div>
      )}

      {/* Bookmarks */}
      <BookmarksPanel
        bookmarks={bookmarks}
        onCopy={copyToClipboard}
        onRemove={removeBookmark}
        onClear={clearBookmarks}
      />

      {/* Footer */}
      <footer
        style={{
          marginTop: "50px",
          padding: "15px",
          fontSize: "14px",
          opacity: 0.7
        }}
      >
        Built with ❤️ by <strong>Lovepreet Singh</strong> • VivaPrep AI v1.0
      </footer>
    </div>
  );
}

export default App;
