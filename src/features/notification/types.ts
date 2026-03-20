export type InAppNotificationDTO = {
  id: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
  read: boolean;
  createdAt: string;
  updatedAt?: string;
};
