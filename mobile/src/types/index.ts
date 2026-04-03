export interface WorkoutSet {
  kg: number;
  reps: number;
  unit: 'kg' | 'lbs';
}

export interface Exercise {
  id: string;
  name: string;
}

export interface Day {
  id: string;
  name: string;
  exercises: Exercise[];
}

export interface Log {
  id: string;
  exerciseId: string;
  exerciseName: string;
  dayName: string;
  date: number;
  sets: WorkoutSet[];
}

export interface PersonalRecord {
  exerciseName: string;
  weight: number;
  reps: number;
  unit: string;
  date: number;
  logId: string;
}
