import PropertyMap from './property-map';
import PropertyReader from './property-reader';
import StringHelper from '../util/string-helper';
import IPageControl, { PageControl } from '../models/page-control';

export default class PageReader {
  static readSegment(name: string, input: string) {
    switch (name) {
      case 'PROPERTIES':
        return PropertyReader.read(input, PropertyMap.pageProperties);
      case 'CONTROLS':
        return this.readControls(input);
      default:
        throw new TypeError(`Invalid segment type'${name}'`);
    }
  }

  private static readControls(input: string): Array<IPageControl> {
    input = StringHelper.remove4SpaceIndentation(input);
    const dataItems: Array<IPageControl> = [];
    const lines = StringHelper.groupLines(input);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const dataItem = this.getControl(line);
      dataItems.push(dataItem);
    }

    return dataItems;
  }

  private static getControl(input: string): IPageControl {
    const LABEL_EXPR = /{ (\d*)\s*?;(\d*)\s*?;(\w*)\s*?(;((.*\r?\n?)*?))? }/;
    if (!LABEL_EXPR.test(input))
      throw new Error(`Invalid page control '${input}'`);

    const match = LABEL_EXPR.exec(input);
    if (!match) throw new Error(`Invalid report label '${input}'`);

    const id = Number(match[1]);
    const indentation = Number(match[2]);
    const type = match[3];

    let properties = match[5] || '';
    properties = properties.replace(/^[ ]{12}/, '');
    properties = properties.replace(/\r?\n[ ]{12}/g, '\r\n');
    const props = PropertyReader.read(properties, PropertyMap.pageControl);
    return new PageControl(id, indentation, type, props);
  }
}
