"use client"

import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import type React from "react"
import { useEffect, useState } from "react"

interface StripeProps {
  children: React.ReactNode
  options: {
    mode: "payment" | "subscription"
    amount: number
    currency: string
  }
  className?: string
}

export function Stripe({ children, options, className }: StripeProps) {
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null)

  useEffect(() => {
    // This would normally use your actual Stripe publishable key
    // For demo purposes, we're using a placeholder
    setStripePromise(loadStripe("pk_test_placeholder"))
  }, [])

  return (
    <div className={className}>
      {stripePromise && (
        <Elements
          stripe={stripePromise}
          options={{
            mode: options.mode,
            amount: options.amount,
            currency: options.currency,
            appearance: {
              theme: "stripe",
            },
          }}
        >
          {children}
        </Elements>
      )}
    </div>
  )
}

