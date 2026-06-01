import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Wallet, CheckCircle2, Info } from "lucide-react";
import {
  getMyDokanStoreId,
  getVendorPayoutSettings,
  saveVendorPayoutSettings,
} from "@/services/woocommerce-api";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

/**
 * UrbanSitter-style payment model: the platform does NOT process payments,
 * hold funds, take commission, or facilitate transfers. Clients and caregivers
 * arrange payment directly between themselves.
 *
 * As an optional convenience, a caregiver can paste their own Stripe Payment
 * Link URL (generated in their own Stripe Dashboard). Clients see the link on
 * the booking page and pay the caregiver directly — funds never touch the
 * platform.
 *
 * The existing `stripe_account_id` custom field on the Dokan store record is
 * reused to store this URL (kept as a string; no Connect/onboarding involved).
 */
export default function PayoutAccountsCard() {
  const { i18n } = useTranslation();
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

  const [stripePaymentLink, setStripePaymentLink] = useState("");

  useEffect(() => {
    if (payout) {
      setStripePaymentLink(payout.stripeAccountId || "");
    }
  }, [payout]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!storeId) throw new Error("No vendor store found");
      return saveVendorPayoutSettings(storeId, {
        stripeAccountId: stripePaymentLink.trim(),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendor-payout-settings", storeId] });
      toast({ title: isZh ? "已保存" : "Saved" });
    },
    onError: (err: any) => {
      toast({
        title: isZh ? "保存失败" : "Save failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const hasLink = !!stripePaymentLink.trim();

  return (
    <Card className="border-transparent card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" /> {isZh ? "收款方式" : "Payment Method"}
          {hasLink && (
            <Badge variant="default" className="ml-2">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {isZh ? "已配置" : "Configured"}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex gap-2 p-3 rounded-lg bg-muted/40 border border-border/50">
          <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            {isZh
              ? "本平台不提供支付或资金结算服务，亦不收取任何中介费用。请您与对方就服务费用、付款时间及方式自行协商完成。"
              : "This platform does not provide payment processing or fund settlement, and charges no service fees. Please arrange the amount, timing, and method of payment directly with the other party."}
          </p>
        </div>

        {!isZh && (
          <div className="space-y-2">
            <Label htmlFor="stripe-link" className="font-semibold">
              Stripe Payment Link <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="stripe-link"
              type="url"
              value={stripePaymentLink}
              onChange={(e) => setStripePaymentLink(e.target.value)}
              placeholder="https://buy.stripe.com/..."
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Paste a Payment Link you created in your own Stripe Dashboard. Clients
              will see it on your profile so they can pay you directly. Funds go
              straight to your Stripe account — the platform never touches them.
            </p>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !storeId}
              className="w-full"
            >
              {saveMutation.isPending ? "Saving..." : "Save"}
            </Button>
            {!storeId && !isLoading && (
              <p className="text-xs text-warning text-center">
                No vendor store detected. Save your Basic Info once to create your store.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
