import ICalcFormula from 'cal-to-json/models/calc-formula';
import { IChange, ChangeType } from './change.model';
import { CompareFilterConditions } from './compare-filter-conditions';

const ElementName = 'CalcFormula';

export class CompareCalcFormula {
  static compare(
    propertyName: string,
    baseCalcFormula: ICalcFormula,
    customCalcFormula: ICalcFormula
  ) {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementName,
      name: propertyName,
      change: ChangeType.NONE,
      changes: changes,
    };

    for (const key in baseCalcFormula) {
      switch (key) {
        case 'className':
        case 'constructor':
          break;
        case 'method':
        case 'reverseSign':
        case 'table':
        case 'field':
          if (baseCalcFormula[key] !== customCalcFormula[key]) {
            changes.push({
              element: 'Property',
              name: key,
              base: baseCalcFormula[key],
              custom: customCalcFormula[key],
              change: ChangeType.MODIFY,
            });
          }
          break;
        case 'tableFilter':
          const tableFiltersChange = CompareFilterConditions.compareCollection(
            baseCalcFormula.tableFilter || [],
            customCalcFormula.tableFilter || []
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
