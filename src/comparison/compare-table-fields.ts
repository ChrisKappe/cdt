import { CompareProperties } from './compare-properties';
import ITableField from 'cal-to-json/models/table-field';
import {
  ChangeType,
  ITableFieldChange,
  ICollectionChange,
  IMemberChange,
  MemberChange,
} from './change.model';

const ElementCollectionName = 'TableFields';
const ElementName = 'TableField';

export class CompareTableFields {
  static compareCollection(
    propertyName: string,
    baseFields: Array<ITableField>,
    customFields: Array<ITableField>
  ): ICollectionChange<ITableFieldChange> {
    const changes: Array<ITableFieldChange> = [];
    const change: ICollectionChange<ITableFieldChange> = {
      element: ElementCollectionName,
      propertyName: propertyName,
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
          fieldId: baseField.id,
          fieldName: baseField.name,
          base: baseField,
          custom: null,
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
          fieldId: customField.id,
          fieldName: customField.name,
          base: null,
          custom: customField,
          change: ChangeType.ADD,
        });
      }
    });

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }

  static compare(
    baseObject: ITableField,
    customObject: ITableField
  ): ITableFieldChange {
    const changes: Array<IMemberChange> = [];
    const change: ITableFieldChange = {
      element: ElementName,
      fieldId: baseObject.id,
      fieldName: baseObject.name,
      base: baseObject,
      custom: customObject,
      change: ChangeType.NONE,
      changes: changes,
    };

    for (const member in baseObject) {
      switch (member) {
        case 'className':
        case 'constructor':
          break;
        case 'name':
        case 'id':
        case 'dataType':
        case 'enabled':
          MemberChange.AddChange(
            changes,
            member,
            baseObject[member],
            customObject[member]
          );
          break;
        case 'properties':
          MemberChange.AddChangeObject(
            changes,
            member,
            CompareProperties.compareCollection(
              member,
              baseObject[member] || [],
              customObject[member] || []
            )
          );
          break;
        default:
          throw new Error(`${member} not implemented`);
      }
    }

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }
}
