import ILangText from 'cal-to-json/models/lang-text';
import { ChangeType, ILangTextChange, ICollectionChange } from './change.model';

const ElementCollectionName = 'TextML';
const ElementName = 'Text';

export class CompareTextML {
  static compareCollection(
    propertyName: string,
    baseTextML: Array<ILangText>,
    customTextML: Array<ILangText>
  ): ICollectionChange<ILangTextChange> {
    const changes: Array<ILangTextChange> = [];
    const change: ICollectionChange<ILangTextChange> = {
      element: ElementCollectionName,
      propertyName: propertyName,
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

  static compare(base: ILangText, custom: ILangText): ILangTextChange {
    const change: ILangTextChange = {
      element: ElementName,
      lang: base.lang,
      text: base.text,
      change: ChangeType.NONE,
    };

    if (base.text !== custom.text) {
      return {
        element: ElementName,
        lang: base.text,
        text: custom.text,
        change: ChangeType.MODIFY,
      };
    }

    return change;
  }
}
