import ILangText from 'cal-to-json/models/lang-text';
import { IChange } from './change.model';

export class CompareTextML {
  static compareCollection(
    property: string,
    baseTextML: Array<ILangText>,
    customTextML: Array<ILangText>
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      name: property,
      change: 'NONE',
      changes: changes,
    };

    const comparedLangTexts: Array<ILangText> = [];

    baseTextML.forEach(baseLangText => {
      let customLangText = customTextML.find(
        item => item.lang === baseLangText.lang
      );

      if (customLangText) {
        comparedLangTexts.push(customLangText);
        const change2 = this.compare(baseLangText, customLangText);
        if (change.change !== 'NONE') changes.push(change2);
      } else {
        changes.push({
          name: baseLangText.lang,
          text: baseLangText.text,
          change: 'DELETE',
        });
      }
    });

    customTextML.forEach(customLangText => {
      let langTextFound = comparedLangTexts.find(
        item => item.lang === customLangText.lang
      );

      if (!langTextFound) {
        changes.push({
          name: customLangText.lang,
          text: customLangText.text,
          change: 'ADD',
        });
      }
    });

    if (change.changes && change.changes.length > 0) change.change = 'MODIFY';

    return change;
  }

  static compare(baseVariable: ILangText, customVariable: ILangText): IChange {
    const change: IChange = {
      name: baseVariable.lang,
      change: 'NONE',
    };

    if (baseVariable.text !== customVariable.text) {
      return {
        name: baseVariable.lang,
        base: baseVariable.text,
        custom: customVariable.text,
        change: 'MODIFY',
      };
    }

    return change;
  }
}
