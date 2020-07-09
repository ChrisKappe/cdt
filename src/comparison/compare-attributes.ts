import { IAttribute } from 'cal-to-json/cal/attribute-reader';
import { IChange } from './change.model';

const ElementCollectionName = 'Attributes';
const ElementName = 'Attribute';

export class CompareAttributes {
  static compareCollection(
    baseAttributes: Array<IAttribute>,
    customAttributes: Array<IAttribute>
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementCollectionName,
      change: 'NONE',
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
        if (change.change !== 'NONE') changes.push(change);
      } else {
        changes.push({
          element: ElementName,
          name: baseAttribute.type,
          change: 'DELETE',
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
          name: customAttribute.type,
          change: 'ADD',
        });
      }
    });

    if (changes.length > 0) change.change = 'MODIFY';
    return change;
  }

  static compare(
    baseAttribute: IAttribute | any,
    customAttribute: IAttribute | any
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementName,
      name: baseAttribute.type,
      change: 'NONE',
      changes: changes,
    };

    for (const key in baseAttribute) {
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
          if (baseAttribute[key] !== customAttribute[key]) {
            changes.push({
              element: 'Property',
              name: key,
              base: baseAttribute[key],
              custom: customAttribute[key],
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
