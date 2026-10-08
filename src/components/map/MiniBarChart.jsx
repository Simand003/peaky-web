import "../../styles/miniBarChart.css";

// A small bar chart made of plain divs.
// labels and values have the same length: one bar per label.
export default function MiniBarChart({ title, labels, values, note }) {
  // At least 1: avoids dividing by zero when every value is 0
  const max = Math.max(...values, 1);

  return (
    <div className="mini-chart">
      <h4>{title}</h4>

      <div className="mini-chart__bars">
        {values.map((value, i) => (
          <div key={labels[i]} className="mini-chart__column">
            <span className="mini-chart__value">{value > 0 ? value : ""}</span>
            <div className="mini-chart__track">
              {/* The height is a percentage of the tallest bar */}
              <div
                className="mini-chart__bar"
                style={{ height: `${(value / max) * 100}%` }}
              />
            </div>
            <span className="mini-chart__label">{labels[i]}</span>
          </div>
        ))}
      </div>

      {note && <p className="mini-chart__note">{note}</p>}
    </div>
  );
}