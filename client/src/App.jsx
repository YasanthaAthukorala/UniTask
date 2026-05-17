import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from './context/AuthContext';
import AuthPage from './components/AuthPage';
import Header from './components/Header';
import TabBar from './components/TabBar';
import GigFilters from './components/GigFilters';
import GigSection from './components/GigSection';
import TaskForm from './components/TaskForm';
import RatingModal from './components/RatingModal';
import * as api from './api/tasks';
import { formatCurrency } from './utils/format';
import './App.css';

function getOwnerId(task) {
  const owner = task.postedBy?._id || task.postedBy;
  return owner ? String(owner) : null;
}

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [ratingTask, setRatingTask] = useState(null);
  const [activeTab, setActiveTab] = useState('explore');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');

  const loadTasks = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const data = await api.fetchTasks({ search, category, sort });
      setTasks(data);
    } catch (err) {
      setError(err.message || 'Could not load gigs.');
    } finally {
      setLoading(false);
    }
  }, [search, category, sort]);

  useEffect(() => {
    if (user) loadTasks();
  }, [user, loadTasks]);

  const { myGigs, exploreGigs } = useMemo(() => {
    if (!user) return { myGigs: [], exploreGigs: [] };
    const mine = [];
    const explore = [];
    for (const task of tasks) {
      const ownerId = getOwnerId(task);
      if (!ownerId) continue;
      if (ownerId === String(user._id)) mine.push(task);
      else explore.push(task);
    }
    return { myGigs: mine, exploreGigs: explore };
  }, [tasks, user]);

  if (authLoading) {
    return <p className="loading screen-loading">Loading…</p>;
  }

  if (!user) {
    return <AuthPage />;
  }

  function openCreate() {
    setEditingTask(null);
    setFormOpen(true);
  }

  function openEdit(task) {
    setEditingTask(task);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingTask(null);
  }

  async function handleSubmit(payload) {
    if (editingTask) {
      await api.updateTask(editingTask._id, payload);
    } else {
      await api.createTask(payload);
    }
    await loadTasks();
  }

  async function handleDelete(id) {
    if (!window.confirm('Remove this gig?')) return;
    try {
      await api.deleteTask(id);
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleHire(task) {
    if (
      !window.confirm(
        `Hire "${task.title}" for ${formatCurrency(task.budget)}? The owner will be notified.`
      )
    ) {
      return;
    }
    try {
      await api.hireTask(task._id);
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRate({ stars, comment }) {
    await api.rateTask(ratingTask._id, { stars, comment });
    await loadTasks();
  }

  const tabTasks = activeTab === 'mine' ? myGigs : exploreGigs;
  const tabEmpty =
    activeTab === 'mine'
      ? "You haven't posted any gigs yet."
      : 'No gigs from others match your search.';

  return (
    <div className="app">
      <Header onPostClick={openCreate} />

      <main className="main">
        {error && (
          <div className="alert alert-error" role="alert">
            {error}
            <button type="button" className="alert-dismiss" onClick={() => setError('')}>
              ×
            </button>
          </div>
        )}

        <section className="hero">
          <div className="hero-content">
            <div className="hero-badge">Welcome to UniTask</div>
            <h2>Elevate your <span className="highlight">Campus Gigs</span></h2>
            <p>Post gigs with contact info, explore curated listings, and hire top talent instantly. Owners get notified in real-time.</p>
          </div>
        </section>

        <TabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          myCount={myGigs.length}
          exploreCount={exploreGigs.length}
        />

        <GigFilters
          search={search}
          category={category}
          sort={sort}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
          onSortChange={setSort}
        />

        {loading ? (
          <p className="loading">Loading gigs…</p>
        ) : (
          <GigSection
            title={activeTab === 'mine' ? 'Your posted gigs' : 'Explore gigs'}
            subtitle={
              activeTab === 'mine'
                ? 'Manage your listings. You are notified when someone hires a gig.'
                : 'Browse others’ gigs, view contact details, and hire available listings.'
            }
            tasks={tabTasks}
            emptyMessage={tabEmpty}
            currentUserId={user._id}
            onEdit={activeTab === 'mine' ? openEdit : undefined}
            onDelete={activeTab === 'mine' ? handleDelete : undefined}
            onHire={activeTab === 'explore' ? handleHire : undefined}
            onRate={activeTab === 'explore' ? (task) => setRatingTask(task) : undefined}
            onPostClick={activeTab === 'mine' ? openCreate : undefined}
          />
        )}
      </main>

      <TaskForm open={formOpen} task={editingTask} onClose={closeForm} onSubmit={handleSubmit} />

      <RatingModal
        task={ratingTask}
        currentUserId={user._id}
        open={Boolean(ratingTask)}
        onClose={() => setRatingTask(null)}
        onSubmit={handleRate}
      />
    </div>
  );
}
