import ILangText from 'cal-to-json/models/lang-text';
import { ChangeType, ILangTextChange, ICollectionChange } from './change.model';

export class CompareTextML {
  static compareCollection(
    propertyName: string,
    baseTextML: Array<ILangText>,
    customTextML: Array<ILangText>
  ): ICollectionChange<ILangTextChange> {
    const changes: Array<ILangTextChange> = [];
    const change: ICollectionChange<ILangTextChange> = {
      memberName: propertyName,
      changeType: ChangeType.NONE,
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
        if (change.changeType !== ChangeType.NONE) changes.push(change2);
      } else {
        changes.push({
          lang: baseLangText.lang,
          text: baseLangText.text,
          changeType: ChangeType.DELETE,
        });
      }
    });

    customTextML.forEach(customLangText => {
      let langTextFound = comparedLangTexts.find(
        item => item.lang === customLangText.lang
      );

      if (!langTextFound) {
        changes.push({
          lang: customLangText.lang,
          text: customLangText.text,
          changeType: ChangeType.ADD,
        });
      }
    });

    if (changes.length > 0) change.changeType = ChangeType.MODIFY;
    return change;
  }

  static compare(base: ILangText, custom: ILangText): ILangTextChange {
    const change: ILangTextChange = {
      lang: base.lang,
      text: base.text,
      changeType: ChangeType.NONE,
    };

    if (base.text !== custom.text) {
      return {
        lang: base.text,
        text: custom.text,
        changeType: ChangeType.MODIFY,
      };
    }

    return change;
  }
}
