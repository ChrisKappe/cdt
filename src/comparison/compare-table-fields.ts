import { CompareProperties } from './compare-properties';
import ITableField from 'cal-to-json/models/table-field';
import { IChange, ChangeType } from './change.model';

const ElementCollectionName = 'TableFields';
const ElementName = 'TableField';

export class CompareTableFields {
  static compareCollection(
    baseFields: Array<ITableField>,
    customFields: Array<ITableField>
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementCollectionName,
      change: ChangeType.NONE,
      changes: changes,
    };

    const comparedFields: Array<ITableField> = [];

    baseFields.forEach(baseField => {
      let customField = customFields.find(
        item => item.id === baseField.id && item.name === baseField.name
      );

      if (customField) {
        comparedFields.push(customField);
        const change = this.compare(baseField, customField);
        if (change.change !== ChangeType.NONE) changes.push(change);
      } else {
        changes.push({
          element: ElementName,
          id: baseField.id,
          name: baseField.name,
          change: ChangeType.DELETE,
        });
      }
    });

    customFields.forEach(customField => {
      let fieldFound = comparedFields.find(
        item => item.id === customField.id && item.name === customField.name
      );

      if (!fieldFound) {
        changes.push({
          element: ElementName,
          id: customField.id,
          name: customField.name,
          change: ChangeType.ADD,
        });
      }
    });

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }

  static compare(baseField: ITableField, customField: ITableField): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementName,
      id: baseField.id,
      name: baseField.name,
      change: ChangeType.NONE,
      changes: changes,
    };

    for (const key in baseField) {
      switch (key) {
        case 'className':
        case 'constructor':
          break;
        case 'name':
        case 'id':
        case 'dataType':
        case 'enabled':
          if (baseField[key] !== customField[key]) {
            changes.push({
              element: 'Property',
              name: 'dataType',
              base: baseField[key],
              custom: customField[key],
              change: ChangeType.MODIFY,
            });
          }
          break;
        case 'properties':
          const propChange = CompareProperties.compareCollection(
            'properties',
            baseField[key] || [],
            customField[key] || []
          );
          if (propChange.change !== ChangeType.NONE) changes.push(propChange);
          break;
        default:
          throw new Error(`${key} not implemented`);
      }
    }

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }
}
