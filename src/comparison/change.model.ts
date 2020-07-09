export interface IChange {
  element: string;
  id?: string | number;
  name?: string;
  base?: any;
  custom?: any;
  change: 'NONE' | 'ADD' | 'MODIFY' | 'DELETE';

  changes?: Array<IChange>;

  [key: string]: any;
}
