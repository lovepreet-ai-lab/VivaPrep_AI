function ResultCard({ title, content, onCopy, isList = false }) {
  return (
    <div className="card">
      <h3>
        {title}
        <button onClick={onCopy}>📋 Copy</button>
      </h3>

      {isList ? (
        <ul>
          {content.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>{content}</p>
      )}
    </div>
  );
}

export default ResultCard;
