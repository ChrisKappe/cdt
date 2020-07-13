import { IProperty } from '../cal-to-json/cal/property-map';
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

export class CompareProperties {
  static compareCollection(
    baseProperties: Array<IProperty>,
    customProperties: Array<IProperty>
  ): ICollectionChange<IPropertyChange> {
    const changes: Array<IPropertyChange> = [];
    const change: ICollectionChange<IPropertyChange> = {
      changeType: ChangeType.NONE,
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
        if (change.changeType !== ChangeType.NONE) changes.push(change);
      } else {
        changes.push({
          propertyName: baseProperty.name,
          propertyType: baseProperty.type,
          base: baseProperty,
          custom: null,
          changeType: ChangeType.DELETE,
        });
      }
    });

    customProperties.forEach(customProperty => {
      let propertyFound = comparedProperties.find(
        item => item.name === customProperty.name
      );

      if (!propertyFound) {
        changes.push({
          propertyName: customProperty.name,
          propertyType: customProperty.type,
          base: null,
          custom: customProperty,
          changeType: ChangeType.ADD,
        });
      }
    });

    if (changes.length > 0) change.changeType = ChangeType.MODIFY;
    return change;
  }

  static compare(
    baseObject: IProperty,
    customObject: IProperty
  ): IPropertyChange {
    const change: IPropertyChange = {
      propertyName: baseObject.name,
      propertyType: baseObject.type,
      base: baseObject,
      custom: customObject,
      changeType: ChangeType.NONE,
    };

    switch (baseObject.type) {
      case 'TEXT':
      case 'FIELD_LIST':
      case 'BOOLEAN':
      case 'INTEGER':
      case 'OPTION':
        if (baseObject.value !== customObject.value) {
          return {
            propertyName: baseObject.name,
            propertyType: baseObject.type,
            base: baseObject.value,
            custom: customObject.value,
            changeType: ChangeType.MODIFY,
          };
        }
        break;
      case 'TRIGGER':
        return this.GetPropertyChange(
          baseObject.name,
          baseObject.type,
          CompareTrigger.compare(
            baseObject.name,
            baseObject.value,
            customObject.value
          )
        );
      case 'TEXT_ML':
        return this.GetPropertyChange(
          baseObject.name,
          baseObject.type,
          CompareTextML.compareCollection(baseObject.value, customObject.value)
        );
      case 'TABLE_RELATION':
        return this.GetPropertyChange(
          baseObject.name,
          baseObject.type,
          CompareTableRelation.compare(
            baseObject.name,
            baseObject.value,
            customObject.value
          )
        );
      case 'CALC_FORMULA':
        return this.GetPropertyChange(
          baseObject.name,
          baseObject.type,
          CompareCalcFormula.compare(
            baseObject.name,
            baseObject.value,
            customObject.value
          )
        );
      case 'PERMISSION':
        return this.GetPropertyChange(
          baseObject.name,
          baseObject.type,
          ComparePermissions.compare(baseObject.value, customObject.value)
        );
      case 'PERMISSIONS':
        return this.GetPropertyChange(
          baseObject.name,
          baseObject.type,
          ComparePermissions.compareCollection(
            baseObject.value,
            customObject.value
          )
        );
      case 'ACTION_LIST':
        return this.GetPropertyChange(
          baseObject.name,
          baseObject.type,
          ComparePageActions.compareCollection(
            baseObject.value,
            customObject.value
          )
        );
      case 'TABLE_FILTER':
        return this.GetPropertyChange(
          baseObject.name,
          baseObject.type,
          CompareFilterConditions.compareCollection(
            baseObject.value || [],
            customObject.value || []
          )
        );
      case 'DATA_ITEM_LINK':
        return this.GetPropertyChange(
          baseObject.name,
          baseObject.type,
          CompareDataItemLinks.compareCollection(
            baseObject.value || [],
            customObject.value || []
          )
        );
      case 'TABLE_VIEW':
        return this.GetPropertyChange(
          baseObject.name,
          baseObject.type,
          CompareTableView.compare(
            baseObject.name,
            baseObject.value,
            customObject.value
          )
        );
      case 'ORDERBY':
        return this.GetPropertyChange(
          baseObject.name,
          baseObject.type,
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
    propertyType: string,
    change: IChange
  ): IPropertyChange {
    return {
      propertyName: propertyName,
      propertyType: propertyType,
      change: change,
      changeType: change.changeType,
    };
  }
}
