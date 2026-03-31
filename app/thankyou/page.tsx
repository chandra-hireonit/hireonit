"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircleIcon, AlertCircleIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function ThankYouPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  // Track if we should show the redirection UI or the "safe to close" UI
  const [isValidClient, setIsValidClient] = useState(true);

  useEffect(() => {
    const clientName = sessionStorage.getItem("clientName");

    // Check if clientName is missing, null, or just an empty string
    if (!clientName || clientName.trim() === "") {
      setIsValidClient(false);
      return; // Exit early; do not start timers
    }

    // Interval to handle the visual countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Timeout to handle the actual redirection
    const redirectTimeout = setTimeout(() => {
      window.location.href = `https://${clientName}.ambitionhire.ai/candidate/dashboard`;
    }, 5000);

    // Cleanup
    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimeout);
    };
  }, []);

  return (
    <Card className="flex h-[400px] w-full flex-col items-center justify-center overflow-hidden p-6">
      <div className="flex flex-col items-center gap-6">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {isValidClient ? (
            <CheckCircleIcon className="h-16 w-16 text-green-500" />
          ) : (
            <CheckCircleIcon className="h-16 w-16 text-amber-500" />
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col items-center gap-2 text-center"
        >
          <h1 className="text-2xl font-bold">
            {isValidClient ? "Thank You!" : "Session Completed"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isValidClient
              ? "Your interview has been completed successfully. We appreciate your time and effort."
              : "Your progress has been saved."}
          </p>

          {isValidClient ? (
            <p className="text-xs text-muted-foreground mt-4 italic">
              Redirecting to your dashboard in {countdown}{" "}
              {countdown === 1 ? "second" : "seconds"}...
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-4 font-medium">
              You can now safely close this window.
            </p>
          )}
        </motion.div>
      </div>
    </Card>
  );
}
