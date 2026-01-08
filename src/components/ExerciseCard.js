import React from "react";
import ExerciseAvatar from "./ExerciseAvatar";

export default function ExerciseCard({ set, index, deleteSet }) {
  return (
    <li className="bg-white p-4 rounded-2xl shadow-md flex justify-between items-center transition hover:shadow-lg">
      <div className="flex items-center gap-4">
        <ExerciseAvatar name={set.exercise} />
        <div>
          <p className="font-semibold text-gray-800">{set.exercise}</p>
          <p className="text-gray-500 text-sm">{set.reps} reps @ {set.weight} lbs</p>
        </div>
      </div>
      <button
        onClick={() => deleteSet(index)}
        className="bg-red-500 text-white px-3 py-1 rounded-xl hover:bg-red-600 transition"
      >
        Delete
      </button>
    </li>
  );
}
