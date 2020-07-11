import { CompareProperties } from './compare-properties';
import {
  IChange,
  ChangeType,
  IReportLabelChange,
  ICollectionChange,
  IMemberChange,
  MemberChange,
} from './change.model';
import IReportLabel from 'cal-to-json/models/report-label';

export class CompareReportLabels {
  static compareCollection(
    propertyName: string,
    baseLabels: Array<IReportLabel>,
    customLabels: Array<IReportLabel>
  ): IChange {
    const changes: Array<IReportLabelChange> = [];
    const change: ICollectionChange<IReportLabelChange> = {
      memberName: propertyName,
      changeType: ChangeType.NONE,
      changes: changes,
    };

    const comparedLabels: Array<IReportLabel> = [];

    baseLabels.forEach(baseLabel => {
      let customLabel = customLabels.find(
        item => item.id === baseLabel.id && item.name === baseLabel.name
      );

      if (customLabel) {
        comparedLabels.push(customLabel);
        const change = this.compare(baseLabel, customLabel);
        if (change.changeType !== ChangeType.NONE) changes.push(change);
      } else {
        changes.push({
          id: baseLabel.id,
          name: baseLabel.name,
          base: baseLabel,
          custom: null,
          changeType: ChangeType.DELETE,
        });
      }
    });

    customLabels.forEach(customLabel => {
      let labelFound = comparedLabels.find(
        item => item.id === customLabel.id && item.name === customLabel.name
      );

      if (!labelFound) {
        changes.push({
          id: customLabel.id,
          name: customLabel.name,
          base: null,
          custom: customLabel,
          changeType: ChangeType.ADD,
        });
      }
    });

    if (changes.length > 0) change.changeType = ChangeType.MODIFY;
    return change;
  }

  static compare(
    baseObject: IReportLabel,
    customObject: IReportLabel
  ): IReportLabelChange {
    const changes: Array<IMemberChange> = [];
    const change: IReportLabelChange = {
      id: baseObject.id,
      name: baseObject.name,
      base: baseObject,
      custom: customObject,
      changeType: ChangeType.NONE,
      changes: changes,
    };

    for (const member in baseObject) {
      switch (member) {
        case 'className':
        case 'constructor':
          break;
        case 'id':
        case 'name':
          MemberChange.AddChange(
            changes,
            member,
            baseObject[member],
            customObject[member]
          );
          break;
        case 'properties':
          MemberChange.AddChangeObject(
            changes,
            member,
            CompareProperties.compareCollection(
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
