import { IProcedure } from 'cal-to-json/models/procedure';
import {
  ChangeType,
  IProcedureChange,
  ICollectionChange,
  IMemberChange,
  MemberChange,
} from './change.model';
import { CompareVariables } from './compare-variables';
import { CompareParameters } from './compare-parameters';
import { CompareAttributes } from './compare-attributes';
import { CompareReturnType } from './compare-return-type';

const ElementCollectionName = 'Procedures';
const ElementName = 'Procedure';

export class CompareProcedures {
  static compareCollection(
    propertyName: string,
    baseProcedures: Array<IProcedure>,
    customProcedures: Array<IProcedure>
  ): ICollectionChange<IProcedureChange> {
    const changes: Array<IProcedureChange> = [];
    const change: ICollectionChange<IProcedureChange> = {
      element: ElementCollectionName,
      propertyName: propertyName,
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
          procedureId: baseProcedure.id,
          procedureName: baseProcedure.name,
          base: baseProcedure,
          custom: null,
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
          procedureId: customProcedure.id,
          procedureName: customProcedure.name,
          base: null,
          custom: customProcedure,
          change: ChangeType.ADD,
        });
      }
    });

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }

  static compare(
    base: IProcedure | any,
    custom: IProcedure | any
  ): IProcedureChange {
    const changes: Array<IMemberChange> = [];
    const change: IProcedureChange = {
      element: ElementName,
      procedureId: base.id,
      procedureName: base.name,
      base: base,
      custom: custom,
      change: ChangeType.NONE,
      changes: changes,
    };

    for (const key in base) {
      switch (key) {
        case 'className':
        case 'constructor':
          break;
        case 'variables':
          const varChange = CompareVariables.compareCollection(
            key,
            base.variables || [],
            custom.variables || []
          );
          MemberChange.AddChangeObject(changes, key, varChange);
          break;
        case 'parameters':
          const paramsChange = CompareParameters.compareCollection(
            key,
            base.parameters || [],
            custom.parameters || []
          );
          MemberChange.AddChangeObject(changes, key, paramsChange);
          break;
        case 'attributes':
          const attributesChange = CompareAttributes.compareCollection(
            key,
            base.attributes || [],
            custom.attributes || []
          );
          MemberChange.AddChangeObject(changes, key, attributesChange);
          break;
        case 'id':
        case 'name':
        case 'body':
        case 'local':
        case 'eventVariable':
        case 'eventVariableId':
          MemberChange.AddChange(changes, key, base[key], custom[key]);
          break;
        case 'returns':
          if (base.returns && custom.returns) {
            const returnsChange = CompareReturnType.compare(
              base.returns,
              custom.returns
            );
            MemberChange.AddChangeObject(changes, key, returnsChange);
          } else {
            MemberChange.AddChange(changes, key, base[key], custom[key]);
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
