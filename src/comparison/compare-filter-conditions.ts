import IFilterCondition from 'cal-to-json/models/filter-condition';
import {
  ChangeType,
  IFilterConditionChange,
  ICollectionChange,
  IMemberChange,
  MemberChange,
} from './change.model';

const ElementCollectionName = 'FilterConditions';
const ElementName = 'FilterCondition';

export class CompareFilterConditions {
  static compareCollection(
    propertyName: string,
    baseFilterConditions: Array<IFilterCondition>,
    customFilterConditions: Array<IFilterCondition>
  ): ICollectionChange<IFilterConditionChange> {
    const changes: Array<IFilterConditionChange> = [];
    const change: ICollectionChange<IFilterConditionChange> = {
      element: ElementCollectionName,
      propertyName: propertyName,
      change: ChangeType.NONE,
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
        if (change.change !== ChangeType.NONE) changes.push(change);
      } else {
        changes.push({
          element: ElementName,
          field: baseFilterCondition.field,
          base: baseFilterCondition,
          custom: null,
          change: ChangeType.DELETE,
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
          element: ElementName,
          field: customFilterCondition.field,
          base: null,
          custom: customFilterCondition,
          change: ChangeType.ADD,
        });
      }
    });

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }

  static compare(
    baseObject: IFilterCondition,
    customObject: IFilterCondition
  ): IFilterConditionChange {
    const changes: Array<IMemberChange> = [];
    const change: IFilterConditionChange = {
      element: ElementName,
      field: baseObject.field,
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

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }
}
