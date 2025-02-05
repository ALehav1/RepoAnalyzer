import * as React from "react";
import { Link } from "react-router-dom";
import { GitHubLogoIcon, MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/common/ui";
import { useTheme } from "@/hooks/useTheme";

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="container flex h-14 items-center">
      <div className="mr-4 flex">
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <GitHubLogoIcon className="h-6 w-6" />
          <span className="hidden font-bold sm:inline-block">
            Repository Analyzer
          </span>
        </Link>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link
            to="/repositories"
            className="transition-colors hover:text-foreground/80"
          >
            Repositories
          </Link>
          <Link
            to="/analysis"
            className="transition-colors hover:text-foreground/80"
          >
            Analysis
          </Link>
          <Link
            to="/patterns"
            className="transition-colors hover:text-foreground/80"
          >
            Patterns
          </Link>
        </nav>
      </div>
      <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
        <nav className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </nav>
      </div>
    </div>
  );
}
