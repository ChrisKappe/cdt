import { IProcedure } from '../cal-to-json/models/procedure';
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

export class CompareProcedures {
  static compareCollection(
    baseProcedures: Array<IProcedure>,
    customProcedures: Array<IProcedure>
  ): ICollectionChange<IProcedureChange> {
    const changes: Array<IProcedureChange> = [];
    const change: ICollectionChange<IProcedureChange> = {
      changeType: ChangeType.NONE,
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
        if (procedureChange.changeType !== ChangeType.NONE)
          changes.push(procedureChange);
      } else
        changes.push({
          procedureId: baseProcedure.id,
          procedureName: baseProcedure.name,
          base: baseProcedure,
          custom: null,
          changeType: ChangeType.DELETE,
        });
    });

    customProcedures.forEach(customProcedure => {
      let procedureFound = comparedProcedures.find(
        item => item.name === customProcedure.name
      );

      if (!procedureFound) {
        changes.push({
          procedureId: customProcedure.id,
          procedureName: customProcedure.name,
          base: null,
          custom: customProcedure,
          changeType: ChangeType.ADD,
        });
      }
    });

    if (changes.length > 0) change.changeType = ChangeType.MODIFY;
    return change;
  }

  static compare(
    baseObject: IProcedure | any,
    customObject: IProcedure | any
  ): IProcedureChange {
    const changes: Array<IMemberChange> = [];
    const change: IProcedureChange = {
      procedureId: baseObject.id,
      procedureName: baseObject.name,
      base: baseObject,
      custom: customObject,
      changeType: ChangeType.NONE,
      changes: changes,
    };

    for (const member in baseObject) {
      switch (member) {
        case 'className':
        case 'constructor':
          break;
        case 'variables':
          const varChange = CompareVariables.compareCollection(
            baseObject.variables || [],
            customObject.variables || []
          );
          MemberChange.AddChangeObject(changes, member, varChange);
          break;
        case 'parameters':
          const paramsChange = CompareParameters.compareCollection(
            baseObject.parameters || [],
            customObject.parameters || []
          );
          MemberChange.AddChangeObject(changes, member, paramsChange);
          break;
        case 'attributes':
          const attributesChange = CompareAttributes.compareCollection(
            baseObject.attributes || [],
            customObject.attributes || []
          );
          MemberChange.AddChangeObject(changes, member, attributesChange);
          break;
        case 'id':
        case 'name':
        case 'body':
        case 'local':
        case 'eventVariable':
        case 'eventVariableId':
          MemberChange.AddChange(
            changes,
            member,
            baseObject[member],
            customObject[member]
          );
          break;
        case 'returns':
          if (baseObject.returns && customObject.returns) {
            const returnsChange = CompareReturnType.compare(
              baseObject.returns,
              customObject.returns
            );
            MemberChange.AddChangeObject(changes, member, returnsChange);
          } else {
            MemberChange.AddChange(
              changes,
              member,
              baseObject[member],
              customObject[member]
            );
          }
          break;
        default:
          throw new Error(`${member} not implemented`);
      }
    }

    if (changes.length > 0) change.changeType = ChangeType.MODIFY;
    return change;
  }
}
