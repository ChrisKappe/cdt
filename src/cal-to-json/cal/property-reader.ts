import PropertyMap, { IPropertyMap, Property, IProperty } from './property-map';
import StringHelper from '../util/string-helper';
import { PropertyType } from './property-type';
import TextMLReader from './text-ml-reader';
import TableRelationReader from './table-relation-reader';
import CalcFormulaReader from './calc-formula-reader';
import PermissionReader from './permission-reader';
import TableViewReader from './table-view-reader';
import TableFiltersReader from './table-filter-reader';
import DataItemLinkReader from './data-item-link-reader';
import OrderByReader from './order-by-reader';
import TriggerReader from './trigger-reader';
import { IPageAction, PageAction } from '../models/page-action';

export default class PropertyReader {
  static read(
    input: string,
    maps: Array<IPropertyMap>
  ): Array<IProperty> | undefined {
    let props: Array<IProperty> | undefined = undefined;
    const PROP_EXPR = /([\w:\s]*)=((.*\r?\n?)*)/;

    input = StringHelper.remove4SpaceIndentation(input);

    const lines = StringHelper.groupLines(input);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!PROP_EXPR.test(line)) throw new Error(`Invalid property '${line}'`);

      const match = PROP_EXPR.exec(line);
      if (!match) throw new Error(`Invalid property '${line}'`);

      const name = match[1];
      let value: string = match[2];

      if (value.endsWith(';')) value = value.slice(0, -1);

      if (name === 'ActionList' && value === 'ACTIONS') {
        value += `\r\n${lines[++i]}\r\n${lines[++i]}`;
      }

      props = props || [];
      props.push(this.getProperty(name, value, maps));
    }

    return props;
  }

  private static getProperty(
    name: string,
    value: string,
    maps: Array<IPropertyMap>
  ): IProperty {
    const propType = maps.find(p => p.name === name);
    if (!propType) {
      throw new TypeError(`Property map not found for '${name}'`);
    }

    switch (propType.type) {
      case PropertyType.Text:
      case PropertyType.Boolean:
      case PropertyType.Integer:
      case PropertyType.FieldList:
      case PropertyType.Option:
        return new Property(name, propType.type, value);
      case PropertyType.SIFTLevels:
        return new Property(name, propType.type, value);
      case PropertyType.TextML:
        return new Property(name, propType.type, TextMLReader.read(value));
      case PropertyType.TableRelation:
        return new Property(
          name,
          propType.type,
          TableRelationReader.read(value)
        );
      case PropertyType.CalcFormula:
        return new Property(name, propType.type, CalcFormulaReader.read(value));
      case PropertyType.Permission:
        return new Property(name, propType.type, PermissionReader.read(value));
      case PropertyType.Permissions:
        return new Property(
          name,
          propType.type,
          PermissionReader.readMultiple(value)
        );
      case PropertyType.TableView:
        return new Property(name, propType.type, TableViewReader.read(value));
      case PropertyType.ActionList:
        return new Property(name, propType.type, this.getPageActions(value));
      case PropertyType.TableFilter:
        return new Property(
          name,
          propType.type,
          TableFiltersReader.readFilters(value)
        );
      case PropertyType.DataItemLink:
        return new Property(
          name,
          propType.type,
          DataItemLinkReader.read(value)
        );
      case PropertyType.OrderBy:
        return new Property(name, propType.type, OrderByReader.read(value));
      case PropertyType.Trigger:
        return new Property(name, propType.type, TriggerReader.read(value));
      default:
        throw new TypeError(`Property type '${propType.type}' not implemented`);
    }
  }

  static getPageActions(input: string): Array<IPageAction> {
    const SEGMENTS_HEADER_BODY_EXPR = /\r?\n\}|\r?\n\{/;
    let lines = input.split(SEGMENTS_HEADER_BODY_EXPR);
    input =
      lines.length >= 2 ? StringHelper.remove2SpaceIndentation(lines[1]) : '';

    const actions: Array<IPageAction> = [];
    lines = StringHelper.groupLines(input);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const action = this.getPageAction(line);
      actions.push(action);
    }

    return actions;
  }

  static getPageAction(input: string): IPageAction {
    const LABEL_EXPR = /{ (\d*)\s*?;(\d*)\s*?;(\w*)\s*?(;((.*\r?\n?)*?))? }/;
    if (!LABEL_EXPR.test(input))
      throw new Error(`Invalid report label '${input}'`);

    const match = LABEL_EXPR.exec(input);
    if (!match) throw new Error(`Invalid report label '${input}'`);

    const id = Number(match[1]);
    const indentation = Number(match[2]);
    const type = match[3];

    let properties = match[5] || '';
    properties = properties.replace(/^[ ]{12}/, '');
    properties = properties.replace(/\r?\n[ ]{12}/g, '\r\n');
    const props = PropertyReader.read(properties, PropertyMap.pageAction);
    return new PageAction(id, indentation, type, props);
  }
}
