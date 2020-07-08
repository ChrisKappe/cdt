import ICalcFormula from 'cal-to-json/models/calc-formula';
import { IChange } from './change.model';
import { CompareFilterConditions } from './compare-filter-conditions';

export class CompareCalcFormula {
  static compare(
    propertyName: string,
    baseCalcFormula: ICalcFormula,
    customCalcFormula: ICalcFormula
  ) {
    const changes: Array<IChange> = [];
    const change: IChange = {
      name: propertyName,
      change: 'NONE',
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
              name: key,
              base: baseCalcFormula[key],
              custom: customCalcFormula[key],
              change: 'MODIFY',
            });
          }
          break;
        case 'tableFilter':
          const tableFiltersChange = CompareFilterConditions.compareCollection(
            baseCalcFormula.tableFilter || [],
            customCalcFormula.tableFilter || []
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
