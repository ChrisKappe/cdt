import IFieldGroup from 'cal-to-json/models/field-group';
import { IChange } from './change.model';

const ElementCollectionName = 'FieldGroups';
const ElementName = 'FieldGroup';

export class CompareFieldGroups {
  static compareCollection(
    baseFieldGroups: Array<IFieldGroup>,
    customFieldGroups: Array<IFieldGroup>
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementCollectionName,
      change: 'NONE',
      changes: changes,
    };

    const comparedFieldGroups: Array<IFieldGroup> = [];

    baseFieldGroups.forEach(baseFieldGroup => {
      let customFieldGroup = customFieldGroups.find(
        item => item.name === baseFieldGroup.name
      );

      if (customFieldGroup) {
        comparedFieldGroups.push(customFieldGroup);
        const fieldGroupChange = this.compare(baseFieldGroup, customFieldGroup);
        if (fieldGroupChange.change !== 'NONE') changes.push(fieldGroupChange);
      } else
        changes.push({
          element: ElementName,
          name: baseFieldGroup.name,
          fields: baseFieldGroup.fields.join(', '),
          change: 'DELETE',
        });
    });

    customFieldGroups.forEach(customFieldGroup => {
      let fieldGroupFound = comparedFieldGroups.find(
        item => item.name === customFieldGroup.name
      );

      if (!fieldGroupFound) {
        changes.push({
          element: ElementName,
          name: customFieldGroup.name,
          fields: customFieldGroup.fields.join(', '),
          change: 'ADD',
        });
      }
    });

    if (changes.length > 0) change.change = 'MODIFY';
    return change;
  }

  static compare(
    baseFieldGroup: IFieldGroup,
    customFieldGroup: IFieldGroup
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementName,
      name: baseFieldGroup.name,
      fields: baseFieldGroup.fields.join(', '),
      change: 'NONE',
      changes: changes,
    };

    for (const key in baseFieldGroup) {
      switch (key) {
        case 'className':
        case 'constructor':
          break;
        case 'fields':
          if (
            baseFieldGroup.fields.join(',') !==
            customFieldGroup.fields.join(',')
          ) {
            changes.push({
              element: 'Property',
              name: 'fields',
              base: baseFieldGroup.fields.join(', '),
              custom: customFieldGroup.fields.join(', '),
              change: 'MODIFY',
            });
          }
          break;
        case 'name':
        case 'id':
          if (baseFieldGroup[key] !== customFieldGroup[key]) {
            changes.push({
              element: 'Property',
              name: key,
              base: baseFieldGroup[key],
              custom: customFieldGroup[key],
              change: 'MODIFY',
            });
          }
          break;
        default:
          throw new Error(`${key} not implemented`);
      }
    }

    if (changes.length > 0) change.change = 'MODIFY';
    return change;
  }
}
