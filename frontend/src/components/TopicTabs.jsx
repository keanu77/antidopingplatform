export default function TopicTabs({ tabs, active, onChange, prefix, label }) {
  function move(event, index) {
    const keys = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index - 1 + tabs.length) % tabs.length, Home: 0, End: tabs.length - 1 };
    if (!Object.hasOwn(keys, event.key)) return;
    event.preventDefault();
    const next = keys[event.key];
    onChange(tabs[next].id);
    document.getElementById(`${prefix}-tab-${tabs[next].id}`)?.focus();
  }
  return <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-lg overflow-x-auto" role="tablist" aria-label={label}>
    {tabs.map(({ id, label: title, icon: Icon }, index) => <button key={id} type="button"
      id={`${prefix}-tab-${id}`} role="tab" aria-selected={active === id}
      aria-controls={`${prefix}-panel-${id}`} tabIndex={active === id ? 0 : -1}
      onKeyDown={(event) => move(event, index)} onClick={() => onChange(id)}
      className={`flex-1 min-w-fit px-4 py-3 rounded-lg font-medium ${active === id ? "bg-white text-primary-700 shadow-sm" : "text-gray-700 hover:bg-white"}`}>
      {Icon && <Icon aria-hidden="true" className="h-4 w-4 mr-2 inline" />}{title}
    </button>)}
  </div>;
}
