import { IParameter } from 'cal-to-json/models/parameter';
import {
  ChangeType,
  IParameterChange,
  ICollectionChange,
  IMemberChange,
  MemberChange,
} from './change.model';
import { CompareVariables } from './compare-variables';

const ElementCollectionName = 'Parameters';
const ElementName = 'Parameter';

export class CompareParameters {
  static compareCollection(
    propertyName: string,
    baseParameters: Array<IParameter>,
    customParameters: Array<IParameter>
  ): ICollectionChange<IParameterChange> {
    const changes: Array<IParameterChange> = [];
    const change: ICollectionChange<IParameterChange> = {
      element: ElementCollectionName,
      propertyName: propertyName,
      change: ChangeType.NONE,
      changes: changes,
    };

    const comparedParameters: Array<IParameter> = [];

    baseParameters.forEach(baseParameter => {
      let customParameter = customParameters.find(
        item => item.variable.name === baseParameter.variable.name
      );

      if (customParameter) {
        comparedParameters.push(customParameter);
        const change = this.compare(baseParameter, customParameter);
        if (change.change !== ChangeType.NONE) changes.push(change);
      } else {
        changes.push({
          element: ElementName,
          id: baseParameter.variable.id,
          name: baseParameter.variable.name,
          base: baseParameter,
          custom: null,
          change: ChangeType.DELETE,
        });
      }
    });

    customParameters.forEach(customParameter => {
      let parameterFound = comparedParameters.find(
        item => item.variable.name === customParameter.variable.name
      );

      if (!parameterFound) {
        changes.push({
          element: ElementName,
          id: customParameter.variable.id,
          name: customParameter.variable.name,
          base: null,
          custom: customParameter,
          change: ChangeType.ADD,
        });
      }
    });

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }

  static compare(
    baseParameter: IParameter,
    customParameter: IParameter
  ): IParameterChange {
    const changes: Array<IMemberChange> = [];
    const change: IParameterChange = {
      element: ElementName,
      id: baseParameter.variable.id,
      name: baseParameter.variable.name,
      base: baseParameter,
      custom: customParameter,
      change: ChangeType.NONE,
      changes: changes,
    };

    MemberChange.AddChange(
      changes,
      'ByReference',
      baseParameter.byReference,
      customParameter.byReference
    );

    MemberChange.AddChangeObject(
      changes,
      'Variable',
      CompareVariables.compare(baseParameter.variable, customParameter.variable)
    );

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }
}
