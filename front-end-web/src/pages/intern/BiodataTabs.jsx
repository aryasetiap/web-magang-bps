import React from "react";
import { Tab, TabGroup, TabList, TabPanels, TabPanel } from "@headlessui/react";
import BiodataSection from "./biodata/BiodataSection";
import UploadDocumentsSection from "./biodata/UploadDocumentsSections";
import { UserIcon, ArrowUpOnSquareIcon } from "@heroicons/react/24/outline";

function BiodataTabsPage() {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-bps-blue mb-6">Data Magang</h2>

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
              <UserIcon className="h-6 w-6" />
              Biodata Diri
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
              <ArrowUpOnSquareIcon className="h-6 w-6" />
              Unggah Berkas
            </div>
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <BiodataSection />
          </TabPanel>
          <TabPanel>
            <UploadDocumentsSection />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}

export default BiodataTabsPage;
