import { IProperty } from 'cal-to-json/cal/property-map';
import {
  ChangeType,
  IPropertyChange,
  ICollectionChange,
  IChange,
} from './change.model';
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

const ElementCollectionName = 'Properties';
const ElementName = 'Property';

export class CompareProperties {
  static compareCollection(
    propertyName: string,
    baseProperties: Array<IProperty>,
    customProperties: Array<IProperty>
  ): ICollectionChange<IPropertyChange> {
    const changes: Array<IPropertyChange> = [];
    const change: ICollectionChange<IPropertyChange> = {
      element: ElementCollectionName,
      propertyName: propertyName,
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
          propertyName: baseProperty.name,
          base: baseProperty,
          custom: null,
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
          propertyName: customProperty.name,
          base: null,
          custom: customProperty,
          change: ChangeType.ADD,
        });
      }
    });

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }

  static compare(
    baseObject: IProperty,
    customObject: IProperty
  ): IPropertyChange {
    const change: IPropertyChange = {
      element: ElementName,
      propertyName: baseObject.name,
      base: baseObject,
      custom: customObject,
      change: ChangeType.NONE,
    };

    switch (baseObject.type) {
      case 'TEXT':
      case 'FIELD_LIST':
      case 'BOOLEAN':
      case 'INTEGER':
      case 'OPTION':
        if (baseObject.value !== customObject.value) {
          return {
            element: ElementName,
            propertyName: baseObject.name,
            base: baseObject.value,
            custom: customObject.value,
            change: ChangeType.MODIFY,
          };
        }
        break;
      case 'TRIGGER':
        return this.GetPropertyChange(
          baseObject.name,
          CompareTrigger.compare(
            baseObject.name,
            baseObject.value,
            customObject.value
          )
        );
      case 'TEXT_ML':
        return this.GetPropertyChange(
          baseObject.name,
          CompareTextML.compareCollection(
            baseObject.name,
            baseObject.value,
            customObject.value
          )
        );
      case 'TABLE_RELATION':
        return this.GetPropertyChange(
          baseObject.name,
          CompareTableRelation.compare(
            baseObject.name,
            baseObject.value,
            customObject.value
          )
        );
      case 'CALC_FORMULA':
        return this.GetPropertyChange(
          baseObject.name,
          CompareCalcFormula.compare(
            baseObject.name,
            baseObject.value,
            customObject.value
          )
        );
      case 'PERMISSION':
        return this.GetPropertyChange(
          baseObject.name,
          ComparePermissions.compare(
            baseObject.name,
            baseObject.value,
            customObject.value
          )
        );
      case 'PERMISSIONS':
        return this.GetPropertyChange(
          baseObject.name,
          ComparePermissions.compareCollection(
            baseObject.name,
            baseObject.value,
            customObject.value
          )
        );
      case 'ACTION_LIST':
        return this.GetPropertyChange(
          baseObject.name,
          ComparePageActions.compareCollection(
            baseObject.name,
            baseObject.value,
            customObject.value
          )
        );
      case 'TABLE_FILTER':
        return this.GetPropertyChange(
          baseObject.name,
          CompareFilterConditions.compareCollection(
            baseObject.name,
            baseObject.value || [],
            customObject.value || []
          )
        );
      case 'DATA_ITEM_LINK':
        return this.GetPropertyChange(
          baseObject.name,
          CompareDataItemLinks.compareCollection(
            baseObject.name,
            baseObject.value || [],
            customObject.value || []
          )
        );
      case 'TABLE_VIEW':
        return this.GetPropertyChange(
          baseObject.name,
          CompareTableView.compare(
            baseObject.name,
            baseObject.value,
            customObject.value
          )
        );
      case 'ORDERBY':
        return this.GetPropertyChange(
          baseObject.name,
          CompareOrderBy.compare(
            baseObject.name,
            baseObject.value,
            customObject.value
          )
        );
      default:
        throw new Error(`${baseObject.type} not implemented`);
    }

    return change;
  }

  private static GetPropertyChange(
    propertyName: string,
    change: IChange
  ): IPropertyChange {
    return {
      element: ElementName,
      propertyName: propertyName,
      innerChange: change,
      change: change.change,
    };
  }
}
