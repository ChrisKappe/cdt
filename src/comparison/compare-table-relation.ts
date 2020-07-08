import ITableRelation from 'cal-to-json/models/table-relation';
import { IChange } from './change.model';
import { CompareFilterConditions } from './compare-filter-conditions';

export class CompareTableRelation {
  static compare(
    property: string,
    baseTableRelation: ITableRelation,
    customTableRelation: ITableRelation
  ) {
    const changes: Array<IChange> = [];
    const change: IChange = {
      name: property,
      change: 'NONE',
      changes: changes,
    };

    for (const key in baseTableRelation) {
      switch (key) {
        case 'className':
        case 'constructor':
          break;
        case 'table':
        case 'field':
          if (baseTableRelation[key] !== customTableRelation[key]) {
            changes.push({
              name: key,
              base: baseTableRelation[key],
              custom: customTableRelation[key],
              change: 'MODIFY',
            });
          }
          break;
        case 'conditions':
          const conditionsChange = CompareFilterConditions.compareCollection(
            baseTableRelation.conditions || [],
            customTableRelation.conditions || []
          );
          if (conditionsChange.change !== 'NONE')
            changes.push(conditionsChange);
          break;
        case 'tableFilters':
          const tableFiltersChange = CompareFilterConditions.compareCollection(
            baseTableRelation.tableFilters || [],
            customTableRelation.tableFilters || []
          );
          if (tableFiltersChange.change !== 'NONE')
            changes.push(tableFiltersChange);
          break;
        case 'alternate':
          if (baseTableRelation.alternate && customTableRelation.alternate) {
            const alternateChange = this.compare(
              'alternate',
              baseTableRelation.alternate,
              customTableRelation.alternate
            );
            if (alternateChange.change !== 'NONE')
              changes.push(alternateChange);
          } else if (
            !baseTableRelation.alternate &&
            customTableRelation.alternate
          ) {
            changes.push({
              name: 'alternate',
              change: 'ADD',
            });
          } else if (
            baseTableRelation.alternate &&
            !customTableRelation.alternate
          ) {
            changes.push({
              name: 'alternate',
              change: 'DELETE',
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
