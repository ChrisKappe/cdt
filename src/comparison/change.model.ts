import { IAppObject } from 'cal-to-json/cal/object-reader';
import { IProcedure } from 'cal-to-json/models/procedure';
import { IAttribute } from 'cal-to-json/cal/attribute-reader';
import ICalcFormula from 'cal-to-json/models/calc-formula';
import IFieldGroup from 'cal-to-json/models/field-group';
import ITableKey from 'cal-to-json/cal/table-key';
import ITableField from 'cal-to-json/models/table-field';
import IFilterCondition from 'cal-to-json/models/filter-condition';
import { IDataItemLink } from 'cal-to-json/cal/data-item-link-reader';
import { IOrderBy } from 'cal-to-json/cal/order-by-reader';
import ITableRelation from 'cal-to-json/models/table-relation';
import ITableView from 'cal-to-json/models/table-view';
import { ITrigger } from 'cal-to-json/cal/trigger-reader';
import { IVariable } from 'cal-to-json/cal/variable-reader';
import { IReturnType } from 'cal-to-json/models/return-type';
import { IXMLportElement } from 'cal-to-json/cal/xml-port-reader';
import { IParameter } from 'cal-to-json/models/parameter';
import { IPageAction } from 'cal-to-json/models/page-action';
import IPageControl from 'cal-to-json/models/page-control';
import IPermission from 'cal-to-json/models/permission';
import { IQueryElement } from 'cal-to-json/cal/query-reader';
import IReportLabel from 'cal-to-json/models/report-label';
import IRequestPage from 'cal-to-json/models/request-page';
import IReportDataItem from 'cal-to-json/models/report-data-item';
import { IProperty } from 'cal-to-json/cal/property-map';

export enum ChangeType {
  NONE = '',
  ADD = 'Add',
  MODIFY = 'Modify',
  DELETE = 'Delete',
}

export interface IChange {
  changeType: ChangeType;
}

export interface IObjectChange extends IChange {
  changes?: Array<IMemberChange>;
}

export interface IUndefinedChangedValue<T> {
  base?: T | null;
  custom?: T | null;
}

export interface IChangedValue<T> {
  base: T | null;
  custom: T | null;
}

export interface IAppObjectChange
  extends IObjectChange,
    IChangedValue<IAppObject> {
  objectId: number;
  objectType: string;
  objectName: string;
}

export interface IProcedureChange
  extends IObjectChange,
    IChangedValue<IProcedure> {
  procedureId: number;
  procedureName: string;
}

export interface IAttributeChange
  extends IObjectChange,
    IChangedValue<IAttribute> {
  attributeType: string;
}

export interface ICalcFormulaChange
  extends IObjectChange,
    IChangedValue<ICalcFormula> {
  propertyName: string;
}

export interface IFieldGroupChange
  extends IObjectChange,
    IChangedValue<IFieldGroup> {
  name: string;
  fields: string;
}

export interface ITableKeyChange
  extends IObjectChange,
    IChangedValue<ITableKey> {
  fields: string;
}

export interface ITableFieldChange
  extends IObjectChange,
    IChangedValue<ITableField> {
  fieldId: number;
  fieldName: string;
}

export interface IFilterConditionChange
  extends IObjectChange,
    IChangedValue<IFilterCondition> {
  field: string;
}

export interface IDataItemLinkChange
  extends IObjectChange,
    IChangedValue<IDataItemLink> {
  field: string;
}

export interface IOrderByChange
  extends IObjectChange,
    IChangedValue<Array<IOrderBy>> {
  propertyName: string;
}

export interface ITableRelationChange
  extends IObjectChange,
    IChangedValue<ITableRelation> {
  propertyName: string;
}

export interface ITableViewChange
  extends IObjectChange,
    IChangedValue<ITableView> {
  propertyName: string;
}

export interface ITriggerChange extends IObjectChange, IChangedValue<ITrigger> {
  propertyName: string;
}

export interface ILangTextChange extends IChange {
  lang: string;
  text: string;
}

export interface IVariableChange
  extends IObjectChange,
    IChangedValue<IVariable> {
  id: number;
  name: string;
}

export interface IParameterChange
  extends IObjectChange,
    IChangedValue<IParameter> {
  id: number;
  name: string;
}

export interface IReturnTypeChange
  extends IObjectChange,
    IChangedValue<IReturnType> {}

export interface IXMLportElementChange
  extends IObjectChange,
    IChangedValue<IXMLportElement> {
  id: string;
}

export interface IPageActionChange
  extends IObjectChange,
    IChangedValue<IPageAction> {
  id: number;
}

export interface IPageControlChange
  extends IObjectChange,
    IChangedValue<IPageControl> {
  id: number;
}

export interface IPermissionChange
  extends IObjectChange,
    IChangedValue<IPermission> {
  objectType: string;
  objectId: number;
}

export interface IQueryElementChange
  extends IObjectChange,
    IChangedValue<IQueryElement> {
  id: number;
}

export interface IReportLabelChange
  extends IObjectChange,
    IChangedValue<IReportLabel> {
  id: number;
  name: string;
}

export interface IRequestPageChange
  extends IObjectChange,
    IChangedValue<IRequestPage> {}

export interface IReportDataItemChange
  extends IObjectChange,
    IChangedValue<IReportDataItem> {
  id: number;
}

export interface IPropertyChange
  extends IChange,
    IUndefinedChangedValue<IProperty> {
  propertyName: string;
  change?: IObjectChange;
}

export interface IMemberChange extends IChange {
  memberName: string;
  base?: string | number | boolean;
  custom?: string | number | boolean;
  change?: IObjectChange;
}

export interface ICollectionChange<T> extends IChange {
  changes?: Array<T>;
}

export interface ICodeChange extends IObjectChange {}

export class MemberChange {
  static AddChange(
    changes: Array<IMemberChange>,
    memberName: string,
    baseValue: any,
    customValue: any
  ) {
    if (baseValue === customValue) return;
    const change: IMemberChange = {
      memberName: memberName,
      base: baseValue,
      custom: customValue,
      changeType: ChangeType.NONE,
    };

    if (!baseValue && customValue) {
      change.changeType = ChangeType.ADD;
    } else if (baseValue && !customValue) {
      change.changeType = ChangeType.DELETE;
    } else {
      change.changeType = ChangeType.MODIFY;
    }
    changes.push(change);
  }

  static AddChangeObject(
    changes: Array<IMemberChange>,
    memberName: string,
    change: IChange
  ) {
    if (change.changeType !== ChangeType.NONE)
      changes.push({
        memberName: memberName,
        change: change,
        changeType: ChangeType.MODIFY,
      });
  }
}
