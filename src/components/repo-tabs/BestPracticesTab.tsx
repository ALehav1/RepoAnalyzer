import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Loader2, CheckCircle2, AlertTriangle, XCircle, Share2 } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { CodeBlock } from "../CodeBlock";
import { BestPractice } from "../../types";
import { bestPractices } from "../../lib/api";

interface BestPracticesTabProps {
  repoId: string;
}

export default function BestPracticesTab({ repoId }: BestPracticesTabProps) {
  const [practices, setPractices] = useState<BestPractice[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBestPractices();
  }, [repoId]);

  const fetchBestPractices = async () => {
    try {
      const data = await bestPractices.getForRepo(repoId);
      setPractices(data);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch best practices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMakeGeneralizable = async (practiceId: string) => {
    try {
      const updatedPractice = await bestPractices.makeGeneralizable(practiceId);
      setPractices((prev) =>
        prev.map((p) => (p.id === practiceId ? updatedPractice : p))
      );
      toast({
        title: "Success",
        description: "Practice marked as generalizable",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to mark practice as generalizable",
        variant: "destructive",
      });
    }
  };

  const getSeverityIcon = (severity: string | null) => {
    switch (severity?.toLowerCase()) {
      case "high":
        return <XCircle className="text-destructive w-5 h-5" />;
      case "medium":
        return <AlertTriangle className="text-warning w-5 h-5" />;
      case "low":
        return <CheckCircle2 className="text-success w-5 h-5" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="space-y-4 p-4">
        {practices.map((practice) => (
          <Card key={practice.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    {getSeverityIcon(practice.severity)}
                    {practice.title}
                  </CardTitle>
                  <CardDescription>{practice.description}</CardDescription>
                </div>
                {!practice.is_generalizable && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMakeGeneralizable(practice.id)}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Make Generalizable
                  </Button>
                )}
              </div>
              <div className="flex gap-2 mt-2">
                {practice.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {practice.code && (
                <div className="space-y-2">
                  <h4 className="font-medium">Code Example:</h4>
                  <CodeBlock
                    code={practice.code}
                    language={practice.language || "plaintext"}
                  />
                </div>
              )}
              {practice.explanation && (
                <div className="space-y-2">
                  <h4 className="font-medium">Explanation:</h4>
                  <p className="text-sm text-muted-foreground">{practice.explanation}</p>
                </div>
              )}
              {practice.impact && (
                <div className="space-y-2">
                  <h4 className="font-medium">Impact:</h4>
                  <p className="text-sm text-muted-foreground">{practice.impact}</p>
                </div>
              )}
              {practice.resolution && (
                <div className="space-y-2">
                  <h4 className="font-medium">Resolution:</h4>
                  <p className="text-sm text-muted-foreground">{practice.resolution}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
