import { NotificationI } from "./NotificationInterface";

export interface UserI {
  id: number;
  name: string;
  email: string;
  notifications?: NotificationI[];
}
