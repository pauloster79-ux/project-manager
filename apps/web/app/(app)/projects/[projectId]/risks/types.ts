export interface RiskListItem {
  id: string;
  title: string;
  probability: number;
  impact: number;
  exposure: number;
  next_review_date?: string;
  updated_at: string;
}
