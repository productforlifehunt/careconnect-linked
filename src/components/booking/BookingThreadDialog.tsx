import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, MessageSquare, Send, Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useOrderNotes, useAddOrderNote, useResolveRefund } from "@/hooks/use-cart";
import { formatDateTime } from "@/lib/locale";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId?: number | string;
  /** "client" hides the approve/decline controls; "provider" shows them. */
  role: "client" | "provider";
  counterpartName?: string;
  /** "requested" | "approved" | "declined" | "" — read from order meta. */
  refundStatus?: string;
  refundReason?: string;
  refundAmount?: string | number;
};

/**
 * The booking conversation both sides read in the app: issue reports, refund
 * requests and the caregiver's decision, all on one timeline. This is what
 * keeps clients and caregivers out of any admin back office.
 */
export default function BookingThreadDialog({
  open,
  onOpenChange,
  orderId,
  role,
  counterpartName,
  refundStatus,
  refundReason,
  refundAmount,
}: Props) {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language?.startsWith("zh");
  const id = Number(orderId);
  const { data: notes, isLoading } = useOrderNotes(open && id > 0 ? id : undefined);
  const addNote = useAddOrderNote();
  const resolveRefund = useResolveRefund();
  const [message, setMessage] = useState("");

  const currency = isZh ? "¥" : "$";
  const openRefund = refundStatus === "requested";

  const send = async () => {
    if (!message.trim() || !(id > 0)) return;
    try {
      await addNote.mutateAsync({ orderId: id, note: message.trim() });
      setMessage("");
    } catch { /* surfaced by the hook */ }
  };

  const settle = async (decision: "approve" | "decline") => {
    if (!(id > 0)) return;
    try {
      await resolveRefund.mutateAsync({ orderId: id, decision, note: message.trim() || undefined });
      setMessage("");
    } catch { /* surfaced by the hook */ }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            {isZh ? "预约沟通记录" : "Booking thread"}
            {id > 0 && <span className="text-sm font-normal text-muted-foreground">#{id}</span>}
          </DialogTitle>
          <DialogDescription>
            {counterpartName
              ? isZh
                ? `与 ${counterpartName} 就这笔预约的沟通、问题反馈与退款处理。`
                : `Messages, issues and refunds for this booking with ${counterpartName}.`
              : isZh
                ? "就这笔预约反馈问题、查看退款处理进度。"
                : "Report an issue or follow the refund decision for this booking."}
          </DialogDescription>
        </DialogHeader>

        {refundStatus && (
          <div className="rounded-lg border border-border/60 bg-muted/40 p-3 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-foreground">
                {isZh ? "退款申请" : "Refund request"}
              </span>
              <Badge
                variant={
                  refundStatus === "approved" ? "default" : refundStatus === "declined" ? "destructive" : "secondary"
                }
              >
                {refundStatus === "approved"
                  ? (isZh ? "已退款" : "Refunded")
                  : refundStatus === "declined"
                    ? (isZh ? "已拒绝" : "Declined")
                    : (isZh ? "待处理" : "Awaiting decision")}
              </Badge>
            </div>
            {!!Number(refundAmount) && (
              <p className="text-sm text-muted-foreground">
                {isZh ? "金额" : "Amount"}: <span className="font-medium text-foreground">{currency}{Number(refundAmount).toFixed(2)}</span>
              </p>
            )}
            {!!refundReason && <p className="text-sm text-muted-foreground">{refundReason}</p>}
          </div>
        )}

        <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : notes?.length ? (
            notes.map((note) => (
              <div key={note.id} className="rounded-lg border border-border/50 p-3">
                <p className="text-sm text-foreground whitespace-pre-wrap">{note.note}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDateTime(note.date_created, i18n.language)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">
              {isZh ? "还没有消息，写下第一条吧。" : "No messages yet — write the first one."}
            </p>
          )}
        </div>

        <Separator />

        <div className="space-y-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder={
              openRefund && role === "provider"
                ? (isZh ? "给客户的说明（可选）" : "Optional note to the client")
                : (isZh ? "写下您的问题或说明..." : "Describe the issue or add a note...")
            }
          />
          <div className="flex flex-wrap gap-2 justify-end">
            <Button variant="outline" onClick={() => send()} disabled={addNote.isPending || !message.trim()}>
              {addNote.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              {isZh ? "发送" : "Send"}
            </Button>
            {role === "provider" && openRefund && (
              <>
                <Button
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => settle("decline")}
                  disabled={resolveRefund.isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  {isZh ? "拒绝退款" : "Decline refund"}
                </Button>
                <Button variant="coral" onClick={() => settle("approve")} disabled={resolveRefund.isPending}>
                  {resolveRefund.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                  {isZh ? "同意并退款" : "Approve refund"}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
