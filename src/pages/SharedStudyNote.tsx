import { useSearchParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { decodeSharedNote } from "@/lib/shared-note";

/** Public, read-only view of a study note shared by link. The note text travels inside the link itself. */
export default function SharedStudyNote() {
  const [params] = useSearchParams();
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith("zh");
  const note = decodeSharedNote(params.get("d") || "");

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {!note ? (
        <p className="text-center text-muted-foreground">{isZh ? "这个分享链接无效" : "This share link is not valid"}</p>
      ) : (
        <Card className="p-6 space-y-3">
          <p className="text-xs text-muted-foreground">{isZh ? "分享的学习笔记" : "Shared study note"}</p>
          <h1 className="text-2xl font-bold">{note.t}</h1>
          <p className="whitespace-pre-wrap text-foreground">{note.c}</p>
          {note.s && (
            <p className="text-sm text-muted-foreground pt-2 border-t">
              {isZh ? "来自：" : "From: "}
              {note.p ? <Link className="text-primary underline" to={note.p}>{note.s}</Link> : note.s}
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
