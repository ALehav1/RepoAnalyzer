import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FileIcon,
  GitBranchIcon,
  CodeIcon,
  ReaderIcon,
} from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Sidebar({ className, ...props }: SidebarProps) {
  const location = useLocation();

  return (
    <div className={cn("pb-12", className)} {...props}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">Navigation</h2>
          <div className="space-y-1">
            <Link
              to="/files"
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                location.pathname === "/files" && "bg-accent"
              )}
            >
              <FileIcon className="mr-2 h-4 w-4" />
              Files
            </Link>
            <Link
              to="/branches"
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                location.pathname === "/branches" && "bg-accent"
              )}
            >
              <GitBranchIcon className="mr-2 h-4 w-4" />
              Branches
            </Link>
            <Link
              to="/patterns"
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                location.pathname === "/patterns" && "bg-accent"
              )}
            >
              <CodeIcon className="mr-2 h-4 w-4" />
              Patterns
            </Link>
            <Link
              to="/documentation"
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                location.pathname === "/documentation" && "bg-accent"
              )}
            >
              <ReaderIcon className="mr-2 h-4 w-4" />
              Documentation
            </Link>
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">Analysis</h2>
          <div className="space-y-1">
            <Link
              to="/analysis/code-quality"
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                location.pathname === "/analysis/code-quality" && "bg-accent"
              )}
            >
              Code Quality
            </Link>
            <Link
              to="/analysis/dependencies"
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                location.pathname === "/analysis/dependencies" && "bg-accent"
              )}
            >
              Dependencies
            </Link>
            <Link
              to="/analysis/security"
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                location.pathname === "/analysis/security" && "bg-accent"
              )}
            >
              Security
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
