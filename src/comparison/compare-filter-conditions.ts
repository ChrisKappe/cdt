import IFilterCondition from 'cal-to-json/models/filter-condition';
import { IChange } from './change.model';

const ElementCollectionName = 'FilterConditions';
const ElementName = 'FilterCondition';

export class CompareFilterConditions {
  static compareCollection(
    baseFilterConditions: Array<IFilterCondition>,
    customFilterConditions: Array<IFilterCondition>
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementCollectionName,
      change: 'NONE',
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
        if (change.change !== 'NONE') changes.push(change);
      } else {
        changes.push({
          element: ElementName,
          field: baseFilterCondition.field,
          change: 'DELETE',
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
          change: 'ADD',
        });
      }
    });

    if (changes.length > 0) change.change = 'MODIFY';
    return change;
  }

  static compare(
    baseField: IFilterCondition,
    customField: IFilterCondition
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementName,
      field: baseField.field,
      change: 'NONE',
      changes: changes,
    };

    for (const key in baseField) {
      switch (key) {
        case 'className':
        case 'constructor':
          break;
        case 'field':
        case 'type':
        case 'value':
        case 'filter':
        case 'upperLimit':
          if (baseField[key] !== customField[key]) {
            changes.push({
              element: 'Property',
              name: key,
              base: baseField[key],
              custom: customField[key],
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
