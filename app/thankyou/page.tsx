"use client";

import { useEffect, useState } from "react"; // Added useState
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircleIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function ThankYouPage() {
  const router = useRouter();
  // 1. Initialize state for the countdown
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const clientName = localStorage.getItem("var_client_name");

    // 2. Interval to handle the visual countdown
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    // 3. Timeout to handle the actual redirection
    const redirectTimeout = setTimeout(() => {
      if (clientName) {
        window.location.href = `https://${clientName}.ambitionhire.ai/candidate/dashboard`;
      } else {
        window.location.href = `https://services.ambitionhire.ai/candidate/dashboard`;
        console.error("Client name not found in localStorage");
      }
    }, 5000);

    // Cleanup both the interval and the timeout
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

          {/* 4. Display the dynamic countdown state here */}
          <p className="text-xs text-muted-foreground mt-4 italic">
            Redirecting to your dashboard in {countdown}{" "}
            {countdown === 1 ? "second" : "seconds"}...
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex gap-3"
        ></motion.div>
      </div>
    </Card>
  );
}
