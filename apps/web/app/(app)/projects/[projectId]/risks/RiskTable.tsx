import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/catalyst/table";
import { Badge } from "@/components/catalyst/badge";
import { RiskListItem } from "./lib";

interface RiskTableProps {
  risks: RiskListItem[];
  projectId: string;
}

function getExposureColor(exposure: number) {
  if (exposure >= 20) return "red";
  if (exposure >= 15) return "orange";
  if (exposure >= 10) return "amber";
  if (exposure >= 5) return "yellow";
  return "green";
}

function formatDate(dateString: string | null) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString();
}

export function RiskTable({ risks, projectId }: RiskTableProps) {
  if (risks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No risks found for this project.
      </div>
    );
  }

  return (
    <Table bleed>
      <TableHead>
        <TableRow>
          <TableHeader>Title</TableHeader>
          <TableHeader>Exposure</TableHeader>
          <TableHeader>Probability</TableHeader>
          <TableHeader>Impact</TableHeader>
          <TableHeader>Next Review</TableHeader>
          <TableHeader>Updated</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {risks.map((risk) => (
          <TableRow key={risk.id}>
            <TableCell>
              <Link 
                href={`/projects/${projectId}/risks/${risk.id}`} 
                className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
              >
                {risk.title}
              </Link>
            </TableCell>
            <TableCell>
              <Badge color={getExposureColor(risk.exposure)}>
                {risk.exposure}
              </Badge>
            </TableCell>
            <TableCell>{risk.probability}</TableCell>
            <TableCell>{risk.impact}</TableCell>
            <TableCell>{formatDate(risk.next_review_date)}</TableCell>
            <TableCell className="text-muted-foreground">
              {new Date(risk.updated_at).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
