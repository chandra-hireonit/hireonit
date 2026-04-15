"use client";
import { useRouter } from "next/navigation";
import { useCallback, useState, useEffect, Suspense } from "react";
import { useConversation } from "@elevenlabs/react";
import { useSearchParams } from "next/navigation";

import { VoiceChatInterface } from "@/components/voice-chat-interface";

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
  const [interviewStatus, setInterviewStatus] = useState<
    "Incomplete" | "In Progress" | "Complete" | null
  >(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!userIdParam || !jobIdParam) return;

    const fetchInterviewStatus = async () => {
      setIsLoadingStatus(true);
      try {
        const response = await fetch(
          "https://cmyou45.app.n8n.cloud/webhook/e1d77ba9-116a-466c-bea0-114c51fd932d",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: userIdParam,
              job_id: jobIdParam,
              client_name: clientNameParam,
            }),
          },
        );

        if (!response.ok) {
          setInterviewStatus("Incomplete");
          return;
        }

        const data = await response.json();
        console.log("Interview status response:", data);
        // API returns an array with an object containing isValidSession and message
        const result = Array.isArray(data) ? data[0] : data;
        console.log("Parsed interview status result:", result);

        if (result?.message) {
          setSessionMessage(result.message);
        }

        if (result?.isValidSession) {
          setInterviewStatus("Incomplete");
          console.log("Valid session - interview can proceed.");
        } else {
          setInterviewStatus("Complete");
          console.log(
            "Invalid session - interview already completed or expired.",
          );
        }
      } catch (error) {
        console.error("Error fetching interview status:", error);
        setInterviewStatus("Incomplete");
      } finally {
        setIsLoadingStatus(false);
      }
    };

    fetchInterviewStatus();
  }, [userIdParam, jobIdParam]);

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
      setAgentId(searchParams.get("agent_id"));
      setUserId(searchParams.get("var_user_id"));
      setJobId(searchParams.get("var_job_id"));
      setClientName(searchParams.get("var_client_name"));
    }, [searchParams, setAgentId, setUserId, setJobId, setClientName]);
    return null;
  }

  const conversation = useConversation({
    onConnect: () => {
      setInterviewStatus("In Progress");
    },
    onDisconnect: () => {
      setInterviewStatus("Complete");
      router.push("/thankyou");
    },
    onError: (error) => {
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
      setAgentState("disconnected");
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setErrorMessage(
          "Please enable microphone permissions in your browser.",
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
    agentIdParam && userIdParam && jobIdParam && clientNameParam,
  );

  return (
    <Suspense fallback={null}>
      <VoiceChatInterface
        agentState={agentState}
        errorMessage={errorMessage}
        isCallActive={isCallActive}
        isTransitioning={isTransitioning}
        hasAllParams={hasAllParams}
        isValidSession={interviewStatus === "Incomplete"}
        isLoadingStatus={isLoadingStatus}
        sessionMessage={sessionMessage}
        onCallClick={handleCall}
        getInputVolume={getInputVolume}
        getOutputVolume={getOutputVolume}
        searchParamsElement={
          <SearchParamsSetter
            setAgentId={setAgentIdParam}
            setUserId={setUserIdParam}
            setJobId={setJobIdParam}
            setClientName={setClientNameParam}
          />
        }
      />
    </Suspense>
  );
}
