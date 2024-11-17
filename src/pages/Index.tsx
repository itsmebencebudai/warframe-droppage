import { useQuery } from "@tanstack/react-query";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { fetchWarframeData } from "@/lib/warframeData";
import { useState, useEffect } from "react";
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

  // Show error toast when fetch fails using useEffect
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch Warframe drop data. Please try again later.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Filter locations based on search term
  const filteredLocations = Object.entries(dropData || {}).filter(([location]) =>
    location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-warframe-accent">
            Warframe Drop Locations
          </h1>
          <p className="text-warframe-light/80 text-lg">
            Explore drop locations and chances for all items
          </p>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-warframe-light/50" />
          <Input
            type="text"
            placeholder="Search locations..."
            className="pl-10 bg-warframe-dark/50 border-warframe-light/20 text-warframe-light placeholder:text-warframe-light/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-warframe-accent mx-auto"></div>
            <p className="mt-4 text-warframe-light/80">Loading drop data...</p>
          </div>
        )}

        {!isLoading && !error && (
          <Accordion type="single" collapsible className="space-y-4">
            {filteredLocations.map(([location, items]) => (
              <AccordionItem
                key={location}
                value={location}
                className="border border-warframe-light/20 rounded-lg overflow-hidden"
              >
                <AccordionTrigger className="px-4 py-3 hover:bg-warframe-light/5 text-left">
                  <span className="text-warframe-accent">{location}</span>
                </AccordionTrigger>
                <AccordionContent className="dropdown-content">
                  <div className="px-4 py-2 space-y-2">
                    {items.map((item, index) => (
                      <div
                        key={`${item.name}-${index}`}
                        className="flex justify-between items-center py-2 border-b border-warframe-light/10 last:border-0"
                      >
                        <span className="text-warframe-light/90">{item.name}</span>
                        <span className="text-warframe-accent">
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