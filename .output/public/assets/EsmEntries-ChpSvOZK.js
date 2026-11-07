var e=`import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteRecord, exportJson, getRecords } from "@/features/esm/store";
import { pushPendingRecords } from "@/features/esm/backend";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { isChineseLanguage, uiText } from "@/features/esm/i18n";

const KIND_LABEL: Record<string, string> = {
  primary_screening: "Entry survey (main caregiver)",
  other_screening: "Entry survey (other caregiver)",
  hourly_log: "Hourly entry",
  daily_log: "End-of-day log",
};

/** Everything this participant has recorded, with a JSON export for the team. */
export default function EsmEntries() {
  const [records, setRecords] = useState(getRecords());
  const { i18n } = useTranslation();
  const zh = isChineseLanguage(i18n.language);

  const download = () => {
    const blob = new Blob([exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = \`esm-survey-\${new Date().toISOString().slice(0, 10)}.json\`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-3 px-4 py-6">
      <div className="flex items-center justify-between gap-2">
         <h1 className="text-2xl font-semibold text-foreground">{uiText(zh, "My entries", "我的记录")}</h1>
        <div className="flex gap-2">
          {records.some((r) => !r.synced) && (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const { sent, failed } = await pushPendingRecords(getRecords());
                setRecords(getRecords());
                 if (failed) toast.warning(uiText(zh, \`\${sent} uploaded, \${failed} still waiting.\`, \`已上传 \${sent} 条，仍有 \${failed} 条等待上传。\`));
                 else toast.success(uiText(zh, \`\${sent} entr\${sent === 1 ? "y" : "ies"} uploaded.\`, \`已上传 \${sent} 条记录。\`));
              }}
            >
               {uiText(zh, "Upload", "上传")}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={download} disabled={!records.length}>
             {uiText(zh, "Export", "导出")}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="hourly" className="pt-2">
        <TabsList className="grid w-full grid-cols-2">
           <TabsTrigger value="hourly">{uiText(zh, "Hourly care events", "每小时照护事件")}</TabsTrigger>
           <TabsTrigger value="daily">{uiText(zh, "Daily care summaries", "每日照护总结")}</TabsTrigger>
        </TabsList>
        <TabsContent value="hourly" className="mt-4 space-y-3">
          <RecordList records={records.filter((record) => record.kind === "hourly_log")} onDelete={() => setRecords(getRecords())} />
        </TabsContent>
        <TabsContent value="daily" className="mt-4 space-y-3">
          <RecordList records={records.filter((record) => record.kind === "daily_log")} onDelete={() => setRecords(getRecords())} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RecordList({ records, onDelete }: { records: ReturnType<typeof getRecords>; onDelete: () => void }) {
  const { i18n } = useTranslation();
  const zh = isChineseLanguage(i18n.language);
  if (!records.length) return <p className="text-muted-foreground">{uiText(zh, "Nothing recorded yet.", "目前还没有记录。")}</p>;
  return (
    <>
      {records.map((record) => {
        const answered = Object.values(record.answers).filter(
          (v) => v !== null && v !== "" && !(Array.isArray(v) && v.length === 0),
        ).length;
        return (
          <Card key={record.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
              <div>
                 <CardTitle className="text-base">{zh ? ({ primary_screening: "主要护理者初始问卷", other_screening: "协助护理者初始问卷", hourly_log: "每小时照护事件", daily_log: "每日照护总结" }[record.kind] ?? "研究记录") : (KIND_LABEL[record.kind] ?? "Study entry")}</CardTitle>
                <p className="text-xs text-muted-foreground">
                   {new Date(record.submittedAt).toLocaleString(zh ? "zh-CN" : "en")}
                   {record.slot ? \` · \${record.slot.slice(-2)}:00\` : ""}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                 aria-label={uiText(zh, "Delete entry", "删除记录")}
                onClick={() => {
                  deleteRecord(record.id);
                   onDelete();
                   toast.success(uiText(zh, "Entry deleted.", "记录已删除。"));
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                 {uiText(zh, \`\${answered} answers recorded\`, \`已记录 \${answered} 个回答\`)} · {record.synced ? uiText(zh, "sent to the study", "已发送给研究团队") : uiText(zh, "on this device only", "仅保存在本设备")}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </>
  );
}
`;export{e as default};