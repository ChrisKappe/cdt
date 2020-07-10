import { IParameter } from 'cal-to-json/models/parameter';
import { IChange, ChangeType } from './change.model';
import { CompareVariables } from './compare-variables';

const ElementCollectionName = 'Parameters';
const ElementName = 'Parameter';

export class CompareParameters {
  static compareCollection(
    baseParameters: Array<IParameter>,
    customParameters: Array<IParameter>
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementCollectionName,
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
          change: ChangeType.ADD,
        });
      }
    });

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }

  static compare(baseParameter: IParameter, customParameter: IParameter) {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementName,
      id: baseParameter.variable.id,
      name: baseParameter.variable.name,
      change: ChangeType.NONE,
      changes: changes,
    };

    if (baseParameter.byReference !== customParameter.byReference) {
      changes.push({
        element: 'Property',
        name: 'byReference',
        base: baseParameter.byReference,
        custom: customParameter.byReference,
        change: ChangeType.MODIFY,
      });
    }

    const variableChange = CompareVariables.compare(
      baseParameter.variable,
      customParameter.variable
    );
    if (variableChange.change !== ChangeType.NONE) changes.push(variableChange);

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }
}
