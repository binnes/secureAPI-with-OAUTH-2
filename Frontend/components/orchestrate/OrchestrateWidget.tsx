/**
 * Orchestrate Widget Component
 * Integrates IBM watsonx Orchestrate web chat widget
 * This is the PRIMARY interface for accessing schedule data and AI capabilities
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { ExtendedSession } from "@/types";

// Orchestrate configuration from environment variables
const ORCHESTRATE_CONFIG = {
  integrationID: process.env.NEXT_PUBLIC_ORCHESTRATE_INTEGRATION_ID,
  region: process.env.NEXT_PUBLIC_ORCHESTRATE_REGION || "us-south",
  serviceInstanceID: process.env.NEXT_PUBLIC_ORCHESTRATE_SERVICE_INSTANCE_ID,
};

export default function OrchestrateWidget() {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const widgetContainerRef = useRef<HTMLDivElement>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Orchestrate is configured
    if (!ORCHESTRATE_CONFIG.integrationID || !ORCHESTRATE_CONFIG.serviceInstanceID) {
      setError("Orchestrate widget is not configured. Please set environment variables.");
      return;
    }

    setIsConfigured(true);

    // Initialize Orchestrate widget
    const initializeWidget = () => {
      // Check if watsonxOrchestrate is available
      if (typeof window !== "undefined" && (window as any).watsonxOrchestrate) {
        try {
          (window as any).watsonxOrchestrate.init({
            integrationID: ORCHESTRATE_CONFIG.integrationID,
            region: ORCHESTRATE_CONFIG.region,
            serviceInstanceID: ORCHESTRATE_CONFIG.serviceInstanceID,
            // Pass user context if authenticated
            userID: session?.user?.email || session?.user?.name,
            // Token for authentication with Orchestrate
            // This should be exchanged via OAuth 2.0 Token Exchange (RFC 8693)
            jwt: session?.accessToken,
            onLoad: function (instance: any) {
              console.log("Orchestrate widget loaded successfully");
              instance.render();
            },
            onError: function (error: any) {
              console.error("Orchestrate widget error:", error);
              setError("Failed to load Orchestrate widget");
            },
          });
        } catch (err) {
          console.error("Error initializing Orchestrate widget:", err);
          setError("Failed to initialize Orchestrate widget");
        }
      } else {
        // Widget script not loaded yet, retry
        setTimeout(initializeWidget, 100);
      }
    };

    // Load Orchestrate widget script
    const script = document.createElement("script");
    script.src = `https://web-chat.global.assistant.watson.appdomain.cloud/versions/${ORCHESTRATE_CONFIG.region}/WatsonAssistantChatEntry.js`;
    script.async = true;
    script.onload = initializeWidget;
    script.onerror = () => {
      setError("Failed to load Orchestrate widget script");
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup: remove script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [session]);

  // Show configuration placeholder if not configured
  if (!isConfigured && !error) {
    return (
      <div className="flex items-center justify-center p-8 h-full">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Configuration Required
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            The watsonx Orchestrate widget needs to be configured with your integration credentials.
          </p>
          <div className="bg-dark-bg rounded-lg p-4 text-left border border-dark-border">
            <p className="text-xs font-mono text-slate-300 mb-2">
              Required environment variables:
            </p>
            <ul className="text-xs font-mono text-slate-400 space-y-1">
              <li>NEXT_PUBLIC_ORCHESTRATE_INTEGRATION_ID</li>
              <li>NEXT_PUBLIC_ORCHESTRATE_REGION</li>
              <li>NEXT_PUBLIC_ORCHESTRATE_SERVICE_INSTANCE_ID</li>
            </ul>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            See documentation for setup instructions
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center p-8 h-full">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Widget Error
          </h3>
          <p className="text-sm text-slate-400 mb-4">{error}</p>
          <p className="text-xs text-slate-500">
            Check console for more details
          </p>
        </div>
      </div>
    );
  }

  // Widget container
  return (
    <div className="h-full flex flex-col">
      <div 
        ref={widgetContainerRef}
        className="flex-1 min-h-[500px] rounded-lg overflow-hidden"
        id="orchestrate-widget-container"
      >
        {/* Orchestrate widget will be rendered here */}
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-slate-400">Loading AI assistant...</p>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-dark-border">
        <p className="text-xs text-slate-500 text-center">
          Ask about your tasks, get AI-powered assistance, or manage your schedule
        </p>
      </div>
    </div>
  );
}

// Made with Bob
