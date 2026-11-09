"use client";

import { useMemo, useState } from "react";
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import { Loader2, Lock } from "lucide-react";
import { ButtonNative } from "@/components/ui/Button";
import { confirmStripeOrder } from "@/lib/catalog";

type Props = {
  clientSecret: string;
  publishableKey: string;
  orderRequestId: string;
  paymentIntentId: string;
  amountLabel?: string;
  onSuccess: () => void;
  onError: (message: string) => void;
};

const CARD_ELEMENT_OPTIONS = {
  hidePostalCode: false,
  style: {
    base: {
      color: "#0a0a0a",
      fontFamily: "Montserrat, system-ui, sans-serif",
      fontSize: "16px",
      fontSmoothing: "antialiased",
      "::placeholder": { color: "#94a3b8" },
      iconColor: "#0a0a0a",
    },
    invalid: {
      color: "#b91c1c",
      iconColor: "#b91c1c",
    },
  },
};

function InnerForm({
  clientSecret,
  orderRequestId,
  paymentIntentId,
  amountLabel,
  onSuccess,
  onError,
}: Omit<Props, "publishableKey">) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  async function onPay(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    const card = elements.getElement(CardElement);
    if (!card) return;

    setSubmitting(true);
    onError("");

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    });

    if (result.error) {
      setSubmitting(false);
      onError(result.error.message || "Payment failed. Please try again.");
      return;
    }

    const intent = result.paymentIntent;
    if (
      intent &&
      (intent.status === "requires_capture" ||
        intent.status === "succeeded" ||
        intent.status === "processing")
    ) {
      const confirmed = await confirmStripeOrder({
        orderRequestId,
        paymentIntentId: intent.id || paymentIntentId,
      });
      setSubmitting(false);
      if (!confirmed.ok) {
        onError(confirmed.error || "Payment went through but order sync failed.");
        return;
      }
      onSuccess();
      return;
    }

    setSubmitting(false);
    onError("Payment was not completed. Please try again.");
  }

  return (
    <form onSubmit={(e) => void onPay(e)} className="space-y-4">
      <div className="rounded-[var(--radius-md)] border border-border bg-white px-3.5 py-3.5">
        <CardElement
          options={CARD_ELEMENT_OPTIONS}
          onChange={(event) => {
            setCardComplete(event.complete);
            if (event.error) onError(event.error.message);
            else onError("");
          }}
        />
      </div>
      <ButtonNative
        type="submit"
        variant="secondary"
        size="lg"
        arrow={false}
        disabled={!stripe || !elements || !cardComplete || submitting}
        className="w-full"
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Paying…
          </>
        ) : (
          <>
            <Lock size={15} />
            {amountLabel ? `Pay ${amountLabel}` : "Pay now"}
          </>
        )}
      </ButtonNative>
      <p className="text-center text-xs text-ink-soft">
        Charged now · we’ll email your mockup before production
      </p>
    </form>
  );
}

export function StripePaymentForm(props: Props) {
  const stripePromise = useMemo(
    () => loadStripe(props.publishableKey),
    [props.publishableKey],
  );

  const options: StripeElementsOptions = {
    clientSecret: props.clientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#0a0a0a",
        colorBackground: "#ffffff",
        colorText: "#0a0a0a",
        colorDanger: "#b91c1c",
        fontFamily: "Montserrat, system-ui, sans-serif",
        borderRadius: "12px",
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <InnerForm
        clientSecret={props.clientSecret}
        orderRequestId={props.orderRequestId}
        paymentIntentId={props.paymentIntentId}
        amountLabel={props.amountLabel}
        onSuccess={props.onSuccess}
        onError={props.onError}
      />
    </Elements>
  );
}
