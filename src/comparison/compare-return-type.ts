import { IReturnType } from 'cal-to-json/models/return-type';
import {
  IChange,
  ChangeType,
  IReturnTypeChange,
  IMemberChange,
  MemberChange,
} from './change.model';

const ElementName = 'ReturnType';

export class CompareReturnType {
  static compare(baseObject: IReturnType, customObject: IReturnType): IChange {
    const changes: Array<IMemberChange> = [];
    const change: IReturnTypeChange = {
      element: ElementName,
      base: baseObject,
      custom: customObject,
      change: ChangeType.NONE,
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

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }
}
