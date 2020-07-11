import IFilterCondition from 'cal-to-json/models/filter-condition';
import {
  ChangeType,
  IFilterConditionChange,
  ICollectionChange,
  IMemberChange,
  MemberChange,
} from './change.model';

export class CompareFilterConditions {
  static compareCollection(
    baseFilterConditions: Array<IFilterCondition>,
    customFilterConditions: Array<IFilterCondition>
  ): ICollectionChange<IFilterConditionChange> {
    const changes: Array<IFilterConditionChange> = [];
    const change: ICollectionChange<IFilterConditionChange> = {
      changeType: ChangeType.NONE,
      changes: changes,
    };

    const comparedFilterConditions: Array<IFilterCondition> = [];

    baseFilterConditions.forEach(baseFilterCondition => {
      let customFilterCondition = customFilterConditions.find(
        item =>
          item.field === baseFilterCondition.field &&
          item.type === baseFilterCondition.type &&
          item.value === baseFilterCondition.value &&
          item.filter === baseFilterCondition.filter
      );

      if (customFilterCondition) {
        comparedFilterConditions.push(customFilterCondition);
        const change = this.compare(baseFilterCondition, customFilterCondition);
        if (change.changeType !== ChangeType.NONE) changes.push(change);
      } else {
        changes.push({
          field: baseFilterCondition.field,
          base: baseFilterCondition,
          custom: null,
          changeType: ChangeType.DELETE,
        });
      }
    });

    customFilterConditions.forEach(customFilterCondition => {
      let filterConditionFound = comparedFilterConditions.find(
        item =>
          item.field === customFilterCondition.field &&
          item.type === customFilterCondition.type &&
          item.value === customFilterCondition.value &&
          item.filter === customFilterCondition.filter
      );

      if (!filterConditionFound) {
        changes.push({
          field: customFilterCondition.field,
          base: null,
          custom: customFilterCondition,
          changeType: ChangeType.ADD,
        });
      }
    });

    if (changes.length > 0) change.changeType = ChangeType.MODIFY;
    return change;
  }

  static compare(
    baseObject: IFilterCondition,
    customObject: IFilterCondition
  ): IFilterConditionChange {
    const changes: Array<IMemberChange> = [];
    const change: IFilterConditionChange = {
      field: baseObject.field,
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
        case 'field':
        case 'type':
        case 'value':
        case 'filter':
        case 'upperLimit':
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
