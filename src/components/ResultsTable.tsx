import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ResultsTableProps {
  data: any[];
}

export const ResultsTable = ({ data }: ResultsTableProps) => {
  if (!data || data.length === 0) return null;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Table Name</TableHead>
          <TableHead>Results</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((tableData, index) => (
          <TableRow key={`${tableData.table}-${index}`}>
            <TableCell className="font-medium">{tableData.table}</TableCell>
            <TableCell>
              <Table>
                <TableBody>
                  {tableData.results.map((result: any, resultIndex: number) => (
                    <TableRow key={`${result.id}-${resultIndex}`}>
                      {Object.entries(result).map(([key, value]) => (
                        <TableCell key={key}>{String(value)}</TableCell>
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
  );
};