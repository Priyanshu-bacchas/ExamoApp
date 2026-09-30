import CrudPage from "../components/CrudPage";

import {
getSchedules,
createSchedule,
updateSchedule,
deleteSchedule,
} from "../services/scheduleService";

function Schedules() {
return (
<CrudPage
title="Schedule"
description="Manage your daily study schedule."
emptyMessage="No schedules found."
service={{
get: getSchedules,
create: createSchedule,
update: updateSchedule,
delete: deleteSchedule,
}}
columns={[
{
key: "subject",
label: "Subject",
},
{
key: "scheduleDate",
label: "Date",
type: "date",
},
{
key: "startTime",
label: "Start Time",
},
{
key: "endTime",
label: "End Time",
},
{
key: "lecture",
label: "Lecture",
},
{
key: "description",
label: "Description",
},
]}
fields={[
{
name: "subject",
label: "Subject",
required: true,
},
{
name: "scheduleDate",
label: "Date",
type: "date",
required: true,
},
{
name: "startTime",
label: "Start Time",
type: "time",
required: true,
},
{
name: "endTime",
label: "End Time",
type: "time",
},
{
name: "lecture",
label: "Lecture",
type: "number",
min: 0,
},
{
name: "description",
label: "Description",
type: "textarea",
fullWidth: true,
},
]}
/>
);
}

export default Schedules;
