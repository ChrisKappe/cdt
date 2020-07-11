import { IReturnType } from 'cal-to-json/models/return-type';
import {
  IChange,
  ChangeType,
  IReturnTypeChange,
  IMemberChange,
  MemberChange,
} from './change.model';

export class CompareReturnType {
  static compare(baseObject: IReturnType, customObject: IReturnType): IChange {
    const changes: Array<IMemberChange> = [];
    const change: IReturnTypeChange = {
      base: baseObject,
      custom: customObject,
      changeType: ChangeType.NONE,
      changes: changes,
    };

    for (const member in baseObject) {
      switch (member) {
        case 'className':
        case 'constructor':
          break;
        case 'name':
        case 'datatype':
        case 'length':
          MemberChange.AddChange(
            changes,
            member,
            baseObject[member],
            customObject[member]
          );
          break;
        default:
          throw new Error(`${member} not implemented`);
      }
    }

    if (changes.length > 0) change.changeType = ChangeType.MODIFY;
    return change;
  }
}
