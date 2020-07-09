import IBaseClass, { BaseClass } from './base-class';
import { IProperty } from '../cal/property-map';
import IPageControl from './page-control';

export default interface IRequestPage extends IBaseClass {
  controls?: Array<IPageControl>;
  properties?: Array<IProperty>;
}

export class RequestPage extends BaseClass implements IRequestPage {
  controls?: Array<IPageControl>;
  properties?: Array<IProperty>;

  constructor(controls?: Array<IPageControl>, properties?: Array<IProperty>) {
    super('RequestPage');
    this.controls = controls;
    this.properties = properties;
  }
}
