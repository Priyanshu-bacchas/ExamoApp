import { Briefcase, Bell } from "lucide-react";

import "./HelpSubscription.css";

const content = {
  jobs: {
    title: "Jobs",
    icon: Briefcase,
    text: "Government job openings and alerts will show up here soon.",
  },
  notifications: {
    title: "Notifications",
    icon: Bell,
    text: "Your exam and account notifications will show up here soon.",
  },
};

function ComingSoon({ page }) {
  const item = content[page] || content.jobs;
  const Icon = item.icon;

  return (
    <div className="hs-coming">
      <span>
        <Icon size={30} />
      </span>

      <h1>{item.title}</h1>
      <p>{item.text}</p>
      <small>Coming soon</small>
    </div>
  );
}

export default ComingSoon;
