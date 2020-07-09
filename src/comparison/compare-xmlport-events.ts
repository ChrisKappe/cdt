import { IChange } from './change.model';
const ElementCollectionName = 'XMLportEvents';

export class CompareXMLportEvents {
  static compareCollection(
    baseElements: Array<any>,
    customElements: Array<any>
  ): IChange {
    const change: IChange = {
      element: ElementCollectionName,
      change: 'NONE',
    };

    if(baseElements.length > 0 || customElements.length >0) {
      throw new Error('XMLport events comparison not implemented');
    }

    return change;
  }
}
