// File: ActivitiesPage.jsx
import React from "react";
import { Tab, TabGroup, TabList, TabPanels, TabPanel } from "@headlessui/react";
import PresenceSection from "./activities/PresenceSection";
import AssignmentSection from "./activities/AssignmentSection";
import LogbookSection from "./activities/LogbookSection";
import {
  DocumentCheckIcon,
  ClockIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function ActivitiesPage() {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-bps-blue mb-6">
        Aktivitas Harian
      </h2>

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
            <PresenceSection />
          </TabPanel>
          <TabPanel>
            <AssignmentSection />
          </TabPanel>
          <TabPanel>
            <LogbookSection />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}

export default ActivitiesPage;
