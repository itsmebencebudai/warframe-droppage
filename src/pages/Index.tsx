import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { fetchWarframeData, fetchWarframeDataFromSource } from "@/lib/warframeData";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 10;

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  
  const { data: dropData, isLoading, error } = useQuery({
    queryKey: ['warframeDrops'],
    queryFn: fetchWarframeDataFromSource,
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

  // Pagination logic
  const totalPages = Math.ceil(tableData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = tableData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Warframe Droppage
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
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on new search
            }}
          />
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading drop data...</p>
          </div>
        )}

        {!isLoading && !error && paginatedData.length > 0 && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Drop Chance</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((item, index) => (
                  <TableRow key={`${item.name}-${item.location}-${index}`}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.dropChance.toFixed(2)}%</TableCell>
                    <TableCell>{item.location}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
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