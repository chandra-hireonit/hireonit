"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function ThankYouPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  // Track if we have a valid client name to redirect to
  const [isValidClient, setIsValidClient] = useState(true);

  useEffect(() => {
    const paramsString = sessionStorage.getItem("voice-chat-params");
    let clientName = "";

    try {
      if (paramsString) {
        const params = JSON.parse(paramsString);
        clientName = params.clientName;
      }
    } catch (error) {
      console.error("Error parsing voice-chat-params:", error);
    }

    // If clientName is missing or invalid, stop the timer logic
    if (!clientName || clientName.trim() === "") {
      setIsValidClient(false);
      return;
    }

    // Interval to handle the visual countdown
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    // Timeout to handle the actual redirection
    const redirectTimeout = setTimeout(() => {
      window.location.href = `https://${clientName.toLowerCase()}.ambitionhire.ai/candidate/dashboard`;
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
          <CheckCircleIcon className="h-16 w-16 text-green-500" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col items-center gap-2 text-center"
        >
          <h1 className="text-2xl font-bold">Thank You!</h1>
          <p className="text-muted-foreground text-sm">
            Your interview has been completed successfully. We appreciate your
            time and effort.
          </p>

          {isValidClient ? (
            <p className="text-xs text-muted-foreground mt-4 italic">
              Redirecting to your dashboard in {countdown}{" "}
              {countdown === 1 ? "second" : "seconds"}...
            </p>
          ) : (
            <p className="text-sm text-blue-600 mt-4 font-medium">
              You can now safely close this window.
            </p>
          )}
        </motion.div>
      </div>
    </Card>
  );
}
