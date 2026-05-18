import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tag, Clock, DollarSign, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { type QuoteData, encodeQuote } from "@/lib/quote-protocol";
import { useToast } from "@/hooks/use-toast";
import { useAddToCart } from "@/hooks/use-cart";
import { createQuoteProduct } from "@/services/quote-product";
import { useSendMessage } from "@/hooks/use-care-data";
import { useTranslation } from "react-i18next";

interface QuoteCardProps {
  quote: QuoteData;
  isRecipient: boolean;
  isMe: boolean;
  conversationId?: string;
  otherUserId?: string;
}

export function QuoteCard({ quote, isRecipient, isMe, conversationId, otherUserId }: QuoteCardProps) {
  const { toast } = useToast();
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith("zh");
  const Z = (cn: string, en: string) => (isZh ? cn : en);
  const navigate = useNavigate();
  const addToCart = useAddToCart();
  const sendMessage = useSendMessage();
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);

  const status = quote.status || "pending";

  const statusLabel = (s: string) =>
    s === "accepted" ? Z("已接受", "accepted")
      : s === "paid" ? Z("已付款", "paid")
      : s === "declined" ? Z("已拒绝", "declined")
      : Z("待回应", "pending");

  const handleAccept = async () => {
    if (!quote.vendorUserId) {
      toast({ title: Z("无法接受", "Cannot accept"), description: Z("报价缺少卖家信息。", "Quote is missing seller info."), variant: "destructive" });
      return;
    }
    setAccepting(true);
    try {
      const { id: productId } = await createQuoteProduct({
        quote,
        vendorUserId: quote.vendorUserId,
      });
      await addToCart.mutateAsync({ productId });
      toast({
        title: Z("已加入购物车", "Added to cart"),
        description: Z(`$${quote.amount} 的报价已准备结账。`, `Quote of $${quote.amount} ready to checkout.`),
      });
      navigate("/cart");
    } catch (e: any) {
      toast({
        title: Z("接受报价失败", "Failed to accept quote"),
        description: e?.message || Z("请重试。", "Please try again."),
        variant: "destructive",
      });
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (!conversationId || !otherUserId) {
      toast({ title: Z("无法拒绝", "Cannot decline"), description: Z("缺少对话上下文。", "Missing conversation context."), variant: "destructive" });
      return;
    }
    setDeclining(true);
    try {
      const declined: QuoteData = { ...quote, status: "declined" };
      await sendMessage.mutateAsync({
        conversationId,
        receiverUserId: otherUserId,
        content: encodeQuote(declined),
      });
      toast({ title: Z("已拒绝报价", "Quote declined"), description: Z("已通知发送方。", "The sender has been notified.") });
    } catch (e: any) {
      toast({
        title: Z("拒绝失败", "Failed to decline"),
        description: e?.message || Z("请重试。", "Please try again."),
        variant: "destructive",
      });
    } finally {
      setDeclining(false);
    }
  };

  return (
    <div
      className={`max-w-[80%] rounded-2xl border-2 ${isMe ? "border-primary/40 bg-primary/5 ml-auto" : "border-coral/30 bg-card"} p-4 shadow-sm`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="h-7 w-7 rounded-full bg-coral/15 flex items-center justify-center">
          <Tag className="h-3.5 w-3.5 text-coral" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {Z("价格报价", "Price Quote")}
        </span>
        {status !== "pending" && (
          <Badge variant={status === "accepted" || status === "paid" ? "default" : "secondary"} className="ml-auto text-[10px]">
            {statusLabel(status)}
          </Badge>
        )}
      </div>

      {quote.serviceType && (
        <p className="text-sm font-medium text-foreground mb-1">{quote.serviceType}</p>
      )}

      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-3xl font-bold text-foreground">${quote.amount}</span>
        {quote.mode === "hourly" && (
          <span className="text-xs text-muted-foreground">
            ({quote.ratePerHour}/{Z("小时", "hr")} × {quote.hours}{Z("小时", "h")})
          </span>
        )}
        {quote.mode === "flat" && (
          <span className="text-xs text-muted-foreground">{Z("一口价", "flat rate")}</span>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
        {quote.mode === "hourly" ? (
          <Clock className="h-3 w-3" />
        ) : (
          <DollarSign className="h-3 w-3" />
        )}
        <span>{quote.mode === "hourly" ? Z("按小时计费", "Hourly billing") : Z("一次性支付", "One-time payment")}</span>
      </div>

      {quote.note && (
        <p className="text-xs text-muted-foreground italic border-l-2 border-muted pl-2 mb-3">
          "{quote.note}"
        </p>
      )}

      {status === "pending" && isRecipient && (
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="coral"
            size="sm"
            className="flex-1"
            disabled={accepting || addToCart.isPending || declining}
            onClick={handleAccept}
          >
            {accepting || addToCart.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> {Z("处理中…", "Processing…")}
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> {Z("接受并支付", "Accept & Pay")} ${quote.amount}
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={accepting || declining}
            onClick={handleDecline}
          >
            {declining ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <XCircle className="h-3.5 w-3.5 mr-1" /> {Z("拒绝", "Decline")}
              </>
            )}
          </Button>
        </div>
      )}

      {status === "pending" && isMe && (
        <p className="text-xs text-muted-foreground italic pt-2 border-t">
          {Z("等待对方回应…", "Awaiting acceptance…")}
        </p>
      )}

      {(status === "accepted" || status === "paid") && (
        <div className="flex items-center gap-1.5 text-xs text-success pt-2 border-t">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>{Z(`报价${statusLabel(status)}`, `Quote ${status}`)}</span>
        </div>
      )}

      {status === "declined" && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t">
          <XCircle className="h-3.5 w-3.5" />
          <span>{Z("报价已拒绝", "Quote declined")}</span>
        </div>
      )}
    </div>
  );
}
