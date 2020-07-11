import { IAttribute } from 'cal-to-json/cal/attribute-reader';
import {
  ChangeType,
  IAttributeChange,
  IMemberChange,
  ICollectionChange,
  MemberChange,
} from './change.model';

const ElementCollectionName = 'Attributes';
const ElementName = 'Attribute';

export class CompareAttributes {
  static compareCollection(
    propertyName: string,
    baseAttributes: Array<IAttribute>,
    customAttributes: Array<IAttribute>
  ): ICollectionChange<IAttributeChange> {
    const changes: Array<IAttributeChange> = [];
    const change: ICollectionChange<IAttributeChange> = {
      element: ElementCollectionName,
      propertyName: propertyName,
      change: ChangeType.NONE,
      changes: changes,
    };

    const comparedAttributes: Array<IAttribute> = [];

    baseAttributes.forEach(baseAttribute => {
      let customAttribute = customAttributes.find(
        item => item.type === baseAttribute.type
      );

      if (customAttribute) {
        comparedAttributes.push(customAttribute);
        const change = this.compare(baseAttribute, customAttribute);
        if (change.change !== ChangeType.NONE) changes.push(change);
      } else {
        changes.push({
          element: ElementName,
          attributeType: baseAttribute.type,
          base: baseAttribute,
          custom: null,
          change: ChangeType.DELETE,
        });
      }
    });

    customAttributes.forEach(customAttribute => {
      let attributeFound = comparedAttributes.find(
        item => item.type === customAttribute.type
      );

      if (!attributeFound) {
        changes.push({
          element: ElementName,
          attributeType: customAttribute.type,
          base: null,
          custom: customAttribute,
          change: ChangeType.ADD,
        });
      }
    });

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }

  static compare(
    baseObject: IAttribute | any,
    customObject: IAttribute | any
  ): IAttributeChange {
    const changes: Array<IMemberChange> = [];
    const change: IAttributeChange = {
      element: ElementName,
      attributeType: baseObject.type,
      base: baseObject,
      custom: customObject,
      change: ChangeType.NONE,
      changes: changes,
    };

    for (const key in baseObject) {
      switch (key) {
        case 'className':
        case 'constructor':
          break;
        case 'type':
        case 'includeSender':
        case 'globalVarAccess':
        case 'publisherObjectType':
        case 'publisherObjectId':
        case 'eventFunction':
        case 'publisherElement':
        case 'onMissingLicense':
        case 'onMissingPermission':
          MemberChange.AddChange(
            changes,
            key,
            baseObject[key],
            customObject[key]
          );
          break;
        default:
          throw new Error(`${key} not implemented`);
      }
    }

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }
}
