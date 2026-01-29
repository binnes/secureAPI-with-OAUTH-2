"use client";

import { useState } from "react";
import type { Task, KanbanColumn as KanbanColumnType } from "@/types/task";
import KanbanColumn from "./KanbanColumn";

// Mock data for demonstration
const mockTasks: Task[] = [
  {
    id: "1",
    title: "Design new dashboard layout",
    description: "Create wireframes and mockups for the new dashboard interface",
    status: "in-progress",
    priority: "high",
    dueDate: "2026-02-05",
    tags: ["design", "ui/ux"],
    assignee: {
      name: "Sarah Chen",
      avatar: "SC"
    }
  },
  {
    id: "2",
    title: "Implement user authentication",
    description: "Set up OAuth 2.0 with Keycloak integration",
    status: "in-progress",
    priority: "urgent",
    dueDate: "2026-02-03",
    tags: ["backend", "security"],
    assignee: {
      name: "John Doe",
      avatar: "JD"
    }
  },
  {
    id: "3",
    title: "Write API documentation",
    description: "Document all REST endpoints with examples",
    status: "todo",
    priority: "medium",
    dueDate: "2026-02-10",
    tags: ["documentation"],
    assignee: {
      name: "Mike Wilson",
      avatar: "MW"
    }
  },
  {
    id: "4",
    title: "Code review: Payment module",
    description: "Review and approve payment processing implementation",
    status: "review",
    priority: "high",
    dueDate: "2026-02-02",
    tags: ["review", "backend"],
    assignee: {
      name: "Sarah Chen",
      avatar: "SC"
    }
  },
  {
    id: "5",
    title: "Setup CI/CD pipeline",
    description: "Configure automated testing and deployment",
    status: "done",
    priority: "medium",
    dueDate: "2026-01-28",
    tags: ["devops", "automation"],
    assignee: {
      name: "Alex Kumar",
      avatar: "AK"
    }
  },
  {
    id: "6",
    title: "Database migration script",
    description: "Create migration for new user preferences table",
    status: "todo",
    priority: "low",
    dueDate: "2026-02-15",
    tags: ["database"],
    assignee: {
      name: "John Doe",
      avatar: "JD"
    }
  },
  {
    id: "7",
    title: "Performance optimization",
    description: "Optimize API response times and reduce database queries",
    status: "review",
    priority: "medium",
    dueDate: "2026-02-08",
    tags: ["performance", "backend"],
    assignee: {
      name: "Mike Wilson",
      avatar: "MW"
    }
  },
  {
    id: "8",
    title: "Mobile responsive design",
    description: "Ensure all pages work correctly on mobile devices",
    status: "done",
    priority: "high",
    dueDate: "2026-01-30",
    tags: ["frontend", "mobile"],
    assignee: {
      name: "Sarah Chen",
      avatar: "SC"
    }
  }
];

export default function KanbanBoard() {
  const [tasks] = useState<Task[]>(mockTasks);

  // Group tasks by status
  const columns: KanbanColumnType[] = [
    {
      id: "todo",
      title: "To Do",
      tasks: tasks.filter(task => task.status === "todo"),
      color: "bg-slate-500"
    },
    {
      id: "in-progress",
      title: "In Progress",
      tasks: tasks.filter(task => task.status === "in-progress"),
      color: "bg-blue-500"
    },
    {
      id: "review",
      title: "Review",
      tasks: tasks.filter(task => task.status === "review"),
      color: "bg-purple-500"
    },
    {
      id: "done",
      title: "Done",
      tasks: tasks.filter(task => task.status === "done"),
      color: "bg-green-500"
    }
  ];

  return (
    <div className="h-full">
      {/* Board Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Project Board</h2>
          <p className="text-slate-400">Manage your tasks and track progress</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-dark-surface border border-dark-border text-slate-300 rounded-lg hover:bg-dark-hover transition-colors">
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all">
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Task
          </button>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-[calc(100vh-280px)]">
        {columns.map((column) => (
          <div key={column.id} className="bg-dark-surface border border-dark-border rounded-lg p-4">
            <KanbanColumn column={column} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Made with Bob