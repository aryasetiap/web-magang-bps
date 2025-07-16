import React from "react";
import PresencesRecap from "./management-activities/PresencesRecap";
import LogbookList from "./management-activities/LogbookList";

function AdminMonitoringPage() {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-bps-blue mb-6">
        Monitoring Peserta
      </h2>
      <p className="text-gray-700 mb-6">
        Pantau rekapitulasi presensi dan baca logbook harian dari semua peserta
        magang.
      </p>

      <PresencesRecap />
      <LogbookList />
    </div>
  );
}

export default AdminMonitoringPage;
