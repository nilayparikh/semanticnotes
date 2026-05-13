export interface Note {
  id: string;
  title: string;
  content: string;
  note_version: number;
  created_at: string;
  updated_at: string;
  updated_ts: number;
}

export interface NoteCreateData {
  title: string;
  content: string;
}

export interface NoteUpdateData {
  title?: string;
  content?: string;
  note_version: number;
}

export type NoteVersion = number;
export type NoteTimestamp = string;
