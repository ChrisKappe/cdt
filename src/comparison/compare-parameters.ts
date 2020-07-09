import { IParameter } from 'cal-to-json/models/parameter';
import { IChange } from './change.model';
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
        const change = this.compare(baseParameter, customParameter);
        if (change.change !== 'NONE') changes.push(change);
      } else {
        changes.push({
          element: ElementName,
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
          element: ElementName,
          id: customParameter.variable.id,
          name: customParameter.variable.name,
          change: 'ADD',
        });
      }
    });

    if (changes.length > 0) change.change = 'MODIFY';
    return change;
  }

  static compare(baseParameter: IParameter, customParameter: IParameter) {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementName,
      id: baseParameter.variable.id,
      name: baseParameter.variable.name,
      change: 'NONE',
      changes: changes,
    };

    if (baseParameter.byReference !== customParameter.byReference) {
      changes.push({
        element: 'Property',
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
}
