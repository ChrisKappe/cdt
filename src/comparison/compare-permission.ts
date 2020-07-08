import IPermission from 'cal-to-json/models/permission';
import { IChange } from './change.model';

export class ComparePermission {
  static compare(
    propertyName: string,
    basePermission: IPermission,
    customPermission: IPermission
  ) {
    const changes: Array<IChange> = [];
    const change: IChange = {
      name: propertyName,
      change: 'NONE',
      changes: changes,
    };

    for (const key in basePermission) {
      switch (key) {
        case 'className':
        case 'constructor':
          break;
        case 'objectType':
        case 'objectId':
        case 'read':
        case 'insert':
        case 'modify':
        case 'delete2':
        case 'execute':
          if (basePermission[key] !== customPermission[key]) {
            changes.push({
              name: key,
              base: basePermission[key],
              custom: customPermission[key],
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
