import { CompareProperties } from './compare-properties';
import {
  ChangeType,
  IQueryElementChange,
  ICollectionChange,
  IMemberChange,
  MemberChange,
} from './change.model';
import { IQueryElement } from 'cal-to-json/cal/query-reader';

export class CompareQueryElements {
  static compareCollection(
    propertyName: string,
    baseElements: Array<IQueryElement>,
    customElements: Array<IQueryElement>
  ): ICollectionChange<IQueryElementChange> {
    const changes: Array<IQueryElementChange> = [];
    const change: ICollectionChange<IQueryElementChange> = {
      memberName: propertyName,
      changeType: ChangeType.NONE,
      changes: changes,
    };

    const comparedElements: Array<IQueryElement> = [];

    baseElements.forEach(baseElement => {
      let customElement = customElements.find(
        item => item.id === baseElement.id
      );

      if (customElement) {
        comparedElements.push(customElement);
        const change = this.compare(baseElement, customElement);
        if (change.changeType !== ChangeType.NONE) changes.push(change);
      } else {
        changes.push({
          id: baseElement.id,
          base: baseElement,
          custom: null,
          changeType: ChangeType.DELETE,
        });
      }
    });

    customElements.forEach(customElement => {
      let elementFound = comparedElements.find(
        item => item.id === customElement.id
      );

      if (!elementFound) {
        changes.push({
          id: customElement.id,
          base: null,
          custom: customElement,
          changeType: ChangeType.ADD,
        });
      }
    });

    if (changes.length > 0) change.changeType = ChangeType.MODIFY;
    return change;
  }

  static compare(
    baseObject: IQueryElement,
    customObject: IQueryElement
  ): IQueryElementChange {
    const changes: Array<IMemberChange> = [];
    const change: IQueryElementChange = {
      id: baseObject.id,
      base: baseObject,
      custom: customObject,
      changeType: ChangeType.NONE,
      changes: changes,
    };

    for (const member in baseObject) {
      switch (member) {
        case 'className':
        case 'constructor':
          break;
        case 'id':
        case 'indentation':
        case 'type':
        case 'name':
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

    if (changes.length > 0) change.changeType = ChangeType.MODIFY;
    return change;
  }
}
