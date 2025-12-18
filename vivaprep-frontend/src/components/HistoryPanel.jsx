function HistoryPanel({ history, onSelect }) {
  if (history.length === 0) return null;

  return (
    <div className="card" style={{ marginTop: "30px" }}>
      <h3>🕘 Recent Topics</h3>

      <ul style={{ paddingLeft: "18px" }}>
        {history.map((item, index) => (
          <li
            key={index}
            style={{
              cursor: "pointer",
              marginBottom: "8px"
            }}
            onClick={() => onSelect(item)}
          >
            <strong>{item.topic}</strong>  
            <span style={{ opacity: 0.6 }}>
              {" "}({item.subject}, {item.mode})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HistoryPanel;
