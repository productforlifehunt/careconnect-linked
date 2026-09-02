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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { getStoreCountries } from "@/services/woocommerce-api";
import { useTranslation } from "react-i18next";


/** Service names come back from the store HTML-escaped (e.g. "&amp;"). */
function decodeEntities(value: string) {
  if (!value) return "";
  const el = document.createElement("textarea");
  el.innerHTML = value;
  return el.value;
}

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
  const [address1, setAddress1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postcode, setPostcode] = useState("");
  const [country, setCountry] = useState("US");


  useEffect(() => {
    const u = user as any;
    const mail = u?.email || u?.user_email || u?.user_login_email;
    if (!email && mail) setEmail(mail);
  }, [user, email]);


  const { data: countries = [] } = useQuery({
    queryKey: ["wc-countries"],
    queryFn: getStoreCountries,
    staleTime: 24 * 60 * 60 * 1000,
  });
  const stateOptions = countries.find(c => c.code === country)?.states ?? [];
  const stateRequired = stateOptions.length > 0;

  const items = cart?.items || [];
  const total = cart?.totals?.total_price ? (parseInt(cart.totals.total_price) / 100).toFixed(2) : "0.00";
  const sym = (cart?.totals as any)?.currency_symbol || "$";
  const missingFields = [
    [email, cn ? "账单邮箱" : "billing email"],
    [address1, cn ? "街道地址" : "street address"],
    [city, cn ? "城市" : "city"],
    ...(stateRequired ? [[state, cn ? "省 / 州" : "state / province"]] : []),
    [postcode, cn ? "邮政编码" : "ZIP / postcode"],
    [country, cn ? "国家" : "country"],
  ].filter(([v]) => !String(v || "").trim()).map(([, label]) => label as string);



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
              {items.map((item: any) => {
                const detail = decodeEntities(String(item.description || "").replace(/<[^>]*>/g, "").trim());
                const vendor = (item.item_data || []).find((d: any) => d?.type === "vendor")?.value;
                return (
                <div key={item.key} className="flex items-start justify-between border-b last:border-0 pb-3 last:pb-0 gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{decodeEntities(item.name)}</p>
                    {detail && <p className="text-xs text-muted-foreground mt-0.5">{detail}</p>}
                    {vendor && <p className="text-xs text-muted-foreground">{cn ? "服务方" : "Provider"}: {decodeEntities(String(vendor))}</p>}
                    <p className="text-sm text-muted-foreground mt-0.5">{cn ? "数量" : "Qty"}: {item.quantity} × {sym}{Number(item.price || 0).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary">{sym}{(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}</Badge>
                    <Button variant="ghost" size="icon" aria-label={cn ? "移除" : "Remove item"} onClick={() => removeItem.mutate(item.key)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>

                </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border-transparent card-elevated">
            <CardContent className="p-5 space-y-4">
              <div className="flex justify-between text-lg font-bold"><span>{cn ? "合计" : "Total"}</span><span>{sym}{total}</span></div>
              <div><Label htmlFor="billing-email">{cn ? "账单邮箱" : "Billing Email"} *</Label><Input id="billing-email" value={email} onChange={e => setEmail(e.target.value)} placeholder={(user as any)?.email || "email@example.com"} /></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="billing-address1">{cn ? "街道地址" : "Street address"} *</Label>
                  <Input id="billing-address1" value={address1} onChange={e => setAddress1(e.target.value)} placeholder={cn ? "例如：建国路 12 号" : "e.g. 12 Main Street"} />
                </div>
                <div><Label htmlFor="billing-city">{cn ? "城市" : "City"} *</Label><Input id="billing-city" value={city} onChange={e => setCity(e.target.value)} /></div>
                <div><Label htmlFor="billing-postcode">{cn ? "邮政编码" : "ZIP / Postcode"} *</Label><Input id="billing-postcode" value={postcode} onChange={e => setPostcode(e.target.value)} /></div>
                <div>
                  <Label htmlFor="billing-country">{cn ? "国家 / 地区" : "Country"} *</Label>
                  {countries.length > 0 ? (
                    <Select value={country} onValueChange={v => { setCountry(v); setState(""); }}>
                      <SelectTrigger id="billing-country"><SelectValue placeholder={cn ? "选择国家" : "Select country"} /></SelectTrigger>
                      <SelectContent className="max-h-72">
                        {countries.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input id="billing-country" value={country} onChange={e => setCountry(e.target.value.toUpperCase().slice(0, 2))} placeholder="US" />
                  )}
                </div>
                <div>
                  <Label htmlFor="billing-state">{cn ? "省 / 州" : "State / Province"} {stateRequired ? "*" : ""}</Label>
                  {stateOptions.length > 0 ? (
                    <Select value={state} onValueChange={setState}>
                      <SelectTrigger id="billing-state"><SelectValue placeholder={cn ? "选择省 / 州" : "Select state / province"} /></SelectTrigger>
                      <SelectContent className="max-h-72">
                        {stateOptions.map(s => <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input id="billing-state" value={state} onChange={e => setState(e.target.value)} placeholder={cn ? "可选" : "Optional"} />
                  )}
                </div>
              </div>



              <div className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
                {cn
                  ? "下一步：在本应用内完成下单，付款方式按平台已启用的渠道处理，全程无需跳转到其他网站。平台仅提供收款便利，不代为托管款项，也不介入纠纷或退款仲裁。"
                  : "Next: your order is placed inside this app and handled by whichever payment method the platform has enabled — no redirect to any other website. The platform only provides the payment convenience; it does not hold funds in escrow and does not arbitrate disputes or refunds."}
              </div>


              {missingFields.length > 0 && (
                <p className="text-sm text-destructive">
                  {(cn ? "继续付款前请填写：" : "Fill in before continuing: ") + missingFields.join(cn ? "、" : ", ")}
                </p>
              )}

              <Button variant="coral" className="w-full" size="lg" disabled={doCheckout.isPending || missingFields.length > 0} onClick={async () => {
                const u = user as any;

                const displayName = u?.full_name || "";
                const parts = displayName.split(" ").filter(Boolean);
                const result = await doCheckout.mutateAsync({
                  first_name: parts[0] || "",
                  last_name: parts.slice(1).join(" ") || (parts[0] || ""),
                  email: email.trim(),
                  phone: u?.phone_number || "",
                  address_1: address1.trim(),
                  city: city.trim(),
                  state: state.trim(),
                  postcode: postcode.trim(),
                  country: country.trim() || "US",
                });

                const orderId = (result as any)?.order_id || (result as any)?.id || "";
                const orderKey = (result as any)?.order_key || "";
                const orderTotal = (result as any)?.totals?.total_price ? (parseInt((result as any).totals.total_price) / 100).toFixed(2) : total;
                const paymentUrl = (result as any)?.payment_url || "";
                const orderStatus = (result as any)?.status || "pending";

                // Stash the order metadata so the confirmation page can show
                // it after the user comes back from the gateway.
                try {
                  const params = new URLSearchParams();
                  if (orderId) params.set("order_id", String(orderId));
                  if (orderKey) params.set("order_key", orderKey);
                  if (orderTotal) params.set("total", orderTotal);
                  params.set("status", orderStatus);
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
                params.set("status", orderStatus);
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
