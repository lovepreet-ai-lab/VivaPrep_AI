function BookmarksPanel({ bookmarks, onCopy, onRemove, onClear }) {
  if (bookmarks.length === 0) return null;

  return (
    <div className="card" style={{ marginTop: "40px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <h3>⭐ Bookmarked Answers</h3>

        <button
          onClick={onClear}
          style={{ background: "#7f1d1d" }}
        >
          🗑 Clear All
        </button>
      </div>

      {bookmarks.map((item, index) => (
        <div
          key={index}
          style={{
            marginTop: "15px",
            paddingTop: "10px",
            borderTop: "1px solid #e5e7eb"
          }}
        >
          <strong>{item.title}</strong>

          <p style={{ opacity: 0.85, marginTop: "5px" }}>
            {item.content}
          </p>

          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => onCopy(item.content)}>
              📋 Copy
            </button>

            <button
              onClick={() =>
                onRemove(item.title, item.content)
              }
              style={{ background: "#991b1b" }}
            >
              ❌ Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default BookmarksPanel;
