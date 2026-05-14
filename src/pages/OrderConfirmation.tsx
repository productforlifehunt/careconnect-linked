import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, CalendarDays, Clock, DollarSign, ArrowRight, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function OrderConfirmation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const orderId = searchParams.get("order_id");
  const orderTotal = searchParams.get("total");
  const orderDate = searchParams.get("date");
  const providerName = searchParams.get("provider");
  const status = searchParams.get("status") || "processing";

  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-6">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-3 ${showConfetti ? "animate-bounce" : ""}`}>
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
          {t("checkout.orderConfirmed", "Order Confirmed!")}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {t("checkout.thankYou", "Thank you for your booking. Your order has been placed successfully.")}
        </p>
      </div>

      <Card className="border-transparent card-elevated mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t("checkout.orderSummary", "Order Summary")}</span>
            {orderId && (
              <Badge variant="outline" className="text-sm font-mono">
                #{orderId}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {providerName && (
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground">{t("checkout.provider", "Provider")}</span>
              <span className="font-semibold">{providerName}</span>
            </div>
          )}
          {orderDate && (
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-muted-foreground flex items-center gap-2">
                <CalendarDays className="h-4 w-4" /> {t("checkout.date", "Date")}
              </span>
              <span className="font-semibold">
                {new Date(orderDate).toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" })}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">{t("checkout.status", "Status")}</span>
            <Badge className="bg-success text-success-foreground">{status === "processing" ? t("checkout.confirmed", "Confirmed") : status}</Badge>
          </div>
          {orderTotal && (
            <div className="flex items-center justify-between py-3">
              <span className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5" /> {t("checkout.total", "Total")}
              </span>
              <span className="text-2xl font-bold text-primary">${orderTotal}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-transparent card-elevated mb-6">
        <CardContent className="p-5">
          <h3 className="font-semibold mb-2">{t("checkout.whatNext", "What happens next?")}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Clock className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              {t("checkout.nextStep1", "Your provider will review and confirm your booking.")}
            </li>
            <li className="flex items-start gap-2">
              <CalendarDays className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              {t("checkout.nextStep2", "You'll receive a notification when your booking is confirmed.")}
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              {t("checkout.nextStep3", "You can manage or reschedule your booking from the Bookings page.")}
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="coral" className="flex-1" onClick={() => navigate("/bookings")}>
          {t("checkout.viewBookings", "View My Bookings")} <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => navigate("/search")}>
          {t("checkout.browseMore", "Browse More Services")}
        </Button>
      </div>
    </div>
  );
}
