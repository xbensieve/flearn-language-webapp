import api from '../../config/axios';
import type { Enum } from './type';

export const getSkillTypeService = async () => {
  const res = await api.get<Enum[]>('enums/skill-types');
  return res.data;
};

export const getLevelTypeService = async () => {
  const res = await api.get<Enum[]>('enums/level-types');
  return res.data;
};

export const getCourseStatusService = async () => {
  const res = await api.get<Enum[]>('enums/course-status');
  return res.data;
};
