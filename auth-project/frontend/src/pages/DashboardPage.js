import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tasksAPI } from '../utils/api';

const priorityColors = {
  high: '#ff6b6b',
  medium: '#ffa94d',
  low: '#69db7c',
};

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState('medium');
  const [apiError, setApiError] = useState('');

  // ── Fetch protected tasks from backend ─────────────────────────────────────
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await tasksAPI.getAll();
        setTasks(res.data.data);
      } catch (err) {
        setApiError(err.response?.data?.message || 'Failed to load tasks.');
      } finally {
        setLoadingTasks(false);
      }
    };
    fetchTasks();
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    try {
      const res = await tasksAPI.create({ title: newTask.trim(), priority });
      setTasks((prev) => [...prev, res.data.data]);
      setNewTask('');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Could not add task.');
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await tasksAPI.toggle(id);
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? res.data.data : t))
      );
    } catch (err) {
      setApiError('Could not update task.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await tasksAPI.delete(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setApiError('Could not delete task.');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const completedCount = tasks.filter((t) => t.done).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="dashboard">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="dash-header">
        <div className="dash-brand">
          <span className="brand-icon">⬡</span>
          <span className="brand-name">NexAuth</span>
        </div>
        <div className="dash-user">
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-email">{user?.email}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </header>

      <main className="dash-main">
        {/* ── Welcome ──────────────────────────────────────────────────────── */}
        <section className="dash-welcome">
          <h1>
            Hello, <span className="accent">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="welcome-sub">
            You have <strong>{tasks.length - completedCount}</strong> tasks remaining today.
          </p>

          {tasks.length > 0 && (
            <div className="progress-area">
              <div className="progress-labels">
                <span>Overall progress</span>
                <span>{progress}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </section>

        {/* ── JWT Info Panel ────────────────────────────────────────────────── */}
        <section className="jwt-panel">
          <div className="jwt-badge">🔐 JWT Protected Route</div>
          <p className="jwt-info">
            This dashboard is only accessible with a valid JSON Web Token stored in{' '}
            <code>localStorage</code>. Your middleware verified it on every API call to{' '}
            <code>/api/tasks</code>.
          </p>
          <div className="token-preview">
            <span className="token-label">Your token:</span>
            <code className="token-value">
              {localStorage.getItem('authToken')?.slice(0, 40)}...
            </code>
          </div>
        </section>

        {/* ── Error ────────────────────────────────────────────────────────── */}
        {apiError && (
          <div className="error-banner">
            <span>⚠</span> {apiError}
            <button className="clear-err" onClick={() => setApiError('')}>✕</button>
          </div>
        )}

        {/* ── Add Task ─────────────────────────────────────────────────────── */}
        <section className="task-section">
          <h2 className="section-title">Tasks</h2>
          <form onSubmit={handleAddTask} className="add-task-form">
            <input
              type="text"
              className="field-input task-input"
              placeholder="Add a new task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
            />
            <select
              className="priority-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="high">🔴 High</option>
              <option value="medium">🟠 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
            <button type="submit" className="submit-btn add-btn">
              Add
            </button>
          </form>

          {/* ── Task List ──────────────────────────────────────────────────── */}
          {loadingTasks ? (
            <div className="tasks-loading">Loading tasks from protected API...</div>
          ) : tasks.length === 0 ? (
            <div className="tasks-empty">
              <span>✓</span>
              <p>No tasks yet. Add one above!</p>
            </div>
          ) : (
            <ul className="task-list">
              {tasks.map((task) => (
                <li key={task.id} className={`task-item ${task.done ? 'done' : ''}`}>
                  <button
                    className="task-check"
                    onClick={() => handleToggle(task.id)}
                    aria-label="Toggle task"
                  >
                    {task.done ? '✓' : ''}
                  </button>
                  <div className="task-body">
                    <span className="task-title">{task.title}</span>
                    <span
                      className="task-priority"
                      style={{ color: priorityColors[task.priority] }}
                    >
                      ● {task.priority}
                    </span>
                  </div>
                  <button
                    className="task-delete"
                    onClick={() => handleDelete(task.id)}
                    aria-label="Delete task"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <div className="bg-orb orb-dash-1" />
      <div className="bg-orb orb-dash-2" />
    </div>
  );
};

export default DashboardPage;
