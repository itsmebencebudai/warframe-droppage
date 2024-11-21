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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 20;

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['warframeData', searchTerm, currentPage],
    queryFn: async () => {
      try {
        if (searchTerm) {
          return await searchItems(searchTerm, currentPage, ITEMS_PER_PAGE);
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

        <div className="relative flex-1 mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for items..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading data...</p>
          </div>
        )}

        {!isLoading && !error && data && (
          <>
            <ResultsTable data={data} />
            
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  <PaginationItem>
                    <PaginationLink isActive>{currentPage}</PaginationLink>
                  </PaginationItem>
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="cursor-pointer"
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </>
        )}

        {!isLoading && !error && (!data || data.length === 0) && searchTerm && (
          <div className="text-center py-12 text-muted-foreground">
            No items found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;