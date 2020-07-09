import IPermission from 'cal-to-json/models/permission';
import { IChange } from './change.model';

export class ComparePermissions {
  static compareCollection(
    property: string,
    basePermissions: Array<IPermission>,
    customPermissions: Array<IPermission>
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      name: property,
      change: 'NONE',
      changes: changes,
    };

    const comparedPermissions: Array<IPermission> = [];

    basePermissions.forEach(basePermission => {
      let customPermission = customPermissions.find(
        item =>
          item.objectType === basePermission.objectType &&
          item.objectId === basePermission.objectId
      );

      if (customPermission) {
        comparedPermissions.push(customPermission);
        const change2 = this.compare(
          'Permission',
          basePermission,
          customPermission
        );
        if (change.change !== 'NONE') changes.push(change2);
      } else {
        changes.push({
          name: 'Permission',
          objectId: basePermission.objectId,
          objectType: basePermission.objectType,
          change: 'DELETE',
        });
      }
    });

    customPermissions.forEach(customPermission => {
      let permissionFound = comparedPermissions.find(
        item =>
          item.objectType === customPermission.objectType &&
          item.objectId === customPermission.objectId
      );

      if (!permissionFound) {
        changes.push({
          name: 'Permission',
          objectId: customPermission.objectId,
          objectType: customPermission.objectType,
          change: 'ADD',
        });
      }
    });

    if (changes.length > 0) change.change = 'MODIFY';
    return change;
  }

  static compare(
    propertyName: string,
    basePermission: IPermission,
    customPermission: IPermission
  ) {
    const changes: Array<IChange> = [];
    const change: IChange = {
      name: propertyName,
      objectId: basePermission.objectId,
      objectType: basePermission.objectType,
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
