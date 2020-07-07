export interface IChange {
  property: string;
  baseValue?: string;
  customValue?: string;
  changeType: 'NEW' | 'MODIFY' | 'DELETE';

  innerChanges?: Array<IChange>;
}
