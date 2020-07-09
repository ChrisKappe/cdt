import { CompareProcedures } from './compare-procedures';
import { IChange } from './change.model';
import { CompareVariables } from './compare-variables';

const ElementName = 'Code';

export class CompareCode {
  static compare(baseCode: any, customCode: any): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementName,
      change: 'NONE',
      changes: changes,
    };

    for (const key in baseCode) {
      switch (key) {
        case 'documentation':
          if (baseCode.documentation !== customCode.documentation) {
            changes.push({
              element: 'documentation',
              base: baseCode.documentation,
              custom: customCode.documentation,
              change: 'MODIFY',
            });
          }
          break;
        case 'variables':
          const varChange = CompareVariables.compareCollection(
            baseCode[key] || [],
            customCode[key] || []
          );
          if (varChange.change !== 'NONE') changes.push(varChange);
          break;
        case 'procedures':
          const procedureChange = CompareProcedures.compareCollection(
            baseCode[key] || [],
            customCode[key] || []
          );

          if (procedureChange.change !== 'NONE') changes.push(procedureChange);
          break;
        default:
          throw new Error(`${key} not implemented`);
      }
    }

    if (changes.length > 0) change.change = 'MODIFY';
    return change;
  }
}
