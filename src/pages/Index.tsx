import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { fetchWarframeData } from "@/lib/warframeData";
import { useState } from "react";
import { Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  
  const { data: dropData, isLoading, error } = useQuery({
    queryKey: ['warframeDrops'],
    queryFn: fetchWarframeData,
    retry: 3,
  });

  if (error) {
    console.error("Error fetching data:", error);
    toast({
      title: "Error",
      description: "Failed to fetch Warframe drop data. Please try again later.",
      variant: "destructive",
    });
  }

  // Transform data for table display
  const tableData = Object.entries(dropData || {}).reduce((acc, [location, items]) => {
    const matchingItems = items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    matchingItems.forEach(item => {
      acc.push({
        name: item.name,
        dropChance: item.dropChance,
        location: location
      });
    });
    
    return acc;
  }, [] as Array<{ name: string; dropChance: number; location: string; }>);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Warframe Item Drops
          </h1>
          <p className="text-muted-foreground text-lg">
            Search for items to find their drop locations
          </p>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for items..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading drop data...</p>
          </div>
        )}

        {!isLoading && !error && tableData.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Drop Chance</TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((item, index) => (
                <TableRow key={`${item.name}-${item.location}-${index}`}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.dropChance.toFixed(2)}%</TableCell>
                  <TableCell>{item.location}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {!isLoading && !error && tableData.length === 0 && searchTerm && (
          <div className="text-center py-12 text-muted-foreground">
            No items found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;