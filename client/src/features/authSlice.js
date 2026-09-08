import { createSlice } from '@reduxjs/toolkit';

const getInitialUser = () => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

const savedUser = getInitialUser();

const initialState = {
  isAuthenticated: !!savedUser,
  user: savedUser,
  error: null,
};

const authSlice = createSlice({
  name: 'authSlice',
  initialState,
  reducers: {
    login(state, action) {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
      try {
        localStorage.setItem('user', JSON.stringify(action.payload));
      } catch (e) {
        console.warn('Failed to save user to localStorage:', e);
      }
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
      try {
        localStorage.removeItem('user');
      } catch (e) {
        console.warn('Failed to remove user from localStorage:', e);
      }
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const { login, logout, setError } = authSlice.actions;
export default authSlice.reducer;
