import IFieldGroup from 'cal-to-json/models/field-group';
import {
  ChangeType,
  IFieldGroupChange,
  IMemberChange,
  ICollectionChange,
  MemberChange,
} from './change.model';

const ElementCollectionName = 'FieldGroups';
const ElementName = 'FieldGroup';

export class CompareFieldGroups {
  static compareCollection(
    propertyName: string,
    base: Array<IFieldGroup>,
    custom: Array<IFieldGroup>
  ): ICollectionChange<IFieldGroupChange> {
    const changes: Array<IFieldGroupChange> = [];
    const change: ICollectionChange<IFieldGroupChange> = {
      element: ElementCollectionName,
      propertyName: propertyName,
      change: ChangeType.NONE,
      changes: changes,
    };

    const comparedFieldGroups: Array<IFieldGroup> = [];

    base.forEach(baseFieldGroup => {
      let customFieldGroup = custom.find(
        item => item.name === baseFieldGroup.name
      );

      if (customFieldGroup) {
        comparedFieldGroups.push(customFieldGroup);
        const fieldGroupChange = this.compare(baseFieldGroup, customFieldGroup);
        if (fieldGroupChange.change !== ChangeType.NONE)
          changes.push(fieldGroupChange);
      } else
        changes.push({
          element: ElementName,
          name: baseFieldGroup.name,
          fields: baseFieldGroup.fields.join(', '),
          base: baseFieldGroup,
          custom: null,
          change: ChangeType.DELETE,
        });
    });

    custom.forEach(customFieldGroup => {
      let fieldGroupFound = comparedFieldGroups.find(
        item => item.name === customFieldGroup.name
      );

      if (!fieldGroupFound) {
        changes.push({
          element: ElementName,
          name: customFieldGroup.name,
          fields: customFieldGroup.fields.join(', '),
          base: null,
          custom: customFieldGroup,
          change: ChangeType.ADD,
        });
      }
    });

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }

  static compare(
    baseObject: IFieldGroup,
    customObject: IFieldGroup
  ): IFieldGroupChange {
    const changes: Array<IMemberChange> = [];
    const change: IFieldGroupChange = {
      element: ElementName,
      name: baseObject.name,
      fields: baseObject.fields.join(', '),
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
        case 'fields':
          MemberChange.AddChange(
            changes,
            member,
            baseObject.fields.join(','),
            customObject.fields.join(',')
          );
          break;
        case 'name':
        case 'id':
          MemberChange.AddChange(
            changes,
            member,
            baseObject[member],
            customObject[member]
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
