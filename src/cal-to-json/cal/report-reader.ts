import StringHelper from '../util/string-helper';
import IReportDataItem, { ReportDataItem } from '../models/report-data-item';
import PropertyReader from './property-reader';
import PropertyMap, { IProperty } from './property-map';
import IReportLabel, { ReportLabel } from '../models/report-label';
import IRequestPage, { RequestPage } from '../models/request-page';
import IPageControl from '../models/page-control';
import SegmentReader from './segment-reader';

export default class ReportReader {
  static readSegment(name: string, input: string) {
    switch (name) {
      case 'PROPERTIES':
        return PropertyReader.read(input, PropertyMap.reportProperties);
      case 'DATASET':
        return this.readDataSet(input);
      case 'REQUESTPAGE':
        return this.readRequestPage(input);
      case 'LABELS':
        return this.readLabels(input);
      case 'RDLDATA':
        return input;
      case 'WORDLAYOUT':
        return this.readWordLayout(input);
      default:
        throw new TypeError(`Report's segment type '${name}' not implemented.`);
    }
  }

  static readWordLayout(input: string): string[] {
    input = StringHelper.remove4SpaceIndentation(input);
    let lines = input.split(/\r?\n/);
    lines = lines.length > 0 ? lines.splice(1) : lines;

    let current = 0;
    let lines2 = [];

    while (current < lines.length) {
      const line = lines[current++];
      if (line === 'END_OF_WORDLAYOUT') break;

      lines2.push(line);
    }

    return lines2;
  }

  static readLabels(input: string): Array<IReportLabel> {
    input = StringHelper.remove4SpaceIndentation(input);
    const labels: Array<IReportLabel> = [];
    const lines = StringHelper.groupLines(input);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const label = this.getLabel(line);
      labels.push(label);
    }

    return labels;
  }

  static getLabel(input: string): IReportLabel {
    const LABEL_EXPR = /{ (\d*)\s*?;(\[.*?\]|.*?)\s*?(;((.*\r?\n?)*?))? }/;
    if (!LABEL_EXPR.test(input))
      throw new Error(`Invalid report label '${input}'`);

    const match = LABEL_EXPR.exec(input);
    if (!match) throw new Error(`Invalid report label '${input}'`);

    const id = Number(match[1]);
    const name = match[2];

    let properties = match[4] || '';
    properties = properties.replace(/^[ ]{28}/, '');
    properties = properties.replace(/\r?\n[ ]{28}/g, '\r\n');
    const props = PropertyReader.read(properties, PropertyMap.reportLabel);

    return new ReportLabel(id, name, props);
  }

  private static readRequestPage(input: string): IRequestPage {
    input = StringHelper.remove2SpaceIndentation(input);
    const segments = SegmentReader.splitSegments('Page', input);

    let controls: Array<IPageControl> | undefined,
      properties: Array<IProperty> | undefined;
    for (var i = 0; i < segments.length; i++) {
      const segment = segments[i];
      switch (segment.name) {
        case 'CONTROLS':
          controls = segment.body;
          break;
        case 'PROPERTIES':
          properties = segment.body;
          break;
        default:
          throw new Error(`${segment.name} unhandled`);
      }
    }

    return new RequestPage(controls, properties);
  }

  private static readDataSet(input: string) {
    input = StringHelper.remove4SpaceIndentation(input);
    const dataItems: Array<IReportDataItem> = [];
    const lines = StringHelper.groupLines(input);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const dataItem = this.getDataItem(line);
      dataItems.push(dataItem);
    }

    return dataItems;
  }

  static getDataItem(input: string): IReportDataItem {
    const DATA_ITEM_EXPR = /{ (\d*)\s*?;(\w*)\s*?;(\w*)\s*?;(\[.*?\]|.*?)\s*?;((.*\r?\n?)*?) }/;
    if (!DATA_ITEM_EXPR.test(input))
      throw new Error(`Invalid field '${input}'`);

    const match = DATA_ITEM_EXPR.exec(input);
    if (!match) throw new Error(`Invalid field '${input}'`);

    const id = Number(match[1]);
    const indentation = Number(match[2] || 0);
    const dataType = match[3];
    const name = match[4] || undefined;

    let properties = match[5];
    properties = properties.replace(/^[ ]{11}/, '');
    properties = properties.replace(/\r?\n[ ]{11}/g, '\r\n');
    const props = PropertyReader.read(properties, PropertyMap.reportDataItem);

    return new ReportDataItem(id, dataType, name, indentation, props);
  }
}
