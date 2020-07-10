import { IProcedure } from 'cal-to-json/models/procedure';
import { IChange, ChangeType } from './change.model';
import { CompareVariables } from './compare-variables';
import { CompareParameters } from './compare-parameters';
import { CompareAttributes } from './compare-attributes';
import { CompareReturnType } from './compare-return-type';

const ElementCollectionName = 'Procedures';
const ElementName = 'Procedure';

export class CompareProcedures {
  static compareCollection(
    baseProcedures: Array<IProcedure>,
    customProcedures: Array<IProcedure>
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementCollectionName,
      change: ChangeType.NONE,
      changes: changes,
    };

    const comparedProcedures: Array<IProcedure> = [];

    baseProcedures.forEach(baseProcedure => {
      let customProcedure = customProcedures.find(
        item => item.name === baseProcedure.name
      );

      if (customProcedure) {
        comparedProcedures.push(customProcedure);
        const procedureChange = this.compare(baseProcedure, customProcedure);
        if (procedureChange.change !== ChangeType.NONE)
          changes.push(procedureChange);
      } else
        changes.push({
          element: ElementName,
          id: baseProcedure.id,
          name: baseProcedure.name,
          change: ChangeType.DELETE,
        });
    });

    customProcedures.forEach(customProcedure => {
      let procedureFound = comparedProcedures.find(
        item => item.name === customProcedure.name
      );

      if (!procedureFound) {
        changes.push({
          element: ElementName,
          id: customProcedure.id,
          name: customProcedure.name,
          change: ChangeType.ADD,
        });
      }
    });

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }

  static compare(
    baseProcedure: IProcedure | any,
    customProcedure: IProcedure | any
  ) {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementName,
      id: baseProcedure.id,
      name: baseProcedure.name,
      change: ChangeType.NONE,
      changes: changes,
    };

    for (const key in baseProcedure) {
      switch (key) {
        case 'className':
        case 'constructor':
          break;
        case 'variables':
          const varChange = CompareVariables.compareCollection(
            baseProcedure.variables || [],
            customProcedure.variables || []
          );

          if (varChange.change !== ChangeType.NONE) changes.push(varChange);
          break;
        case 'parameters':
          const paramsChange = CompareParameters.compareCollection(
            baseProcedure.parameters || [],
            customProcedure.parameters || []
          );
          if (paramsChange.change !== ChangeType.NONE)
            changes.push(paramsChange);
          break;
        case 'attributes':
          const attributesChange = CompareAttributes.compareCollection(
            baseProcedure.attributes || [],
            customProcedure.attributes || []
          );
          if (attributesChange.change !== ChangeType.NONE)
            changes.push(attributesChange);
          break;
        case 'id':
        case 'name':
        case 'body':
        case 'local':
        case 'eventVariable':
        case 'eventVariableId':
          if (baseProcedure[key] !== customProcedure[key]) {
            changes.push({
              element: 'Property',
              name: key,
              base: baseProcedure[key],
              custom: customProcedure[key],
              change: ChangeType.MODIFY,
            });
          }
          break;
        case 'returns':
          if (baseProcedure.returns && customProcedure.returns) {
            const returnsChange = CompareReturnType.compare(
              baseProcedure.returns,
              customProcedure.returns
            );
            if (returnsChange.change !== ChangeType.NONE)
              changes.push(returnsChange);
          } else if (!baseProcedure.returns && customProcedure.returns) {
            changes.push({
              element: 'ReturnType',
              change: ChangeType.ADD,
            });
          } else if (baseProcedure.returns && !customProcedure.returns) {
            changes.push({
              element: 'ReturnType',
              change: ChangeType.DELETE,
            });
          }
          break;
        default:
          throw new Error(`${key} not implemented`);
      }
    }

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }
}
