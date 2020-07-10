export interface IChange {
  element: string;
  id?: string | number;
  name?: string;
  base?: any;
  custom?: any;
  change: ChangeType;

  changes?: Array<IChange>;

  [key: string]: any;
}

export enum ChangeType {
  NONE, ADD, MODIFY, DELETE
}