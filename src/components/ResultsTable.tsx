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
import { ArrowUpDown, ArrowDown } from "lucide-react";
import { SourceCell } from "./table/SourceCell";
import { 
  getRotationValue, 
  getRarityValue, 
  removeCommasAndNumbers, 
  removeBountLevelAndPlanet 
} from "./table/SortUtils";

interface ResultsTableProps {
  data: any[];
}

export const ResultsTable = ({ data }: ResultsTableProps) => {
  const [sortColumn, setSortColumn] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [displayLimit, setDisplayLimit] = useState(50);

  if (!data || data.length === 0) return null;

  const handleSort = (column: string) => {
    setSortColumn(column);
    setSortOrder((prevOrder) => prevOrder === 'asc' ? 'desc' : 'asc');
  };

  // Flatten all results into a single array
  const allResults = data.flatMap(tableData => tableData.results);
  let sortedResults = [...allResults];

  if (sortColumn) {
    sortedResults.sort((a, b) => {
      const valA = a[sortColumn] || '';
      const valB = b[sortColumn] || '';

      switch (sortColumn) {
        case 'chance': {
          const chanceA = parseFloat(String(valA).replace('%', '')) || 0;
          const chanceB = parseFloat(String(valB).replace('%', '')) || 0;
          return sortOrder === 'asc' ? chanceA - chanceB : chanceB - chanceA;
        }
        case 'rotation': {
          const rotationA = getRotationValue(valA);
          const rotationB = getRotationValue(valB);
          return sortOrder === 'asc' ? rotationA - rotationB : rotationB - rotationA;
        }
        case 'rarity': {
          const rarityA = getRarityValue(valA);
          const rarityB = getRarityValue(valB);
          return sortOrder === 'asc' ? rarityA - rarityB : rarityB - rarityA;
        }
        case 'source': {
          const sourceA = removeBountLevelAndPlanet(valA);
          const sourceB = removeBountLevelAndPlanet(valB);
          if (sourceA < sourceB) return sortOrder === 'asc' ? -1 : 1;
          if (sourceA > sourceB) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        }
        case 'itemName': {
          const itemNameA = removeCommasAndNumbers(valA);
          const itemNameB = removeCommasAndNumbers(valB);
          if (itemNameA < itemNameB) return sortOrder === 'asc' ? -1 : 1;
          if (itemNameA > itemNameB) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        }
        default: {
          if (typeof valA === 'number' && typeof valB === 'number') {
            return sortOrder === 'asc' ? valA - valB : valB - valA;
          }
          return sortOrder === 'asc' ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
        }
      }
    });
  }

  const getColumnHeaders = () => {
    if (data[0]?.results?.[0]) {
      return Object.keys(data[0].results[0])
        .filter(key => !['tablename', 'id', 'isEvent'].includes(key));
    }
    return [];
  };

  const columnHeaders = getColumnHeaders();
  const limitedResults = sortedResults.slice(0, displayLimit);
  const hasMoreResults = sortedResults.length > displayLimit;

  return (
    <div className="space-y-4">
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
            {limitedResults.map((result: any, resultIndex: number) => (
              <TableRow key={`result-${resultIndex}`} className="hover:bg-muted/50">
                {columnHeaders.map((header) => (
                  <TableCell key={header}>
                    {header === 'source' ? (
                      <SourceCell item={result} />
                    ) : header === 'chance' ? (
                      `${result[header]}%`
                    ) : (
                      result[header]
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {hasMoreResults && (
        <div className="flex justify-center">
          <Button
            onClick={() => setDisplayLimit(prev => prev + 50)}
            className="flex items-center gap-2"
          >
            Load More
            <ArrowDown className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};