import "../../styles/miniBarChart.css";

// A small bar chart made of plain divs.
// values: one number per bar.
// labels (optional): text centered under each bar, same length as values.
// ticks (optional): text on the boundaries between bars, length = values.length + 1.
export default function MiniBarChart({ title, labels, ticks, values, note }) {
  // At least 1: avoids dividing by zero when every value is 0
  const max = Math.max(...values, 1);

  return (
    <div className="mini-chart">
      <h4>{title}</h4>

      <div className="mini-chart__bars">
        {values.map((value, i) => (
          <div key={i} className="mini-chart__column">
            <span className="mini-chart__value">{value > 0 ? value : ""}</span>
            <div className="mini-chart__track">
              {/* The height is a percentage of the tallest bar */}
              <div
                className="mini-chart__bar"
                style={{ height: `${(value / max) * 100}%` }}
              />
            </div>
            {labels && <span className="mini-chart__label">{labels[i]}</span>}
          </div>
        ))}
      </div>

      {ticks && (
        <div className="mini-chart__ticks">
          {ticks.map((tick, i) => (
            // Boundary i sits at i / (number of bars) of the width
            <span key={i} style={{ left: `${(i / values.length) * 100}%` }}>
              {tick}
            </span>
          ))}
        </div>
      )}

      {note && <p className="mini-chart__note">{note}</p>}
    </div>
  );
}