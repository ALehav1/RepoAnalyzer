import * as React from "react";
import { useParams } from "react-router-dom";
import { AppShell, Header, Sidebar } from "@/components/layout";
import {
  Card,
  ScrollArea,
  Button,
  Progress,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/common/ui";

interface AnalysisResult {
  pattern: string;
  confidence: number;
  description: string;
  locations: string[];
}

// Mock data - replace with actual API calls
const mockResults: AnalysisResult[] = [
  {
    pattern: "Factory Pattern",
    confidence: 0.95,
    description: "Creates objects without exposing instantiation logic",
    locations: ["src/factory.py", "src/creator.py"],
  },
  {
    pattern: "Singleton Pattern",
    confidence: 0.85,
    description: "Ensures a class has only one instance",
    locations: ["src/database.py"],
  },
];

export function RepositoryAnalysis() {
  const { repoId } = useParams<{ repoId: string }>();
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [results, setResults] = React.useState<AnalysisResult[]>([]);

  React.useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setResults(mockResults);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      setResults(mockResults);
    }, 2000);
  };

  return (
    <AppShell
      header={<Header />}
      sidebar={<Sidebar />}
    >
      <div className="container py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Repository Analysis</h1>
            <p className="text-muted-foreground">
              Analyzing repository: {repoId}
            </p>
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? "Analyzing..." : "Start Analysis"}
          </Button>
        </div>

        {isAnalyzing && (
          <Card className="mt-6">
            <Card.Header>
              <Card.Title>Analysis in Progress</Card.Title>
            </Card.Header>
            <Card.Content>
              <Progress value={45} className="mt-2" />
            </Card.Content>
          </Card>
        )}

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {results.map((result) => (
            <Card key={result.pattern}>
              <Card.Header className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Card.Title>{result.pattern}</Card.Title>
                <Badge variant={result.confidence > 0.9 ? "success" : "warning"}>
                  {Math.round(result.confidence * 100)}% Confidence
                </Badge>
              </Card.Header>
              <Card.Content>
                <p className="text-sm text-muted-foreground">
                  {result.description}
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="link" className="mt-2 h-auto p-0">
                      View {result.locations.length} occurrences
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{result.pattern} Locations</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="max-h-[300px]">
                      <div className="space-y-2">
                        {result.locations.map((location) => (
                          <div
                            key={location}
                            className="rounded-md bg-muted p-2 text-sm"
                          >
                            {location}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </Card.Content>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
