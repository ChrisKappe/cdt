import IPermission from 'cal-to-json/models/permission';
import { IChange, ChangeType } from './change.model';

const ElementCollectionName = 'Permissions';
const ElementName = 'Permission';

export class ComparePermissions {
  static compareCollection(
    property: string,
    basePermissions: Array<IPermission>,
    customPermissions: Array<IPermission>
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementCollectionName,
      name: property,
      change: ChangeType.NONE,
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
          ElementName,
          basePermission,
          customPermission
        );
        if (change.change !== ChangeType.NONE) changes.push(change2);
      } else {
        changes.push({
          element: ElementName,
          objectId: basePermission.objectId,
          objectType: basePermission.objectType,
          change: ChangeType.DELETE,
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
          element: ElementName,
          objectId: customPermission.objectId,
          objectType: customPermission.objectType,
          change: ChangeType.ADD,
        });
      }
    });

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }

  static compare(
    propertyName: string,
    basePermission: IPermission,
    customPermission: IPermission
  ) {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementName,
      name: propertyName,
      objectId: basePermission.objectId,
      objectType: basePermission.objectType,
      change: ChangeType.NONE,
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
              element: 'Property',
              name: key,
              base: basePermission[key],
              custom: customPermission[key],
              change: ChangeType.MODIFY,
            });
          }
          break;
        default:
          throw new Error(`${key} not implemented`);
      }
    }

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }
}
