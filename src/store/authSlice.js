import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userData: null,
  token: null,
  status: "idle"
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      const { user, token } = action.payload;
      state.userData = user;
      state.token = token; // ✅ Token stored here
      state.status = "authenticated";
    },
    logout: (state) => {
      state.userData = null;
      state.token = null;
      state.status = "idle";
      localStorage.removeItem("persist:root"); // clear persisted storage if using persist
    }
  }
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
