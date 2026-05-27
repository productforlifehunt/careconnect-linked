import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Wallet, CreditCard, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  getMyDokanStoreId,
  getVendorPayoutSettings,
  saveVendorPayoutSettings,
} from "@/services/woocommerce-api";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

/**
 * Lets a vendor configure where their payouts go:
 *   • Stripe Express account id (auto-split via Stripe Connect — preferred)
 *   • PayPal email (manual Dokan withdraw → PayPal Payouts)
 *   • Alipay ID (manual Dokan withdraw — China)
 *
 * Until the WP admin enables Stripe Connect, the "Connect Stripe" button is
 * disabled with a clear status badge so vendors know the platform is not
 * ready yet. PayPal/Alipay always work via manual withdraw.
 */
export default function PayoutAccountsCard() {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language?.startsWith("zh");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: storeId } = useQuery({
    queryKey: ["my-dokan-store-id"],
    queryFn: getMyDokanStoreId,
    staleTime: 5 * 60_000,
  });

  const { data: payout, isLoading } = useQuery({
    queryKey: ["vendor-payout-settings", storeId],
    queryFn: () => (storeId ? getVendorPayoutSettings(storeId) : null),
    enabled: !!storeId,
  });

  const [paypalEmail, setPaypalEmail] = useState("");
  const [alipayId, setAlipayId] = useState("");
  const [stripeAccountId, setStripeAccountId] = useState("");

  useEffect(() => {
    if (payout) {
      setPaypalEmail(payout.paypalEmail || "");
      setAlipayId(payout.alipayId || "");
      setStripeAccountId(payout.stripeAccountId || "");
    }
  }, [payout]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!storeId) throw new Error("No Dokan store found for this vendor");
      return saveVendorPayoutSettings(storeId, { paypalEmail, alipayId, stripeAccountId });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendor-payout-settings", storeId] });
      toast({ title: isZh ? "收款账户已保存" : "Payout accounts saved" });
    },
    onError: (err: any) => {
      toast({
        title: isZh ? "保存失败" : "Save failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const hasAny = paypalEmail || alipayId || stripeAccountId;

  return (
    <Card className="border-transparent card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" /> {isZh ? "收款账户" : "Payout Accounts"}
          {hasAny && (
            <Badge variant="default" className="ml-2">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {isZh ? "已配置" : "Configured"}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm text-muted-foreground">
          {isZh
            ? "添加一种或多种收款方式。客户付款由平台保管，订单完成后您可申请提现到这里。"
            : "Add one or more ways to get paid. The platform holds customer payments and releases them to your account here after the booking is completed."}
        </p>

        {/* Stripe Connect (auto) */}
        <div className="space-y-2 p-4 rounded-lg border bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <Label className="font-semibold">Stripe Connect {isZh ? "（自动结算）" : "(automatic)"}</Label>
            </div>
            <Badge variant="secondary" className="text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              {isZh ? "平台未启用" : "Platform not enabled"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {isZh
              ? "首选。每笔订单完成后，扣除 15% 平台费后自动打入您的 Stripe 账户。需要平台管理员先开启 Stripe Connect。"
              : "Preferred. Each completed booking auto-splits 15% platform fee, the rest goes to your Stripe account instantly. Requires the platform admin to enable Stripe Connect first."}
          </p>
          <Input
            value={stripeAccountId}
            onChange={(e) => setStripeAccountId(e.target.value)}
            placeholder="acct_xxxxxxxxxxxxxx"
            disabled
          />
          <Button variant="outline" size="sm" disabled className="w-full">
            {isZh ? "连接 Stripe（即将上线）" : "Connect Stripe (coming soon)"}
          </Button>
        </div>

        {/* PayPal (manual) */}
        <div className="space-y-2">
          <Label htmlFor="paypal-email" className="font-semibold">PayPal {isZh ? "邮箱" : "Email"}</Label>
          <Input
            id="paypal-email"
            type="email"
            value={paypalEmail}
            onChange={(e) => setPaypalEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            {isZh
              ? "您可在“收入”页申请提现，管理员核对后通过 PayPal 转账。"
              : "Request a withdrawal from the Earnings tab; admin reviews and sends via PayPal."}
          </p>
        </div>

        {/* Alipay (manual) */}
        <div className="space-y-2">
          <Label htmlFor="alipay-id" className="font-semibold">{isZh ? "支付宝账号" : "Alipay ID"}</Label>
          <Input
            id="alipay-id"
            value={alipayId}
            onChange={(e) => setAlipayId(e.target.value)}
            placeholder={isZh ? "手机号或邮箱" : "Phone or email"}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            {isZh
              ? "中国大陆首选。提现由管理员手动通过支付宝转账完成。"
              : "Preferred for China. Withdrawals are sent manually via Alipay by the admin."}
          </p>
        </div>

        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending || !storeId}
          className="w-full"
        >
          {saveMutation.isPending
            ? isZh ? "保存中..." : "Saving..."
            : isZh ? "保存收款账户" : "Save Payout Accounts"}
        </Button>

        {!storeId && !isLoading && (
          <p className="text-xs text-warning text-center">
            {isZh
              ? "未检测到商家店铺。请先在“基本资料”保存一次以创建店铺。"
              : "No vendor store detected. Save your Basic Info once to create your store."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
