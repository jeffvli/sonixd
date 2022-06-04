import axios from 'renderer/lib/axios';
import { UserResponse } from './types';

const getUsers = async () => {
  const { data } = await axios.get<UserResponse>('/users');
  return data;
};

export const usersApi = {
  getUsers,
};
