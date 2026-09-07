export interface Exercise {
  name: string;
  tags: ExerciseTag[];
  favorite: boolean;
  isPowerlifting: boolean;
  bodyweight: boolean;
  repType: 'reps' | 'time';
  repTypeUnit?: 'second' | 'minute';
  warmupProtocol?: { exo?: string; weight: string; reps: number; weightUnit: 'kg' | '%' }[];
  description?: {
    title: string;
    content: string;
  };
  category: ExerciseCategory[];
  strengthType?: 'strength' | 'hypertrophy' | 'power' | 'skill' | 'endurance';
  equipment: 'floor' | 'parallette' | 'rings' | 'bar' | 'dumbbell' | 'band' | 'barbell' | 'machine';
  restSecondsRange?: [number, number];
}

export const REST_SECONDS_BY_EXERCISE: Record<string, [number, number]> = {
  // ===== POWERLIFTING =====
  Squat: [180, 300],
  Deadlift: [180, 300],
  'Trap bar Deadlift': [180, 300],
  'Bench Press': [180, 300],

  // ===== CALISTHÉNIE - PULLING / STRENGTH =====
  'Pull up': [180, 300],
  'Chin up': [180, 300],
  'Wide grip pull up': [180, 300],
  'Close grip pull up': [180, 300],
  'Hammer pull up': [180, 300],
  'L-sit pull up': [180, 300],
  'Archer pull up': [180, 300],
  'Typewriter pull up': [180, 300],

  'One arm pull up': [180, 300],
  'Eccentric OAP': [180, 300],
  'Assisted OAP': [180, 300],

  'Muscle up': [180, 300],
  'Ring muscle up': [180, 300],

  // Pull horizontal moins nerveux
  'Body rows': [120, 180],
  'Ring rows': [120, 180],
  'Australian pull up': [120, 180],

  // Préhab / isolation
  'Ring face Pull': [45, 90],
  'Face Pull': [45, 90],

  // Levers / skills statiques lourds
  'Front lever': [120, 300],
  'Front lever pull': [180, 300],
  'Back lever': [120, 300],

  // Hangs
  'Dead hang hold': [90, 180],
  'Active hang hold': [90, 180],
  'One arm hang hold': [180, 300],

  // ===== CALISTHÉNIE - PUSHING =====
  'Push up': [120, 180],
  'Diamond push up': [60, 120],
  'Wide push up': [60, 120],
  'Archer push up': [120, 180],

  'Pseudo planche push up': [180, 300],
  'Planche lean hold': [120, 300],
  'Tuck planche hold': [120, 300],
  'Tuck planche push up': [180, 300],
  Planche: [180, 300],

  'Pike push up': [180, 300],
  'Handstand push up': [180, 300],

  // Technique pure : repos plus court car pas forcément proche échec
  Handstand: [30, 90],
  'Handstand hold': [60, 180],

  Dips: [180, 300],
  'Bar dips': [180, 300],
  'Ring dips': [180, 300],

  'Ring support hold': [90, 180],
  'L-sit dips': [180, 300],
  'Korean dips': [180, 300],

  // ===== CORE / SKILL =====
  'L-sit hold': [90, 180],
  'V-sit hold': [90, 180],
  'Hanging leg raise': [60, 120],
  'Toes to bar': [90, 180],
  'Dragon flag': [180, 300],
  'Human flag': [180, 300],
  'Ab wheel rollout': [120, 240],

  Plank: [60, 120],
  'Side plank': [60, 120],
  'Hollow body hold': [60, 120],
  'Arch hold': [60, 120],

  // ===== LEGS BODYWEIGHT =====
  'Pistol squat': [120, 240],
  'Shrimp squat': [120, 240],
  'Sissy squat': [60, 120],
  'Jump squat': [120, 180],
  'Bulgarian split squat': [90, 180],
  Lunges: [60, 120],
  'Reverse lunges': [60, 120],
  'Walking lunges': [60, 120],
  'Calf raises': [45, 90],
  'Single leg calf raise': [45, 90],
  'Nordic curl': [180, 300],
  'Glute bridge': [60, 120],
  'Single leg glute bridge': [60, 120],
  'Hip thrust': [90, 180],

  // ===== MUSCULATION PUSH =====
  'Incline bench press': [90, 180],
  'Decline bench press': [90, 180],
  'Dumbbell bench press': [90, 180],
  'Incline dumbbell press': [90, 180],
  'Dumbbell flyes': [45, 90],
  'Cable flyes': [45, 90],

  'Overhead press': [180, 300],
  'Overhead press dumbell': [180, 300],
  'Overhead press dumbell - standing': [180, 300],

  'Lateral raises': [45, 90],
  'Front raises': [45, 90],
  'Rear delt flyes': [45, 90],
  'Tricep dips': [60, 120],
  'Tricep extensions': [45, 90],
  'Overhead tricep extension': [45, 90],
  'Cable tricep pushdown': [45, 90],
  'Close grip bench press': [180, 300],

  // ===== MUSCULATION PULL =====
  'Barbell row': [180, 300],
  'T-bar row': [90, 180],
  'Bicep curls': [45, 90],
  'Hammer curls': [45, 90],
  'Jefferson curls': [45, 90],
  Shrugs: [45, 90],
  'Upright row': [60, 120],

  // ===== LOWER / CORE / CONDITIONING =====
  'Front squat': [180, 300],
  'Russian twist': [45, 90],
  Crunches: [45, 90],
  'Sit ups': [45, 90],
  'Bicycle crunches': [45, 90],
  Bike: [60, 180],
  'Mountain climbers': [45, 90],
  Burpees: [60, 120],
};

export const EXERCISE_TAGS = [
  'Legs',
  'Quads',
  'Glutes',
  'Compound',
  'Powerlifting',
  'Back',
  'Hamstrings',
  'Chest',
  'Triceps',
  'Shoulders',
  'Core',
  'Lats',
  'Biceps',
  'Pulling',
  'Abs',
  'Pushing',
  'Grip',
  'Isometric',
  'Balance',
  'Hip Flexors',
  'Obliques',
  'Calves',
  'Isolation',
  'Plyometric',
  'Traps',
  'Adductors',
  'Cardio',
  'Full Body',
  'Stretching',
] as const;

export type ExerciseCategory =
  | 'push_vertical'
  | 'push_horizontal'
  | 'pull_vertical'
  | 'pull_horizontal'
  | 'squat'
  | 'hinge'
  | 'core'
  | 'skill'
  | 'mobility'
  | 'cardio'
  | 'conditioning';

export type ExerciseTag = (typeof EXERCISE_TAGS)[number];

export const defaultWarmupProtocol = [
  { weight: '30', reps: 10, weightUnit: '%' },
  { weight: '60', reps: 5, weightUnit: '%' },
  { weight: '85', reps: 2, weightUnit: '%' },
];

function getDefaultRestSecondsRange(exercise: Exercise): [number, number] {
  if (exercise.isPowerlifting) {
    return [180, 300];
  }

  if (exercise.strengthType === 'power') {
    return [120, 180];
  }

  if (exercise.strengthType === 'skill') {
    return [120, 240];
  }

  if (exercise.strengthType === 'strength') {
    return [120, 240];
  }

  if (exercise.strengthType === 'hypertrophy') {
    const isIsolation = exercise.tags.includes('Isolation');
    return isIsolation ? [45, 90] : [60, 120];
  }

  if (exercise.strengthType === 'endurance') {
    return [30, 120];
  }

  return [60, 120];
}

const EXERCISE_DEFINITIONS: Exercise[] = [
  // ===== POWERLIFTING =====
  {
    name: 'Squat',
    tags: ['Legs', 'Quads', 'Glutes', 'Compound', 'Powerlifting'],
    favorite: false,
    isPowerlifting: true,
    bodyweight: false,
    repType: 'reps',
    category: ['squat', 'core'],
    strengthType: 'strength',
    equipment: 'barbell',
    warmupProtocol: [
      { weight: '20', reps: 10, weightUnit: 'kg' },
      { weight: '60', reps: 5, weightUnit: '%' },
      { weight: '85', reps: 2, weightUnit: '%' },
    ],
  },
  {
    name: 'Deadlift',
    tags: ['Back', 'Legs', 'Hamstrings', 'Glutes', 'Compound', 'Powerlifting'],
    favorite: false,
    isPowerlifting: true,
    bodyweight: false,
    repType: 'reps',
    category: ['hinge', 'core'],
    strengthType: 'strength',
    equipment: 'barbell',
    warmupProtocol: [
      { weight: '20', reps: 10, weightUnit: 'kg' },
      { weight: '40', reps: 8, weightUnit: '%' },
      { weight: '70', reps: 4, weightUnit: '%' },
      { weight: '90', reps: 1, weightUnit: '%' },
    ],
  },
  {
    name: 'Trap bar Deadlift',
    tags: ['Back', 'Legs', 'Quads', 'Glutes', 'Compound', 'Powerlifting'],
    favorite: false,
    isPowerlifting: true,
    bodyweight: false,
    repType: 'reps',
    category: ['hinge', 'squat', 'core'],
    strengthType: 'strength',
    equipment: 'barbell',
    warmupProtocol: [
      { weight: '20', reps: 10, weightUnit: 'kg' },
      { weight: '40', reps: 8, weightUnit: '%' },
      { weight: '70', reps: 4, weightUnit: '%' },
      { weight: '90', reps: 1, weightUnit: '%' },
    ],
  },
  {
    name: 'Bench Press',
    tags: ['Chest', 'Triceps', 'Shoulders', 'Compound', 'Powerlifting'],
    favorite: false,
    isPowerlifting: true,
    bodyweight: false,
    repType: 'reps',
    category: ['push_horizontal'],
    strengthType: 'strength',
    equipment: 'barbell',
  },
  // ===== CALISTHÉNIE - PULLING =====
  {
    name: 'Pull up',
    tags: ['Back', 'Lats', 'Biceps', 'Compound', 'Pulling'],
    favorite: true,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'reps',
    category: ['pull_vertical'],
    strengthType: 'strength',
    equipment: 'bar',
    description: {
      title: 'Mindset focus : change brain instructions',
      content: `
      <ul class="list-disc pl-4 space-y-1">
        <li>Not pull you up : Push your chest up the ceiling</li>
        <li>Driving your elbows down and back</li>
        <li>Active scapula depress / shoulders down</li>
      </ul>  `,
    },
  },
  {
    name: 'Chin up',
    tags: ['Back', 'Lats', 'Biceps', 'Compound', 'Pulling'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'reps',
    category: ['pull_vertical'],
    strengthType: 'strength',
    equipment: 'bar',
  },
  {
    name: 'Wide grip pull up',
    tags: ['Back', 'Lats', 'Biceps', 'Compound', 'Pulling'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'reps',
    category: ['pull_vertical'],
    strengthType: 'strength',
    equipment: 'bar',
  },
  {
    name: 'Close grip pull up',
    tags: ['Back', 'Lats', 'Biceps', 'Compound', 'Pulling'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'reps',
    category: ['pull_vertical'],
    strengthType: 'strength',
    equipment: 'bar',
  },
  {
    name: 'Hammer pull up',
    tags: ['Back', 'Lats', 'Biceps', 'Compound', 'Pulling'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'reps',
    category: ['pull_vertical'],
    strengthType: 'strength',
    equipment: 'bar',
  },
  {
    name: 'L-sit pull up',
    tags: ['Back', 'Lats', 'Biceps', 'Core', 'Abs', 'Compound', 'Pulling'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'reps',
    category: ['pull_vertical', 'core'],
    strengthType: 'skill',
    equipment: 'bar',
  },
  {
    name: 'Archer pull up',
    tags: ['Back', 'Lats', 'Biceps', 'Compound', 'Pulling'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'reps',
    category: ['pull_vertical'],
    strengthType: 'strength',
    equipment: 'bar',
  },
  {
    name: 'Typewriter pull up',
    tags: ['Back', 'Lats', 'Biceps', 'Compound', 'Pulling'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'reps',
    category: ['pull_vertical'],
    strengthType: 'skill',
    equipment: 'bar',
  },
  {
    name: 'One arm pull up',
    tags: ['Back', 'Lats', 'Biceps', 'Compound', 'Pulling'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'reps',
    category: ['pull_vertical'],
    strengthType: 'skill',
    equipment: 'bar',
  },
  {
    name: 'Eccentric OAP',
    tags: ['Back', 'Lats', 'Biceps', 'Compound', 'Pulling'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'reps',
    category: ['pull_vertical'],
    strengthType: 'skill',
    equipment: 'bar',
  },
  {
    name: 'Assisted OAP',
    tags: ['Back', 'Lats', 'Biceps', 'Compound', 'Pulling'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'reps',
    category: ['pull_vertical'],
    strengthType: 'skill',
    equipment: 'bar',
  },
  {
    name: 'Muscle up',
    tags: ['Back', 'Lats', 'Triceps', 'Chest', 'Compound', 'Pulling', 'Pushing'],
    favorite: true,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'reps',
    category: ['pull_vertical', 'push_vertical'],
    strengthType: 'skill',
    equipment: 'bar',
  },
  {
    name: 'Ring muscle up',
    tags: ['Back', 'Lats', 'Triceps', 'Chest', 'Compound', 'Pulling', 'Pushing'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'reps',
    category: ['pull_vertical', 'push_vertical'],
    strengthType: 'skill',
    equipment: 'rings',
  },
  {
    name: 'Body rows',
    tags: ['Back', 'Lats', 'Biceps', 'Compound', 'Pulling'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'reps',
    category: ['pull_horizontal'],
    strengthType: 'strength',
    equipment: 'bar',
  },
  {
    name: 'Ring rows',
    tags: ['Back', 'Lats', 'Biceps', 'Compound', 'Pulling'],
    favorite: true,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'reps',
    category: ['pull_horizontal'],
    strengthType: 'strength',
    equipment: 'rings',
  },
  {
    name: 'Ring face Pull',
    tags: ['Shoulders', 'Back', 'Isolation', 'Pulling'],
    favorite: true,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'reps',
    category: ['pull_horizontal'],
    strengthType: 'hypertrophy',
    equipment: 'rings',
  },
  {
    name: 'Australian pull up',
    tags: ['Back', 'Lats', 'Biceps', 'Compound', 'Pulling'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'reps',
    category: ['pull_horizontal'],
    strengthType: 'strength',
    equipment: 'bar',
  },
  {
    name: 'Front lever',
    tags: ['Back', 'Lats', 'Core', 'Abs', 'Isometric', 'Pulling'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'time',
    category: ['skill', 'pull_vertical', 'core'],
    strengthType: 'skill',
    equipment: 'bar',
  },
  {
    name: 'Front lever pull',
    tags: ['Back', 'Lats', 'Biceps', 'Core', 'Compound', 'Pulling'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'reps',
    category: ['skill', 'pull_vertical', 'core'],
    strengthType: 'skill',
    equipment: 'bar',
  },
  {
    name: 'Back lever',
    tags: ['Back', 'Lats', 'Biceps', 'Core', 'Isometric', 'Pulling'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'time',
    category: ['skill', 'pull_vertical', 'core'],
    strengthType: 'skill',
    equipment: 'bar',
  },
  {
    name: 'Dead hang hold',
    tags: ['Back', 'Lats', 'Grip', 'Isometric', 'Pulling'],
    favorite: true,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'time',
    category: ['pull_vertical'],
    strengthType: 'strength',
    equipment: 'bar',
  },
  {
    name: 'Active hang hold',
    tags: ['Back', 'Lats', 'Biceps', 'Grip', 'Isometric', 'Pulling'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'time',
    category: ['pull_vertical'],
    strengthType: 'strength',
    equipment: 'bar',
  },
  {
    name: 'One arm hang hold',
    tags: ['Back', 'Lats', 'Grip', 'Isometric', 'Pulling'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'time',
    category: ['pull_vertical'],
    strengthType: 'skill',
    equipment: 'bar',
  },

  // ===== CALISTHÉNIE - PUSHING =====
  {
    name: 'Push up',
    tags: ['Chest', 'Triceps', 'Shoulders', 'Compound', 'Pushing'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'reps',
    category: ['push_horizontal'],
    strengthType: 'strength',
    equipment: 'bar',
  },
  {
    name: 'Diamond push up',
    tags: ['Chest', 'Triceps', 'Compound', 'Pushing'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'reps',
    category: ['push_horizontal'],
    strengthType: 'hypertrophy',
    equipment: 'bar',
  },
  {
    name: 'Wide push up',
    tags: ['Chest', 'Shoulders', 'Compound', 'Pushing'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'reps',
    category: ['push_horizontal'],
    strengthType: 'hypertrophy',
    equipment: 'bar',
  },
  {
    name: 'Archer push up',
    tags: ['Chest', 'Triceps', 'Shoulders', 'Compound', 'Pushing'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'reps',
    category: ['push_horizontal'],
    strengthType: 'strength',
    equipment: 'parallette',
  },
  {
    name: 'Pseudo planche push up',
    tags: ['Chest', 'Triceps', 'Shoulders', 'Compound', 'Pushing'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'reps',
    category: ['push_horizontal', 'skill'],
    strengthType: 'skill',
    equipment: 'parallette',
  },
  {
    name: 'Planche lean hold',
    tags: ['Chest', 'Triceps', 'Shoulders', 'Compound', 'Pushing'],
    favorite: true,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'time',
    category: ['skill', 'push_horizontal'],
    strengthType: 'skill',
    equipment: 'parallette',
  },
  {
    name: 'Tuck planche hold',
    tags: ['Chest', 'Triceps', 'Shoulders', 'Core', 'Compound', 'Pushing'],
    favorite: true,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'time',
    category: ['skill', 'push_horizontal'],
    strengthType: 'skill',
    equipment: 'parallette',
  },
  {
    name: 'Tuck planche push up',
    tags: ['Chest', 'Triceps', 'Shoulders', 'Core', 'Compound', 'Pushing'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'reps',
    category: ['skill', 'push_horizontal'],
    strengthType: 'skill',
    equipment: 'parallette',
  },
  {
    name: 'Pike push up',
    tags: ['Shoulders', 'Triceps', 'Core', 'Compound', 'Pushing'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'reps',
    category: ['push_vertical'],
    strengthType: 'strength',
    equipment: 'floor',
  },
  {
    name: 'Handstand push up',
    tags: ['Shoulders', 'Triceps', 'Core', 'Compound', 'Pushing'],
    favorite: true,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'reps',
    category: ['push_vertical', 'skill'],
    strengthType: 'skill',
    equipment: 'parallette',
  },
  {
    name: 'Handstand',
    tags: ['Shoulders', 'Core', 'Balance', 'Pushing'],
    favorite: true,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'time',
    repTypeUnit: 'minute',
    category: ['skill', 'push_vertical'],
    strengthType: 'skill',
    equipment: 'parallette',
  },
  {
    name: 'Handstand hold',
    tags: ['Shoulders', 'Core', 'Balance', 'Isometric', 'Pushing'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'time',
    category: ['skill', 'push_vertical'],
    strengthType: 'skill',
    equipment: 'parallette',
  },
  {
    name: 'Dips',
    tags: ['Chest', 'Triceps', 'Shoulders', 'Compound', 'Pushing'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'reps',
    category: ['push_vertical', 'push_horizontal'],
    strengthType: 'strength',
    equipment: 'bar',
  },
  {
    name: 'Bar dips',
    tags: ['Chest', 'Triceps', 'Shoulders', 'Compound', 'Pushing'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'reps',
    category: ['push_vertical', 'push_horizontal'],
    strengthType: 'strength',
    equipment: 'bar',
  },
  {
    name: 'Ring dips',
    tags: ['Chest', 'Triceps', 'Shoulders', 'Compound', 'Pushing'],
    favorite: true,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'reps',
    category: ['push_vertical', 'push_horizontal'],
    strengthType: 'strength',
    equipment: 'rings',
  },
  {
    name: 'Ring support hold',
    tags: ['Triceps', 'Shoulders', 'Compound', 'Pushing'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'time',
    category: ['core', 'push_horizontal'],
    strengthType: 'strength',
    equipment: 'rings',
  },
  {
    name: 'L-sit dips',
    tags: ['Chest', 'Triceps', 'Core', 'Abs', 'Compound', 'Pushing'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'reps',
    category: ['push_vertical', 'push_horizontal', 'core'],
    strengthType: 'skill',
    equipment: 'bar',
  },
  {
    name: 'Planche',
    tags: ['Chest', 'Triceps', 'Shoulders', 'Core', 'Isometric', 'Pushing'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'time',
    category: ['skill', 'push_horizontal', 'core'],
    strengthType: 'skill',
    equipment: 'parallette',
  },

  // ===== CALISTHÉNIE - CORE =====
  {
    name: 'L-sit hold',
    tags: ['Core', 'Abs', 'Triceps', 'Isometric'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'time',
    category: ['core', 'skill'],
    strengthType: 'skill',
    equipment: 'bar',
  },
  {
    name: 'Hanging leg raise',
    tags: ['Core', 'Abs', 'Hip Flexors', 'Pulling'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'reps',
    category: ['core', 'pull_vertical'],
    strengthType: 'hypertrophy',
    equipment: 'bar',
  },
  {
    name: 'Toes to bar',
    tags: ['Core', 'Abs', 'Back', 'Hip Flexors', 'Pulling'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'reps',
    category: ['core', 'pull_vertical'],
    strengthType: 'strength',
    equipment: 'bar',
  },
  {
    name: 'Dragon flag',
    tags: ['Core', 'Abs', 'Hip Flexors', 'Isometric'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'reps',
    category: ['core', 'skill'],
    strengthType: 'strength',
    equipment: 'bar',
  },
  {
    name: 'Human flag',
    tags: ['Core', 'Abs', 'Shoulders', 'Isometric'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'time',
    category: ['skill', 'core'],
    strengthType: 'skill',
    equipment: 'bar',
  },
  {
    name: 'Plank',
    tags: ['Core', 'Abs', 'Isometric'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'time',
    category: ['core'],
    strengthType: 'strength',
    equipment: 'bar',
  },
  {
    name: 'Side plank',
    tags: ['Core', 'Abs', 'Obliques', 'Isometric'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'time',
    category: ['core'],
    strengthType: 'strength',
    equipment: 'bar',
  },
  {
    name: 'Hollow body hold',
    tags: ['Core', 'Abs', 'Isometric'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'time',
    category: ['core'],
    strengthType: 'skill',
    equipment: 'bar',
  },
  {
    name: 'Pistol squat',
    tags: ['Legs', 'Quads', 'Glutes', 'Balance', 'Compound'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: true,
    repType: 'reps',
    category: ['squat', 'skill'],
    strengthType: 'skill',
    equipment: 'bar',
  },

  {
    name: 'Overhead press',
    tags: ['Shoulders', 'Triceps', 'Core', 'Compound', 'Pushing'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: false,
    repType: 'reps',
    category: ['push_vertical', 'core'],
    strengthType: 'strength',
    equipment: 'barbell',
  },
  {
    name: 'Overhead press dumbell',
    tags: ['Shoulders', 'Triceps', 'Core', 'Compound', 'Pushing'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: false,
    repType: 'reps',
    category: ['push_vertical', 'core'],
    strengthType: 'strength',
    equipment: 'dumbbell',
    description: {
      title: 'Focus : Stabilité scapulaire & Force de poussée verticale.',
      content: ` <ul class="list-disc pl-4 space-y-1">
        <li><strong>Placement :</strong> Haltères aux épaules, coudes orientés à 45° vers l'avant (pas sur les côtés).</li>
        <li><strong>Exécution :</strong> Presse verticalement en gardant les abdos contractés pour ne pas cambrer.</li>
        <li><strong>Skill Transfer :</strong> Travaille la phase de verrouillage utile pour tes <strong>HSPU</strong>.</li>
      </ul>`,
    },
  },
  {
    name: 'Overhead press dumbell - standing',
    tags: ['Shoulders', 'Triceps', 'Compound', 'Pushing'],
    favorite: true,
    isPowerlifting: false,
    bodyweight: false,
    repType: 'reps',
    category: ['push_vertical', 'core'],
    strengthType: 'strength',
    equipment: 'dumbbell',
    description: {
      title: 'Focus : Stabilité scapulaire & Force de poussée verticale.',
      content: ` <ul class="list-disc pl-4 space-y-1">
        <li><strong>Placement :</strong> Haltères aux épaules, coudes orientés à 45° vers l'avant (pas sur les côtés).</li>
        <li><strong>Exécution :</strong> Presse verticalement en gardant les abdos contractés pour ne pas cambrer.</li>
        <li><strong>Skill Transfer :</strong> Travaille la phase de verrouillage utile pour tes <strong>HSPU</strong>.</li>
      </ul>`,
    },
  },
  {
    name: 'Lateral raises',
    tags: ['Shoulders', 'Isolation', 'Pushing'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: false,
    repType: 'reps',
    category: ['push_vertical'],
    strengthType: 'hypertrophy',
    equipment: 'dumbbell',
  },

  // ===== MUSCULATION CLASSIQUE - UPPER BODY PULLING =====
  {
    name: 'Barbell row',
    tags: ['Back', 'Lats', 'Biceps', 'Compound', 'Pulling'],
    favorite: false,
    isPowerlifting: true,
    bodyweight: false,
    repType: 'reps',
    category: ['pull_horizontal', 'core'],
    strengthType: 'strength',
    equipment: 'barbell',
    description: {
      title: 'Focus : Épaisseur du dos & Transfert Muscle-up.',
      content: `
      <ul class="list-disc pl-4 space-y-1">
        <li><strong>Placement :</strong> Buste à 45°, dos plat, genoux déverrouillés.</li>
        <li><strong>Exécution :</strong> Tire la barre vers le nombril en resserrant volontairement les omoplates.</li>
        <li><strong>Astuce :</strong> Imagine que tu veux couder quelqu'un derrière toi pour engager les dorsaux.</li>
      </ul>
  
  `,
    },
  },
  {
    name: 'Face Pull',
    tags: ['Shoulders', 'Back', 'Isolation', 'Pulling'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: false,
    repType: 'reps',
    category: ['pull_horizontal'],
    strengthType: 'hypertrophy',
    equipment: 'machine',
  },

  {
    name: 'Bicep curls',
    tags: ['Biceps', 'Isolation', 'Pulling'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: false,
    repType: 'reps',
    category: ['pull_vertical'],
    strengthType: 'hypertrophy',
    equipment: 'dumbbell',
  },
  {
    name: 'Jefferson curls',
    tags: ['Back', 'Legs', 'Hamstrings', 'Glutes', 'Compound', 'Pulling', 'Stretching'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: false,
    repType: 'reps',
    category: ['pull_vertical'],
    strengthType: 'hypertrophy',
    equipment: 'dumbbell',
  },
  {
    name: 'Bike',
    tags: ['Legs', 'Cardio', 'Compound'],
    favorite: false,
    isPowerlifting: false,
    bodyweight: false,
    repType: 'time',
    category: ['cardio', 'conditioning'],
    strengthType: 'endurance',
    equipment: 'machine',
  },
];

export const EXERCISES: Exercise[] = EXERCISE_DEFINITIONS.map(
  (exercise) =>
    ({
      ...exercise,
      warmupProtocol: exercise.warmupProtocol ? exercise.warmupProtocol : exercise.bodyweight ? undefined : defaultWarmupProtocol,
      restSecondsRange: exercise.restSecondsRange ?? REST_SECONDS_BY_EXERCISE[exercise.name] ?? getDefaultRestSecondsRange(exercise as Exercise),
    }) as Exercise
);

/** Returns the catalogue default; unknown exercises safely fall back to floor. */
export function getDefaultEquipment(exerciseName: string): Exercise['equipment'] {
  return EXERCISES.find((exercise) => exercise.name.toLowerCase() === exerciseName.toLowerCase())?.equipment ?? 'floor';
}

export type ExerciseName = Exercise['name'];
