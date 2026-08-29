import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Wallet, CheckCircle2, Info } from "lucide-react";
import { getMyPayout, saveMyPayout, requestWithdrawal, cancelWithdrawal } from "@/services/woocommerce-api";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

/**
 * Payout account for caregivers.
 *
 * Clients pay online at checkout, so every confirmed booking is recorded
 * against the caregiver's payout account. This card shows the balance, lets the
 * caregiver save where the money should be sent (PayPal or bank), and submits a
 * payout request once a completed booking has matured.
 */
export default function PayoutAccountsCard() {
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith("zh");
  const { toast } = useToast();
  const qc = useQueryClient();
  const currency = isZh ? "¥" : "$";

  const { data, isLoading } = useQuery({
    queryKey: ["my-payout"],
    queryFn: getMyPayout,
  });

  const [paypalEmail, setPaypalEmail] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (!data) return;
    setPaypalEmail(data.payment?.paypal?.email || "");
    setAccountName(data.payment?.bank?.ac_name || "");
    setAccountNumber(data.payment?.bank?.ac_number || "");
    setBankName(data.payment?.bank?.bank_name || "");
  }, [data]);

  const balance = Number(data?.balance?.current_balance ?? 0);
  const minimum = Number(data?.balance?.withdraw_limit ?? 0) || 0;
  const hasPayoutDetails = !!(paypalEmail.trim() || (accountName.trim() && accountNumber.trim()));
  // Only one payout request can be open at a time, so say so up front instead
  // of letting the caregiver hit a rejection they can't explain.
  const pendingPayout = (data?.withdrawals ?? []).find(
    (w: any) => String(w.status).toLowerCase() === "pending",
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payment: any = {};
      if (paypalEmail.trim()) payment.paypal = { email: paypalEmail.trim() };
      if (accountName.trim() || accountNumber.trim() || bankName.trim()) {
        payment.bank = {
          ac_name: accountName.trim(),
          ac_number: accountNumber.trim(),
          bank_name: bankName.trim(),
        };
      }
      if (!Object.keys(payment).length) {
        throw new Error(isZh ? "请填写至少一种收款方式" : "Add at least one payout method");
      }
      return saveMyPayout(payment);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-payout"] });
      toast({ title: isZh ? "收款信息已保存" : "Payout details saved" });
    },
    onError: (err: any) =>
      toast({
        title: isZh ? "保存失败" : "Save failed",
        description: err.message,
        variant: "destructive",
      }),
  });

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      const value = Number(amount);
      if (!(value > 0)) throw new Error(isZh ? "请输入提现金额" : "Enter an amount");
      if (value > balance) throw new Error(isZh ? "超出可提现余额" : "Amount exceeds your balance");
      if (minimum > 0 && value < minimum) {
        throw new Error(
          isZh
            ? `最低提现金额为 ${currency}${minimum.toFixed(2)}，请等余额积累后再申请。`
            : `The minimum payout is ${currency}${minimum.toFixed(2)} — let your balance build up before requesting.`,
        );
      }

      const method = paypalEmail.trim() ? "paypal" : "bank";
      return requestWithdrawal(value, method);
    },
    onSuccess: () => {
      setAmount("");
      qc.invalidateQueries({ queryKey: ["my-payout"] });
      toast({ title: isZh ? "提现申请已提交" : "Payout request submitted" });
    },
    onError: (err: any) =>
      toast({
        title: isZh ? "提交失败" : "Request failed",
        description: err.message,
        variant: "destructive",
      }),
  });
  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!pendingPayout) throw new Error(isZh ? "没有待处理的提现申请" : "No pending payout request");
      return cancelWithdrawal(Number(pendingPayout.id));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-payout"] });
      toast({ title: isZh ? "提现申请已撤销" : "Payout request cancelled" });
    },
    onError: (err: any) =>
      toast({
        title: isZh ? "撤销失败" : "Cancel failed",
        description: err.message,
        variant: "destructive",
      }),
  });


  return (
    <Card className="border-transparent card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" /> {isZh ? "收款与提现" : "Payouts"}
          {hasPayoutDetails && (
            <Badge variant="default" className="ml-2">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {isZh ? "已配置" : "Configured"}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted/40 border border-border/50 p-4 text-center">
            <p className="text-2xl font-bold text-foreground">
              {currency}{balance.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isZh ? "可提现余额" : "Available balance"}
            </p>
          </div>
          <div className="rounded-lg bg-muted/40 border border-border/50 p-4 text-center">
            <p className="text-2xl font-bold text-foreground">
              {currency}{minimum.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isZh ? "最低提现金额" : "Minimum payout"}
            </p>
          </div>
        </div>

        <div className="flex gap-2 p-3 rounded-lg bg-muted/40 border border-border/50">
          <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            {isZh
              ? "客户在下单时完成在线支付。您将服务标记为已完成后，该笔金额进入可提现余额，可随时提交提现申请。"
              : "Clients pay online when they book. After you mark a service complete, that amount moves into your available balance and you can request a payout."}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="paypal-email" className="font-semibold">
            {isZh ? "PayPal 收款邮箱" : "PayPal email"}
          </Label>
          <Input
            id="paypal-email"
            type="email"
            value={paypalEmail}
            onChange={(e) => setPaypalEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={isLoading}
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label htmlFor="bank-ac-name">{isZh ? "账户名" : "Account name"}</Label>
            <Input id="bank-ac-name" value={accountName} onChange={(e) => setAccountName(e.target.value)} disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bank-ac-number">{isZh ? "账号" : "Account number"}</Label>
            <Input id="bank-ac-number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bank-name">{isZh ? "银行名称" : "Bank name"}</Label>
            <Input id="bank-name" value={bankName} onChange={(e) => setBankName(e.target.value)} disabled={isLoading} />
          </div>
        </div>

        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="w-full"
        >
          {saveMutation.isPending
            ? (isZh ? "保存中..." : "Saving...")
            : (isZh ? "保存收款信息" : "Save payout details")}
        </Button>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="withdraw-amount" className="font-semibold">
            {isZh ? "提现金额" : "Payout amount"}
          </Label>
          <div className="flex gap-2">
            <Input
              id="withdraw-amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={balance > 0 ? balance.toFixed(2) : "0.00"}
            />
            <Button
              variant="secondary"
              onClick={() => withdrawMutation.mutate()}
              disabled={withdrawMutation.isPending || !hasPayoutDetails || balance <= 0 || !!pendingPayout}
            >
              {withdrawMutation.isPending
                ? (isZh ? "提交中..." : "Submitting...")
                : (isZh ? "申请提现" : "Request payout")}
            </Button>
          </div>
          {!hasPayoutDetails && (
            <p className="text-xs text-muted-foreground">
              {isZh ? "请先保存收款信息，然后即可申请提现。" : "Save your payout details first, then you can request a payout."}
            </p>
          )}
          {!!pendingPayout && (
            <p className="text-xs text-muted-foreground">
              {isZh
                ? `您有一笔 ${currency}${Number(pendingPayout.amount).toFixed(2)} 的提现申请正在处理中，处理完成后即可再次申请。`
                : `A ${currency}${Number(pendingPayout.amount).toFixed(2)} payout request is still being processed — you can request another once it's settled.`}
            </p>
          )}
        </div>

        {!!data?.withdrawals?.length && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">
              {isZh ? "提现记录" : "Payout history"}
            </p>
            <div className="space-y-1.5">
              {data.withdrawals.map((w) => (
                <div key={w.id} className="flex items-center justify-between text-sm rounded-md border border-border/50 px-3 py-2">
                  <span className="text-muted-foreground">{String(w.created || "").slice(0, 10)}</span>
                  <span className="font-medium text-foreground">{currency}{Number(w.amount).toFixed(2)}</span>
                  <Badge variant={w.status === "approved" ? "default" : "secondary"}>{w.status}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
