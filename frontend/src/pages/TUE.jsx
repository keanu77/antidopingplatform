import TopicTabs from "../components/TopicTabs";
import useTopicTab from "../utils/useTopicTab";
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
  const [activeTab, setActiveTab] = useTopicTab(TABS.map((tab) => tab.id), "basic");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">治療用途豁免 (TUE) 專區</h1>
        <p className="text-gray-600">了解TUE申請流程、獲取專業指引，確保合規用藥</p>
      </div>

      <TopicTabs tabs={TABS} active={activeTab} onChange={setActiveTab} prefix="tue" label="TUE 主題" />

      {TABS.map(({ id, Panel }) => <div key={id} role="tabpanel" id={`tue-panel-${id}`} aria-labelledby={`tue-tab-${id}`} tabIndex={0} hidden={activeTab !== id}>
        {activeTab === id && <Panel />}
      </div>)}
    </div>
  );
}

export default TUE;
