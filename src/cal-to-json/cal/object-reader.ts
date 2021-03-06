import StringHelper from '../util/string-helper';
import StringBuffer from '../util/string-buffer';
import LineByLine from 'n-readlines';
import SegmentReader from './segment-reader';

export interface IAppObject {
  type: string;
  id: number;
  name: string;
  [name: string]: any;
}

export interface ISegment {
  name: string;
  body: any;
}

type ReadObjectsCallback = (object: IAppObject, content: string) => void;

export default class ObjectReader {
  static readObjects(
    objectFile: string,
    onObject: ReadObjectsCallback | null = null
  ): Array<IAppObject> {
    const objects: Array<IAppObject> = [];

    // OBJECT Table 3 Payment Terms
    const headerExpr = /OBJECT \[?(\w*) (\d*) (.*)\]?/;
    let buffer: Buffer | false;
    let objectBuffer: StringBuffer | null = null;
    const liner = new LineByLine(objectFile);
    let stage: 'CLOSED' | 'OPEN' = 'CLOSED';

    while ((buffer = liner.next())) {
      const line = buffer.toString('utf-8');

      switch (stage) {
        case 'CLOSED':
          if (line[0] === '\r') {
            continue;
          }

          const match = headerExpr.exec(line);
          if (!match) {
            throw new Error(`Invalid file header: '${line}'`);
          }

          stage = 'OPEN';
          objectBuffer = new StringBuffer();
          break;
        case 'OPEN':
          if (line.substring(0, 1) === '}') {
            stage = 'CLOSED';
          }

          break;
      }

      if (objectBuffer) {
        objectBuffer.append(line);

        if (stage === 'CLOSED') {
          const content = objectBuffer.toString();
          const appObject = this.readObject(content);
          objects.push(appObject);

          if (onObject) {
            onObject(appObject, content);
          }

          objectBuffer = null;
        }
      }
    }

    return objects;
  }

  static readObject(content: string): IAppObject {
    const OBJECT_HEADER_BODY_EXPR = /(.*)(\r?\n\{)((\r?\n.*)*?)(\r?\n\})/;

    if (!OBJECT_HEADER_BODY_EXPR.test(content)) {
      throw new Error('object header error');
    }

    let match = OBJECT_HEADER_BODY_EXPR.exec(content);
    if (!match) throw new Error('object header error');

    const appObject = this.getObjectHeader(match[1]);
    // console.log(`${appObject.type} ${appObject.id} ${appObject.name}`);

    const body = match[3];
    const segments = SegmentReader.splitSegments(appObject.type, body);
    segments.forEach(segment => {
      appObject[segment.name] = segment.body;
    });

    return appObject;
  }

  static getObjectHeader(input: string): IAppObject {
    const OBJECT_SIG_EXPR = /OBJECT (.*)/;
    const OBJECT_HEADER_EXPR = /(\w*) (\d*) (.*)/;

    if (!OBJECT_SIG_EXPR.test(input))
      throw new Error(`Invalid object header '${input}'`);

    let match = /OBJECT (.*)/.exec(input);
    if (!match) throw new Error(`Invalid object header '${input}'`);

    let header = StringHelper.unescapeBrackets(match[1]);
    if (!OBJECT_HEADER_EXPR.test(header))
      throw new Error(`Invalid object header '${header}'`);

    match = OBJECT_HEADER_EXPR.exec(header);
    if (!match) throw new Error(`Invalid object header '${header}'`);

    return { type: match[1], id: Number(match[2]), name: match[3] };
  }
}
