import { IAppObject } from 'cal-to-json/cal/object-reader';
import { IChange } from './change.model';

export class CompareObjects {
  static compareObjects(
    baseObjects: Array<IAppObject>,
    customObjects: Array<IAppObject>
  ) {
    const customObjects2: Array<IAppObject> = [];

    baseObjects.forEach(baseObject => {
      let customObject = customObjects.find(
        item => item.id == baseObject.id && item.type == baseObject.type
      );

      if (customObject) {
        customObjects2.push(customObject);

        // Modified Object
        
        this.compareObject(baseObject, customObject);
      }
    });

    customObjects.forEach(customObject => {
      let customObject2 = customObjects2.find(
        item => item.id == customObject.id && item.type == customObject.type
      );

      if (!customObject2) {
        // New Custom Object
      }
    });
  }

  static compareObject(
    baseObject: IAppObject,
    customObject: IAppObject
  ): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      property: `${baseObject.type} ${baseObject.id}`,
      changeType: 'MODIFY',
      innerChanges: changes
    };

    for (const key in baseObject) {
      switch (key) {
        case 'type':
        case 'id':
          break;
        case 'name':
          if (baseObject.name != customObject.name) {
            changes.push({
              property: key,
              baseValue: baseObject.name,
              customValue: customObject.name,
              changeType: 'MODIFY'
            });
          }
          break;
        default:
          throw new Error(`${key} not implemented`);
          break;
      }
    }

    return change;
  }
}
