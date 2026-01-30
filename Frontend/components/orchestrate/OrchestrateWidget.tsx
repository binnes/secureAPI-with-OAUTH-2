/**
 * Orchestrate Widget Component
 * Integrates IBM watsonx Orchestrate web chat widget (Local Developer Edition)
 * This is the PRIMARY interface for accessing schedule data and AI capabilities
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { ExtendedSession } from "@/types";

// Local Orchestrate configuration for Developer Edition
// Generated via: orchestrate channels webchat embed --agent-name schedule_assistant --env draft
const ORCHESTRATE_CONFIG = {
  hostURL: "https://dl.watson-orchestrate.ibm.com", // IBM Cloud CDN
  orchestrationID: "1347f097-e475-4558-b2df-cba7f1eb2288",
  agentId: "7e78e8e6-27a7-4922-bb90-955c5367778e", // schedule_assistant
  agentEnvironmentId: "bf531e9c-706a-49ec-b67d-cd05e6d9df0b", // draft environment ID
};

// Extend Window interface for Orchestrate
declare global {
  interface Window {
    wxOConfiguration?: any;
    wxOChat?: any;
  }
}

export default function OrchestrateWidget() {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!session) {
      return;
    }

    const initializeChat = async () => {
      try {
        // Configure Orchestrate - EXACTLY matching CLI-generated format
        window.wxOConfiguration = {
          orchestrationID: ORCHESTRATE_CONFIG.orchestrationID,
          hostURL: ORCHESTRATE_CONFIG.hostURL,
          rootElementID: "root",
          showLauncher: false,
          chatOptions: {
            agentId: ORCHESTRATE_CONFIG.agentId,
            agentEnvironmentId: ORCHESTRATE_CONFIG.agentEnvironmentId,
            onLoad: (chat: any) => {
              console.log("Orchestrate chat loaded successfully");
              console.log("User context:", {
                username: session.user?.name,
                email: session.user?.email,
                hasAccessToken: !!session.accessToken,
              });
              chatInstanceRef.current = chat;
              setIsLoaded(true);
              setError(null);
            },
            onError: (error: any) => {
              console.error("Orchestrate chat error:", error);
              setError("Chat failed to load. Please try again.");
            },
          },
          layout: {
            form: "float",
            showOrchestrateHeader: true,
          },
          style: {
            headerColor: "#0f62fe",
            primaryColor: "#0f62fe",
            userMessageBackgroundColor: "#0f62fe",
            showBackgroundGradient: true,
          },
          // Pass the Keycloak access token for OAuth Token Exchange
          token: session.accessToken,
        };

        // Load script EXACTLY as CLI generates it
        setTimeout(() => {
          const script = document.createElement("script");
          script.src = `${window.wxOConfiguration.hostURL}/wxoLoader.js?embed=true`;
          script.addEventListener("load", function () {
            console.log("Orchestrate script loaded from:", script.src);
            if ((window as any).wxoLoader) {
              (window as any).wxoLoader.init();
            }
          });
          script.addEventListener("error", () => {
            console.error("Failed to load Orchestrate script from:", script.src);
            setError("Failed to load Orchestrate chat script. Is the Orchestrate chat server running on port 3000?");
          });
          document.head.appendChild(script);
        }, 0);

        return () => {
          // Cleanup handled by component unmount
        };
      } catch (error) {
        console.error("Error initializing Orchestrate chat:", error);
        setError("Failed to initialize chat");
      }
    };

    initializeChat();

    return () => {
      if (chatInstanceRef.current) {
        try {
          chatInstanceRef.current.destroy();
        } catch (e) {
          console.error("Error destroying chat:", e);
        }
      }
    };
  }, [session]);

  // Reset chat function
  const resetChat = () => {
    if (chatInstanceRef.current) {
      try {
        chatInstanceRef.current.destroy();
      } catch (e) {
        console.error("Error destroying chat:", e);
      }
      chatInstanceRef.current = null;
    }
    setIsLoaded(false);
    
    // Delete user cookie to force new session
    document.cookie = 'WXO_USER_ID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Reinitialize after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  // Show loading state if not authenticated
  if (!session) {
    return (
      <div className="flex items-center justify-center p-8 h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm text-slate-400">Please sign in to use the AI assistant</p>
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
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Widget container
  return (
    <div className="relative h-full flex flex-col">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-bg/50 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-slate-400">Connecting to AI assistant...</p>
          </div>
        </div>
      )}
      
      <div
        id="root"
        className="flex-1 min-h-[500px] rounded-lg overflow-hidden"
      />

      {isLoaded && (
        <div className="mt-4 pt-4 border-t border-dark-border flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Ask about your schedule, tasks, or get AI-powered assistance
          </p>
          <button
            onClick={resetChat}
            className="px-3 py-1 bg-slate-700 text-white rounded hover:bg-slate-600 text-xs"
            title="Reset chat and refresh context"
          >
            🔄 Reset
          </button>
        </div>
      )}
    </div>
  );
}

// Made with Bob
