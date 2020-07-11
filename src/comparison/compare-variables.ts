import { IVariable } from 'cal-to-json/cal/variable-reader';
import {
  ChangeType,
  IVariableChange,
  ICollectionChange,
  IMemberChange,
  MemberChange,
} from './change.model';
import { CompareTextML } from './compare-text-ml';

const ElementCollectionName = 'Variables';
const ElementName = 'Variable';

export class CompareVariables {
  static compareCollection(
    propertyName: string,
    baseVariables: Array<IVariable>,
    customVariables: Array<IVariable>
  ): ICollectionChange<IVariableChange> {
    const changes: Array<IVariableChange> = [];
    const change: ICollectionChange<IVariableChange> = {
      element: ElementCollectionName,
      propertyName: propertyName,
      change: ChangeType.NONE,
      changes: changes,
    };

    const comparedVariables: Array<IVariable> = [];

    baseVariables.forEach(baseVariable => {
      let customVariable = customVariables.find(
        item => item.name === baseVariable.name
      );

      if (customVariable) {
        comparedVariables.push(customVariable);
        const change = this.compare(baseVariable, customVariable);
        if (change.change !== ChangeType.NONE) changes.push(change);
      } else {
        changes.push({
          element: ElementName,
          id: baseVariable.id,
          name: baseVariable.name,
          base: baseVariable,
          custom: null,
          change: ChangeType.DELETE,
        });
      }
    });

    customVariables.forEach(customVariable => {
      let variableFound = comparedVariables.find(
        item => item.name === customVariable.name
      );

      if (!variableFound) {
        changes.push({
          element: ElementName,
          id: customVariable.id,
          name: customVariable.name,
          base: null,
          custom: customVariable,
          change: ChangeType.ADD,
        });
      }
    });

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }

  static compare(
    baseObject: IVariable,
    customObject: IVariable
  ): IVariableChange {
    const changes: Array<IMemberChange> = [];
    const change: IVariableChange = {
      element: ElementName,
      id: baseObject.id,
      name: baseObject.name,
      base: baseObject,
      custom: customObject,
      change: ChangeType.NONE,
      changes: changes,
    };

    MemberChange.AddChange(
      changes,
      'Length',
      baseObject.length,
      customObject.length
    );

    MemberChange.AddChange(
      changes,
      'DataType',
      baseObject.datatype,
      customObject.datatype
    );

    MemberChange.AddChange(
      changes,
      'Dimensions',
      baseObject.dimensions,
      customObject.dimensions
    );

    MemberChange.AddChange(
      changes,
      'Temporary',
      baseObject.temporary,
      customObject.temporary
    );

    MemberChange.AddChange(
      changes,
      'SubType',
      baseObject.subType,
      customObject.subType
    );

    MemberChange.AddChange(
      changes,
      'InDataSet',
      baseObject.inDataSet,
      customObject.inDataSet
    );

    MemberChange.AddChange(
      changes,
      'SecurityFiltering',
      baseObject.securityFiltering,
      customObject.securityFiltering
    );

    MemberChange.AddChangeObject(
      changes,
      'TextML',
      CompareTextML.compareCollection(
        'textML',
        baseObject.textML || [],
        customObject.textML || []
      )
    );

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }
}
