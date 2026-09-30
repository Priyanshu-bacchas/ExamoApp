function StatusBadge({ status }) {
  const normalized = String(status || "")
    .toLowerCase()
    .replace(/\s+/g, "-");

  return (
    <span className={`status-badge ${normalized}`}>
      {status || "Not Started"}
    </span>
  );
}

export default StatusBadge;