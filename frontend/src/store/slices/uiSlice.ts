import { createSlice, type PayloadAction } from '@reduxjs/toolkit'; // <--- Add 'type' here

interface UiState {
  sidebarCollapsed: boolean;
  currentPage: string;
}

const initialState: UiState = {
  sidebarCollapsed: false,
  currentPage: 'Dashboard',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.currentPage = action.payload;
    },
  },
});

export const { toggleSidebar, setCurrentPage } = uiSlice.actions;
export default uiSlice.reducer;
