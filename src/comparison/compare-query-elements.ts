import { CompareProperties } from './compare-properties';
import { IChange, ChangeType } from './change.model';
import { IQueryElement } from 'cal-to-json/cal/query-reader';

const ElementCollectionName = 'QueryElements';
const ElementName = 'QueryElement';

export class CompareQueryElements {
  static compareCollection(
    baseElements: Array<IQueryElement>,
    customElements: Array<IQueryElement>
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementCollectionName,
      change: ChangeType.NONE,
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
        if (change.change !== ChangeType.NONE) changes.push(change);
      } else {
        changes.push({
          element: ElementName,
          id: baseElement.id,
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
          change: ChangeType.ADD,
        });
      }
    });

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }

  static compare(
    baseElement: IQueryElement,
    customElement: IQueryElement
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementName,
      id: baseElement.id,
      change: ChangeType.NONE,
      changes: changes,
    };

    for (const key in baseElement) {
      switch (key) {
        case 'className':
        case 'constructor':
          break;
        case 'id':
        case 'indentation':
        case 'type':
        case 'name':
          if (baseElement[key] !== customElement[key]) {
            changes.push({
              element: 'Property',
              name: 'dataType',
              base: baseElement[key],
              custom: customElement[key],
              change: ChangeType.MODIFY,
            });
          }
          break;
        case 'properties':
          const propChange = CompareProperties.compareCollection(
            'properties',
            baseElement[key] || [],
            customElement[key] || []
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
