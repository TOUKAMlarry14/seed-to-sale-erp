import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { exportToCSV, exportToPDF, flattenForExport } from "@/lib/exportUtils";

interface ExportColumn {
  key: string;
  label: string;
  render?: (row: any) => string;
}

interface ExportButtonsProps {
  data: any[];
  columns: ExportColumn[];
  filename: string;
  title: string;
}

export function ExportButtons({ data, columns, filename, title }: ExportButtonsProps) {
  const handleExport = (format: "csv" | "pdf") => {
    const { data: flatData, columns: flatCols } = flattenForExport(data, columns);
    if (format === "csv") {
      exportToCSV(flatData, flatCols, filename);
    } else {
      exportToPDF(flatData, flatCols, title, filename);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-1" />
          Exporter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleExport("pdf")}>
          <FileText className="h-4 w-4 mr-2" />
          Exporter en PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exporter en CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
