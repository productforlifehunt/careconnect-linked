import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Banknote, Plus } from "lucide-react";
import {
  getDokanVendorWithdrawals,
  createDokanWithdrawalRequest,
  getMyDokanStoreId,
  getVendorPayoutSettings,
} from "@/services/woocommerce-api";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface Props {
  /** Currently-held vendor earnings (85% of completed-and-pending bookings). */
  availableAmount: number;
}

export default function WithdrawCard({ availableAmount }: Props) {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language?.startsWith("zh");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: withdrawals = [], isLoading } = useQuery({
    queryKey: ["vendor-withdrawals"],
    queryFn: getDokanVendorWithdrawals,
    staleTime: 30_000,
  });

  const { data: storeId } = useQuery({
    queryKey: ["my-dokan-store-id"],
    queryFn: getMyDokanStoreId,
    staleTime: 5 * 60_000,
  });

  const { data: payout } = useQuery({
    queryKey: ["vendor-payout-settings", storeId],
    queryFn: () => (storeId ? getVendorPayoutSettings(storeId) : null),
    enabled: !!storeId,
  });

  const availableMethods: { value: "paypal" | "alipay" | "bank"; label: string }[] = [];
  if (payout?.paypalEmail) availableMethods.push({ value: "paypal", label: `PayPal (${payout.paypalEmail})` });
  if (payout?.alipayId) availableMethods.push({ value: "alipay", label: `${isZh ? "支付宝" : "Alipay"} (${payout.alipayId})` });

  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"paypal" | "alipay" | "bank">("paypal");
  const [note, setNote] = useState("");

  const createMutation = useMutation({
    mutationFn: () =>
      createDokanWithdrawalRequest({
        amount: parseFloat(amount),
        method,
        note,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendor-withdrawals"] });
      setOpen(false);
      setAmount("");
      setNote("");
      toast({
        title: isZh ? "提现申请已提交" : "Withdrawal request submitted",
        description: isZh ? "管理员核对后将处理打款。" : "Admin will process the payout after review.",
      });
    },
    onError: (err: any) =>
      toast({
        title: isZh ? "提交失败" : "Submit failed",
        description: err.message,
        variant: "destructive",
      }),
  });

  const canWithdraw = availableMethods.length > 0 && availableAmount > 0;

  const statusVariant = (s: string): "default" | "secondary" | "destructive" =>
    s === "approved" || s === "completed" ? "default" : s === "cancelled" ? "destructive" : "secondary";

  return (
    <Card className="border-transparent card-elevated">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Banknote className="h-5 w-5" /> {isZh ? "提现" : "Withdrawals"}
        </CardTitle>
        <Button
          size="sm"
          onClick={() => {
            const first = availableMethods[0];
            if (first) setMethod(first.value);
            setOpen(true);
          }}
          disabled={!canWithdraw}
        >
          <Plus className="h-4 w-4 mr-1" />
          {isZh ? "申请提现" : "Request"}
        </Button>
      </CardHeader>
      <CardContent>
        {!canWithdraw && (
          <p className="text-xs text-muted-foreground mb-3">
            {availableMethods.length === 0
              ? isZh
                ? "请先在“设置”中添加 PayPal 或支付宝收款账户。"
                : "Add a PayPal or Alipay payout account in Settings first."
              : isZh
                ? "暂无可提现金额。"
                : "No available balance to withdraw yet."}
          </p>
        )}
        {isLoading ? (
          <p className="text-center py-6 text-muted-foreground text-sm">{isZh ? "加载中..." : "Loading..."}</p>
        ) : withdrawals.length === 0 ? (
          <p className="text-center py-6 text-muted-foreground text-sm">
            {isZh ? "暂无提现记录" : "No withdrawal history yet"}
          </p>
        ) : (
          withdrawals.map((w: any) => (
            <div key={w.id} className="flex items-center justify-between py-3 border-b last:border-0">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {isZh ? "¥" : "$"}{Number(w.amount).toFixed(2)} · {w.method}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(w.created_at).toLocaleDateString()} {w.note ? `· ${w.note}` : ""}
                </p>
              </div>
              <Badge variant={statusVariant(w.status)}>{w.status}</Badge>
            </div>
          ))
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isZh ? "申请提现" : "Request Withdrawal"}</DialogTitle>
            <DialogDescription>
              {isZh
                ? `可提现余额：约 ${isZh ? "¥" : "$"}${availableAmount.toFixed(2)}。管理员核对后通常 1–3 个工作日内打款。`
                : `Available balance: ~$${availableAmount.toFixed(2)}. Admin typically processes within 1–3 business days.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-1.5">{isZh ? "金额" : "Amount"}</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max={availableAmount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label className="mb-1.5">{isZh ? "收款方式" : "Method"}</Label>
              <Select value={method} onValueChange={(v) => setMethod(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {availableMethods.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5">{isZh ? "备注（可选）" : "Note (optional)"}</Label>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>{isZh ? "取消" : "Cancel"}</Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={
                createMutation.isPending ||
                !amount ||
                parseFloat(amount) <= 0 ||
                parseFloat(amount) > availableAmount
              }
            >
              {createMutation.isPending ? (isZh ? "提交中..." : "Submitting...") : (isZh ? "提交" : "Submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
