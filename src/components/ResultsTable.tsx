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

  if (!data || data.length === 0) return null;

  const handleSort = (column: string) => {
    setSortColumn(column);
    setSortOrder((prevOrder) => prevOrder === 'asc' ? 'desc' : 'asc');
  };

  let sortedResults = [...data];

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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('source')}
                className="flex items-center gap-2"
              >
                Source
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('itemName')}
                className="flex items-center gap-2"
              >
                Item Name
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('chance')}
                className="flex items-center gap-2"
              >
                Chance
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('rotation')}
                className="flex items-center gap-2"
              >
                Rotation
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('rarity')}
                className="flex items-center gap-2"
              >
                Rarity
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedResults.map((item: any, index: number) => (
            <TableRow key={`result-${index}`} className="hover:bg-muted/50">
              <TableCell>
                <SourceCell item={item} />
              </TableCell>
              <TableCell>{item.itemName}</TableCell>
              <TableCell>{item.chance}%</TableCell>
              <TableCell>{item.rotation || '-'}</TableCell>
              <TableCell>{item.rarity || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};