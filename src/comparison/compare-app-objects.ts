import { IAppObject } from 'cal-to-json/cal/object-reader';
import { IChange, ChangeType } from './change.model';
import { CompareProperties } from './compare-properties';
import { CompareTableFields } from './compare-table-fields';
import { CompareTableKeys } from './compare-table-keys';
import { CompareFieldGroups } from './compare-field-groups';
import { CompareCode } from './compare-code';
import { ComparePageControls } from './compare-page-controls';
import { CompareReportDataItems } from './compare-report-data-item';
import { CompareRequestPage } from './compare-request-page';
import { CompareReportLabels } from './compare-report-labels';
import { CompareXMLportElements } from './compare-xmlport-elements';
import { CompareXMLportEvents } from './compare-xmlport-events';
import { CompareQueryElements } from './compare-query-elements';

const ElementName = 'ApplicationObject';

export class CompareAppObjects {
  static compareCollection(
    baseObjects: Array<IAppObject>,
    customObjects: Array<IAppObject>
  ): Array<IChange> {
    const changes: Array<IChange> = [];
    const comparedObjects: Array<IAppObject> = [];

    baseObjects.forEach(baseObject => {
      let customObject = customObjects.find(
        item => item.id === baseObject.id && item.type === baseObject.type
      );

      if (customObject) {
        comparedObjects.push(customObject);
        const change = this.compare(baseObject, customObject);
        if (change.change !== ChangeType.NONE) changes.push(change);
      } else {
        changes.push({
          element: ElementName,
          id: baseObject.id,
          type: baseObject.type,
          name: baseObject.name,
          change: ChangeType.DELETE,
        });
      }
    });

    customObjects.forEach(customObject => {
      let objectFound = comparedObjects.find(
        item => item.id === customObject.id && item.type === customObject.type
      );

      if (!objectFound) {
        changes.push({
          element: ElementName,
          id: customObject.id,
          type: customObject.type,
          name: customObject.name,
          change: ChangeType.ADD,
        });
      }
    });

    return changes;
  }

  static compare(baseObject: IAppObject, customObject: IAppObject): IChange {
    const changes: Array<IChange> = [];
    const change: IChange = {
      element: ElementName,
      id: baseObject.id,
      type: baseObject.type,
      name: baseObject.name,
      change: ChangeType.NONE,
      changes: changes,
    };

    if (baseObject.type === 'MenuSuite') return change;

    for (const key in baseObject) {
      switch (key) {
        case 'type':
        case 'id':
        case 'name':
          if (baseObject[key] !== customObject[key]) {
            changes.push({
              element: 'Property',
              name: key,
              base: baseObject[key],
              custom: customObject[key],
              change: ChangeType.MODIFY,
            });
          }
          break;
        case 'RDLDATA':
          if (baseObject[key] !== customObject[key]) {
            changes.push({
              element: 'RDLDATA',
              base: baseObject[key],
              custom: customObject[key],
              change: ChangeType.MODIFY,
            });
          }
          break;
        case 'WORDLAYOUT':
          const baseWordLayout = baseObject[key].join('\n'),
            customWordLayout = customObject[key].join('\n');
          if (baseWordLayout !== customWordLayout) {
            changes.push({
              element: 'WordLayout',
              base: baseWordLayout,
              custom: customWordLayout,
              change: ChangeType.MODIFY,
            });
          }
          break;
        case 'OBJECT-PROPERTIES':
        case 'PROPERTIES':
          const propsChange = CompareProperties.compareCollection(
            key,
            baseObject[key],
            customObject[key]
          );
          if (propsChange.change !== ChangeType.NONE) changes.push(propsChange);
          break;
        case 'FIELDS':
          const fieldsChange = CompareTableFields.compareCollection(
            baseObject[key] || [],
            customObject[key] || []
          );
          if (fieldsChange.change !== ChangeType.NONE)
            changes.push(fieldsChange);
          break;
        case 'KEYS':
          const keysChange = CompareTableKeys.compareCollection(
            baseObject[key] || [],
            customObject[key] || []
          );
          if (keysChange.change !== ChangeType.NONE) changes.push(keysChange);
          break;
        case 'FIELDGROUPS':
          const fieldGroupChange = CompareFieldGroups.compareCollection(
            baseObject[key] || [],
            customObject[key] || []
          );
          if (fieldGroupChange.change !== ChangeType.NONE)
            changes.push(fieldGroupChange);
          break;
        case 'CONTROLS':
          const pageControlsChange = ComparePageControls.compareCollection(
            baseObject[key] || [],
            customObject[key] || []
          );
          if (pageControlsChange.change !== ChangeType.NONE)
            changes.push(pageControlsChange);
          break;
        case 'DATASET':
          const dataItemsChange = CompareReportDataItems.compareCollection(
            baseObject[key] || [],
            customObject[key] || []
          );
          if (dataItemsChange.change !== ChangeType.NONE)
            changes.push(dataItemsChange);
          break;
        case 'REQUESTPAGE':
          const requestChange = CompareRequestPage.compare(
            baseObject[key],
            customObject[key]
          );
          if (requestChange.change !== ChangeType.NONE)
            changes.push(requestChange);
          break;
        case 'CODE':
          const codeChange = CompareCode.compare(
            baseObject[key],
            customObject[key]
          );

          if (codeChange.change !== ChangeType.NONE) changes.push(codeChange);
          break;
        case 'LABELS':
          const labelsChange = CompareReportLabels.compareCollection(
            baseObject[key] || [],
            customObject[key] || []
          );
          if (labelsChange.change !== ChangeType.NONE)
            changes.push(labelsChange);
          break;
        case 'ELEMENTS':
          if (baseObject.type === 'XMLport') {
            const elementsChange = CompareXMLportElements.compareCollection(
              baseObject[key] || [],
              customObject[key] || []
            );
            if (elementsChange.change !== ChangeType.NONE)
              changes.push(elementsChange);
            break;
          } else if (baseObject.type === 'Query') {
            const elementsChange = CompareQueryElements.compareCollection(
              baseObject[key] || [],
              customObject[key] || []
            );
            if (elementsChange.change !== ChangeType.NONE)
              changes.push(elementsChange);
            break;
          } else {
            throw new Error(`${key} not implemented`);
          }
        case 'EVENTS':
          const eventsChange = CompareXMLportEvents.compareCollection(
            baseObject[key] || [],
            customObject[key] || []
          );
          if (eventsChange.change !== ChangeType.NONE)
            changes.push(eventsChange);
          break;
        default:
          throw new Error(`${key} not implemented`);
      }
    }

    if (changes.length > 0) change.change = ChangeType.MODIFY;
    return change;
  }
}
