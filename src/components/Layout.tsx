import React from "react";

interface LayoutProps {
  children?: {
    sidebar: React.ReactNode;
    main: React.ReactNode;
    chat: React.ReactNode;
  };
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function Layout({
  children,
  sidebarCollapsed = true,
  onToggleSidebar,
}: LayoutProps = {}) {
  const {
    sidebar = null,
    main = null,
    chat = null,
  } = children || {};

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Global Header */}
      <header className="glass-panel px-4 py-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h1 className="text-primary font-geist text-lg">SemanticNotes.ai</h1>
          <div className="flex gap-2">
            <span className="glass-panel px-2 py-1 text-xs text-secondary">
              ● WebGPU
            </span>
            <span className="glass-panel px-2 py-1 text-xs text-secondary">
              ● SQLite
            </span>
          </div>
        </div>
      </header>

      {/* 3-Column Grid Layout */}
      <div
        className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden"
        data-testid="grid"
      >
        {/* Sidebar: hidden on mobile, visible on desktop */}
        <aside
          className="hidden lg:block lg:w-[280px]"
          data-testid="sidebar"
        >
          {sidebar}
        </aside>

        {/* Main: full width on mobile, flex-1 on desktop */}
        <main
          className="col-span-full lg:col-span-1 flex-1"
          data-testid="main"
        >
          {main}
        </main>

        {/* Chat: hidden on mobile, visible on desktop */}
        <aside
          className="hidden lg:block lg:w-[320px]"
          data-testid="chat"
        >
          {chat}
        </aside>
      </div>
    </div>
  );
}
