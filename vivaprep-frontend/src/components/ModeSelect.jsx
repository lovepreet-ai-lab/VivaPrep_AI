function ModeSelect({ mode, setMode }) {
  return (
    <select
      value={mode}
      onChange={(e) => setMode(e.target.value)}
      style={{ marginLeft: "10px" }}
    >
      <option value="viva">Viva</option>
      <option value="1-minute">1 Minute</option>
      <option value="exam">Exam</option>
    </select>
  );
}

export default ModeSelect;
