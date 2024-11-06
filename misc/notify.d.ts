export type Notify = {
  notify_id: string,
  notify_title: string,
  notify_detail: string,
  notify_url: string,
  notify_to: string,
  notify_lv: string,
  adddate: Date | string,
  is_seen: boolean,
  seen_date: Date | string,
};

export type NotifyEvent = {
  notify_event_id: string,
  notify_event_name: string,
  notify_event_key: string,
  notify_event_group: number,
};

export type OnesignalPlayer = {
  player_id: string,
  student_id?: string,
  teacher_id?: string,
  user_id?: string,
};