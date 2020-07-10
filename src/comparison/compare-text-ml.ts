import ILangText from 'cal-to-json/models/lang-text';
import { IChange, ChangeType } from './change.model';

const ElementCollectionName = 'TextML';
const ElementName = 'Text';

export class CompareTextML {
  static compareCollection(
    property: string,
    baseTextML: Array<ILangText>,
    customTextML: Array<ILangText>
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementCollectionName,
      name: property,
      change: ChangeType.NONE,
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
        if (change.change !== ChangeType.NONE) changes.push(change2);
      } else {
        changes.push({
          element: ElementName,
          lang: baseLangText.lang,
          text: baseLangText.text,
          change: ChangeType.DELETE,
        });
      }
    });

    customTextML.forEach(customLangText => {
      let langTextFound = comparedLangTexts.find(
        item => item.lang === customLangText.lang
      );

      if (!langTextFound) {
        changes.push({
          element: ElementName,
          lang: customLangText.lang,
          text: customLangText.text,
          change: ChangeType.ADD,
        });
      }
    });

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }

  static compare(baseVariable: ILangText, customVariable: ILangText): IChange {
    const change: IChange = {
      element: ElementName,
      change: ChangeType.NONE,
    };

    if (baseVariable.text !== customVariable.text) {
      return {
        element: ElementName,
        base: baseVariable.text,
        custom: customVariable.text,
        change: ChangeType.MODIFY,
      };
    }

    return change;
  }
}
