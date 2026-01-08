import React from "react";

export default function WorkoutForm({ addSet }) {
  return (
    <form onSubmit={addSet} className="flex flex-col gap-3 mb-6 bg-white p-4 rounded-2xl shadow-md">
      <input
        name="exercise"
        placeholder="Exercise"
        required
        className="p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <div className="flex gap-3">
        <input
          name="reps"
          type="number"
          placeholder="Reps"
          required
          className="flex-1 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          name="weight"
          type="number"
          placeholder="Weight"
          required
          className="flex-1 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <button className="bg-blue-500 text-white p-3 rounded-xl font-semibold hover:bg-blue-600 transition">
        Add Set
      </button>
    </form>
  );
}
