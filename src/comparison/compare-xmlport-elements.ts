import { CompareProperties } from './compare-properties';
import {
  ChangeType,
  IXMLportElementChange,
  ICollectionChange,
  IMemberChange,
  MemberChange,
} from './change.model';
import { IXMLportElement } from 'cal-to-json/cal/xml-port-reader';

const ElementCollectionName = 'XMLportElements';
const ElementName = 'XMLportElement';

export class CompareXMLportElements {
  static compareCollection(
    propertyName: string,
    baseElements: Array<IXMLportElement>,
    customElements: Array<IXMLportElement>
  ): ICollectionChange<IXMLportElementChange> {
    const changes: Array<IXMLportElementChange> = [];
    const change: ICollectionChange<IXMLportElementChange> = {
      element: ElementCollectionName,
      propertyName: propertyName,
      change: ChangeType.NONE,
      changes: changes,
    };

    const comparedElements: Array<IXMLportElement> = [];

    baseElements.forEach(baseElement => {
      let customElement = customElements.find(
        item => item.id === baseElement.id
      );

      if (customElement) {
        comparedElements.push(customElement);
        const change = this.compare(baseElement, customElement);
        if (change.change !== ChangeType.NONE) changes.push(change);
      } else {
        changes.push({
          element: ElementName,
          id: baseElement.id,
          base: baseElement,
          custom: null,
          change: ChangeType.DELETE,
        });
      }
    });

    customElements.forEach(customElement => {
      let elementFound = comparedElements.find(
        item => item.id === customElement.id
      );

      if (!elementFound) {
        changes.push({
          element: ElementName,
          id: customElement.id,
          base: null,
          custom: customElement,
          change: ChangeType.ADD,
        });
      }
    });

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }

  static compare(
    baseObject: IXMLportElement,
    customObject: IXMLportElement
  ): IXMLportElementChange {
    const changes: Array<IMemberChange> = [];
    const change: IXMLportElementChange = {
      element: ElementName,
      id: baseObject.id,
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
        case 'id':
        case 'indentation':
        case 'nodeName':
        case 'nodeType':
        case 'sourceType':
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
