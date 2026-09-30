function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="section-header">
      <div>
        <h2>{title}</h2>

        {subtitle && <p>{subtitle}</p>}
      </div>

      {action && (
        <button className="text-button">
          {action}
        </button>
      )}
    </div>
  );
}

export default SectionHeader;