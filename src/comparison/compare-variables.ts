import { IVariable } from 'cal-to-json/cal/variable-reader';
import { IChange } from './change.model';
import { CompareTextML } from './compare-text-ml';

const ElementCollectionName = 'Variables';
const ElementName = 'Variable';

export class CompareVariables {
  static compareCollection(
    baseVariables: Array<IVariable>,
    customVariables: Array<IVariable>
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementCollectionName,
      change: 'NONE',
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
        if (change.change !== 'NONE') changes.push(change);
      } else {
        changes.push({
          element: ElementName,
          id: baseVariable.id,
          name: baseVariable.name,
          change: 'DELETE',
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
          change: 'ADD',
        });
      }
    });

    if (changes.length > 0) change.change = 'MODIFY';
    return change;
  }

  static compare(baseVariable: IVariable, customVariable: IVariable) {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementName,
      id: baseVariable.id,
      name: baseVariable.name,
      change: 'NONE',
      changes: changes,
    };

    if (baseVariable.length !== customVariable.length) {
      changes.push({
        element: 'Property',
        name: 'length',
        base: baseVariable.length,
        custom: customVariable.length,
        change: 'MODIFY',
      });
    }

    if (baseVariable.datatype !== customVariable.datatype) {
      changes.push({
        element: 'Property',
        name: 'datatype',
        base: baseVariable.datatype,
        custom: customVariable.datatype,
        change: 'MODIFY',
      });
    }

    if (baseVariable.dimensions !== customVariable.dimensions) {
      changes.push({
        element: 'Property',
        name: 'dimensions',
        base: baseVariable.dimensions,
        custom: customVariable.dimensions,
        change: 'MODIFY',
      });
    }

    if (baseVariable.temporary !== customVariable.temporary) {
      changes.push({
        element: 'Property',
        name: 'temporary',
        base: baseVariable.temporary,
        custom: customVariable.temporary,
        change: 'MODIFY',
      });
    }
    if (baseVariable.subType !== customVariable.subType) {
      changes.push({
        element: 'Property',
        name: 'subType',
        base: baseVariable.subType,
        custom: customVariable.subType,
        change: 'MODIFY',
      });
    }

    if (baseVariable.inDataSet !== customVariable.inDataSet) {
      changes.push({
        element: 'Property',
        name: 'inDataSet',
        base: baseVariable.inDataSet,
        custom: customVariable.inDataSet,
        change: 'MODIFY',
      });
    }

    if (baseVariable.securityFiltering !== customVariable.securityFiltering) {
      changes.push({
        element: 'Property',
        name: 'securityFiltering',
        base: baseVariable.securityFiltering,
        custom: customVariable.securityFiltering,
        change: 'MODIFY',
      });
    }

    if (baseVariable.textML !== customVariable.textML) {
      const textMLChange = CompareTextML.compareCollection(
        'textML',
        baseVariable.textML || [],
        customVariable.textML || []
      );
      if (textMLChange.change !== 'NONE') changes.push(textMLChange);
    }

    if (changes.length > 0) change.change = 'MODIFY';
    return change;
  }
}
