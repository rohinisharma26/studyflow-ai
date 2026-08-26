const navItems = [
  { icon: "dashboard", label: "Dashboard", href: "/" },
  { icon: "assignment", label: "Tasks library", href: "/tasks" },
  { icon: "calendar_view_week", label: "Weekly Planner", href: "/planner" },
  { icon: "timer", label: "Focus Timer", href: "/timer" },
  { icon: "smart_toy", label: "AI Assistant", href: "/ai" },
];

export default function Sidebar({ active }: { active: string }) {
  return (
    <nav className="hidden md:flex flex-col py-6 px-4 gap-4 bg-surface w-[240px] h-screen fixed left-0 top-0 border-r border-outline-variant">
      <div className="mb-8 px-4">
        <h1 className="text-lg font-bold text-primary">StudyFlow AI</h1>
        <p className="text-xs text-on-surface-variant mt-1">Academic Excellence</p>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => {
          const linkTag = "a";
          const isActive = active === item.href;
          const classes = isActive
            ? "flex items-center gap-3 bg-primary-fixed text-on-primary-fixed rounded-lg px-4 py-2"
            : "flex items-center gap-3 text-on-surface-variant px-4 py-2 rounded-lg hover:bg-secondary-fixed transition-all";

          return (
            <a key={item.href} href={item.href} className={classes}>
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}