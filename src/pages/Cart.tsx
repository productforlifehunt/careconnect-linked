import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Trash2, Loader2, ArrowLeft } from "lucide-react";
import { useCart, useRemoveCartItem, useClearCart, useCheckout } from "@/hooks/use-cart";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

export default function Cart() {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const cn = i18n.language?.startsWith("zh");
  const { user } = useAuth();
  const { data: cart, isLoading } = useCart();
  const removeItem = useRemoveCartItem();
  const clearAll = useClearCart();
  const doCheckout = useCheckout();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const u = user as any;
    if (!email && u?.email) setEmail(u.email);
  }, [user, email]);

  const items = cart?.items || [];
  const total = cart?.totals?.total_price ? (parseInt(cart.totals.total_price) / 100).toFixed(2) : "0.00";
  const sym = (cart?.totals as any)?.currency_symbol || "$";

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-5">
      <Button variant="ghost" size="sm" className="mb-3 gap-1.5 -ml-2" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /> {cn ? "返回" : "Back"}</Button>
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-5 flex items-center gap-2"><ShoppingCart className="h-5 w-5" /> {cn ? "我的购物车" : "Your Cart"}</h1>

      {items.length === 0 ? (
        <Card className="border-transparent card-elevated">
          <CardContent className="p-8 text-center">
            <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground mb-4">{cn ? "购物车为空" : "Your cart is empty"}</p>
            <Button variant="coral" onClick={() => navigate("/search")}>{cn ? "浏览护理服务" : "Browse Care Services"}</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="border-transparent card-elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{cn ? "商品" : "Items"} ({items.length})</CardTitle>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => clearAll.mutate()} disabled={clearAll.isPending}>{cn ? "全部清空" : "Clear All"}</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item: any) => (
                <div key={item.key} className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{cn ? "数量" : "Qty"}: {item.quantity} × {sym}{(parseInt(item.prices?.price || "0") / 100).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{sym}{(parseInt(item.totals?.line_total || "0") / 100).toFixed(2)}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => removeItem.mutate(item.key)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-transparent card-elevated">
            <CardContent className="p-5 space-y-4">
              <div className="flex justify-between text-lg font-bold"><span>{cn ? "合计" : "Total"}</span><span>{sym}{total}</span></div>
              <div><Label>{cn ? "账单邮箱" : "Billing Email"}</Label><Input value={email} onChange={e => setEmail(e.target.value)} placeholder={(user as any)?.email || "email@example.com"} /></div>
              <div className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
                {cn
                  ? "下一步：将转到安全支付页面，由 Stripe / PayPal / 支付宝等已配置的支付方式直接完成付款。平台仅提供便利的收款入口，不代为托管款项，也不介入纠纷或退款仲裁。"
                  : "Next: you'll be sent to the secure payment page where Stripe / PayPal / Alipay (whichever the platform has enabled) processes the payment directly. The platform only provides the payment convenience — it does not hold funds in escrow and does not arbitrate disputes or refunds."}
              </div>

              <Button variant="coral" className="w-full" size="lg" disabled={doCheckout.isPending || !email.trim()} onClick={async () => {
                const u = user as any;
                const displayName = u?.full_name || u?.user_display_name || "";
                const parts = displayName.split(" ").filter(Boolean);
                const result = await doCheckout.mutateAsync({ first_name: parts[0] || "", last_name: parts.slice(1).join(" "), email: email.trim(), phone: u?.phone_number || "" });
                const orderId = (result as any)?.order_id || (result as any)?.id || "";
                const orderKey = (result as any)?.order_key || "";
                const orderTotal = (result as any)?.totals?.total_price ? (parseInt((result as any).totals.total_price) / 100).toFixed(2) : total;
                const paymentUrl = (result as any)?.payment_url || "";

                // Stash the order metadata so the confirmation page can show
                // it after the user comes back from the gateway.
                try {
                  const params = new URLSearchParams();
                  if (orderId) params.set("order_id", String(orderId));
                  if (orderKey) params.set("order_key", orderKey);
                  if (orderTotal) params.set("total", orderTotal);
                  params.set("status", "pending");
                  sessionStorage.setItem("cc:last_order", params.toString());
                } catch { /* ignore */ }

                // Hand the customer off to WC's hosted pay page. The
                // platform only facilitates payment — funds settle directly
                // through the gateway, no escrow / no platform-held balance.

                if (paymentUrl) {
                  window.location.href = paymentUrl;
                  return;
                }

                // Fallback (no gateway configured / payment_url missing):
                // jump straight to the local confirmation page.
                const params = new URLSearchParams();
                if (orderId) params.set("order_id", String(orderId));
                if (orderKey) params.set("order_key", orderKey);
                if (orderTotal) params.set("total", orderTotal);
                params.set("status", "pending");
                navigate(`/order-confirmation?${params.toString()}`);
              }}>
                {doCheckout.isPending ? (cn ? "处理中…" : "Processing...") : (cn ? "前往安全支付" : "Continue to Secure Payment")}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
