"use client";
import { motion } from "framer-motion";
import { CheckCircleIcon } from "lucide-react";

import { Card } from "@/components/ui/card";

export default function ThankYouPage() {
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
