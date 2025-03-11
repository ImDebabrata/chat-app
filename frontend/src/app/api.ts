import axios from 'axios';
import axiosInstance from './axiosInstance';

// Access the API URL from the environment variable
const API_URL = import.meta.env.VITE_APP_API_URL;

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface SigninData {
  email: string;
  password: string;
}

export const signup = async (data: SignupData) => {
  const response = await axios.post(`${API_URL}/signup`, data);
  return response.data;
};

export const signin = async (data: SigninData) => {
  const response = await axios.post(`${API_URL}/signin`, data);
  return response.data;
}; 

export const fetchUsers = async () => {
  const response = await axiosInstance.get("/users");
  return response.data;
};

export const sendMessage = async (data: { receiverId: string; content: string }) => {
  const response = await axiosInstance.post("/message", data);
  return response.data;
};

export const getMessages = async (recipientId: string) => {
  const response = await axiosInstance.get(`${API_URL}/messages/${recipientId}`, {
  });
  return response.data;
};