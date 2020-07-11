import { IAppObject } from 'cal-to-json/cal/object-reader';
import {
  IAppObjectChange,
  ChangeType,
  IMemberChange,
  MemberChange,
} from './change.model';
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

export class CompareAppObjects {
  static compareCollection(
    baseObjects: Array<IAppObject>,
    customObjects: Array<IAppObject>
  ): Array<IAppObjectChange> {
    const changes: Array<IAppObjectChange> = [];
    const comparedObjects: Array<IAppObject> = [];

    baseObjects.forEach(baseObject => {
      console.log(
        `Comparing: ${baseObject.type} ${baseObject.id} ${baseObject.name}`
      );
      let customObject = customObjects.find(
        item => item.id === baseObject.id && item.type === baseObject.type
      );

      if (customObject) {
        comparedObjects.push(customObject);
        const change = this.compare(baseObject, customObject);
        if (change.changeType !== ChangeType.NONE) changes.push(change);
      } else {
        changes.push({
          objectId: baseObject.id,
          objectType: baseObject.type,
          objectName: baseObject.name,
          base: baseObject,
          custom: null,
          changeType: ChangeType.DELETE,
        });
      }
    });

    customObjects.forEach(customObject => {
      let objectFound = comparedObjects.find(
        item => item.id === customObject.id && item.type === customObject.type
      );

      if (!objectFound) {
        changes.push({
          objectId: customObject.id,
          objectType: customObject.type,
          objectName: customObject.name,
          base: null,
          custom: customObject,
          changeType: ChangeType.ADD,
        });
      }
    });

    return changes;
  }

  static compare(
    baseObject: IAppObject,
    customObject: IAppObject
  ): IAppObjectChange {
    const changes: Array<IMemberChange> = [];
    const change: IAppObjectChange = {
      objectId: baseObject.id,
      objectType: baseObject.type,
      objectName: baseObject.name,
      base: baseObject,
      custom: customObject,
      changeType: ChangeType.NONE,
      changes: changes,
    };

    if (baseObject.type === 'MenuSuite') return change;

    for (const member in baseObject) {
      switch (member) {
        case 'type':
        case 'id':
        case 'name':
        case 'RDLDATA':
          MemberChange.AddChange(
            changes,
            member,
            baseObject[member],
            customObject[member]
          );
          break;
        case 'WORDLAYOUT':
          MemberChange.AddChange(
            changes,
            member,
            baseObject[member].join('\n'),
            customObject[member].join('\n')
          );
          break;
        case 'OBJECT-PROPERTIES':
        case 'PROPERTIES':
          MemberChange.AddChangeObject(
            changes,
            member,
            CompareProperties.compareCollection(
              member,
              baseObject[member],
              customObject[member]
            )
          );
          break;
        case 'FIELDS':
          MemberChange.AddChangeObject(
            changes,
            member,
            CompareTableFields.compareCollection(
              member,
              baseObject[member] || [],
              customObject[member] || []
            )
          );
          break;
        case 'KEYS':
          MemberChange.AddChangeObject(
            changes,
            member,
            CompareTableKeys.compareCollection(
              member,
              baseObject[member] || [],
              customObject[member] || []
            )
          );
          break;
        case 'FIELDGROUPS':
          MemberChange.AddChangeObject(
            changes,
            member,
            CompareFieldGroups.compareCollection(
              member,
              baseObject[member] || [],
              customObject[member] || []
            )
          );
          break;
        case 'CONTROLS':
          MemberChange.AddChangeObject(
            changes,
            member,
            ComparePageControls.compareCollection(
              member,
              baseObject[member] || [],
              customObject[member] || []
            )
          );
          break;
        case 'DATASET':
          MemberChange.AddChangeObject(
            changes,
            member,
            CompareReportDataItems.compareCollection(
              member,
              baseObject[member] || [],
              customObject[member] || []
            )
          );
          break;
        case 'REQUESTPAGE':
          MemberChange.AddChangeObject(
            changes,
            member,
            CompareRequestPage.compare(baseObject[member], customObject[member])
          );
          break;
        case 'CODE':
          MemberChange.AddChangeObject(
            changes,
            member,
            CompareCode.compare(baseObject[member], customObject[member])
          );
          break;
        case 'LABELS':
          MemberChange.AddChangeObject(
            changes,
            member,
            CompareReportLabels.compareCollection(
              member,
              baseObject[member] || [],
              customObject[member] || []
            )
          );
          break;
        case 'ELEMENTS':
          if (baseObject.type === 'XMLport') {
            MemberChange.AddChangeObject(
              changes,
              member,
              CompareXMLportElements.compareCollection(
                member,
                baseObject[member] || [],
                customObject[member] || []
              )
            );
            break;
          } else if (baseObject.type === 'Query') {
            MemberChange.AddChangeObject(
              changes,
              member,
              CompareQueryElements.compareCollection(
                member,
                baseObject[member] || [],
                customObject[member] || []
              )
            );
            break;
          } else {
            throw new Error(`${member} not implemented`);
          }
        case 'EVENTS':
          MemberChange.AddChangeObject(
            changes,
            member,
            CompareXMLportEvents.compareCollection(
              member,
              baseObject[member] || [],
              customObject[member] || []
            )
          );
          break;
        default:
          throw new Error(`${member} not implemented`);
      }
    }

    if (changes.length > 0) change.changeType = ChangeType.MODIFY;
    return change;
  }
}
