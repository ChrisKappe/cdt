import IFieldGroup from 'cal-to-json/models/field-group';
import { IChange } from './change.model';

export class CompareFieldGroups {
  static compareCollection(
    baseFieldGroups: Array<IFieldGroup>,
    customFieldGroups: Array<IFieldGroup>
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      name: 'FieldGroups',
      change: 'NONE',
      changes: changes,
    };

    const comparedFieldGroups: Array<IFieldGroup> = [];

    baseFieldGroups.forEach(baseFieldGroup => {
      let customFieldGroup = customFieldGroups.find(
        item => item.name === baseFieldGroup.name
      );

      if (customFieldGroup) {
        const fieldGroupChange = this.compare(
          baseFieldGroup,
          customFieldGroup
        );
        if (fieldGroupChange.change != 'NONE') changes.push(fieldGroupChange);
      } else
        changes.push({
          name: baseFieldGroup.name,
          change: 'DELETE',
        });
    });

    customFieldGroups.forEach(customFieldGroup => {
      let fieldGroupFound = comparedFieldGroups.find(
        item => item.name === customFieldGroup.name
      );

      if (!fieldGroupFound) {
        changes.push({
          name: customFieldGroup.name,
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
      name: baseFieldGroup.name,
      change: 'NONE',
      changes: changes,
    };

    for (const key in baseFieldGroup) {
      switch (key) {
        case 'className':
        case 'constructor':
        case 'name':
          break;
        case 'fields':
          if (
            baseFieldGroup.fields.join(',') !==
            customFieldGroup.fields.join(',')
          ) {
            changes.push({
              name: 'fields',
              base: baseFieldGroup.fields.join(', '),
              custom: customFieldGroup.fields.join(', '),
              change: 'MODIFY',
            });
          }
          break;
        case 'id':
          if (baseFieldGroup.id !== customFieldGroup.id) {
            changes.push({
              name: 'id',
              base: baseFieldGroup.id,
              custom: customFieldGroup.id,
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
