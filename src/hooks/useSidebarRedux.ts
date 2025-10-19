import { useAppSelector, useAppDispatch } from '../store/hooks';
import {
  selectIsExpanded,
  selectIsMobileOpen,
  selectIsHovered,
  selectActiveItem,
  selectOpenSubmenu,
  selectIsMobile,
  toggleSidebar,
  toggleMobileSidebar,
  setIsHovered,
  setActiveItem,
  toggleSubmenu,
  setIsMobileOpen,
} from '../store/slices/sidebarSlice';

export const useSidebar = () => {
  const dispatch = useAppDispatch();
  
  const isExpanded = useAppSelector(selectIsExpanded);
  const isMobileOpen = useAppSelector(selectIsMobileOpen);
  const isHovered = useAppSelector(selectIsHovered);
  const activeItem = useAppSelector(selectActiveItem);
  const openSubmenu = useAppSelector(selectOpenSubmenu);
  const isMobile = useAppSelector(selectIsMobile);

  return {
    isExpanded,
    isMobileOpen,
    isHovered,
    activeItem,
    openSubmenu,
    isMobile,
    toggleSidebar: () => dispatch(toggleSidebar()),
    toggleMobileSidebar: () => dispatch(toggleMobileSidebar()),
    setIsHovered: (hovered: boolean) => dispatch(setIsHovered(hovered)),
    setActiveItem: (item: string | null) => dispatch(setActiveItem(item)),
    toggleSubmenu: (item: string) => dispatch(toggleSubmenu(item)),
    setIsMobileOpen: (open: boolean) => dispatch(setIsMobileOpen(open)),
  };
};