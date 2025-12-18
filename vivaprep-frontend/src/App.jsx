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

  /* -------------------- EFFECTS -------------------- */

  useEffect(() => {
    setTopic("");
    setResult(null);
  }, [subject]);

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

    let updatedBookmarks;

    if (exists) {
      updatedBookmarks = bookmarks.filter(
        (b) => !(b.title === title && b.content === content)
      );
    } else {
      updatedBookmarks = [
        {
          title,
          content,
          timestamp: new Date().toLocaleString()
        },
        ...bookmarks
      ];
    }

    setBookmarks(updatedBookmarks);
    localStorage.setItem("bookmarks", JSON.stringify(updatedBookmarks));
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

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const BASE_URL = import.meta.env.VITE_API_URL;
      const endpoint = BASE_URL + SUBJECTS[subject].endpoint;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ topic, mode })
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

        const filteredHistory = history.filter(
          (item) =>
            !(
              item.subject === subject &&
              item.topic === topic &&
              item.mode === mode
            )
        );

        const updatedHistory = [newEntry, ...filteredHistory].slice(0, 8);
        setHistory(updatedHistory);
        localStorage.setItem("history", JSON.stringify(updatedHistory));
      }
    } catch {
      setError("Backend is waking up… please retry in 30 seconds ⏳");
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

      <br /><br />

      <button
        className="generate-btn"
        onClick={generateAnswer}
        disabled={loading}
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

      {/* Empty State */}
      {!loading && !result && !error && (
        <p style={{ marginTop: "30px", opacity: 0.6 }}>
          👆 Select a subject, topic & mode to generate answers
        </p>
      )}

      {result && <div className="section-divider"></div>}

      {/* Results */}
      {!loading && result && (
        <div style={{ marginTop: "30px" }}>
          {result.viva_1_min && (
            <ResultCard
              title="🗣 1-Minute Viva Answer"
              content={result.viva_1_min}
              onCopy={() => copyToClipboard(result.viva_1_min)}
              onBookmark={() =>
                toggleBookmark("🗣 1-Minute Viva Answer", result.viva_1_min)
              }
              isBookmarked={isBookmarked(
                "🗣 1-Minute Viva Answer",
                result.viva_1_min
              )}
            />
          )}

          {result.questions && (
            <ResultCard
              title="❓ Examiner Questions"
              content={result.questions}
              isList
              onCopy={() =>
                copyToClipboard(result.questions.join("\n"))
              }
              onBookmark={() =>
                toggleBookmark(
                  "❓ Examiner Questions",
                  result.questions.join("\n")
                )
              }
              isBookmarked={isBookmarked(
                "❓ Examiner Questions",
                result.questions.join("\n")
              )}
            />
          )}

          {result.hinglish && (
            <ResultCard
              title="🧠 Hinglish Explanation"
              content={result.hinglish}
              onCopy={() => copyToClipboard(result.hinglish)}
              onBookmark={() =>
                toggleBookmark("🧠 Hinglish Explanation", result.hinglish)
              }
              isBookmarked={isBookmarked(
                "🧠 Hinglish Explanation",
                result.hinglish
              )}
            />
          )}

          {result.deep && (
            <ResultCard
              title="🔍 If Examiner Goes Deeper"
              content={result.deep}
              onCopy={() => copyToClipboard(result.deep)}
              onBookmark={() =>
                toggleBookmark("🔍 If Examiner Goes Deeper", result.deep)
              }
              isBookmarked={isBookmarked(
                "🔍 If Examiner Goes Deeper",
                result.deep
              )}
            />
          )}

          {result.exam_answer && (
            <ResultCard
              title="📝 Exam Answer"
              content={result.exam_answer}
              onCopy={() => copyToClipboard(result.exam_answer)}
              onBookmark={() =>
                toggleBookmark("📝 Exam Answer", result.exam_answer)
              }
              isBookmarked={isBookmarked(
                "📝 Exam Answer",
                result.exam_answer
              )}
            />
          )}
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
