import { useState, useEffect } from "react";
import { Info, UserCheck, Stethoscope, Search } from "lucide-react";
import BasicTab from "../components/tue/BasicTab";
import ApplicationTab from "../components/tue/ApplicationTab";
import DiseasesTab from "../components/tue/DiseasesTab";
import ToolsTab from "../components/tue/ToolsTab";

const TABS = [
  { id: "basic", label: "基礎知識", icon: Info, Panel: BasicTab },
  { id: "application", label: "申請指引", icon: UserCheck, Panel: ApplicationTab },
  { id: "diseases", label: "疾病分類", icon: Stethoscope, Panel: DiseasesTab },
  { id: "tools", label: "實用工具", icon: Search, Panel: ToolsTab },
];

function TUE() {
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    document.title = "TUE 治療用途豁免指南 | 乾淨運動從你我開始";
  }, []);

  const { Panel } = TABS.find((t) => t.id === activeTab);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">治療用途豁免 (TUE) 專區</h1>
        <p className="text-gray-600">了解TUE申請流程、獲取專業指引，確保合規用藥</p>
      </div>

      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg overflow-x-auto" role="tablist">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 min-w-fit px-4 py-2 rounded-lg font-medium transition ${
              activeTab === id
                ? "bg-white text-primary-600 shadow"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Icon className="h-4 w-4 mr-2 inline" />
            {label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        <Panel />
      </div>
    </div>
  );
}

export default TUE;
