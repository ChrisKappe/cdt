import { IChange, ChangeType } from './change.model';
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
      change: ChangeType.NONE,
      changes: changes,
    };

    for (const key in baseTableView) {
      switch (key) {
        case 'className':
        case 'constructor':
          break;
        case 'key':
          const baseKey = baseTableView.key?.join(','),
            customKey = customTableView.key?.join(',');
          if (baseKey !== customKey) {
            changes.push({
              element: 'Property',
              name: key,
              base: baseKey,
              custom: customKey,
              change: ChangeType.MODIFY,
            });
          }
          break;
        case 'order':
          if (baseTableView[key] !== customTableView[key]) {
            changes.push({
              element: 'Property',
              name: key,
              base: baseTableView[key],
              custom: customTableView[key],
              change: ChangeType.MODIFY,
            });
          }
          break;
        case 'tableFilter':
          const tableFiltersChange = CompareFilterConditions.compareCollection(
            baseTableView.tableFilter || [],
            customTableView.tableFilter || []
          );
          if (tableFiltersChange.change !== ChangeType.NONE)
            changes.push(tableFiltersChange);
          break;
        default:
          throw new Error(`${key} not implemented`);
      }
    }

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }
}
