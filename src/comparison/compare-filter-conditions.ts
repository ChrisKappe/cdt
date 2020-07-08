import IFilterCondition from 'cal-to-json/models/filter-condition';
import { IChange } from './change.model';

export class CompareFilterConditions {
  static compareCollection(
    baseFilterConditions: Array<IFilterCondition>,
    customFilterConditions: Array<IFilterCondition>
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      name: 'FilterConditions',
      change: 'NONE',
      changes: changes,
    };

    const comparedFilterConditions: Array<IFilterCondition> = [];

    baseFilterConditions.forEach(baseFilterCondition => {
      let customFilterCondition = customFilterConditions.find(
        item => item.field === baseFilterCondition.field
      );

      if (customFilterCondition) {
        comparedFilterConditions.push(customFilterCondition);
        const change = this.compare(baseFilterCondition, customFilterCondition);
        if (change.change !== 'NONE') changes.push(change);
      } else {
        changes.push({
          name: 'FilterCondition',
          field: baseFilterCondition.field,
          change: 'DELETE',
        });
      }
    });

    customFilterConditions.forEach(customFilterCondition => {
      let filterConditionFound = comparedFilterConditions.find(
        item => item.field === customFilterCondition.field
      );

      if (!filterConditionFound) {
        changes.push({
          name: 'FilterCondition',
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
      name: 'FilterCondition',
      change: 'NONE',
      changes: changes,
    };

    for (const key in baseField) {
      switch (key) {
        case 'className':
        case 'constructor':
        case 'field':
          break;
        case 'type':
        case 'value':
        case 'filter':
        case 'upperLimit':
          if (baseField[key] !== customField[key]) {
            changes.push({
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
