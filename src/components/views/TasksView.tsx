import React, { useState } from 'react';
import {
  CheckSquare,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  AlertTriangle,
  Sparkles,
  Trash2,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useBusinessData } from '../../context/BusinessDataContext';
import { useAuth } from '../../context/AuthContext';
import { Task, TaskPriority, TaskStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';

export const TasksView: React.FC = () => {
  const { tasks, addTask, updateTaskStatus, deleteTask } = useBusinessData();
  const { currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'HIGH' as TaskPriority,
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    assignee: 'Operations Manager',
  });

  const handleCreateTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    await addTask({
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      dueDate: formData.dueDate,
      assignee: formData.assignee,
      status: 'TODO',
      sourceSection: 'MANUAL',
    });

    setIsAddModalOpen(false);
    setFormData({
      title: '',
      description: '',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      assignee: 'Operations Manager',
    });
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.assignee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const todoCount = tasks.filter((t) => t.status === 'TODO').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Action Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-400">To-Do Queue</span>
            <p className="text-2xl font-black text-neutral-900 mt-1">{todoCount} Items</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-400">In Execution</span>
            <p className="text-2xl font-black text-blue-600 mt-1">{inProgressCount} Active</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-neutral-400">Resolved & Closed</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">{completedCount} Tasks</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search and Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search operational tasks or assignees..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-neutral-900"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['ALL', 'TODO', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === st
                    ? 'bg-neutral-900 text-white font-bold'
                    : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                {st.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <button
          id="btn-create-task"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Action Item</span>
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'COMPLETED';
            return (
              <div
                key={task.id}
                className={`bg-white rounded-2xl p-5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:shadow-md ${
                  isCompleted ? 'border-neutral-200 bg-neutral-50/50 opacity-75' : 'border-neutral-200'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1">
                  {/* Status toggle checkbox */}
                  <button
                    id={`btn-toggle-task-${task.id}`}
                    onClick={() =>
                      updateTaskStatus(task.id, isCompleted ? 'TODO' : 'COMPLETED')
                    }
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all shrink-0 mt-0.5 ${
                      isCompleted
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-neutral-300 hover:border-emerald-500 text-transparent hover:text-emerald-500'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={task.priority} />
                      <h4
                        className={`text-xs font-bold text-neutral-900 ${
                          isCompleted ? 'line-through text-neutral-400' : ''
                        }`}
                      >
                        {task.title}
                      </h4>
                      {task.sourceSection && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
                          {task.sourceSection}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-neutral-600 leading-relaxed">
                      {task.description}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-neutral-400 pt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Assignee: <strong className="text-neutral-700">{task.assignee}</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Due: <strong className="text-neutral-700">{task.dueDate}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* State selector & Delete */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <select
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                    className="px-2.5 py-1 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-bold text-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="TODO">To-Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center bg-white rounded-2xl border border-neutral-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-sm text-neutral-800">No tasks matching criteria</p>
            <p className="text-xs text-neutral-400 mt-1">Convert AI insights into tasks or create one manually.</p>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Create Operational Task"
          subtitle="Assign actionable execution items to team members"
          maxWidth="md"
        >
          <form onSubmit={handleCreateTaskSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Task Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Schedule payment recovery meeting with Danladi Supermarkets"
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-neutral-900"
              />
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">Description / SOP Instructions</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Specific operational instructions and context..."
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-neutral-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-neutral-900 font-bold"
                >
                  <option value="CRITICAL">Critical (Immediate)</option>
                  <option value="HIGH">High (Within 48h)</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-neutral-900"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">Assignee / Department</label>
              <input
                type="text"
                required
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                placeholder="e.g. Credit Control / Ibrahim Bello"
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-neutral-900"
              />
            </div>

            <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-xs"
              >
                Create Task
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
