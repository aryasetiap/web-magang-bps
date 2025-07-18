import React from "react";
import { Tab, TabGroup, TabList, TabPanels, TabPanel } from "@headlessui/react";
import PresencesRecap from "./management-activities/PresencesRecap";
import LogbookList from "./management-activities/LogbookList";
import AdminAssignmentsPage from "./management-activities/AdminAssignments";
import {
  BookOpenIcon,
  ClockIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/outline";

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

      <TabGroup>
        <TabList className="flex space-x-4 border-b border-gray-200 mb-6">
          <Tab
            className={({ selected }) =>
              `w-full p-4 text-md font-medium leading-5 text-bps-blue
      ${
        selected
          ? "border-b-2 border-bps-blue"
          : "hover:bg-white/[0.12] hover:text-blue-900"
      }`
            }
          >
            <div className="flex items-center gap-2">
              <DocumentCheckIcon className="h-8 w-8 text-bps-blue" />
              Presensi
            </div>
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full p-4 text-md font-medium leading-5 text-bps-blue
      ${
        selected
          ? "border-b-2 border-bps-blue"
          : "hover:bg-white/[0.12] hover:text-blue-900"
      }`
            }
          >
            <div className="flex items-center gap-2">
              <ClockIcon className="h-7 w-7 text-bps-blue" />
              Aktivitas
            </div>
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full p-4 text-md font-medium leading-5 text-bps-blue
      ${
        selected
          ? "border-b-2 border-bps-blue"
          : "hover:bg-white/[0.12] hover:text-blue-900"
      }`
            }
          >
            <div className="flex items-center gap-2">
              <BookOpenIcon className="h-7 w-7" />
              Logbook
            </div>
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <PresencesRecap />
          </TabPanel>
          <TabPanel>
            <AdminAssignmentsPage />
          </TabPanel>
          <TabPanel>
            <LogbookList />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}

export default AdminMonitoringPage;
