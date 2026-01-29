import type { Task } from "@/types/task";

interface TaskCardProps {
  task: Task;
}

const priorityColors = {
  low: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  medium: 'bg-primary/20 text-primary-light border-primary/30',
  high: 'bg-warning/20 text-warning-light border-warning/30',
  urgent: 'bg-danger/20 text-danger-light border-danger/30',
};

export default function TaskCard({ task }: TaskCardProps) {
  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg p-4 hover:border-primary/50 transition-all duration-200 cursor-pointer group">
      {/* Priority Badge */}
      <div className="flex items-center justify-between mb-3">
        <span className={`px-2 py-1 rounded text-xs font-medium border ${priorityColors[task.priority]}`}>
          {task.priority.toUpperCase()}
        </span>
        {task.dueDate && (
          <span className="text-xs text-slate-500 flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Task Title */}
      <h3 className="text-white font-medium mb-2 group-hover:text-primary transition-colors">
        {task.title}
      </h3>

      {/* Task Description */}
      {task.description && (
        <p className="text-slate-400 text-sm mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {task.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-dark-bg text-slate-400 text-xs rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Assignee */}
      {task.assignee && (
        <div className="flex items-center text-sm text-slate-400">
          <div className="w-6 h-6 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center text-white text-xs font-semibold mr-2">
            {task.assignee.avatar}
          </div>
          <span>{task.assignee.name}</span>
        </div>
      )}
    </div>
  );
}

// Made with Bob