import { IChange } from './change.model';
import { CompareFilterConditions } from './compare-filter-conditions';
import ITableView from 'cal-to-json/models/table-view';

const ElementName = 'TableView';

export class CompareTableView {
  static compare(
    property: string,
    baseTableView: ITableView,
    customTableView: ITableView
  ) {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementName,
      name: property,
      change: 'NONE',
      changes: changes,
    };

    for (const key in baseTableView) {
      switch (key) {
        case 'className':
        case 'constructor':
          break;
        case 'key':
        case 'order':
          if (baseTableView[key] !== customTableView[key]) {
            changes.push({
              element: 'Property',
              name: key,
              base: baseTableView[key],
              custom: customTableView[key],
              change: 'MODIFY',
            });
          }
          break;
        case 'tableFilter':
          const tableFiltersChange = CompareFilterConditions.compareCollection(
            baseTableView.tableFilter || [],
            customTableView.tableFilter || []
          );
          if (tableFiltersChange.change !== 'NONE')
            changes.push(tableFiltersChange);
          break;
        default:
          throw new Error(`${key} not implemented`);
      }
    }

    if (changes.length > 0) change.change = 'MODIFY';
    return change;
  }
}
