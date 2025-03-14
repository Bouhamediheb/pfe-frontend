export interface Notification {
  id: number;
  type: 'default' | 'info' | 'success' | 'warning' | 'error';
  msg: string;
  title?: string;
  icon?: string;
  delay?: number;
  position?: 'top left' | 'top right' | 'bottom left' | 'bottom right' | 'center top'; // Add position
}