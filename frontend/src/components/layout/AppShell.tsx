import * as React from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/common/ui";

interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  showSidebar?: boolean;
}

export function AppShell({
  header,
  sidebar,
  children,
  showSidebar = true,
  className,
  ...props
}: AppShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {header && (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {header}
        </header>
      )}
      <div className="flex flex-1">
        {showSidebar && sidebar && (
          <aside className="w-[300px] shrink-0 border-r bg-background">
            <ScrollArea className="h-screen">
              {sidebar}
            </ScrollArea>
          </aside>
        )}
        <main
          className={cn(
            "flex-1 overflow-auto",
            className
          )}
          {...props}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
