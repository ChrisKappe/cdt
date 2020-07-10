import { IProperty } from 'cal-to-json/cal/property-map';
import { IChange, ChangeType } from './change.model';
import { CompareTrigger } from './compare-trigger';
import { CompareTextML } from './compare-text-ml';
import { CompareTableRelation } from './compare-table-relation';
import { CompareCalcFormula } from './compare-calc-formula';
import { ComparePermissions } from './compare-permission';
import { ComparePageActions } from './compare-page-actions';
import { CompareFilterConditions } from './compare-filter-conditions';
import { CompareTableView } from './compare-table-view';
import { CompareOrderBy } from './compare-order-by';
import { CompareDataItemLinks } from './compare-data-item-link';

const ElementName = 'Property';

export class CompareProperties {
  static compareCollection(
    collectionName: string,
    baseProperties: Array<IProperty>,
    customProperties: Array<IProperty>
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: collectionName,
      change: ChangeType.NONE,
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
        if (change.change !== ChangeType.NONE) changes.push(change);
      } else {
        changes.push({
          element: ElementName,
          name: baseProperty.name,
          change: ChangeType.DELETE,
        });
      }
    });

    customProperties.forEach(customProperty => {
      let propertyFound = comparedProperties.find(
        item => item.name === customProperty.name
      );

      if (!propertyFound) {
        changes.push({
          element: ElementName,
          name: customProperty.name,
          change: ChangeType.ADD,
        });
      }
    });

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }

  static compare(baseProperty: IProperty, customProperty: IProperty): IChange {
    const change: IChange = {
      element: ElementName,
      name: baseProperty.name,
      change: ChangeType.NONE,
    };

    switch (baseProperty.type) {
      case 'TEXT':
      case 'FIELD_LIST':
      case 'BOOLEAN':
      case 'INTEGER':
      case 'OPTION':
        if (baseProperty.value !== customProperty.value) {
          return {
            element: ElementName,
            name: baseProperty.name,
            base: baseProperty.value,
            custom: customProperty.value,
            change: ChangeType.MODIFY,
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
        return ComparePermissions.compare(
          baseProperty.name,
          baseProperty.value,
          customProperty.value
        );
      case 'PERMISSIONS':
        return ComparePermissions.compareCollection(
          baseProperty.name,
          baseProperty.value,
          customProperty.value
        );
      case 'ACTION_LIST':
        return ComparePageActions.compareCollection(
          baseProperty.value,
          customProperty.value
        );
      case 'TABLE_FILTER':
        return CompareFilterConditions.compareCollection(
          baseProperty.value || [],
          customProperty.value || []
        );
      case 'DATA_ITEM_LINK':
        return CompareDataItemLinks.compareCollection(
          baseProperty.value || [],
          customProperty.value || []
        );
      case 'TABLE_VIEW':
        return CompareTableView.compare(
          baseProperty.name,
          baseProperty.value,
          customProperty.value
        );
      case 'ORDERBY':
        return CompareOrderBy.compare(baseProperty.value, customProperty.value);
      default:
        throw new Error(`${baseProperty.type} not implemented`);
    }

    return change;
  }
}
