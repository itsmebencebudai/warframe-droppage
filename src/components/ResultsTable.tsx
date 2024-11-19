import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

interface ResultsTableProps {
  data: any[];
}

export const ResultsTable = ({ data }: ResultsTableProps) => {
  const [sortConfig, setSortConfig] = useState({
    key: '',
    direction: 'asc'
  });

  if (!data || data.length === 0) return null;

  const handleSort = (key: string) => {
    setSortConfig((prevSort) => ({
      key,
      direction: prevSort.key === key && prevSort.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Flatten all results into a single array
  const allResults = data.flatMap(tableData => tableData.results);

  const sortedResults = [...allResults].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return sortConfig.direction === 'asc' 
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  // Get all unique column names from the first result
  const getColumnHeaders = () => {
    if (data[0]?.results?.[0]) {
      return Object.keys(data[0].results[0]);
    }
    return [];
  };

  const columnHeaders = getColumnHeaders();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columnHeaders.map((header) => (
              <TableHead key={header}>
                <Button
                  variant="ghost"
                  onClick={() => handleSort(header)}
                  className="flex items-center gap-2"
                >
                  {header.charAt(0).toUpperCase() + header.slice(1)}
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedResults.map((result: any, resultIndex: number) => (
            <TableRow key={`result-${resultIndex}`} className="hover:bg-muted/50">
              {columnHeaders.map((header) => (
                <TableCell key={header}>
                  {typeof result[header] === 'number' 
                    ? Number(result[header]).toFixed(2)
                    : result[header]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};