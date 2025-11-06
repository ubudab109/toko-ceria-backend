import { UserI } from "./UserInterface";

export interface NotificationI {
  id: number;
  user_id: number;
  user: UserI;
  title: string;
  description: string;
  is_read: boolean;
  link: string;
  created_at: Date;
  updated_at: Date;
}
