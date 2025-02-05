import * as React from "react";
import { Link } from "react-router-dom";
import { AppShell, Header, Sidebar } from "@/components/layout";
import {
  Card,
  Button,
  Input,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/common/ui";
import { DotsVerticalIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";

interface Repository {
  id: string;
  name: string;
  description: string;
  lastAnalyzed: string;
  status: "analyzed" | "pending" | "error";
}

// Mock data - replace with actual API calls
const mockRepositories: Repository[] = [
  {
    id: "1",
    name: "react",
    description: "A JavaScript library for building user interfaces",
    lastAnalyzed: "2025-02-04",
    status: "analyzed",
  },
  {
    id: "2",
    name: "typescript",
    description: "TypeScript is JavaScript with syntax for types",
    lastAnalyzed: "2025-02-03",
    status: "analyzed",
  },
];

export function RepositoryList() {
  const [repositories, setRepositories] = React.useState<Repository[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setRepositories(mockRepositories);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const filteredRepositories = repositories.filter((repo) =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppShell
      header={<Header />}
      sidebar={<Sidebar />}
    >
      <div className="container py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Repositories</h1>
            <p className="text-muted-foreground">
              Manage and analyze your repositories
            </p>
          </div>
          <Button>Add Repository</Button>
        </div>

        <div className="mt-6">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search repositories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="mt-6 grid gap-6">
            {filteredRepositories.map((repo) => (
              <Card key={repo.id}>
                <Card.Header className="flex flex-row items-center justify-between space-y-0">
                  <div className="space-y-1">
                    <Card.Title>{repo.name}</Card.Title>
                    <Card.Description>{repo.description}</Card.Description>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <DotsVerticalIcon className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/repositories/${repo.id}`}>
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/repositories/${repo.id}/analysis`}>
                          View Analysis
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Delete Repository
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Card.Header>
                <Card.Content>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <span className="text-muted-foreground">Last analyzed:</span>
                      <span>{repo.lastAnalyzed}</span>
                    </div>
                  </div>
                </Card.Content>
                <Card.Footer>
                  <div className="flex space-x-2">
                    <Button asChild>
                      <Link to={`/repositories/${repo.id}/analysis`}>
                        View Analysis
                      </Link>
                    </Button>
                    <Button variant="outline">Update</Button>
                  </div>
                </Card.Footer>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
