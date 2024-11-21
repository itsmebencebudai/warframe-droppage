import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ResultsTable } from "@/components/ResultsTable";
import { loadAllItems, searchItems } from "@/lib/api";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthPopup } from "@/components/AuthPopup";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceType, setSourceType] = useState("all");
  const { toast } = useToast();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['warframeData', searchTerm],
    queryFn: async () => {
      try {
        if (searchTerm) {
          return await searchItems(searchTerm);
        } else {
          return await loadAllItems();
        }
      } catch (err) {
        console.error("Query error:", err);
        throw err;
      }
    },
    retry: false,
  });

  if (error) {
    console.error("Error fetching data:", error);
    toast({
      title: "Error",
      description: "Failed to fetch Warframe data. Please try again later.",
      variant: "destructive",
    });
  }

  const filteredData = data ? data.filter(item => {
    if (sourceType === "all") return true;
    switch (sourceType) {
      case "bountyLevel":
        return item.bountyLevel;
      case "objectiveName":
        return item.objectiveName;
      case "enemyName":
        return item.enemyName;
      case "gameMode":
        return item.gameMode;
      case "relicName":
        return item.relicName;
      default:
        return true;
    }
  }) : [];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <ThemeToggle />
      <AuthPopup />
      
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Warframe Droppage
          </h1>
          <p className="text-muted-foreground text-lg">
            Search for items to find their drop locations
          </p>
        </div>

        <div className="flex gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for items..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={sourceType} onValueChange={setSourceType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="bountyLevel">Bounty Level</SelectItem>
              <SelectItem value="objectiveName">Objective Name</SelectItem>
              <SelectItem value="enemyName">Enemy Name</SelectItem>
              <SelectItem value="gameMode">Game Mode</SelectItem>
              <SelectItem value="relicName">Relic Name</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading data...</p>
          </div>
        )}

        {!isLoading && !error && filteredData && (
          <ResultsTable data={filteredData} />
        )}

        {!isLoading && !error && (!filteredData || filteredData.length === 0) && searchTerm && (
          <div className="text-center py-12 text-muted-foreground">
            No items found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;