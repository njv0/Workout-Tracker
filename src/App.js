import React, { useState, useEffect, useRef } from "react";
import WorkoutForm from "./components/WorkoutForm";
import ExerciseList from "./components/ExerciseList";
import HistoryView from "./components/HistoryView";
import ExerciseAvatar from "./components/ExerciseAvatar";
import { addWorkout, getWorkouts, deleteWorkout, getTemplates, addTemplate, deleteTemplate } from "./lib/storage";

function App() {
  const [sets, setSets] = useState([]); // now holds exercises: [{ exercise, sets: [{weight,reps,done}] }]
  const [showHistory, setShowHistory] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryQuery, setLibraryQuery] = useState('');
  const [replacingIndex, setReplacingIndex] = useState(null);
  const [menuOpenIndex, setMenuOpenIndex] = useState(null);
  const [panelMenuOpen, setPanelMenuOpen] = useState(false);
  const [workoutTitle, setWorkoutTitle] = useState('My Workout');
  const [editingTitle, setEditingTitle] = useState(false);
  const titleInputRef = useRef(null);
  const [workouts, setWorkouts] = useState([]);
  const [activePage, setActivePage] = useState('start'); // 'start' | 'history' | 'exercises'
  const EXERCISES = [
    { id: 'chest-1', name: 'Bench Press', group: 'Chest', equipment: 'Barbell' },
    { id: 'chest-2', name: 'Dumbbell Flyes', group: 'Chest', equipment: 'Dumbbell' },
    { id: 'shoulders-1', name: 'Overhead Press', group: 'Shoulders', equipment: 'Barbell' },
    { id: 'shoulders-2', name: 'Lateral Raise', group: 'Shoulders', equipment: 'Dumbbell' },
    { id: 'biceps-1', name: 'Barbell Curl', group: 'Biceps', equipment: 'Barbell' },
    { id: 'biceps-2', name: 'Hammer Curl', group: 'Biceps', equipment: 'Dumbbell' },
    { id: 'triceps-1', name: 'Triceps Pushdown', group: 'Triceps', equipment: 'Cable' },
    { id: 'triceps-2', name: 'Close-Grip Bench', group: 'Triceps', equipment: 'Barbell' },
    { id: 'traps-1', name: 'Barbell Shrug', group: 'Traps', equipment: 'Barbell' },
    { id: 'traps-2', name: 'Upright Row', group: 'Traps', equipment: 'Barbell' },
    { id: 'lats-1', name: 'Pull-Up', group: 'Lats', equipment: 'Bodyweight' },
    { id: 'lats-2', name: 'Lat Pulldown', group: 'Lats', equipment: 'Cable' },
    { id: 'erectors-1', name: 'Deadlift', group: 'Erectors', equipment: 'Barbell' },
    { id: 'erectors-2', name: 'Back Extension', group: 'Erectors', equipment: 'Bodyweight' },
    { id: 'glutes-1', name: 'Hip Thrust', group: 'Glutes', equipment: 'Barbell' },
    { id: 'glutes-2', name: 'Glute Bridge', group: 'Glutes', equipment: 'Bodyweight' },
    { id: 'quads-1', name: 'Squat', group: 'Quads', equipment: 'Barbell' },
    { id: 'quads-2', name: 'Leg Press', group: 'Quads', equipment: 'Machine' },
    { id: 'hipflex-1', name: 'Hanging Leg Raise', group: 'Hip Flexors', equipment: 'Bodyweight' },
    { id: 'hipflex-2', name: 'Seated Knee Raise', group: 'Hip Flexors', equipment: 'Machine' },
    { id: 'core-1', name: 'Plank', group: 'Core', equipment: 'Bodyweight' },
    { id: 'core-2', name: 'Russian Twist', group: 'Core', equipment: 'Bodyweight' },
    { id: 'ham-1', name: 'Romanian Deadlift', group: 'Hamstrings', equipment: 'Barbell' },
    { id: 'ham-2', name: 'Leg Curl', group: 'Hamstrings', equipment: 'Machine' },
    { id: 'add-1', name: 'Cable Adduction', group: 'Adductors', equipment: 'Cable' },
    { id: 'add-2', name: 'Seated Adductor', group: 'Adductors', equipment: 'Machine' },
    { id: 'forearms-1', name: 'Wrist Curl', group: 'Forearms', equipment: 'Barbell' },
    { id: 'forearms-2', name: 'Farmer\'s Carry', group: 'Forearms', equipment: 'Dumbbell' },
    { id: 'calves-1', name: 'Standing Calf Raise', group: 'Calves', equipment: 'Machine' },
    { id: 'calves-2', name: 'Seated Calf Raise', group: 'Calves', equipment: 'Machine' },
  ];
  const [exerciseQuery, setExerciseQuery] = useState('');
  const [expandedExerciseId, setExpandedExerciseId] = useState(null);
  const [muscleFilter, setMuscleFilter] = useState('Any Muscle Group');
  const [equipmentFilter, setEquipmentFilter] = useState('Any Equipment');
  const [sortOption, setSortOption] = useState('name'); // 'name' | 'recent'
  const [groupMenuOpen, setGroupMenuOpen] = useState(false);
  const [equipMenuOpen, setEquipMenuOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  const muscleGroups = Array.from(new Set(EXERCISES.map(e => e.group))).sort();
  const equipments = Array.from(new Set(EXERCISES.map(e => e.equipment))).sort();

  // compute last-used timestamp per exercise name from workouts
  const lastUsedMap = React.useMemo(() => {
    const map = {};
    try {
      const ws = getWorkouts();
      ws.forEach(w => {
        const t = new Date(w.date).getTime();
        (w.sets || []).forEach(ex => {
          const name = ex.exercise || ex.name;
          if (!name) return;
          if (!map[name] || map[name] < t) map[name] = t;
        });
      });
    } catch (e) {}
    return map;
  }, [workouts]);
  const [templates, setTemplates] = useState([]);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [templateDraft, setTemplateDraft] = useState(null);
  const [templateEditing, setTemplateEditing] = useState(false);
  const templateTitleRef = useRef(null);
  const libraryQueryRef = useRef(null);
  const authEmailRef = useRef(null);
  const [invalidMap, setInvalidMap] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState('login'); // 'login' | 'signup'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [users, setUsers] = useState([]);
  const [saveLogin, setSaveLogin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("sets")) || [];
    // migrate older flat-set shape (exercise,reps,weight) to grouped shape
    if (Array.isArray(saved) && saved.length > 0 && saved[0] && !saved[0].sets) {
      const migrated = saved.map(s => ({ exercise: s.exercise || 'Exercise', sets: [{ weight: s.weight || '', reps: s.reps || '', done: false }] }));
      setSets(migrated);
    } else {
      setSets(saved);
    }
    // load workouts for the feed
    try {
      const w = getWorkouts().slice().sort((a,b) => new Date(b.date) - new Date(a.date));
      setWorkouts(w);
    } catch (e) {
      setWorkouts([]);
    }
    try {
      setTemplates(getTemplates().slice().sort((a,b) => new Date(b.date) - new Date(a.date)));
    } catch (e) {
      setTemplates([]);
    }
    try {
      const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      setUsers(savedUsers);
    } catch (e) {
      setUsers([]);
    }
    try {
      const current = JSON.parse(localStorage.getItem('currentUser') || 'null');
      if (current) {
        setCurrentUser(current);
        setIsAuthenticated(true);
      }
    } catch (e) {}
  }, []);

  // keyboard: close modals / overlays on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        if (libraryOpen) { setLibraryOpen(false); setReplacingIndex(null); return; }
        if (showTemplateForm) { setShowTemplateForm(false); setTemplateDraft(null); return; }
        if (showForm) { setShowForm(false); return; }
        if (panelMenuOpen) { setPanelMenuOpen(false); return; }
        if (menuOpenIndex !== null) { setMenuOpenIndex(null); return; }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [libraryOpen, showTemplateForm, showForm, panelMenuOpen, menuOpenIndex]);

  // focus first input when modals open
  useEffect(() => {
    if (libraryOpen) {
      setTimeout(() => libraryQueryRef.current?.focus(), 0);
    }
    if (showForm) {
      setTimeout(() => titleInputRef.current?.focus(), 0);
    }
    if (showTemplateForm) {
      setTimeout(() => templateTitleRef.current?.focus(), 0);
    }
    if (!isAuthenticated) {
      setTimeout(() => authEmailRef.current?.focus(), 0);
    }
  }, [libraryOpen, showForm, showTemplateForm, isAuthenticated]);

  const addSet = (e) => {
    e.preventDefault();
    const exercise = e.target.exercise.value;
    const reps = e.target.reps.value;
    const weight = e.target.weight.value;
    // add as a single-exercise entry with one set
    const newExercise = { exercise, sets: [{ reps, weight, done: false }] };
    const updatedSets = [...sets, newExercise];
    setSets(updatedSets);
    localStorage.setItem("sets", JSON.stringify(updatedSets));
    e.target.reset();
  };

  const deleteSet = (index) => {
    // remove whole exercise
    const updatedSets = sets.filter((_, i) => i !== index);
    setSets(updatedSets);
    localStorage.setItem("sets", JSON.stringify(updatedSets));
  };

  function saveWorkout() {
    if (!sets || sets.length === 0) {
      alert('No sets to save');
      return;
    }
    const workout = {
      id: String(Date.now()),
      date: new Date().toISOString(),
      name: workoutTitle || `Workout ${new Date().toLocaleString()}`,
      sets,
    };
    addWorkout(workout);
    // refresh feed
    try {
      const w = getWorkouts().slice().sort((a,b) => new Date(b.date) - new Date(a.date));
      setWorkouts(w);
    } catch (e) {}
    alert('Workout saved');
  }

  function handleDeleteWorkout(id) {
    if (!window.confirm('Delete this saved workout?')) return;
    deleteWorkout(id);
    setWorkouts(getWorkouts().slice().sort((a,b) => new Date(b.date) - new Date(a.date)));
  }

  // Templates handlers
  function openNewTemplate() {
    setTemplateDraft({ id: String(Date.now()), name: 'New Template', exercises: [] });
    setShowTemplateForm(true);
  }

  function addExerciseToTemplate(name) {
    if (!templateDraft) return;
    const draft = { ...templateDraft };
    if (replacingIndex !== null && replacingIndex >= 0 && replacingIndex < draft.exercises.length) {
      draft.exercises = draft.exercises.slice();
      draft.exercises[replacingIndex] = { exercise: name, sets: [{ weight: '', reps: '' }] };
      setReplacingIndex(null);
    } else {
      draft.exercises = draft.exercises.concat([{ exercise: name, sets: [{ weight: '', reps: '' }] }]);
    }
    setTemplateDraft(draft);
  }

  function addSetToTemplateLocal(exIndex) {
    const draft = { ...templateDraft };
    draft.exercises[exIndex].sets.push({ weight: '', reps: '' });
    setTemplateDraft(draft);
  }

  function updateTemplateSetValue(exIndex, setIndex, field, value) {
    const draft = { ...templateDraft };
    draft.exercises[exIndex].sets[setIndex][field] = value;
    setTemplateDraft(draft);
  }

  function saveTemplate() {
    if (!templateDraft) return;
    // ensure date and replace existing if editing
    templateDraft.date = new Date().toISOString();
    try { deleteTemplate(templateDraft.id); } catch (e) {}
    addTemplate(templateDraft);
    setTemplates(getTemplates().slice().sort((a,b) => new Date(b.date) - new Date(a.date)));
    setShowTemplateForm(false);
    setTemplateDraft(null);
  }

  function cancelTemplate() {
    setShowTemplateForm(false);
    setTemplateDraft(null);
  }

  function editTemplate(id) {
    const t = templates.find(x => x.id === id) || getTemplates().find(x => x.id === id);
    if (!t) return;
    setTemplateDraft(JSON.parse(JSON.stringify(t)));
    setShowTemplateForm(true);
  }

  function handleDeleteTemplate(id) {
    if (!window.confirm('Delete this template?')) return;
    deleteTemplate(id);
    setTemplates(getTemplates().slice().sort((a,b) => new Date(b.date) - new Date(a.date)));
  }

  function finishWorkout() {
    // Save then close the panel
    saveWorkout();
    setShowForm(false);
    setPanelMenuOpen(false);
  }

  function discardWorkout() {
    // Confirm, then clear sets and close
    if (!window.confirm('Discard this workout? This will clear current sets.')) return;
    const updatedSets = [];
    setSets(updatedSets);
    localStorage.setItem('sets', JSON.stringify(updatedSets));
    setShowForm(false);
    setPanelMenuOpen(false);
  }

  function loadWorkout(workout) {
    if (!workout || !workout.sets) return;
    setSets(workout.sets);
    localStorage.setItem('sets', JSON.stringify(workout.sets));
    setShowForm(true);
    alert('Loaded workout into session');
  }

  function addExerciseByName(name) {
    const newExercise = { exercise: name, sets: [{ weight: '', reps: '', done: false }] };
    let updatedSets;
    if (replacingIndex !== null && replacingIndex >= 0 && replacingIndex < sets.length) {
      updatedSets = sets.slice();
      updatedSets[replacingIndex] = newExercise;
    } else {
      updatedSets = [...sets, newExercise];
    }
    setSets(updatedSets);
    localStorage.setItem('sets', JSON.stringify(updatedSets));
    setReplacingIndex(null);
    setLibraryQuery('');
  }

  function removeSet(index) {
    // remove whole exercise (keeps name for compatibility)
    const updatedSets = sets.filter((_, i) => i !== index);
    setSets(updatedSets);
    localStorage.setItem('sets', JSON.stringify(updatedSets));
  }

  function addSetToExercise(exIndex) {
    const updated = sets.slice();
    const ex = updated[exIndex];
    if (!ex) return;
    ex.sets.push({ weight: '', reps: '', done: false });
    setSets(updated);
    localStorage.setItem('sets', JSON.stringify(updated));
  }

  function toggleDone(exIndex, setIndex) {
    const updated = sets.slice();
    const ex = updated[exIndex];
    if (!ex || !ex.sets[setIndex]) return;
    const row = ex.sets[setIndex];
    const missing = { weight: !row.weight, reps: !row.reps };
    // if either empty, mark invalid and don't toggle
    if (missing.weight || missing.reps) {
      const key = `${exIndex}-${setIndex}`;
      setInvalidMap(prev => ({ ...prev, [key]: missing }));
      return;
    }
    // clear any invalid mark
    const key = `${exIndex}-${setIndex}`;
    if (invalidMap[key]) {
      setInvalidMap(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
    row.done = !row.done;
    setSets(updated);
    localStorage.setItem('sets', JSON.stringify(updated));
  }

  function updateSetValue(exIndex, setIndex, field, value) {
    const updated = sets.slice();
    const ex = updated[exIndex];
    if (!ex || !ex.sets[setIndex]) return;
    ex.sets[setIndex][field] = value;
    setSets(updated);
    localStorage.setItem('sets', JSON.stringify(updated));
    // clear invalid flag for this field if any
    const key = `${exIndex}-${setIndex}`;
    if (invalidMap[key] && value) {
      setInvalidMap(prev => {
        const copy = { ...prev };
        const entry = { ...(copy[key] || {}) };
        delete entry[field];
        if (Object.keys(entry).length === 0) {
          delete copy[key];
        } else {
          copy[key] = entry;
        }
        return copy;
      });
    }
  }

  // Auth handlers
  function handleSignup() {
    if (!authEmail || !authPassword) { alert('Enter email and password'); return; }
    if (users.find(u => u.email === authEmail)) { alert('User already exists'); return; }
    const user = { id: String(Date.now()), email: authEmail, password: authPassword };
    const updated = [...users, user];
    setUsers(updated);
    localStorage.setItem('users', JSON.stringify(updated));
    if (saveLogin) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    setIsAuthenticated(true);
    setCurrentUser(user);
  }

  function handleLogin() {
    const user = users.find(u => u.email === authEmail && u.password === authPassword);
    if (!user) { alert('Invalid credentials'); return; }
    if (saveLogin) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    setIsAuthenticated(true);
    setCurrentUser(user);
  }

  function logout() {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setIsAuthenticated(false);
  }

  function switchToSignup() {
    setAuthView('signup'); setAuthEmail(''); setAuthPassword('');
  }

  function switchToLogin() {
    setAuthView('login'); setAuthEmail(''); setAuthPassword('');
  }

  return (
    <div className="min-h-screen bg-[#e6f7ff] flex flex-col items-center p-4 pt-16">

      <header className="fixed top-0 left-0 right-0 bg-blue-900 text-white shadow z-30">
        <div className="h-16 flex items-center px-6">
          <h1 className="text-2xl font-bold">Nico's Tracker</h1>
        </div>
      </header>

      {/* Authentication gate: show login/signup when not authenticated */}
      {!isAuthenticated && (
        <div className="w-full flex items-center justify-center pt-24 pb-12">
          <div className="w-full max-w-md p-6"> 
            <h2 className="text-2xl font-semibold mb-4 text-center">{authView === 'login' ? 'Log In' : 'Sign Up'}</h2>

            <label className="text-sm">Email</label>
            <input ref={authEmailRef} value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="w-full p-2 border rounded mb-3" />

            <label className="text-sm">Password</label>
            <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="w-full p-2 border rounded mb-2" />

            <div className="flex items-center gap-2 mb-4">
              <input id="saveLogin" type="checkbox" checked={saveLogin} onChange={(e) => setSaveLogin(e.target.checked)} className="w-4 h-4" />
              <label htmlFor="saveLogin" className="text-sm">Save login info</label>
            </div>

            <button onClick={authView === 'login' ? handleLogin : handleSignup} className="w-full px-4 py-3 bg-blue-600 text-white rounded font-semibold">{authView === 'login' ? 'Log In' : 'Sign Up'}</button>

            <div className="mt-4 text-sm flex items-center justify-center gap-2">
              {authView === 'login' ? (
                <>
                  <div>New?</div>
                  <button onClick={switchToSignup} className="px-3 py-1 bg-sky-200 text-sky-800 rounded">Sign up</button>
                </>
              ) : (
                <>
                  <div>Already have an account?</div>
                  <button onClick={switchToLogin} className="px-3 py-1 bg-sky-200 text-sky-800 rounded">Log in</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {isAuthenticated && (
      <div className="w-full max-w-4xl flex items-start mb-6 self-start gap-8 ml-64 mr-96">
        <aside className="fixed left-0 top-16 bottom-0 w-64 bg-blue-600 p-4 flex flex-col justify-between z-20">
          <div className="flex flex-col items-start w-full gap-3">
            <button onClick={() => setActivePage('start')} className={`w-full px-3 py-2 ${activePage==='start' ? 'bg-white text-blue-600 font-semibold' : 'bg-blue-500 text-white'} rounded`}>Start</button>
            <button onClick={() => setActivePage('exercises')} className={`w-full px-3 py-2 ${activePage==='exercises' ? 'bg-white text-blue-600 font-semibold' : 'bg-blue-500 text-white'} rounded`}>Exercises</button>
            <button onClick={() => setActivePage('history')} className={`w-full px-3 py-2 ${activePage==='history' ? 'bg-white text-blue-600 font-semibold' : 'bg-blue-500 text-white'} rounded`}>History</button>
          </div>

          <div className="w-full">
            <div className="w-full flex items-center justify-between text-white text-sm">
              <div className="truncate">{currentUser ? currentUser.email : ''}</div>
              <button onClick={logout} className="ml-2 px-2 py-1 bg-blue-500 rounded">Log out</button>
            </div>
          </div>
        </aside>
        <div className="flex-1">
          {activePage === 'start' && (
            <div className="p-4">
              <div className="mb-6">
                <button
                  onClick={() => { setShowForm(true); setSets([]); localStorage.setItem('sets', JSON.stringify([])); }}
                  className="w-full text-left px-4 py-4 bg-white text-blue-600 font-semibold rounded shadow"
                >
                  Start empty workout
                </button>
              </div>

              <div className="bg-white p-4 rounded shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold">Templates</div>
                  <button onClick={openNewTemplate} className="px-2 py-1 text-sm bg-sky-200 text-sky-800 rounded">New Template</button>
                </div>
                <div>
                  {templates.length === 0 ? (
                    <div className="text-gray-500">No templates yet.</div>
                  ) : (
                    <div className="space-y-2">
                      {templates.map(t => (
                        <div key={t.id} className="p-2 border rounded flex items-center justify-between">
                          <div>
                            <div className="font-medium">{t.name}</div>
                            <div className="text-xs text-gray-500">{t.exercises?.length ?? 0} exercises</div>
                          </div>
                          <div className="ml-4 flex items-center gap-2">
                            <button onClick={() => editTemplate(t.id)} className="px-2 py-1 text-sm bg-sky-100 text-sky-700 rounded">Edit</button>
                            <button onClick={() => handleDeleteTemplate(t.id)} className="px-2 py-1 text-sm text-red-600">Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activePage === 'history' && (
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2">History</h2>
              <div className="max-h-[60vh] overflow-auto space-y-2">
                {workouts.length === 0 ? (
                  <div className="text-gray-500">No saved workouts yet.</div>
                ) : (
                  workouts.map(w => (
                    <div key={w.id} className="flex items-center justify-between p-3 bg-white rounded shadow-sm">
                      <div className="flex-1 cursor-pointer" onClick={() => loadWorkout(w)}>
                        <div className="text-sm font-medium">{w.name}</div>
                        <div className="text-xs text-gray-500">{new Date(w.date).toLocaleString()}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {w.sets?.length ?? 0} exercises · { (w.sets || []).reduce((acc, ex) => acc + (ex.sets ? ex.sets.length : 1), 0) } sets
                        </div>
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        <button onClick={() => loadWorkout(w)} className="px-2 py-1 bg-sky-100 text-sky-700 rounded text-sm">Load</button>
                        <button onClick={() => handleDeleteWorkout(w.id)} className="px-2 py-1 text-sm text-red-600">Delete</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activePage === 'exercises' && (
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2">Exercises</h2>
              <div className="mb-3">
                <input
                  value={exerciseQuery}
                  onChange={(e) => setExerciseQuery(e.target.value)}
                  placeholder="Search exercises or groups..."
                  className="w-full p-2 border rounded"
                />

                <div className="mt-2 flex gap-2">
                  <div className="relative">
                    <button onClick={() => { setGroupMenuOpen(!groupMenuOpen); setEquipMenuOpen(false); setSortMenuOpen(false); }} className="px-3 py-1 border rounded">{muscleFilter}</button>
                    {groupMenuOpen && (
                      <div className="absolute mt-1 bg-white border rounded shadow z-40">
                        <button className="block w-full text-left px-3 py-2 hover:bg-gray-100" onClick={() => { setMuscleFilter('Any Muscle Group'); setGroupMenuOpen(false); }}>Any Muscle Group</button>
                        {muscleGroups.map(g => (
                          <button key={g} className="block w-full text-left px-3 py-2 hover:bg-gray-100" onClick={() => { setMuscleFilter(g); setGroupMenuOpen(false); }}>{g}</button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <button onClick={() => { setEquipMenuOpen(!equipMenuOpen); setGroupMenuOpen(false); setSortMenuOpen(false); }} className="px-3 py-1 border rounded">{equipmentFilter}</button>
                    {equipMenuOpen && (
                      <div className="absolute mt-1 bg-white border rounded shadow z-40">
                        <button className="block w-full text-left px-3 py-2 hover:bg-gray-100" onClick={() => { setEquipmentFilter('Any Equipment'); setEquipMenuOpen(false); }}>Any Equipment</button>
                        {equipments.map(eq => (
                          <button key={eq} className="block w-full text-left px-3 py-2 hover:bg-gray-100" onClick={() => { setEquipmentFilter(eq); setEquipMenuOpen(false); }}>{eq}</button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <button onClick={() => { setSortMenuOpen(!sortMenuOpen); setGroupMenuOpen(false); setEquipMenuOpen(false); }} className="px-3 py-1 border rounded">Sort by</button>
                    {sortMenuOpen && (
                      <div className="absolute mt-1 bg-white border rounded shadow z-40">
                        <button className="block w-full text-left px-3 py-2 hover:bg-gray-100" onClick={() => { setSortOption('name'); setSortMenuOpen(false); }}>Name</button>
                        <button className="block w-full text-left px-3 py-2 hover:bg-gray-100" onClick={() => { setSortOption('recent'); setSortMenuOpen(false); }}>Recent</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="max-h-[60vh] overflow-auto space-y-2">
                {EXERCISES
                  .filter(e => {
                    const q = exerciseQuery.trim().toLowerCase();
                    if (q && !(e.name.toLowerCase().includes(q) || e.group.toLowerCase().includes(q))) return false;
                    if (muscleFilter !== 'Any Muscle Group' && e.group !== muscleFilter) return false;
                    if (equipmentFilter !== 'Any Equipment' && e.equipment !== equipmentFilter) return false;
                    return true;
                  })
                  .sort((a,b) => {
                    if (sortOption === 'recent') {
                      const ta = lastUsedMap[a.name] || 0;
                      const tb = lastUsedMap[b.name] || 0;
                      return tb - ta;
                    }
                    return a.name.localeCompare(b.name);
                  })
                  .map((ex) => (
                    <div key={ex.id} className="bg-white rounded shadow-sm">
                      <div className="p-3 flex items-center justify-between cursor-pointer" onClick={() => setExpandedExerciseId(expandedExerciseId === ex.id ? null : ex.id)}>
                        <div className="flex items-center gap-3">
                          <ExerciseAvatar name={ex.name} size={40} />
                          <div className="font-medium">{ex.name}</div>
                        </div>
                        <div className="text-sm text-gray-500">{ex.group}</div>
                      </div>
                      {expandedExerciseId === ex.id && (
                        <div className="px-4 pb-3 text-sm text-gray-700">
                          <div><strong>Primary muscle group:</strong> {ex.group}</div>
                          <div className="mt-1"><strong>Equipment:</strong> {ex.equipment}</div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
        <aside className="fixed right-0 top-16 bottom-0 w-96 bg-blue-600 p-4 z-20">
          {/* Right sidebar - empty for now */}
        </aside>
      </div>
      )}

      {isAuthenticated && showForm && (
        <div className="fixed inset-0 z-10 flex items-start justify-center">
          <div role="dialog" aria-modal="true" tabIndex={-1} className="fixed left-1/2 top-16 bottom-0 transform -translate-x-1/2 w-[50vw] bg-white shadow-xl p-6 overflow-auto">
            <div className="flex flex-col h-full">
              <div>
                <div className="flex items-start justify-between">
                  <div className="text-left flex-1">
                    <div className="relative max-w-md">
                      <input
                        ref={titleInputRef}
                        value={workoutTitle}
                        onChange={(e) => setWorkoutTitle(e.target.value)}
                        readOnly={!editingTitle}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setEditingTitle(false);
                            titleInputRef.current?.blur();
                          }
                        }}
                        onBlur={() => setEditingTitle(false)}
                        placeholder="Workout name"
                        className={`px-3 py-2 border border-gray-300 bg-white rounded text-lg font-semibold w-full ${editingTitle ? '' : 'cursor-default'}`}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTitle(true);
                          setTimeout(() => titleInputRef.current?.focus(), 0);
                        }}
                        aria-label="Edit workout name"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className=""><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                      </button>
                    </div>
                  </div>
                    <div className="ml-4 flex items-center gap-2">
                    <button onClick={finishWorkout} className="px-3 py-1 bg-blue-600 text-white rounded">Finish</button>
                    <div className="relative">
                      <button onClick={() => setPanelMenuOpen(!panelMenuOpen)} aria-expanded={panelMenuOpen} aria-haspopup="true" className="text-2xl px-2">⋯</button>
                      {panelMenuOpen && (
                        <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow py-1 z-40" role="menu">
                          <button
                            onClick={() => { discardWorkout(); }}
                            className="block w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100"
                          >
                            Discard workout
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

                  <div className="flex-1 mt-6 relative">
                    <div className="pt-4 border-t border-gray-200">
                        {/* show current sets */}
                        {sets.length === 0 ? (
                          <div className="text-gray-500 text-center py-6">No exercises yet. Add one below.</div>
                        ) : (
                          <ul className="divide-y divide-gray-200">
                            {sets.map((ex, i) => (
                                <li key={i} className="py-4">
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                      <ExerciseAvatar name={ex.exercise} size={40} />
                                      <div className="font-medium">{ex.exercise}</div>
                                    </div>
                                    <div className="relative">
                                      <button onClick={() => setMenuOpenIndex(menuOpenIndex === i ? null : i)} aria-expanded={menuOpenIndex === i} aria-controls={`menu-${i}`} aria-haspopup="true" className="text-2xl px-2">⋯</button>
                                      {menuOpenIndex === i && (
                                        <div id={`menu-${i}`} className="absolute right-0 mt-2 w-36 bg-white border rounded shadow py-1 z-30" role="menu">
                                          <button
                                            onClick={() => { setReplacingIndex(i); setLibraryOpen(true); setMenuOpenIndex(null); }}
                                            className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                                          >
                                            Replace exercise
                                          </button>
                                          <button
                                            onClick={() => { removeSet(i); setMenuOpenIndex(null); }}
                                            className="block w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100"
                                          >
                                            Remove exercise
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="mt-3">
                                    <div className="grid grid-cols-4 gap-4 text-sm font-semibold text-gray-600 text-center">
                                      <div>Set</div>
                                      <div>Weight</div>
                                      <div>Reps</div>
                                      <div>Done</div>
                                    </div>
                                    <div>
                                      {ex.sets.map((row, j) => (
                                        <div key={j} className={`grid grid-cols-4 gap-4 items-center py-2 ${row.done ? 'bg-green-50' : ''}`}>
                                          <div className="text-center">{j + 1}</div>
                                          <div className="flex justify-center">
                                            <input
                                              value={row.weight}
                                              onChange={(e) => updateSetValue(i, j, 'weight', e.target.value)}
                                              placeholder="weight"
                                              className={`w-20 text-center px-2 py-1 rounded ${invalidMap[`${i}-${j}`] && invalidMap[`${i}-${j}`].weight ? 'border border-red-500' : 'border border-gray-200'}`}
                                            />
                                          </div>
                                          <div className="flex justify-center">
                                            <input
                                              value={row.reps}
                                              onChange={(e) => updateSetValue(i, j, 'reps', e.target.value)}
                                              placeholder="reps"
                                              className={`w-20 text-center px-2 py-1 rounded ${invalidMap[`${i}-${j}`] && invalidMap[`${i}-${j}`].reps ? 'border border-red-500' : 'border border-gray-200'}`}
                                            />
                                          </div>
                                          <div className="text-center">
                                            <button onClick={() => toggleDone(i, j)} className={`w-7 h-7 inline-flex items-center justify-center rounded ${row.done ? 'bg-green-600 text-white' : 'border'}`}>
                                              ✓
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>

                                    <div className="mt-4 border-t border-gray-200 pt-3 flex justify-center">
                                      <button onClick={() => addSetToExercise(i)} className="px-2 py-1 text-sm bg-sky-200 text-sky-800 rounded">+ Add Set</button>
                                    </div>
                                  </div>
                                </li>
                            ))}
                          </ul>
                        )}

                        <div className="mt-4 flex justify-center">
                          <button
                            onClick={() => setLibraryOpen(true)}
                            className="inline-block bg-sky-200 text-sky-800 px-3 py-2 rounded focus:outline-none"
                          >
                            + Add exercise
                          </button>
                        </div>
                      </div>

                      {libraryOpen && (
                        <div className="fixed inset-0 z-50 flex items-start justify-center">
                          <div className="absolute inset-0 bg-black/20" onClick={() => { setLibraryOpen(false); setReplacingIndex(null); }}></div>
                          <div role="dialog" aria-modal="true" tabIndex={-1} className="relative z-60 w-4/5 bg-white rounded-lg p-4 shadow-lg mt-6">
                          <div className="flex items-center justify-between mb-3">
                            <div className="font-semibold">Add / Replace Exercise</div>
                            <button className="text-sm text-gray-500" onClick={() => { setLibraryOpen(false); setReplacingIndex(null); }}>Close</button>
                          </div>
                          <input
                            ref={libraryQueryRef}
                            value={libraryQuery}
                            onChange={(e) => setLibraryQuery(e.target.value)}
                            placeholder="Search exercises..."
                            className="w-full p-2 border rounded mb-4"
                          />
                          <div className="space-y-2 max-h-64 overflow-auto">
                            {['Bench','Squat','Deadlift']
                              .filter(x => x.toLowerCase().includes(libraryQuery.toLowerCase()))
                              .map((ex) => (
                                <div key={ex} className="p-3 border rounded hover:bg-gray-50 flex justify-between items-center">
                                  <div className="flex items-center gap-3">
                                    <ExerciseAvatar name={ex} size={36} />
                                    <div>{ex}</div>
                                  </div>
                                  <button
                                    onClick={() => { addExerciseByName(ex); setLibraryOpen(false); }}
                                    className="px-2 py-1 bg-sky-500 text-white rounded"
                                  >
                                    Add
                                  </button>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
            </div>
          </div>
        </div>
      )}

      {isAuthenticated && showTemplateForm && templateDraft && (
        <div className="fixed inset-0 z-10 flex items-start justify-center">
          <div role="dialog" aria-modal="true" tabIndex={-1} className="fixed left-1/2 top-16 bottom-0 transform -translate-x-1/2 w-[50vw] bg-white shadow-xl p-6 overflow-auto">
            <div className="flex flex-col h-full">
              <div>
                <div className="flex items-start justify-between">
                  <div className="text-left flex-1">
                    <div className="relative max-w-md">
                      <input
                        ref={templateTitleRef}
                        value={templateDraft.name}
                        onChange={(e) => setTemplateDraft({...templateDraft, name: e.target.value})}
                        readOnly={!templateEditing}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setTemplateEditing(false);
                            templateTitleRef.current?.blur();
                          }
                        }}
                        onBlur={() => setTemplateEditing(false)}
                        placeholder="Template name"
                        className={`px-3 py-2 border border-gray-300 bg-white rounded text-lg font-semibold w-full ${templateEditing ? '' : 'cursor-default'}`}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTemplateEditing(true);
                          setTimeout(() => templateTitleRef.current?.focus(), 0);
                        }}
                        aria-label="Edit template name"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className=""><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                      </button>
                    </div>
                  </div>
                    <div className="ml-4 flex items-center gap-2">
                    <button onClick={saveTemplate} className="px-3 py-1 bg-blue-600 text-white rounded">Save</button>
                    <div className="relative">
                      <button onClick={() => setPanelMenuOpen(!panelMenuOpen)} aria-expanded={panelMenuOpen} aria-haspopup="true" className="text-2xl px-2">⋯</button>
                      {panelMenuOpen && (
                        <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow py-1 z-40" role="menu">
                          <button
                            onClick={() => { cancelTemplate(); }}
                            className="block w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 mt-6 relative">
                <div className="pt-4 border-t border-gray-200">
                  {/* show current sets similar to workout UI but without Done column */}
                  {templateDraft.exercises.length === 0 ? (
                    <div className="text-gray-500 text-center py-6">No exercises yet. Add one below.</div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {templateDraft.exercises.map((ex, i) => (
                        <li key={i} className="py-4">
                          <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                <ExerciseAvatar name={ex.exercise} size={36} />
                                <div className="font-medium">{ex.exercise}</div>
                              </div>
                            <div className="relative">
                              <button onClick={() => setMenuOpenIndex(menuOpenIndex === i ? null : i)} aria-expanded={menuOpenIndex === i} aria-controls={`tpl-menu-${i}`} aria-haspopup="true" className="text-2xl px-2">⋯</button>
                              {menuOpenIndex === i && (
                                <div id={`tpl-menu-${i}`} className="absolute right-0 mt-2 w-36 bg-white border rounded shadow py-1 z-30" role="menu">
                                  <button
                                    onClick={() => { setReplacingIndex(i); setLibraryOpen(true); setMenuOpenIndex(null); }}
                                    className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                                  >
                                    Replace exercise
                                  </button>
                                  <button
                                    onClick={() => { templateDraft.exercises = templateDraft.exercises.filter((_, idx) => idx !== i); setTemplateDraft({...templateDraft}); setMenuOpenIndex(null); }}
                                    className="block w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100"
                                  >
                                    Remove exercise
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-3">
                            <div className="grid grid-cols-3 gap-4 text-sm font-semibold text-gray-600 text-center">
                              <div>Set</div>
                              <div>Weight</div>
                              <div>Reps</div>
                            </div>
                            <div>
                              {ex.sets.map((row, j) => (
                                <div key={j} className={`grid grid-cols-3 gap-4 items-center py-2`}>
                                  <div className="text-center">{j + 1}</div>
                                  <div className="flex justify-center">
                                    <input
                                      value={row.weight}
                                      onChange={(e) => updateTemplateSetValue(i, j, 'weight', e.target.value)}
                                      placeholder="weight"
                                      className={`w-20 text-center px-2 py-1 rounded border border-gray-200`}
                                    />
                                  </div>
                                  <div className="flex justify-center">
                                    <input
                                      value={row.reps}
                                      onChange={(e) => updateTemplateSetValue(i, j, 'reps', e.target.value)}
                                      placeholder="reps"
                                      className={`w-20 text-center px-2 py-1 rounded border border-gray-200`}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="mt-4 border-t border-gray-200 pt-3 flex justify-center">
                              <button onClick={() => addSetToTemplateLocal(i)} className="px-2 py-1 text-sm bg-sky-200 text-sky-800 rounded">+ Add Set</button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={() => setLibraryOpen(true)}
                      className="inline-block bg-sky-200 text-sky-800 px-3 py-2 rounded focus:outline-none"
                    >
                      + Add exercise
                    </button>
                  </div>
                </div>
              </div>

              {libraryOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center">
                  <div className="absolute inset-0 bg-black/20" onClick={() => { setLibraryOpen(false); setReplacingIndex(null); }}></div>
                  <div role="dialog" aria-modal="true" tabIndex={-1} className="relative z-60 w-4/5 bg-white rounded-lg p-4 shadow-lg mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold">Add / Replace Exercise</div>
                      <button className="text-sm text-gray-500" onClick={() => { setLibraryOpen(false); setReplacingIndex(null); }}>Close</button>
                    </div>
                    <input
                      ref={libraryQueryRef}
                      value={libraryQuery}
                      onChange={(e) => setLibraryQuery(e.target.value)}
                      placeholder="Search exercises..."
                      className="w-full p-2 border rounded mb-4"
                    />
                    <div className="space-y-2 max-h-64 overflow-auto">
                      {['Bench','Squat','Deadlift','Overhead Press','Barbell Row','Pull-up']
                        .filter(x => x.toLowerCase().includes(libraryQuery.toLowerCase()))
                        .map((ex) => (
                          <div key={ex} className="p-3 border rounded hover:bg-gray-50 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <ExerciseAvatar name={ex} size={36} />
                              <div>{ex}</div>
                            </div>
                            <button
                              onClick={() => { addExerciseToTemplate(ex); setLibraryOpen(false); }}
                              className="px-2 py-1 bg-sky-500 text-white rounded"
                            >
                              Add
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {isAuthenticated && showHistory && <HistoryView onClose={() => setShowHistory(false)} onLoad={loadWorkout} />}
    </div>
  );
}

export default App;
