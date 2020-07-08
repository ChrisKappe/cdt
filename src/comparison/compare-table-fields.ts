import { CompareProperties } from './compare-properties';
import ITableField from 'cal-to-json/models/table-field';
import { IChange } from './change.model';

export class CompareTableFields {
  static compareCollection(
    baseFields: Array<ITableField>,
    customFields: Array<ITableField>
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      name: 'Fields',
      change: 'NONE',
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
        if (change.change !== 'NONE') changes.push(change);
      } else {
        changes.push({
          id: baseField.id,
          name: baseField.name,
          change: 'DELETE',
        });
      }
    });

    customFields.forEach(customField => {
      let fieldFound = comparedFields.find(
        item => item.id === customField.id && item.name === customField.name
      );

      if (!fieldFound) {
        changes.push({
          id: customField.id,
          name: customField.name,
          change: 'ADD',
        });
      }
    });

    if (changes.length > 0) change.change = 'MODIFY';

    return change;
  }

  static compare(
    baseField: ITableField,
    customField: ITableField
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      id: baseField.id,
      name: baseField.name,
      change: 'NONE',
      changes: changes,
    };

    for (const key in baseField) {
      switch (key) {
        case 'className':
        case 'constructor':
        case 'name':
        case 'id':
          break;
        case 'dataType':
          if (baseField.dataType !== customField.dataType) {
            changes.push({
              name: 'dataType',
              base: baseField.dataType,
              custom: customField.dataType,
              change: 'MODIFY',
            });
          }
          break;
        case 'enabled':
          if (baseField.enabled !== customField.enabled) {
            changes.push({
              name: 'enabled',
              base: baseField.enabled,
              custom: customField.enabled,
              change: 'MODIFY',
            });
          }
          break;
        case 'properties':
          const propChange = CompareProperties.compareCollection(
            'properties',
            baseField[key] || [],
            customField[key] || []
          );
          if (propChange.change !== 'NONE') changes.push(propChange);
          break;
        default:
          throw new Error(`${key} not implemented`);
      }
    }

    if (changes.length > 0) change.change = 'MODIFY';
    return change;
  }
}
