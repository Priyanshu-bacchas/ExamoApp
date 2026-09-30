import { useEffect, useMemo, useState } from "react";
import {
CalendarDays,
GraduationCap,
BookOpen,
Clock3,
ArrowRight,
ClipboardList,
} from "lucide-react";

import { getExams } from "../services/examService";
import { getExamForms } from "../services/examFormService";
import { getSubjects } from "../services/subjectService";
import { getSchedules } from "../services/scheduleService";

function Dashboard({ onNavigate }) {
const [exams, setExams] = useState([]);
const [examForms, setExamForms] = useState([]);
const [subjects, setSubjects] = useState([]);
const [schedules, setSchedules] = useState([]);

const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const today = new Date();

useEffect(() => {
loadDashboard();
}, []);

async function loadDashboard() {
try {
setLoading(true);
setError("");

  const [
    examsResponse,
    formsResponse,
    subjectsResponse,
    schedulesResponse,
  ] = await Promise.all([
    getExams(),
    getExamForms(),
    getSubjects(),
    getSchedules(),
  ]);

  setExams(normalize(examsResponse));
  setExamForms(normalize(formsResponse));
  setSubjects(normalize(subjectsResponse));
  setSchedules(normalize(schedulesResponse));
} catch (error) {
  console.error(error);

  setError(
    error.message ||
      "Dashboard data load nahi ho saka."
  );
} finally {
  setLoading(false);
}

}

// -----------------------------------------
// UPCOMING EXAMS
// Only exams with Coming Soon status
// -----------------------------------------
const upcomingExams = useMemo(() => {
return [...exams]
.filter(
(exam) =>
exam.status?.toLowerCase() ===
"coming soon"
)
.sort((a, b) => {
if (!a.examDate) return 1;
if (!b.examDate) return -1;

    return (
      new Date(a.examDate) -
      new Date(b.examDate)
    );
  });

}, [exams]);

// -----------------------------------------
// RECENT EXAMS
// Only Completed / Done exams
//
// Logic:
// 1. Completed exams filter
// 2. Bottom ke 4 records
// 3. Bottom -> Top order me show
//
// NO DATE SORTING
// -----------------------------------------
const recentExams = useMemo(() => {
const completedExams = exams.filter(
(exam) => {
const status =
exam.status?.toLowerCase();

    return (
      status === "completed" ||
      status === "done"
    );
  }
);

return completedExams
  .slice(-4)
  .reverse();

}, [exams]);

// -----------------------------------------
// EXAM FORMS
// Only Pending forms
//
// Logic:
// API ke TOP se first 4 Pending forms
// Original API order maintained
// -----------------------------------------
const pendingForms = useMemo(() => {
return examForms
.filter(
(form) =>
form.status?.toLowerCase() ===
"pending"
)
.slice(0, 4);
}, [examForms]);

// -----------------------------------------
// UPCOMING SCHEDULE
// Latest 2 added schedules only
//
// Logic:
// Highest ID = latest added record
// Top 2 highest IDs are shown
//
// NO DATE SORTING
// -----------------------------------------
const upcomingSchedules = useMemo(() => {
return [...schedules]
.sort(
(a, b) =>
Number(b.id) - Number(a.id)
)
.slice(0, 2);
}, [schedules]);

const completedSubjects = subjects.filter(
(subject) =>
subject.status === "Completed"
).length;

if (loading) {
return (
<div className="page">
<div className="loading-state dashboard-loading">
Loading dashboard...
</div>
</div>
);
}

return (
<div className="page">
{/* -------------------------------- /}
{/ DASHBOARD HEADING /}
{/ -------------------------------- */}

  <div className="dashboard-heading">
    <div>
      <p className="eyebrow">
        Examo / Dashboard
      </p>

      <h1>
        Welcome back, Priyanshu 👋
      </h1>

      <p>
        Here's what's happening with your
        preparation today.
      </p>
    </div>
  </div>

  {error && (
    <div className="error-box">
      {error}
    </div>
  )}

  {/* -------------------------------- */}
  {/* STAT CARDS */}
  {/* -------------------------------- */}

  <div className="stats-grid">
    <StatCard
      icon={
        <GraduationCap size={21} />
      }
      title="Upcoming Exams"
      value={upcomingExams.length}
      text="Upcoming"
    />

    <StatCard
      icon={<BookOpen size={21} />}
      title="Subjects"
      value={subjects.length}
      text={`${completedSubjects} completed`}
    />

    <StatCard
      icon={<Clock3 size={21} />}
      title="Study Sessions"
      value={schedules.length}
      text="Total sessions"
    />

    <StatCard
      icon={
        <ClipboardList size={21} />
      }
      title="Exam Forms"
      value={pendingForms.length}
      text="Pending forms"
    />
  </div>

  {/* -------------------------------- */}
  {/* MAIN DASHBOARD GRID */}
  {/* -------------------------------- */}

  <div className="dashboard-grid">

    {/* -------------------------------- */}
    {/* RECENT EXAMS */}
    {/* -------------------------------- */}

    <section className="dashboard-card">
      <div className="card-heading">
        <div>
          <h2>Recent Exams</h2>

          <p>
            Recently completed examinations
          </p>
        </div>

        <button
          className="text-button"
          onClick={() =>
            onNavigate("exams")
          }
        >
          View all
          <ArrowRight size={15} />
        </button>
      </div>

      <div className="exam-list">
        {recentExams.length === 0 ? (
          <EmptyDashboard
            text="No recent exams available."
          />
        ) : (
          recentExams.map((exam) => (
            <div
              className="exam-list-item"
              key={exam.id}
            >
              <div className="list-icon">
                <CalendarDays
                  size={18}
                />
              </div>

              <div className="list-main">
                <strong>
                  {exam.examName}
                </strong>

                <span>
                  {formatDate(
                    exam.examDate
                  )}
                </span>
              </div>

              <span className="small-status">
                Completed
              </span>
            </div>
          ))
        )}
      </div>
    </section>

    {/* -------------------------------- */}
    {/* EXAM FORMS */}
    {/* -------------------------------- */}

    <section className="dashboard-card">
      <div className="card-heading">
        <div>
          <h2>Exam Forms</h2>

          <p>
            Pending registration forms
          </p>
        </div>

        <button
          className="text-button"
          onClick={() =>
            onNavigate("examForms")
          }
        >
          View all
          <ArrowRight size={15} />
        </button>
      </div>

      <div className="form-deadline-list">
        {pendingForms.length === 0 ? (
          <EmptyDashboard
            text="No pending exam forms."
          />
        ) : (
          pendingForms.map((form) => (
            <div
              className="deadline-item"
              key={form.id}
            >
              <div>
                <strong>
                  {form.examName}
                </strong>

                <span>
                  Closes{" "}
                  {formatDate(
                    form.registerEndDate
                  )}
                </span>
              </div>

              <span className="status-badge status-pending">
                Pending
              </span>
            </div>
          ))
        )}
      </div>
    </section>

    {/* -------------------------------- */}
    {/* STUDY CALENDAR */}
    {/* -------------------------------- */}

    <section className="dashboard-card">
      <div className="card-heading">
        <div>
          <h2>Study Calendar</h2>

          <p>
            {getMonthName(today)}
          </p>
        </div>

        <CalendarDays size={21} />
      </div>

      <Calendar
        schedules={schedules}
      />
    </section>

    {/* -------------------------------- */}
    {/* UPCOMING SCHEDULE */}
    {/* -------------------------------- */}

    <section className="dashboard-card schedule-card">
      <div className="card-heading">
        <div>
          <h2>Upcoming Schedule</h2>

          <p>Your study plan</p>
        </div>

        <button
          className="text-button"
          onClick={() =>
            onNavigate("schedules")
          }
        >
          View all
          <ArrowRight size={15} />
        </button>
      </div>

      <div className="schedule-list">
        {upcomingSchedules.length ===
        0 ? (
          <EmptyDashboard
            text="No schedules available."
          />
        ) : (
          upcomingSchedules.map(
            (schedule) => (
              <div
                className="schedule-item"
                key={schedule.id}
              >
                <div className="schedule-date">
                  {formatShortDate(
                    schedule.scheduleDate
                  )}
                </div>

                <div>
                  <strong>
                    {schedule.subject}
                  </strong>

                  <span>
                    {schedule.startTime}{" "}
                    -{" "}
                    {schedule.endTime ||
                      "--"}
                  </span>
                </div>
              </div>
            )
          )
        )}
      </div>
    </section>
  </div>

  {/* -------------------------------- */}
  {/* QUICK ACTIONS */}
  {/* -------------------------------- */}

  <section className="quick-actions-card">
    <div>
      <h2>Quick Actions</h2>

      <p>
        Quickly manage your student data
      </p>
    </div>

    <div className="quick-actions">
      <button
        onClick={() =>
          onNavigate("students")
        }
      >
        <UsersIcon />
        Add Student
      </button>

      <button
        onClick={() =>
          onNavigate("exams")
        }
      >
        <GraduationCap size={17} />
        Add Exam
      </button>

      <button
        onClick={() =>
          onNavigate("subjects")
        }
      >
        <BookOpen size={17} />
        Add Subject
      </button>

      <button
        onClick={() =>
          onNavigate("schedules")
        }
      >
        <CalendarDays size={17} />
        Add Schedule
      </button>
    </div>
  </section>
</div>

);
}

/* ========================================= /
/ STAT CARD /
/ ========================================= */

function StatCard({
icon,
title,
value,
text,
}) {
return (
<div className="stat-card">
<div className="stat-icon">
{icon}
</div>

  <div>
    <span>{title}</span>

    <strong>{value}</strong>

    <small>{text}</small>
  </div>
</div>

);
}

/* ========================================= /
/ CALENDAR /
/ ========================================= */

function Calendar({ schedules }) {
const today = new Date();

const year = today.getFullYear();
const month = today.getMonth();

const firstDay = new Date(
year,
month,
1
).getDay();

const daysInMonth = new Date(
year,
month + 1,
0
).getDate();

const cells = [];

for (let i = 0; i < firstDay; i++) {
cells.push(null);
}

for (
let day = 1;
day <= daysInMonth;
day++
) {
cells.push(day);
}

const scheduledDays = schedules
.filter((item) => {
if (!item.scheduleDate) {
return false;
}

  const date = new Date(
    item.scheduleDate
  );

  return (
    date.getFullYear() === year &&
    date.getMonth() === month
  );
})
.map((item) =>
  new Date(
    item.scheduleDate
  ).getDate()
);

return (
<div className="calendar">
<div className="calendar-weekdays">
{[
"S",
"M",
"T",
"W",
"T",
"F",
"S",
].map((day, index) => (
<span key={index}>
{day}
</span>
))}
</div>

  <div className="calendar-days">
    {cells.map((day, index) => (
      <div
        key={index}
        className={`calendar-day ${
          day === today.getDate()
            ? "today"
            : ""
        } ${
          day &&
          scheduledDays.includes(day)
            ? "has-study"
            : ""
        }`}
      >
        {day}
      </div>
    ))}
  </div>

  <div className="calendar-legend">
    <span></span>
    Study session
  </div>
</div>

);
}

/* ========================================= /
/ EMPTY STATE /
/ ========================================= */

function EmptyDashboard({ text }) {
return (
<div className="dashboard-empty">
{text}
</div>
);
}

/* ========================================= /
/ QUICK ACTION ICON /
/ ========================================= */

function UsersIcon() {
return (
<span className="quick-icon">
+
</span>
);
}

/* ========================================= /
/ HELPERS /
/ ========================================= */

function normalize(response) {
if (Array.isArray(response)) {
return response;
}

return response?.data || [];
}

function formatDate(value) {
if (!value) {
return "-";
}

const date = new Date(value);

if (Number.isNaN(date.getTime())) {
return value;
}

return date.toLocaleDateString(
"en-IN",
{
day: "2-digit",
month: "short",
year: "numeric",
}
);
}

function formatShortDate(value) {
if (!value) {
return "-";
}

const date = new Date(value);

if (Number.isNaN(date.getTime())) {
return value;
}

return date.toLocaleDateString(
"en-IN",
{
day: "2-digit",
month: "short",
}
);
}

function getMonthName(date) {
return date.toLocaleDateString(
"en-IN",
{
month: "long",
year: "numeric",
}
);
}

export default Dashboard;