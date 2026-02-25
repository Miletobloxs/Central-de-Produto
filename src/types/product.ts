export type SprintStatus = "planning" | "active" | "completed";
export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "critical";
export type MoscowPriority = "must" | "should" | "could" | "wont";
export type OKRStatus = "on_track" | "at_risk" | "off_track" | "completed";

export interface Sprint {
  id: string;
  name: string;
  goal?: string;
  status: SprintStatus;
  start_date?: string;
  end_date?: string;
  velocity?: number;
  created_at: string;
  tasks?: Task[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  story_points: number;
  epic?: string;
  assignee?: string;
  sprint_id?: string;
  parent_task_id?: string | null;
  position: number;
  created_at: string;
}

export interface BacklogItem {
  id: string;
  title: string;
  description?: string;
  moscow_priority: MoscowPriority;
  story_points: number;
  business_value: number;
  epic?: string;
  status: string;
  assignee?: string;
  sprint_id?: string;
  position: number;
  created_at: string;
}

export interface Objective {
  id: string;
  title: string;
  description?: string;
  quarter: string;
  status: OKRStatus;
  owner?: string;
  created_at: string;
  key_results?: KeyResult[];
}

export interface KeyResult {
  id: string;
  title: string;
  objective_id: string;
  target_value: number;
  current_value: number;
  unit: string;
  status: OKRStatus;
  dashboard_metric?: string;
  owner?: string;
  created_at: string;
}

export interface Checkin {
  id: string;
  key_result_id: string;
  value: number;
  note?: string;
  created_at: string;
}
