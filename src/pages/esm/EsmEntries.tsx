import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteRecord, exportJson, getRecords } from "@/features/esm/store";
import { pushPendingRecords } from "@/features/esm/backend";

const KIND_LABEL: Record<string, string> = {
  primary_screening: "Entry survey (main caregiver)",
  other_screening: "Entry survey (other caregiver)",
  hourly_log: "Hourly entry",
  daily_log: "End-of-day log",
};

/** Everything this participant has recorded, with a JSON export for the team. */
export default function EsmEntries() {
  const [records, setRecords] = useState(getRecords());

  const download = () => {
    const blob = new Blob([exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `esm-survey-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-3 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">My entries</h1>
        <Button variant="outline" size="sm" onClick={download} disabled={!records.length}>
          Export
        </Button>
      </div>

      {!records.length && (
        <p className="text-muted-foreground">Nothing recorded yet. Entries appear here as you add them.</p>
      )}

      {records.map((record) => {
        const answered = Object.values(record.answers).filter(
          (v) => v !== null && v !== "" && !(Array.isArray(v) && v.length === 0),
        ).length;
        return (
          <Card key={record.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
              <div>
                <CardTitle className="text-base">{KIND_LABEL[record.kind] ?? record.kind}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {new Date(record.submittedAt).toLocaleString()}
                  {record.slot ? ` · slot ${record.slot.slice(-2)}:00` : ""}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Delete entry"
                onClick={() => {
                  deleteRecord(record.id);
                  setRecords(getRecords());
                  toast.success("Entry deleted.");
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{answered} answers recorded</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
