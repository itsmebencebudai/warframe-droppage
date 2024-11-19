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

  const sortedData = [...data].map(tableData => ({
    ...tableData,
    results: [...tableData.results].sort((a, b) => {
      if (!sortConfig.key) return 0;
      
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return sortConfig.direction === 'asc' 
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    })
  }));

  // Get all unique column names from the first result set
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
            <TableHead>Table Name</TableHead>
            <TableHead>
              <div className="space-y-4">
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
                </Table>
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((tableData, index) => (
            <TableRow key={`${tableData.table}-${index}`}>
              <TableCell className="font-medium">
                {tableData.table}
              </TableCell>
              <TableCell>
                <Table>
                  <TableBody>
                    {tableData.results.map((result: any, resultIndex: number) => (
                      <TableRow key={`${result.id}-${resultIndex}`} className="hover:bg-muted/50">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};