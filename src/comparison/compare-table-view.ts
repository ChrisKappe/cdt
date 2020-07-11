import {
  ChangeType,
  ITableViewChange,
  IMemberChange,
  MemberChange,
} from './change.model';
import { CompareFilterConditions } from './compare-filter-conditions';
import ITableView from 'cal-to-json/models/table-view';

const ElementName = 'TableView';

export class CompareTableView {
  static compare(
    propertyName: string,
    baseObject: ITableView,
    customObject: ITableView
  ): ITableViewChange {
    const changes: Array<IMemberChange> = [];
    const change: ITableViewChange = {
      element: ElementName,
      propertyName: propertyName,
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
        case 'key':
          MemberChange.AddChange(
            changes,
            member,
            baseObject.key?.join(','),
            customObject.key?.join(',')
          );
          break;
        case 'order':
          MemberChange.AddChange(
            changes,
            member,
            baseObject[member],
            customObject[member]
          );
          break;
        case 'tableFilter':
          MemberChange.AddChangeObject(
            changes,
            member,
            CompareFilterConditions.compareCollection(
              member,
              baseObject.tableFilter || [],
              customObject.tableFilter || []
            )
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
