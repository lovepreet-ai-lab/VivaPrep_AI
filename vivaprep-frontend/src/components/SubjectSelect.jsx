function SubjectSelect({ subject, setSubject }) {
  return (
    <select value={subject} onChange={(e) => setSubject(e.target.value)}>
      <option value="DSA">📊 DSA</option>
<option value="DE">⚡ Digital Electronics</option>
<option value="OOPS">🧱 OOPS</option>
    </select>
  );
}

export default SubjectSelect;
