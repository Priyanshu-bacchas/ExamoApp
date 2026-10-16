import { apiGet, apiPost, apiPut, apiDelete } from "./api";

const normalizeTime = (time) => {
if (!time) return null;

// HTML <input type="time"> gives "HH:mm"
// ASP.NET TimeOnly accepts "HH:mm:ss"
if (time.length === 5) {
return `${time}:00`;
}

return time;
};

// Lecture optional hai: khali ("") ho to null bhejo,
// warna backend int? me "" convert nahi kar pata aur validation error aata hai
const normalizeLecture = (lecture) => {
if (lecture === "" || lecture === null || lecture === undefined) {
return null;
}

const number = Number(lecture);

return Number.isNaN(number) ? null : number;
};

const normalizeScheduleData = (data) => ({
...data,
startTime: normalizeTime(data.startTime),
endTime: normalizeTime(data.endTime),
lecture: normalizeLecture(data.lecture),
});

export const getSchedules = () =>
apiGet("/Schedules");

export const getScheduleById = (id) =>
apiGet(`/Schedules/${id}`);

export const createSchedule = (data) =>
apiPost("/Schedules", normalizeScheduleData(data));

export const updateSchedule = (id, data) =>
apiPut(`/Schedules/${id}`, normalizeScheduleData(data));

export const deleteSchedule = (id) =>
apiDelete(`/Schedules/${id}`);