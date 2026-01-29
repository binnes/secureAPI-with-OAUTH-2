/**
 * Component Props Types
 * Type definitions for React component props
 */

import { ReactNode } from "react";
import { ScheduleItem } from "./schedule";

/**
 * Button component variants
 */
export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";

/**
 * Button component sizes
 */
export type ButtonSize = "sm" | "md" | "lg";

/**
 * Button component props
 */
export interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
}

/**
 * Card component props
 */
export interface CardProps {
  children: ReactNode;
  title?: string | ReactNode;
  className?: string;
  padding?: boolean;
}

/**
 * Spinner component props
 */
export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Schedule Item component props
 */
export interface ScheduleItemProps {
  item: ScheduleItem;
  className?: string;
}

/**
 * Schedule List component props
 */
export interface ScheduleListProps {
  items: ScheduleItem[];
  loading?: boolean;
  error?: string | null;
  className?: string;
}

/**
 * Schedule Panel component props
 */
export interface SchedulePanelProps {
  className?: string;
  onRefresh?: () => void;
}

/**
 * Login Button component props
 */
export interface LoginButtonProps {
  className?: string;
}

/**
 * Logout Button component props
 */
export interface LogoutButtonProps {
  className?: string;
}

/**
 * User Menu component props
 */
export interface UserMenuProps {
  className?: string;
}

/**
 * Header component props
 */
export interface HeaderProps {
  className?: string;
}

/**
 * Footer component props
 */
export interface FooterProps {
  className?: string;
}

/**
 * Session Provider Wrapper props
 */
export interface SessionProviderWrapperProps {
  children: ReactNode;
}

// Made with Bob
