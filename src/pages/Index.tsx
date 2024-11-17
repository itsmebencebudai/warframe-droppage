import { useQuery } from "@tanstack/react-query";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { fetchWarframeData } from "@/lib/warframeData";
import { useState } from "react";
import { Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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

  // Filter items based on search term
  const filteredLocations = Object.entries(dropData || {}).reduce((acc, [location, items]) => {
    const filteredItems = items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filteredItems.length > 0) {
      acc[location] = filteredItems;
    }
    return acc;
  }, {} as Record<string, { name: string; dropChance: number; }[]>);

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

        {!isLoading && !error && (
          <Accordion type="single" collapsible className="space-y-4">
            {Object.entries(filteredLocations).map(([location, items]) => (
              <AccordionItem
                key={location}
                value={location}
                className="border rounded-lg overflow-hidden"
              >
                <AccordionTrigger className="px-4 py-3 hover:bg-muted/5">
                  <span>{location}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="px-4 py-2 space-y-2">
                    {items.map((item, index) => (
                      <div
                        key={`${item.name}-${index}`}
                        className="flex justify-between items-center py-2 border-b last:border-0"
                      >
                        <span>{item.name}</span>
                        <span className="text-primary">
                          {item.dropChance.toFixed(2)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
};

export default Index;