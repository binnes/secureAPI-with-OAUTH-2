import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import ChatWidget from "@/components/orchestrate/ChatWidget";

export default async function ApplicationPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {session.user?.name || "User"}
          </h1>
          <p className="text-slate-400">
            Manage your projects and collaborate with your team
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kanban Board - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <KanbanBoard />
          </div>

          {/* AI Assistant Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-dark-surface border border-dark-border rounded-lg p-6 sticky top-8">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-white mb-2">AI Assistant</h2>
                <p className="text-slate-400 text-sm">
                  Get help with your tasks and projects
                </p>
              </div>
              <ChatWidget />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
