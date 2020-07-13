import { IParameter } from '../cal-to-json/models/parameter';
import {
  ChangeType,
  IParameterChange,
  ICollectionChange,
  IMemberChange,
  MemberChange,
} from './change.model';
import { CompareVariables } from './compare-variables';

export class CompareParameters {
  static compareCollection(
    baseParameters: Array<IParameter>,
    customParameters: Array<IParameter>
  ): ICollectionChange<IParameterChange> {
    const changes: Array<IParameterChange> = [];
    const change: ICollectionChange<IParameterChange> = {
      changeType: ChangeType.NONE,
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
        if (change.changeType !== ChangeType.NONE) changes.push(change);
      } else {
        changes.push({
          id: baseParameter.variable.id,
          name: baseParameter.variable.name,
          base: baseParameter,
          custom: null,
          changeType: ChangeType.DELETE,
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
          base: null,
          custom: customParameter,
          changeType: ChangeType.ADD,
        });
      }
    });

    if (changes.length > 0) change.changeType = ChangeType.MODIFY;
    return change;
  }

  static compare(
    baseParameter: IParameter,
    customParameter: IParameter
  ): IParameterChange {
    const changes: Array<IMemberChange> = [];
    const change: IParameterChange = {
      id: baseParameter.variable.id,
      name: baseParameter.variable.name,
      base: baseParameter,
      custom: customParameter,
      changeType: ChangeType.NONE,
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

    if (changes.length > 0) change.changeType = ChangeType.MODIFY;
    return change;
  }
}
