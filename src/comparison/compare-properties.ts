import { IProperty } from 'cal-to-json/cal/property-map';
import { IChange } from './change.model';
import { CompareTrigger } from './compare-trigger';
import { CompareTextML } from './compare-text-ml';
import { CompareTableRelation } from './compare-table-relation';
import { CompareCalcFormula } from './compare-calc-formula';
import { ComparePermission } from './compare-permission';

export class CompareProperties {
  static compareCollection(
    name: string,
    baseProperties: Array<IProperty>,
    customProperties: Array<IProperty>
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      name: name,
      change: 'NONE',
      changes: changes,
    };

    const comparedProperties: Array<IProperty> = [];

    baseProperties.forEach(baseProperty => {
      let customProperty = customProperties.find(
        item => item.name === baseProperty.name
      );

      if (customProperty) {
        comparedProperties.push(customProperty);
        const change = this.compare(baseProperty, customProperty);
        if (change.change !== 'NONE') changes.push(change);
      } else {
        changes.push({
          name: baseProperty.name,
          change: 'DELETE',
        });
      }
    });

    customProperties.forEach(customProperty => {
      let propertyFound = comparedProperties.find(
        item => item.name === customProperty.name
      );

      if (!propertyFound) {
        changes.push({
          name: customProperty.name,
          change: 'ADD',
        });
      }
    });

    if (changes.length > 0) change.change = 'MODIFY';
    return change;
  }

  static compare(baseProperty: IProperty, customProperty: IProperty): IChange {
    const change: IChange = {
      name: baseProperty.name,
      change: 'NONE',
    };

    switch (baseProperty.type) {
      case 'TEXT':
      case 'FIELD_LIST':
      case 'BOOLEAN':
      case 'INTEGER':
      case 'OPTION':
        if (baseProperty.value !== customProperty.value) {
          return {
            name: baseProperty.name,
            base: baseProperty.value,
            custom: customProperty.value,
            change: 'MODIFY',
          };
        }
        break;
      case 'TRIGGER':
        return CompareTrigger.compare(
          baseProperty.name,
          baseProperty.value,
          customProperty.value
        );
      case 'TEXT_ML':
        return CompareTextML.compareCollection(
          baseProperty.name,
          baseProperty.value,
          customProperty.value
        );
      case 'TABLE_RELATION':
        return CompareTableRelation.compare(
          baseProperty.name,
          baseProperty.value,
          customProperty.value
        );
      case 'CALC_FORMULA':
        return CompareCalcFormula.compare(
          baseProperty.name,
          baseProperty.value,
          customProperty.value
        );
      case 'PERMISSION':
        return ComparePermission.compare(
          baseProperty.name,
          baseProperty.value,
          customProperty.value
        );
      default:
        throw new Error(`${baseProperty.type} not implemented`);
    }

    return change;
  }
}
