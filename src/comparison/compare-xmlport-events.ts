import { ChangeType, ICollectionChange } from './change.model';

export class CompareXMLportEvents {
  static compareCollection(
    propertyName: string,
    baseElements: Array<any>,
    customElements: Array<any>
  ): ICollectionChange<any> {
    const change: ICollectionChange<any> = {
      memberName: propertyName,
      changeType: ChangeType.NONE,
    };

    if (baseElements.length > 0 || customElements.length > 0) {
      throw new Error('XMLport events comparison not implemented');
    }

    return change;
  }
}
