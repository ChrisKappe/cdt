import { IProcedure } from 'cal-to-json/models/procedure';
import { IChange } from './change.model';
import { CompareVariables } from './compare-variables';
import { IParameter } from 'cal-to-json/models/parameter';
import { IAttribute } from 'cal-to-json/cal/attribute-reader';
import { IReturnType } from 'cal-to-json/models/return-type';

export class CompareProcedures {
  static compareCollection(
    baseProcedures: Array<IProcedure>,
    customProcedures: Array<IProcedure>
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      name: 'Procedures',
      change: 'NONE',
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
        if (procedureChange.change !== 'NONE') changes.push(procedureChange);
      } else
        changes.push({
          id: baseProcedure.id,
          name: baseProcedure.name,
          change: 'DELETE',
        });
    });

    customProcedures.forEach(customProcedure => {
      let procedureFound = comparedProcedures.find(
        item => item.name === customProcedure.name
      );

      if (!procedureFound) {
        changes.push({
          id: customProcedure.id,
          name: customProcedure.name,
          change: 'ADD',
        });
      }
    });

    if (changes.length > 0) change.change = 'MODIFY';
    return change;
  }

  static compare(baseProcedure: IProcedure, customProcedure: IProcedure) {
    const changes: Array<IChange> = [];
    const change: IChange = {
      id: baseProcedure.id,
      name: baseProcedure.name,
      change: 'NONE',
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

          if (varChange.change !== 'NONE') changes.push(varChange);
          break;
        case 'parameters':
          const paramsChange = this.compareParameters(
            baseProcedure.parameters || [],
            customProcedure.parameters || []
          );
          if (paramsChange.changeType !== 'NONE') changes.push(paramsChange);
          break;
        case 'attributes':
          const attributesChange = this.compareAttributes(
            baseProcedure.attributes || [],
            customProcedure.attributes || []
          );
          if (attributesChange.changeType !== 'NONE')
            changes.push(attributesChange);
          break;
        case 'id':
        case 'name':
        case 'body':
        case 'local':
          if (baseProcedure[key] !== customProcedure[key]) {
            changes.push({
              name: key,
              base: baseProcedure[key],
              custom: customProcedure[key],
              change: 'MODIFY',
            });
          }
          break;
        case 'returns':
          if (baseProcedure.returns && customProcedure.returns) {
            const returnsChange = this.compareReturnType(
              baseProcedure.returns,
              customProcedure.returns
            );
            if (returnsChange.changeType !== 'NONE')
              changes.push(returnsChange);
          } else if (!baseProcedure.returns && customProcedure.returns) {
            changes.push({
              name: 'Returns',
              change: 'ADD',
            });
          } else if (baseProcedure.returns && !customProcedure.returns) {
            changes.push({
              name: 'Returns',
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

  static compareParameters(
    baseParameters: Array<IParameter>,
    customParameters: Array<IParameter>
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      name: 'Parameters',
      change: 'NONE',
      changes: changes,
    };

    const comparedParameters: Array<IParameter> = [];

    baseParameters.forEach(baseParameter => {
      let customParameter = customParameters.find(
        item => item.variable.name === baseParameter.variable.name
      );

      if (customParameter) {
        comparedParameters.push(customParameter);
        const change = this.compareParameter(baseParameter, customParameter);
        if (change.change !== 'NONE') changes.push(change);
      } else {
        changes.push({
          id: baseParameter.variable.id,
          name: baseParameter.variable.name,
          change: 'DELETE',
        });
      }
    });

    customParameters.forEach(customParameter => {
      let parameterFound = comparedParameters.find(
        item => item.variable.name === customParameter.variable.name
      );

      if (!parameterFound) {
        changes.push({
          id: customParameter.variable.id,
          name: customParameter.variable.name,
          change: 'ADD',
        });
      }
    });

    if (changes.length > 0) change.change = 'MODIFY';
    return change;
  }

  static compareParameter(
    baseParameter: IParameter,
    customParameter: IParameter
  ) {
    const changes: Array<IChange> = [];
    const change: IChange = {
      id: baseParameter.variable.id,
      name: baseParameter.variable.name,
      change: 'NONE',
      changes: changes,
    };

    if (baseParameter.byReference !== customParameter.byReference) {
      changes.push({
        name: 'byReference',
        base: baseParameter.byReference,
        custom: customParameter.byReference,
        change: 'MODIFY',
      });
    }

    const variableChange = CompareVariables.compare(
      baseParameter.variable,
      customParameter.variable
    );
    if (variableChange.change !== 'NONE') changes.push(variableChange);

    if (changes.length > 0) change.change = 'MODIFY';
    return change;
  }

  static compareAttributes(
    baseAttributes: Array<IAttribute>,
    customAttributes: Array<IAttribute>
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      name: 'Attributes',
      change: 'NONE',
      changes: changes,
    };

    const comparedAttributes: Array<IAttribute> = [];

    baseAttributes.forEach(baseAttribute => {
      let customAttribute = customAttributes.find(
        item => item.type === baseAttribute.type
      );

      if (customAttribute) {
        comparedAttributes.push(customAttribute);
        const change = this.compareAttribute(baseAttribute, customAttribute);
        if (change.change !== 'NONE') changes.push(change);
      } else {
        changes.push({
          name: baseAttribute.type,
          change: 'DELETE',
        });
      }
    });

    customAttributes.forEach(customAttribute => {
      let attributeFound = comparedAttributes.find(
        item => item.type === customAttribute.type
      );

      if (!attributeFound) {
        changes.push({
          name: customAttribute.type,
          change: 'ADD',
        });
      }
    });

    if (changes.length > 0) change.change = 'MODIFY';
    return change;
  }

  static compareAttribute(
    baseAttribute: IAttribute | any,
    customAttribute: IAttribute | any
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      name: baseAttribute.type,
      change: 'NONE',
      changes: changes,
    };

    for (const key in baseAttribute) {
      switch (key) {
        case 'className':
        case 'constructor':
          break;
        case 'type':
        case 'includeSender':
        case 'globalVarAccess':
        case 'publisherObjectType':
        case 'publisherObjectId':
        case 'eventFunction':
        case 'publisherElement':
        case 'onMissingLicense':
        case 'onMissingPermission':
          if (baseAttribute[key] !== customAttribute[key]) {
            changes.push({
              name: key,
              base: baseAttribute[key],
              custom: customAttribute[key],
              change: 'MODIFY',
            });
          }
          break;
        default:
          throw new Error(`${key} not implemented`);
      }
    }

    const variableChange = CompareVariables.compare(
      baseAttribute.variable,
      customAttribute.variable
    );
    if (variableChange.change !== 'NONE') changes.push(variableChange);

    if (changes.length > 0) change.change = 'MODIFY';
    return change;
  }

  static compareReturnType(
    baseReturnType: IReturnType,
    customReturnType: IReturnType
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      name: 'Returns',
      change: 'NONE',
      changes: changes,
    };

    for (const key in baseReturnType) {
      switch (key) {
        case 'className':
        case 'constructor':
          break;
        case 'name':
        case 'datatype':
        case 'length':
          if (baseReturnType[key] !== customReturnType[key]) {
            changes.push({
              name: key,
              base: baseReturnType[key],
              custom: customReturnType[key],
              change: 'MODIFY',
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
