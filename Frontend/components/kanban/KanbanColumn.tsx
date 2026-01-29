import type { KanbanColumn as KanbanColumnType } from "@/types/task";
import TaskCard from "./TaskCard";

interface KanbanColumnProps {
  column: KanbanColumnType;
}

export default function KanbanColumn({ column }: KanbanColumnProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-dark-border">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${column.color}`} />
          <h3 className="text-white font-semibold">{column.title}</h3>
          <span className="px-2 py-0.5 bg-dark-bg text-slate-400 text-xs rounded-full">
            {column.tasks.length}
          </span>
        </div>
        <button
          className="text-slate-400 hover:text-white transition-colors"
          aria-label="Add new task"
          title="Add new task"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>

      {/* Tasks List */}
      <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2">
        {column.tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-500 text-sm">
            <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p>No tasks</p>
          </div>
        ) : (
          column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))
        )}
      </div>
    </div>
  );
}

// Made with Bob