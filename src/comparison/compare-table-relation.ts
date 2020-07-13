import ITableRelation from '../cal-to-json/models/table-relation';
import {
  ChangeType,
  ITableRelationChange,
  IMemberChange,
  MemberChange,
} from './change.model';
import { CompareFilterConditions } from './compare-filter-conditions';

export class CompareTableRelation {
  static compare(
    propertyName: string,
    baseObject: ITableRelation,
    customObject: ITableRelation
  ): ITableRelationChange {
    const changes: Array<IMemberChange> = [];
    const change: ITableRelationChange = {
      propertyName: propertyName,
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
        case 'table':
        case 'field':
          MemberChange.AddChange(
            changes,
            member,
            baseObject[member],
            customObject[member]
          );
          break;
        case 'conditions':
          MemberChange.AddChangeObject(
            changes,
            member,
            CompareFilterConditions.compareCollection(
              baseObject.conditions || [],
              customObject.conditions || []
            )
          );
          break;
        case 'tableFilters':
          MemberChange.AddChangeObject(
            changes,
            member,
            CompareFilterConditions.compareCollection(
              baseObject.tableFilters || [],
              customObject.tableFilters || []
            )
          );
          break;
        case 'alternate':
          if (baseObject.alternate && customObject.alternate) {
            MemberChange.AddChangeObject(
              changes,
              member,
              this.compare(
                'alternate',
                baseObject.alternate,
                customObject.alternate
              )
            );
          } else {
            MemberChange.AddChange(
              changes,
              member,
              baseObject.alternate,
              customObject.alternate
            );
          }
          break;
        default:
          throw new Error(`${member} not implemented`);
      }
    }

    if (changes.length > 0) change.changeType = ChangeType.MODIFY;
    return change;
  }
}
