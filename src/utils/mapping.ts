export const COURSE_STATUS = {
  draft: { label: 'Draft', color: 'gray' },
  published: { label: 'Published', color: 'green' },
  unpublished: { label: 'Unpublished', color: 'orange' },
  rejected: { label: 'Rejected', color: 'red' },
  archived: { label: 'Archived', color: 'blue' },
};

export type CourseStatus = keyof typeof COURSE_STATUS;

export const UNIT_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  UNPUBLISHED: 'UNPUBLISHED',
};

export const LESSON_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  UNPUBLISHED: 'UNPUBLISHED',
};

export const formatStatusLabel = (status: string): string => {
  return status
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Split camelCase or PascalCase
    .replace(/\b\w/g, (c) => c.toUpperCase()); // Capitalize first letters
};
