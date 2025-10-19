import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface SidebarState {
  isExpanded: boolean;
  isMobileOpen: boolean;
  isHovered: boolean;
  activeItem: string | null;
  openSubmenu: string | null;
  isMobile: boolean;
}

const initialState: SidebarState = {
  isExpanded: true,
  isMobileOpen: false,
  isHovered: false,
  activeItem: null,
  openSubmenu: null,
  isMobile: false,
};

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isExpanded = !state.isExpanded;
    },
    toggleMobileSidebar: (state) => {
      state.isMobileOpen = !state.isMobileOpen;
    },
    setIsHovered: (state, action: PayloadAction<boolean>) => {
      state.isHovered = action.payload;
    },
    setActiveItem: (state, action: PayloadAction<string | null>) => {
      state.activeItem = action.payload;
    },
    toggleSubmenu: (state, action: PayloadAction<string>) => {
      state.openSubmenu = state.openSubmenu === action.payload ? null : action.payload;
    },
    setIsMobileOpen: (state, action: PayloadAction<boolean>) => {
      state.isMobileOpen = action.payload;
    },
    setIsMobile: (state, action: PayloadAction<boolean>) => {
      state.isMobile = action.payload;
      if (!action.payload) {
        state.isMobileOpen = false;
      }
    },
  },
});

// Selectors
export const selectSidebar = (state: { sidebar: SidebarState }) => state.sidebar;
export const selectIsExpanded = (state: { sidebar: SidebarState }) => 
  state.sidebar.isMobile ? false : state.sidebar.isExpanded;
export const selectIsMobileOpen = (state: { sidebar: SidebarState }) => state.sidebar.isMobileOpen;
export const selectIsHovered = (state: { sidebar: SidebarState }) => state.sidebar.isHovered;
export const selectActiveItem = (state: { sidebar: SidebarState }) => state.sidebar.activeItem;
export const selectOpenSubmenu = (state: { sidebar: SidebarState }) => state.sidebar.openSubmenu;
export const selectIsMobile = (state: { sidebar: SidebarState }) => state.sidebar.isMobile;

export const {
  toggleSidebar,
  toggleMobileSidebar,
  setIsHovered,
  setActiveItem,
  toggleSubmenu,
  setIsMobileOpen,
  setIsMobile,
} = sidebarSlice.actions;

export default sidebarSlice.reducer;