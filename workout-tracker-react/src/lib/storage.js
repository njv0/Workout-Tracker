// Simple localStorage-backed storage helpers for workouts
// Data is scoped per current user when `currentUser` exists in localStorage.

function _userKey(base) {
  try {
    const current = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const uid = current && current.id ? current.id : 'global';
    return `${base}:${uid}`;
  } catch (e) {
    return `${base}:global`;
  }
}

function read(base) {
  const KEY = _userKey(base);
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

function write(base, items) {
  const KEY = _userKey(base);
  localStorage.setItem(KEY, JSON.stringify(items))
}

export function getWorkouts() {
  return read('workouts')
}

export function addWorkout(workout) {
  const items = read('workouts')
  items.push(workout)
  write('workouts', items)
  return workout
}

export function updateWorkout(id, patch) {
  const items = read('workouts')
  const idx = items.findIndex(w => w.id === id)
  if (idx === -1) return null
  items[idx] = { ...items[idx], ...patch }
  write('workouts', items)
  return items[idx]
}

export function deleteWorkout(id) {
  const items = read('workouts').filter(w => w.id !== id)
  write('workouts', items)
}

export function clearWorkouts() {
  write('workouts', [])
}

// Templates storage (also scoped per user)
export function getTemplates() {
  return read('templates')
}

export function addTemplate(tpl) {
  const items = read('templates')
  items.push(tpl)
  write('templates', items)
  return tpl
}

export function deleteTemplate(id) {
  const items = read('templates').filter(t => t.id !== id)
  write('templates', items)
}
