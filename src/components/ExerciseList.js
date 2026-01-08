import React from "react";
import ExerciseCard from "./ExerciseCard";

export default function ExerciseList({ sets, deleteSet }) {
  return (
    <ul className="flex flex-col gap-4">
      {sets.map((set, index) => (
        <ExerciseCard key={index} set={set} index={index} deleteSet={deleteSet} />
      ))}
    </ul>
  );
}
