// File: ActivitiesPage.jsx
import React from "react";
import PresenceSection from "./activities/PresenceSection";
import AssignmentSection from "./activities/AssignmentSection";
import LogbookSection from "./activities/LogbookSection";

function ActivitiesPage() {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-bps-blue mb-6">
        Aktivitas Harian
      </h2>
      <PresenceSection />
      <AssignmentSection />
      <LogbookSection />
    </div>
  );
}

export default ActivitiesPage;
