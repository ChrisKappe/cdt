import { ChangeType, ICollectionChange } from './change.model';
const ElementCollectionName = 'XMLportEvents';

export class CompareXMLportEvents {
  static compareCollection(
    propertyName: string,
    baseElements: Array<any>,
    customElements: Array<any>
  ): ICollectionChange<any> {
    const change: ICollectionChange<any> = {
      element: ElementCollectionName,
      propertyName: propertyName,
      change: ChangeType.NONE,
    };

    if (baseElements.length > 0 || customElements.length > 0) {
      throw new Error('XMLport events comparison not implemented');
    }

    return change;
  }
}
