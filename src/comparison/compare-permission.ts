import IPermission from 'cal-to-json/models/permission';
import {
  ChangeType,
  IPermissionChange,
  ICollectionChange,
  IMemberChange,
  MemberChange,
} from './change.model';

const ElementCollectionName = 'Permissions';
const ElementName = 'Permission';

export class ComparePermissions {
  static compareCollection(
    propertyName: string,
    basePermissions: Array<IPermission>,
    customPermissions: Array<IPermission>
  ): ICollectionChange<IPermissionChange> {
    const changes: Array<IPermissionChange> = [];
    const change: ICollectionChange<IPermissionChange> = {
      element: ElementCollectionName,
      propertyName: propertyName,
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
          propertyName: propertyName,
          objectId: basePermission.objectId,
          objectType: basePermission.objectType,
          base: basePermission,
          custom: null,
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
          propertyName: propertyName,
          objectId: customPermission.objectId,
          objectType: customPermission.objectType,
          base: null,
          custom: customPermission,
          change: ChangeType.ADD,
        });
      }
    });

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }

  static compare(
    propertyName: string,
    baseObject: IPermission,
    customObject: IPermission
  ): IPermissionChange {
    const changes: Array<IMemberChange> = [];
    const change: IPermissionChange = {
      element: ElementName,
      propertyName: propertyName,
      objectId: baseObject.objectId,
      objectType: baseObject.objectType,
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
        case 'objectType':
        case 'objectId':
        case 'read':
        case 'insert':
        case 'modify':
        case 'delete2':
        case 'execute':
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
