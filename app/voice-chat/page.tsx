"use client";
import { useRouter } from "next/navigation";
import { useCallback, useState, useEffect, Suspense } from "react";
import { useConversation } from "@elevenlabs/react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2Icon, PhoneIcon, PhoneOffIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Orb } from "@/components/ui/orb";
import { ShimmeringText } from "@/components/ui/shimmering-text";
import { useSearchParams } from "next/navigation";

const DEFAULT_AGENT = {
  agentId: "agent_01k03sadvvf8vakbhkfzws1yn5",
  name: "Hire On It Interview Bot",
  description: "Tap to start a voice interview with Hire On It.",
};

type AgentState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "disconnecting"
  | null;

export default function Page() {
  const [agentState, setAgentState] = useState<AgentState>("disconnected");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  // search params are read inside a Suspense-wrapped client helper to satisfy
  // Next.js expectations when using `useSearchParams` in the app router.
  const [agentIdParam, setAgentIdParam] = useState<string | null>(null);
  const [userIdParam, setUserIdParam] = useState<string | null>(null);
  const [jobIdParam, setJobIdParam] = useState<string | null>(null);
  const [clientNameParam, setClientNameParam] = useState<string | null>(null);

  function SearchParamsSetter({
    setAgentId,
    setUserId,
    setJobId,
    setClientName,
  }: {
    setAgentId: (v: string | null) => void;
    setUserId: (v: string | null) => void;
    setJobId: (v: string | null) => void;
    setClientName: (v: string | null) => void;
  }) {
    const searchParams = useSearchParams();
    useEffect(() => {
      setAgentId(searchParams.get("var_agent_id"));
      setUserId(searchParams.get("var_user_id"));
      setJobId(searchParams.get("var_job_id"));
      setClientName(searchParams.get("var_client_name"));
    }, [searchParams, setAgentId, setUserId, setJobId, setClientName]);
    return null;
  }

  const conversation = useConversation({
    onConnect: () => console.log("Connected"),
    onDisconnect: () => {
      console.log("Disconnected");
      router.push("/thankyou");
    },
    onMessage: (message) => console.log("Message:", message),
    onError: (error) => {
      console.error("Error:", error);
      setAgentState("disconnected");
    },
  });

  const startConversation = useCallback(async () => {
    try {
      setErrorMessage(null);
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: agentIdParam || "unknown_agent",
        dynamicVariables: {
          user_id: userIdParam || "unknown_user",
          job_id: jobIdParam || "unknown_job",
          client_name: clientNameParam || "unknown_client",
        },
        connectionType: "webrtc",
        onStatusChange: (status) => setAgentState(status.status),
      });
    } catch (error) {
      console.error("Error starting conversation:", error);
      setAgentState("disconnected");
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setErrorMessage(
          "Please enable microphone permissions in your browser."
        );
      }
    }
  }, [conversation, agentIdParam, userIdParam, jobIdParam, clientNameParam]);

  const handleCall = useCallback(() => {
    if (agentState === "disconnected" || agentState === null) {
      setAgentState("connecting");
      startConversation();
    } else if (agentState === "connected") {
      conversation.endSession();
      setAgentState("disconnected");
    }
  }, [agentState, conversation, startConversation]);

  const isCallActive = agentState === "connected";
  const isTransitioning =
    agentState === "connecting" || agentState === "disconnecting";

  const getInputVolume = useCallback(() => {
    const rawValue = conversation.getInputVolume?.() ?? 0;
    return Math.min(1.0, Math.pow(rawValue, 0.5) * 2.5);
  }, [conversation]);

  const getOutputVolume = useCallback(() => {
    const rawValue = conversation.getOutputVolume?.() ?? 0;
    return Math.min(1.0, Math.pow(rawValue, 0.5) * 2.5);
  }, [conversation]);

  const hasAllParams = Boolean(
    agentIdParam && userIdParam && jobIdParam && clientNameParam
  );

  return (
    <Card className="flex h-[400px] w-full flex-col items-center justify-center overflow-hidden p-6">
      <div className="flex flex-col items-center gap-6">
        <Suspense fallback={null}>
          <SearchParamsSetter
            setAgentId={setAgentIdParam}
            setUserId={setUserIdParam}
            setJobId={setJobIdParam}
            setClientName={setClientNameParam}
          />
        </Suspense>
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
                    isTransitioning && "bg-primary/60 animate-pulse"
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

        {hasAllParams ? (
          <Button
            onClick={handleCall}
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
                    rotate: { duration: 1, repeat: Infinity, ease: "linear" },
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
                  <PhoneIcon className="h-5 w-5" />
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
            <p>Invalid or expired link</p>
            <p className="text-xs mt-2 text-muted-foreground/80">
              Please check the link in the email you received. If the link is
              correct but still doesn't work, contact our support team .
            </p>
          </motion.div>
        )}
      </div>
    </Card>
  );
}
