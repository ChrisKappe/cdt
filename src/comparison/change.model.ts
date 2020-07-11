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

export interface IChange {
  element: string;
  change: ChangeType;
  // changes?: Array<IChange>;
  // [key: string]: any;
}

export enum ChangeType {
  NONE,
  ADD,
  MODIFY,
  DELETE,
}

export interface IChangedValue<T> {
  base: T | null;
  custom: T | null;
}

export interface IAppObjectChange extends IChange, IChangedValue<IAppObject> {
  objectId: number;
  objectType: string;
  objectName: string;

  changes?: Array<IMemberChange>;
}

export interface IProcedureChange extends IChange, IChangedValue<IProcedure> {
  procedureId: number;
  procedureName: string;

  changes?: Array<IMemberChange>;
}

export interface IAttributeChange extends IChange, IChangedValue<IAttribute> {
  attributeType: string;

  changes?: Array<IMemberChange>;
}

export interface ICalcFormulaChange
  extends IChange,
    IChangedValue<ICalcFormula> {
  propertyName: string;

  changes?: Array<IMemberChange>;
}

export interface IFieldGroupChange extends IChange, IChangedValue<IFieldGroup> {
  name: string;
  fields: string;

  changes?: Array<IMemberChange>;
}

export interface ITableKeyChange extends IChange, IChangedValue<ITableKey> {
  fields: string;

  changes?: Array<IMemberChange>;
}

export interface ITableFieldChange extends IChange, IChangedValue<ITableField> {
  fieldId: number;
  fieldName: string;

  changes?: Array<IMemberChange>;
}

export interface IFilterConditionChange
  extends IChange,
    IChangedValue<IFilterCondition> {
  field: string;

  changes?: Array<IMemberChange>;
}

export interface IDataItemLinkChange
  extends IChange,
    IChangedValue<IDataItemLink> {
  field: string;

  changes?: Array<IMemberChange>;
}

export interface IOrderByChange
  extends IChange,
    IChangedValue<Array<IOrderBy>> {
  propertyName: string;
}

export interface ITableRelationChange
  extends IChange,
    IChangedValue<ITableRelation> {
  propertyName: string;

  changes?: Array<IMemberChange>;
}

export interface ITableViewChange extends IChange, IChangedValue<ITableView> {
  propertyName: string;

  changes?: Array<IMemberChange>;
}

export interface ITriggerChange extends IChange, IChangedValue<ITrigger> {
  propertyName: string;

  changes?: Array<IMemberChange>;
}

export interface ILangTextChange extends IChange {
  lang: string;
  text: string;
}

export interface IVariableChange extends IChange, IChangedValue<IVariable> {
  id: number;
  name: string;

  changes?: Array<IMemberChange>;
}

export interface IParameterChange extends IChange, IChangedValue<IParameter> {
  id: number;
  name: string;

  changes?: Array<IMemberChange>;
}

export interface IReturnTypeChange extends IChange, IChangedValue<IReturnType> {
  changes?: Array<IMemberChange>;
}

export interface IXMLportElementChange
  extends IChange,
    IChangedValue<IXMLportElement> {
  id: string;

  changes?: Array<IMemberChange>;
}

export interface IPageActionChange extends IChange, IChangedValue<IPageAction> {
  id: number;

  changes?: Array<IMemberChange>;
}

export interface IPageControlChange
  extends IChange,
    IChangedValue<IPageControl> {
  id: number;

  changes?: Array<IMemberChange>;
}

export interface IPermissionChange extends IChange, IChangedValue<IPermission> {
  propertyName: string;
  objectType: string;
  objectId: number;

  changes?: Array<IMemberChange>;
}

export interface IQueryElementChange
  extends IChange,
    IChangedValue<IQueryElement> {
  id: number;

  changes?: Array<IMemberChange>;
}

export interface IReportLabelChange
  extends IChange,
    IChangedValue<IReportLabel> {
  id: number;
  name: string;

  changes?: Array<IMemberChange>;
}

export interface IRequestPageChange
  extends IChange,
    IChangedValue<IRequestPage> {
  changes?: Array<IMemberChange>;
}

export interface IReportDataItemChange
  extends IChange,
    IChangedValue<IReportDataItem> {
  id: number;

  changes?: Array<IMemberChange>;
}

export interface IUndefinedChangedValue<T> {
  base?: T | null;
  custom?: T | null;
}

export interface IPropertyChange
  extends IChange,
    IUndefinedChangedValue<IProperty> {
  propertyName: string;

  innerChange?: IChange;
}

export interface IMemberChange extends IChange {
  memberName: string;
  base: any;
  custom: any;
  innerChange?: IChange;
}

export interface ICollectionChange<T> extends IChange {
  propertyName: string;
  changes?: Array<T>;
}

export interface ICodeChange extends IChange {
  changes?: Array<IMemberChange>;
}

export class MemberChange {
  static AddChange(
    changes: Array<IMemberChange>,
    memberName: string,
    baseValue: any,
    customValue: any
  ) {
    if (baseValue === customValue) return;
    const change: IMemberChange = {
      element: 'Member',
      memberName: memberName,
      base: baseValue,
      custom: customValue,
      change: ChangeType.NONE,
    };

    if (!baseValue && customValue) {
      change.change = ChangeType.ADD;
    } else if (baseValue && !customValue) {
      change.change = ChangeType.DELETE;
    } else {
      change.change = ChangeType.MODIFY;
    }
    changes.push(change);
  }

  static AddChangeObject(
    changes: Array<IMemberChange>,
    memberName: string,
    change: IChange
  ) {
    if (change.change !== ChangeType.NONE)
      changes.push({
        element: 'Member',
        memberName: memberName,
        base: null,
        custom: null,
        innerChange: change,
        change: ChangeType.MODIFY,
      });
  }
}
