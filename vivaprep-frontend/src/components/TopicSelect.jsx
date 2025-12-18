function TopicSelect({ topic, setTopic, topics }) {
  return (
    <select value={topic} onChange={(e) => setTopic(e.target.value)}>
      <option value="">Select Topic</option>
      {topics.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  );
}

export default TopicSelect;
