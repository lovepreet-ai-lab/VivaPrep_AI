function ResultCard({
  title,
  content,
  onCopy,
  onBookmark,
  isBookmarked,
  isList
}) {
  return (
    <div className="card">
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px"
        }}
      >
        <h3 style={{ margin: 0 }}>{title}</h3>

        <div style={{ display: "flex", gap: "8px" }}>
          {/* Copy button (only if allowed) */}
          {onCopy && (
            <button onClick={onCopy}>
              📋 Copy
            </button>
          )}

          {/* Bookmark button (only if allowed) */}
          {onBookmark && (
            <button onClick={onBookmark}>
              {isBookmarked ? "⭐ Saved" : "☆ Save"}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {isList ? (
        <ul style={{ marginTop: "10px" }}>
          {content.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ) : (
        <p style={{ marginTop: "10px" }}>{content}</p>
      )}
    </div>
  );
}

export default ResultCard;
