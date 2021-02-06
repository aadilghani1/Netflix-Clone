import { createSlice } from '@reduxjs/toolkit';

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
  },
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
    },
    updatePlan: (state, action) => {
      state.user["plan"] = action.payload;
    },
  },
});

export const { login, logout,updatePlan } = userSlice.actions;




export const selectUser = state => state.user.user;

export default userSlice.reducer;
