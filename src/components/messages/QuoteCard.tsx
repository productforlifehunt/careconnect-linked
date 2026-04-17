import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tag, Clock, DollarSign, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import type { QuoteData } from "@/lib/quote-protocol";
import { useToast } from "@/hooks/use-toast";
import { useAddToCart } from "@/hooks/use-cart";
import { createQuoteProduct } from "@/services/quote-product";

interface QuoteCardProps {
  quote: QuoteData;
  /** True if the current user is the recipient (the buyer). Only the buyer
   *  sees the Accept & Pay button. */
  isRecipient: boolean;
  /** True if current user sent the quote (seller view) — read-only state. */
  isMe: boolean;
}

export function QuoteCard({ quote, isRecipient, isMe }: QuoteCardProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const addToCart = useAddToCart();
  const [accepting, setAccepting] = useState(false);

  const status = quote.status || "pending";

  const handleAccept = async () => {
    if (!quote.vendorUserId) {
      toast({ title: "Cannot accept", description: "Quote is missing seller info.", variant: "destructive" });
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
        title: "Added to cart",
        description: `Quote of $${quote.amount} ready to checkout.`,
      });
      navigate("/cart");
    } catch (e: any) {
      toast({
        title: "Failed to accept quote",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setAccepting(false);
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
          Price Quote
        </span>
        {status !== "pending" && (
          <Badge variant={status === "accepted" || status === "paid" ? "default" : "secondary"} className="ml-auto text-[10px]">
            {status}
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
            ({quote.ratePerHour}/hr × {quote.hours}h)
          </span>
        )}
        {quote.mode === "flat" && (
          <span className="text-xs text-muted-foreground">flat rate</span>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
        {quote.mode === "hourly" ? (
          <Clock className="h-3 w-3" />
        ) : (
          <DollarSign className="h-3 w-3" />
        )}
        <span>{quote.mode === "hourly" ? "Hourly billing" : "One-time payment"}</span>
      </div>

      {quote.note && (
        <p className="text-xs text-muted-foreground italic border-l-2 border-muted pl-2 mb-3">
          "{quote.note}"
        </p>
      )}

      {/* Action buttons — only the recipient (buyer) can accept */}
      {status === "pending" && isRecipient && (
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="coral"
            size="sm"
            className="flex-1"
            disabled={accepting || addToCart.isPending}
            onClick={handleAccept}
          >
            {accepting || addToCart.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Processing…
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Accept &amp; Pay ${quote.amount}
              </>
            )}
          </Button>
        </div>
      )}

      {status === "pending" && isMe && (
        <p className="text-xs text-muted-foreground italic pt-2 border-t">
          Awaiting acceptance…
        </p>
      )}

      {(status === "accepted" || status === "paid") && (
        <div className="flex items-center gap-1.5 text-xs text-success pt-2 border-t">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Quote {status}</span>
        </div>
      )}

      {status === "declined" && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t">
          <XCircle className="h-3.5 w-3.5" />
          <span>Quote declined</span>
        </div>
      )}
    </div>
  );
}
