const PROFICIENCY_LEVELS: Record<
  string,
  { label: string; value: string; description: string; color: string; percent: number }[]
> = {
  en: [
    { label: 'A1', value: 'A1', description: 'Beginner', color: '#418ef2', percent: 16 },
    { label: 'A2', value: 'A2', description: 'Elementary', color: '#418ef2', percent: 33 },
    { label: 'B1', value: 'B1', description: 'Intermediate', color: '#418ef2', percent: 50 },
    { label: 'B2', value: 'B2', description: 'Upper-Intermediate', color: '#418ef2', percent: 66 },
    { label: 'C1', value: 'C1', description: 'Advanced', color: '#418ef2', percent: 83 },
    { label: 'C2', value: 'C2', description: 'Proficient', color: '#418ef2', percent: 100 },
  ],
  ja: [
    { label: 'N5', value: 'N5', description: 'Beginner', color: '#418ef2', percent: 20 },
    { label: 'N4', value: 'N4', description: 'Elementary', color: '#418ef2', percent: 40 },
    { label: 'N3', value: 'N3', description: 'Intermediate', color: '#418ef2', percent: 60 },
    { label: 'N2', value: 'N2', description: 'Business', color: '#418ef2', percent: 80 },
    { label: 'N1', value: 'N1', description: 'Fluent', color: '#418ef2', percent: 100 },
  ],
  zh: [
    { label: 'HSK1', value: 'HSK1', description: 'Beginner', color: '#418ef2', percent: 16 },
    { label: 'HSK2', value: 'HSK2', description: 'Elementary', color: '#418ef2', percent: 33 },
    { label: 'HSK3', value: 'HSK3', description: 'Intermediate', color: '#418ef2', percent: 50 },
    {
      label: 'HSK4',
      value: 'HSK4',
      description: 'Upper-Intermediate',
      color: '#418ef2',
      percent: 66,
    },
    { label: 'HSK5', value: 'HSK5', description: 'Advanced', color: '#418ef2', percent: 83 },
    { label: 'HSK6', value: 'HSK6', description: 'Fluent', color: '#418ef2', percent: 100 },
  ],
};

export { PROFICIENCY_LEVELS };
