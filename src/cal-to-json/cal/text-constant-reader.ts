import StringHelper from '../util/string-helper';
import ILangText from '../models/lang-text';
import TextMLReader from './text-ml-reader';

export default class TextConstantReader {
  static read(input: string): Array<ILangText> {
    const TEXT_CONST_EXPR = /('.*',\r?\n)(\s+'.*',\r?\n)*(\s+'.*')/;
    if (TEXT_CONST_EXPR.test(input)) {
      return TextMLReader.readMultiline(input);
    }

    input = StringHelper.unescapeSingleQuoteString(input);
    return TextMLReader.read(input);
  }
}
