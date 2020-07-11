import PropertyReader from './property-reader';
import PropertyMap from './property-map';
import CodeSegmentReader from './code-segment-reader';
import TableReader from './table-reader';
import ReportReader from './report-reader';
import PageReader from './page-reader';
import XMLportReader from './xml-port-reader';
import QueryReader from './query-reader';
import MenuSuiteReader from './menu-suite-reader';
import CodeunitReader from './code-unit-reader';

export default class SegmentReader {
  static splitSegments(objectType: string, input: string) {
    const SEGMENTS_HEADER_BODY_EXPR = /\r?\n {2}\}|\r?\n {2}\{/;

    const bodySplit = input.split(SEGMENTS_HEADER_BODY_EXPR);
    const segments = [];
    for (let i = 0; i < bodySplit.length - 1; i += 2) {
      let segment: any = null;

      const name = bodySplit[i].trim();
      const text = bodySplit[i + 1];
      switch (name) {
        case 'OBJECT-PROPERTIES':
          segment = PropertyReader.read(text, PropertyMap.objectProperties);
          break;
        case 'CODE':
          segment = CodeSegmentReader.read(text);
          break;
        default:
          segment = this.readSegment(objectType, name, text);
      }

      segments.push({ name: name, body: segment });
    }

    return segments;
  }

  private static readSegment(objectType: string, name: string, input: string) {
    switch (objectType) {
      case 'Table':
        return TableReader.readSegment(name, input);
      case 'Report':
        return ReportReader.readSegment(name, input);
      case 'Page':
        return PageReader.readSegment(name, input);
      case 'XMLport':
        return XMLportReader.readSegment(name, input);
      case 'Query':
        return QueryReader.readSegment(name, input);
      case 'MenuSuite':
        return MenuSuiteReader.readSegment(name, input);
      case 'Codeunit':
        return CodeunitReader.readSegment(name, input);
      default:
        throw new TypeError(
          `Not implemented. Object Type: '${objectType}', Segment: '${name}'`
        );
    }
  }
}
