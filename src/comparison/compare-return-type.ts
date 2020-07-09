import { IReturnType } from 'cal-to-json/models/return-type';
import { IChange } from './change.model';

const ElementName = 'ReturnType';

export class CompareReturnType {
  static compare(
    baseReturnType: IReturnType,
    customReturnType: IReturnType
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementName,
      change: 'NONE',
      changes: changes,
    };

    for (const key in baseReturnType) {
      switch (key) {
        case 'className':
        case 'constructor':
          break;
        case 'name':
        case 'datatype':
        case 'length':
          if (baseReturnType[key] !== customReturnType[key]) {
            changes.push({
              element: 'Property',
              name: key,
              base: baseReturnType[key],
              custom: customReturnType[key],
              change: 'MODIFY',
            });
          }
          break;
        default:
          throw new Error(`${key} not implemented`);
      }
    }

    if (changes.length > 0) change.change = 'MODIFY';
    return change;
  }
}
