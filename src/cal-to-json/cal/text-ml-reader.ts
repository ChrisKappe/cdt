import StringHelper from '../util/string-helper';
import ILangText, { LangText } from '../models/lang-text';
import { TokenType } from '../util/token-model';
import StringTokenizer from '../util/string-tokenizer';
import TokenStream from '../util/token-stream';

export default class TextMLReader {
  static read(input: string): Array<ILangText> {
    input = StringHelper.unescapeBrackets(input);
    const captionML = [];
    const stream = new TokenStream(StringTokenizer.tokens(input));
    while (!stream.EOS) {
      let lang = '';
      if (stream.currentTokenIs(TokenType.NAME)) {
        lang = stream.currentTokenValue;
        stream.next();
      } else {
        lang = stream.getString(TokenType.EQUALS);
      }

      stream.ascertainAndMoveNext(TokenType.EQUALS);

      let text = '';
      if (stream.currentTokenIs(TokenType.DOUBLE_QUOTED_STRING)) {
        text = stream.currentTokenValue;
        stream.next();
      } else {
        text = stream.getString(TokenType.SEMICOLON);
      }

      if (!stream.EOS) stream.ascertainAndMoveNext(TokenType.SEMICOLON);

      captionML.push(new LangText(lang, text));
    }

    return captionML;
  }

  static readMultiline(input: string): Array<ILangText> {
    const textML: Array<ILangText> = [];

    // Example:
    // ApplicationSecretsTxt@1002 : TextConst
    //   '@@@={Locked}',
    //   'ENU=ml-forecast',
    //   'ESM=ml-forecast',
    //   'FRC=ml-forecast',
    //   'ENC=ml-forecast';

    const lines = input.split(/,\r?\n\s*/);
    for (let i = 0; i < lines.length; i++) {
      const line = StringHelper.unescapeSingleQuoteString(lines[i]);
      const mlTexts = this.read(line);
      textML.push(mlTexts[0]);
    }

    return textML;
  }
}
