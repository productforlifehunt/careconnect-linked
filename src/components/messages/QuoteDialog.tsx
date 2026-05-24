import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DollarSign, Clock, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { QuoteData, QuoteMode } from "@/lib/quote-protocol";

interface QuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-fill service type (from job posting or caregiver profile). */
  defaultServiceType?: string;
  /** Pre-fill default hourly rate. */
  defaultRatePerHour?: number;
  /** Optional related job id. */
  jobId?: string | number;
  /** The vendor (payee) — usually the caregiver/seller's WP user id. */
  vendorUserId: string | number;
  /** Called with the assembled quote when user clicks Send. */
  onSend: (quote: QuoteData) => void | Promise<void>;
  /** Submitting state from parent. */
  submitting?: boolean;
}

export function QuoteDialog({
  open,
  onOpenChange,
  defaultServiceType,
  defaultRatePerHour,
  jobId,
  vendorUserId,
  onSend,
  submitting,
}: QuoteDialogProps) {
  const { i18n } = useTranslation();
  const isCN = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isCN ? cn : en);
  const currency = isCN ? "¥" : "$";
  const [mode, setMode] = useState<QuoteMode>("hourly");
  const [rate, setRate] = useState<string>(defaultRatePerHour ? String(defaultRatePerHour) : "");
  const [hours, setHours] = useState<string>("2");
  const [flatAmount, setFlatAmount] = useState<string>("");
  const [serviceType, setServiceType] = useState<string>(defaultServiceType || "");
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    if (open) {
      setRate(defaultRatePerHour ? String(defaultRatePerHour) : "");
      setHours("2");
      setFlatAmount("");
      setServiceType(defaultServiceType || "");
      setNote("");
      setMode("hourly");
    }
  }, [open, defaultRatePerHour, defaultServiceType]);

  const computedAmount =
    mode === "hourly"
      ? (parseFloat(rate) || 0) * (parseFloat(hours) || 0)
      : parseFloat(flatAmount) || 0;

  const canSend = computedAmount > 0 && !submitting;

  const handleSend = async () => {
    if (!canSend) return;
    const quote: QuoteData = {
      mode,
      amount: Math.round(computedAmount * 100) / 100,
      ratePerHour: mode === "hourly" ? parseFloat(rate) || 0 : undefined,
      hours: mode === "hourly" ? parseFloat(hours) || 0 : undefined,
      serviceType: serviceType || undefined,
      note: note || undefined,
      jobId,
      status: "pending",
      vendorUserId,
      createdAt: new Date().toISOString(),
    };
    await onSend(quote);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" /> {Z("发送报价", "Send a Price Quote")}
          </DialogTitle>
          <DialogDescription>
            {Z("对方可一键查看并接受、付款。", "The other side can review and one-tap accept & pay.")}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as QuoteMode)} className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="hourly" className="gap-1.5">
              <Clock className="h-3.5 w-3.5" /> {Z("按小时", "Hourly")}
            </TabsTrigger>
            <TabsTrigger value="flat" className="gap-1.5">
              <DollarSign className="h-3.5 w-3.5" /> {Z("一口价", "Flat Price")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hourly" className="space-y-3 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block text-xs">{Z(`每小时单价（${currency}）`, `Rate per hour (${currency})`)}</Label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="50"
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs">{Z("小时数", "Hours")}</Label>
                <Input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="2"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="flat" className="space-y-3 mt-4">
            <div>
              <Label className="mb-1.5 block text-xs">{Z(`总价（${currency}）`, `Total price (${currency})`)}</Label>
              <Input
                type="number"
                min="1"
                step="1"
                value={flatAmount}
                onChange={(e) => setFlatAmount(e.target.value)}
                placeholder="200"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {Z("例如：过夜照护、一次性上门", "e.g. overnight care, one-time visit")}
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-3 mt-2">
          <div>
            <Label className="mb-1.5 block text-xs">{Z("服务描述（可选）", "Service description (optional)")}</Label>
            <Input
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              placeholder={Z("例如：陪伴长者、过夜照护", "e.g. Elder companion, Overnight care")}
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs">{Z("备注（可选）", "Note (optional)")}</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={Z("需要确认的细节……", "Any details to confirm…")}
              rows={2}
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-accent mt-2">
          <span className="text-sm font-medium text-foreground">{Z("合计", "Total")}</span>
          <span className="text-2xl font-bold text-foreground">
            {currency}{computedAmount.toFixed(2)}
          </span>
        </div>

        <Button
          variant="coral"
          className="w-full mt-2"
          disabled={!canSend}
          onClick={handleSend}
        >
          {submitting ? Z("发送中……", "Sending…") : Z("发送报价", "Send Quote")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
