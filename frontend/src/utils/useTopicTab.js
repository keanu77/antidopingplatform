import { useSearchParams } from "react-router-dom";
export default function useTopicTab(ids, fallback) {
  const [params, setParams] = useSearchParams();
  const active = ids.includes(params.get("tab")) ? params.get("tab") : fallback;
  function select(id) {
    if (ids.includes(id)) setParams({ tab: id });
  }
  return [active, select];
}
