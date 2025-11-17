export interface OutcomeI {
  id: number;
  title: string;
  type: string;
  total: number;
  description: string;
  created_at: Date;
  link?: string;
}