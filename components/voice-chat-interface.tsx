"use client";
import { Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2Icon, PhoneIcon, PhoneOffIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Orb } from "@/components/ui/orb";
import { ShimmeringText } from "@/components/ui/shimmering-text";

const DEFAULT_AGENT = {
  agentId: "agent_01k03sadvvf8vakbhkfzws1yn5",
  name: "AI Interview Bot",
  description: "Tap here to start your interview",
};

type AgentState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "disconnecting"
  | null;

interface VoiceChatInterfaceProps {
  agentState: AgentState;
  errorMessage: string | null;
  isCallActive: boolean;
  isTransitioning: boolean;
  hasAllParams: boolean;
  isValidSession: boolean;
  isLoadingStatus: boolean;
  sessionMessage: string | null;
  onCallClick: () => void;
  getInputVolume: () => number;
  getOutputVolume: () => number;
  searchParamsElement: React.ReactNode;
}

export function VoiceChatInterface({
  agentState,
  errorMessage,
  isCallActive,
  isTransitioning,
  hasAllParams,
  isValidSession,
  isLoadingStatus,
  sessionMessage,
  onCallClick,
  getInputVolume,
  getOutputVolume,
  searchParamsElement,
}: VoiceChatInterfaceProps) {
  console.log("=== VoiceChatInterface Render ===");
  console.log(
    "isTransitioning:",
    isTransitioning,
    "isCallActive:",
    isCallActive,
    "hasAllParams:",
    hasAllParams,
  );
  return (
    <Card className="flex h-screen w-screen flex-col items-center justify-center overflow-hidden p-6 rounded-none border-0">
      <div className="flex flex-col items-center gap-6">
        <Suspense fallback={null}>{searchParamsElement}</Suspense>
        <div className="relative size-32">
          <div className="bg-muted relative h-full w-full rounded-full p-1 shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]">
            <div className="bg-background h-full w-full overflow-hidden rounded-full shadow-[inset_0_0_12px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_12px_rgba(0,0,0,0.3)]">
              <Orb
                className="h-full w-full"
                volumeMode="manual"
                getInputVolume={getInputVolume}
                getOutputVolume={getOutputVolume}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <h2 className="text-xl font-semibold">{DEFAULT_AGENT.name}</h2>
          <AnimatePresence mode="wait">
            {errorMessage ? (
              <motion.p
                key="error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="text-destructive text-center text-sm"
              >
                {errorMessage}
              </motion.p>
            ) : agentState === "disconnected" || agentState === null ? (
              <motion.p
                key="disconnected"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="text-muted-foreground text-sm"
              >
                {DEFAULT_AGENT.description}
              </motion.p>
            ) : (
              <motion.div
                key="status"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center gap-2"
              >
                <div
                  className={cn(
                    "h-2 w-2 rounded-full transition-all duration-300",
                    agentState === "connected" && "bg-green-500",
                    isTransitioning && "bg-primary/60 animate-pulse",
                  )}
                />
                <span className="text-sm capitalize">
                  {isTransitioning ? (
                    <ShimmeringText text={agentState} />
                  ) : (
                    <span className="text-green-600">Connected</span>
                  )}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {isLoadingStatus ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm text-muted-foreground"
          >
            <Loader2Icon className="h-6 w-6 mx-auto mb-2 animate-spin" />
            <p>Please wait while we setup your interview session...</p>
          </motion.div>
        ) : !isValidSession ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm text-muted-foreground"
          >
            <p className="text-xs mt-2 text-muted-foreground/80">
              {sessionMessage ||
                "You have already completed this interview. Thank you for your time! If you have any questions, please contact our support team."}
            </p>
          </motion.div>
        ) : hasAllParams ? (
          <Button
            onClick={onCallClick}
            disabled={isTransitioning}
            size="icon"
            variant={isCallActive ? "secondary" : "default"}
            className="h-12 w-12 rounded-full"
          >
            <AnimatePresence mode="wait">
              {isTransitioning ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, rotate: 0 }}
                  animate={{ opacity: 1, rotate: 360 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    rotate: {
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    },
                  }}
                >
                  <Loader2Icon className="h-5 w-5" />
                </motion.div>
              ) : isCallActive ? (
                <motion.div
                  key="end"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                >
                  <PhoneOffIcon className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="start"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                >
                  <PhoneIcon className="h-5 w-5 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm text-muted-foreground"
          >
            <p>Invalid or Expired link</p>
            <p className="text-xs mt-2 text-muted-foreground/80">
              Please check the link in the email you received. If the link is
              correct but still doesn't work, contact our support team.
            </p>
          </motion.div>
        )}
      </div>
    </Card>
  );
}
