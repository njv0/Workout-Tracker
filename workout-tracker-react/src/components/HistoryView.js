import React, { useEffect, useState } from "react";
import { getWorkouts, deleteWorkout } from "../lib/storage";

export default function HistoryView({ onClose, onLoad }) {
  const [workouts, setWorkouts] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setWorkouts(getWorkouts());
  }, []);

  function handleDelete(id) {
    if (!confirm('Delete this workout?')) return;
    deleteWorkout(id);
    setWorkouts(getWorkouts());
  }

  function handleLoad(w) {
    if (onLoad) onLoad(w);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center p-6">
      <div className="bg-white rounded-lg w-full max-w-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Workout History</h2>
          <button onClick={onClose} className="text-sm text-gray-600">Close</button>
        </div>

        {workouts.length === 0 ? (
          <p className="text-gray-500">No saved workouts yet.</p>
        ) : (
          !selected ? (
            <ul className="space-y-3">
              {workouts.slice().reverse().map((w) => (
                <li key={w.id} className="p-3 border rounded-lg flex justify-between items-center">
                  <div>
                    <div className="font-medium">{w.name || 'Workout'}</div>
                    <div className="text-sm text-gray-500">{new Date(w.date).toLocaleString()} — {w.sets?.length || 0} sets</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-sm text-blue-600" onClick={() => setSelected(w)}>View</button>
                    <button className="text-sm text-red-600" onClick={() => handleDelete(w.id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-lg">{selected.name}</div>
                  <div className="text-sm text-gray-500">{new Date(selected.date).toLocaleString()}</div>
                </div>
                <div className="flex gap-2">
                  <button className="px-2 py-1 bg-gray-200 rounded" onClick={() => setSelected(null)}>Back</button>
                  <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={() => handleLoad(selected)}>Load into session</button>
                </div>
              </div>
              <ul className="space-y-2">
                {selected.sets && selected.sets.length > 0 ? (
                  selected.sets.map((s, idx) => (
                    <li key={idx} className="p-2 border rounded flex justify-between">
                      <div>
                        <div className="font-medium">{s.exercise}</div>
                        <div className="text-sm text-gray-500">{s.reps} reps @ {s.weight} lbs</div>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500">No sets recorded.</li>
                )}
              </ul>
            </div>
          )
        )}
      </div>
    </div>
  );
}
