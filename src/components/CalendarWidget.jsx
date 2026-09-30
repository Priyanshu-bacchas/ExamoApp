import { ChevronLeft, ChevronRight } from "lucide-react";

function CalendarWidget() {
  const days = [
    "",
    "",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "21",
    "22",
    "23",
    "24",
    "25",
    "26",
    "27",
    "28",
    "29",
    "30",
  ];

  return (
    <div className="calendar-card">
      <div className="calendar-heading">
        <h3>Study Calendar</h3>

        <div className="calendar-controls">
          <button>
            <ChevronLeft size={16} />
          </button>

          <strong>September 2026</strong>

          <button>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="calendar-weekdays">
        <span>S</span>
        <span>M</span>
        <span>T</span>
        <span>W</span>
        <span>T</span>
        <span>F</span>
        <span>S</span>
      </div>

      <div className="calendar-grid">
        {days.map((day, index) => (
          <div
            key={index}
            className={`calendar-day ${
              day === "28" ? "today" : ""
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-footer">
        <span className="calendar-dot" />
        <span>Study session</span>
      </div>
    </div>
  );
}

export default CalendarWidget;