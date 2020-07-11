import ICalcFormula from 'cal-to-json/models/calc-formula';
import {
  ChangeType,
  ICalcFormulaChange,
  IMemberChange,
  MemberChange,
} from './change.model';
import { CompareFilterConditions } from './compare-filter-conditions';

const ElementName = 'CalcFormula';

export class CompareCalcFormula {
  static compare(
    propertyName: string,
    baseObject: ICalcFormula,
    customObject: ICalcFormula
  ): ICalcFormulaChange {
    const changes: Array<IMemberChange> = [];
    const change: ICalcFormulaChange = {
      element: ElementName,
      propertyName: propertyName,
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
        case 'method':
        case 'reverseSign':
        case 'table':
        case 'field':
          MemberChange.AddChange(
            changes,
            member,
            baseObject[member],
            customObject[member]
          );
          break;
        case 'tableFilter':
          MemberChange.AddChangeObject(
            changes,
            member,
            CompareFilterConditions.compareCollection(
              member,
              baseObject.tableFilter || [],
              customObject.tableFilter || []
            )
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
