import {
  IAppObjectChange,
  IProcedureChange,
  IMemberChange,
  ICodeChange,
  ICollectionChange,
  ChangeType,
  IPropertyChange,
  ITriggerChange,
  ITableFieldChange,
  IPageControlChange,
  IPageActionChange,
} from './comparison/change.model';
import * as Excel from 'exceljs';
import { IVariable } from './cal-to-json/cal/variable-reader';
import { IAppObject } from './cal-to-json/cal/object-reader';
import { IProcedure } from './cal-to-json/models/procedure';
import ITableField from './cal-to-json/models/table-field';
import { ITrigger } from './cal-to-json/cal/trigger-reader';
import { IProperty } from './cal-to-json/cal/property-map';

export class ExcelReport {
  static complexVariables: Array<IVariable> = [];

  static write(
    changes: Array<IAppObjectChange>,
    baseObjects: Array<IAppObject>,
    customObjects: Array<IAppObject>,
    filePath: string
  ) {
    let workbook = new Excel.Workbook();
    this.complexVariables = [];

    this.AddModifiedObjects(workbook, changes, 'Modified Objects');
    this.AddModifiedFunctions(workbook, changes, 'Modified Functions');
    this.AddModifiedTriggers(workbook, changes, 'Modified Triggers');
    this.AddComplexVariables(
      workbook,
      baseObjects,
      customObjects,
      'All Complex Variables'
    );

    this.AddApplicationObjects(workbook, baseObjects, 'Base All Objects');
    this.AddApplicationObjects(workbook, customObjects, 'Custom All Objects');
    this.AddTableFields(workbook, baseObjects, 'Base All Table Fields');
    this.AddTableFields(workbook, customObjects, 'Custom All Table Fields');
    this.AddFunctions(workbook, baseObjects, 'Base All Functions');
    this.AddFunctions(workbook, customObjects, 'Custom All Functions');
    workbook.xlsx.writeFile(filePath);
  }

  static AddComplexVariables(
    workbook: Excel.Workbook,
    baseObjects: Array<IAppObject>,
    customObjects: Array<IAppObject>,
    sheetName: string
  ) {
    let worksheet = workbook.addWorksheet(sheetName);
    worksheet.columns = [
      { header: 'DataType', key: 'dataType' },
      { header: 'SubType', key: 'subType' },
    ];

    worksheet.columns[0].width = 12;
    worksheet.columns[1].width = 50;

    ExcelReport.addComplexGlobalVariables(baseObjects);
    ExcelReport.addComplexGlobalVariables(customObjects);

    const variables: Array<{ datatype: string; subType: string }> = [];
    this.complexVariables.forEach(variable => {
      let subType = variable.subType + '';
      subType = subType.replace(' RUNONCLIENT', '');
      subType = subType.replace(' WITHEVENTS', '');
      subType = subType.trim().replace(/^"(.*)"$/, '$1');

      const found = variables.find(
        item => item.subType === subType && item.datatype === variable.datatype
      );
      if (!found) variables.push({ datatype: variable.datatype, subType });
    });

    variables.forEach(variable => {
      worksheet.addRow(
        {
          dataType: variable.datatype,
          subType: variable.subType,
        },
        ''
      );
    });

    ExcelReport.formatHeader(worksheet);
  }

  static AddFunctions(
    workbook: Excel.Workbook,
    objects: Array<IAppObject>,
    sheetName: string
  ) {
    let worksheet = workbook.addWorksheet(sheetName);
    worksheet.columns = [
      { header: 'Object Type', key: 'objectType' },
      { header: 'Object ID', key: 'objectId' },
      { header: 'Object Name', key: 'objectName' },
      { header: 'Local', key: 'local' },
      { header: 'Function ID', key: 'functionId' },
      { header: 'Function Name', key: 'functionName' },
      { header: 'Has DotNet Variables', key: 'hasDotNetVariables' },
    ];

    worksheet.columns[0].width = 12;
    worksheet.columns[1].width = 12;
    worksheet.columns[2].width = 35;
    worksheet.columns[3].width = 12;
    worksheet.columns[4].width = 12;
    worksheet.columns[5].width = 35;
    worksheet.columns[6].width = 12;

    objects.forEach(appObject => {
      const code = appObject['CODE'];
      if (code) {
        const procedures: Array<IProcedure> = code.procedures || [];
        procedures.forEach(procedure => {
          const hasDotNetVariables = this.procedureHasDotNetVariables(
            procedure
          );
          worksheet.addRow(
            {
              objectType: appObject.type,
              objectId: appObject.id,
              objectName: appObject.name,
              local: procedure.local ? 'Yes' : 'No',
              functionId: procedure.id,
              functionName: procedure.name,
              hasDotNetVariables: hasDotNetVariables ? 'Yes' : 'No',
            },
            ''
          );
        });
      }
    });

    ExcelReport.formatHeader(worksheet);
  }

  private static AddTableFields(
    workbook: Excel.Workbook,
    objects: Array<IAppObject>,
    sheetName: string
  ) {
    let worksheet = workbook.addWorksheet(sheetName);
    worksheet.columns = [
      { header: 'Object Type', key: 'objectType' },
      { header: 'Object ID', key: 'objectId' },
      { header: 'Object Name', key: 'objectName' },
      { header: 'Enabled', key: 'enabled' },
      { header: 'Field ID', key: 'fieldId' },
      { header: 'Field Name', key: 'fieldName' },
      { header: 'DataType', key: 'dataType' },
    ];

    worksheet.columns[0].width = 12;
    worksheet.columns[1].width = 12;
    worksheet.columns[2].width = 35;
    worksheet.columns[3].width = 12;
    worksheet.columns[4].width = 12;
    worksheet.columns[5].width = 35;
    worksheet.columns[6].width = 12;

    const tables = objects.filter(i => i.type === 'Table');

    tables.forEach(table => {
      const fields: Array<ITableField> = table['FIELDS'] || [];
      fields.forEach(field => {
        worksheet.addRow(
          {
            objectType: table.type,
            objectId: table.id,
            objectName: table.name,
            enabled: field.enabled,
            fieldId: field.id,
            fieldName: field.name,
            dataType: field.dataType,
          },
          ''
        );
      });
    });

    ExcelReport.formatHeader(worksheet);
  }

  static AddApplicationObjects(
    workbook: Excel.Workbook,
    objects: Array<IAppObject>,
    sheetName: string
  ) {
    let worksheet = workbook.addWorksheet(sheetName);
    worksheet.columns = [
      { header: 'Object Type', key: 'objectType' },
      { header: 'Object ID', key: 'objectId' },
      { header: 'Object Name', key: 'objectName' },
      { header: 'Version List', key: 'versionList' },
    ];

    worksheet.columns[0].width = 12;
    worksheet.columns[1].width = 12;
    worksheet.columns[2].width = 35;
    worksheet.columns[3].width = 35;
    objects.forEach(appObject => {
      let versionList = this.getVersionList(appObject);
      worksheet.addRow(
        {
          objectType: appObject.type,
          objectId: appObject.id,
          objectName: appObject.name,
          versionList: versionList,
        },
        ''
      );
    });

    ExcelReport.formatHeader(worksheet);
  }

  private static AddModifiedFunctions(
    workbook: Excel.Workbook,
    changes: Array<IAppObjectChange>,
    sheetName: string
  ) {
    let worksheet = workbook.addWorksheet(sheetName);
    worksheet.columns = [
      { header: 'Object Type', key: 'objectType' },
      { header: 'Object ID', key: 'objectId' },
      { header: 'Object Name', key: 'objectName' },
      { header: 'Function ID', key: 'functionId' },
      { header: 'Function Name', key: 'functionName' },
      { header: 'Has DotNet Variables', key: 'hasDotNetVariables' },
      { header: 'Change Type', key: 'changeType' },
      { header: 'Changes', key: 'changes' },
    ];

    worksheet.columns[0].width = 12;
    worksheet.columns[1].width = 12;
    worksheet.columns[2].width = 35;
    worksheet.columns[3].width = 12;
    worksheet.columns[4].width = 35;
    worksheet.columns[5].width = 12;
    worksheet.columns[6].width = 12;
    worksheet.columns[7].width = 35;

    changes.forEach(appObjectChange => {
      if (appObjectChange.changeType === ChangeType.ADD) {
        const appObject = appObjectChange.custom;
        if (appObject) {
          const procedures: Array<IProcedure> = appObject['CODE']
            ? appObject['CODE'].procedures || []
            : [];

          procedures.forEach(procedure => {
            const hasDotNetVariables = this.procedureHasDotNetVariables(
              procedure
            );
            worksheet.addRow(
              {
                objectType: appObjectChange.objectType,
                objectId: appObjectChange.objectId,
                objectName: appObjectChange.objectName,
                functionId: procedure.id,
                functionName: procedure.name,
                hasDotNetVariables: hasDotNetVariables ? 'Yes' : 'No',
                changeType: ChangeType.ADD,
                changes: '',
              },
              ''
            );
          });
        }
      } else {
        const codeChange = ExcelReport.getObjectChange<ICodeChange>(
          'CODE',
          appObjectChange.changes
        );
        if (codeChange) {
          const proceduresChange = this.getObjectChange<
            ICollectionChange<IProcedureChange>
          >('procedures', codeChange.changes);
          if (proceduresChange && proceduresChange.changes) {
            proceduresChange.changes.forEach(procedureChange => {
              const memberNames: Array<string> = [];
              if (procedureChange.changes) {
                procedureChange.changes.forEach(item =>
                  memberNames.push(item.memberName)
                );
              }

              const hasDotNetVariables = this.hasDotNetVariables(
                procedureChange
              );
              worksheet.addRow(
                {
                  objectType: appObjectChange.objectType,
                  objectId: appObjectChange.objectId,
                  objectName: appObjectChange.objectName,
                  functionId: procedureChange.procedureId,
                  functionName: procedureChange.procedureName,
                  hasDotNetVariables: hasDotNetVariables ? 'Yes' : 'No',
                  changeType: procedureChange.changeType,
                  changes: memberNames.join(', '),
                },
                ''
              );
            });
          }
        }
      }
    });

    ExcelReport.formatHeader(worksheet);
  }

  private static AddModifiedObjects(
    workbook: Excel.Workbook,
    changes: Array<IAppObjectChange>,
    sheetName: string
  ) {
    let worksheet = workbook.addWorksheet(sheetName);
    worksheet.columns = [
      { header: 'Object Type', key: 'objectType' },
      { header: 'Object ID', key: 'objectId' },
      { header: 'Object Name', key: 'objectName' },
      { header: 'Change Type', key: 'changeType' },
      { header: 'Changes', key: 'changes' },
    ];

    worksheet.columns[0].width = 12;
    worksheet.columns[1].width = 12;
    worksheet.columns[2].width = 35;
    worksheet.columns[3].width = 12;
    worksheet.columns[4].width = 35;

    changes.forEach(appObjectChange => {
      const memberNames: Array<string> = [];
      if (appObjectChange.changes) {
        appObjectChange.changes.forEach(item => {
          if (item.memberName !== 'OBJECT-PROPERTIES')
            memberNames.push(item.memberName);
        });
      }

      worksheet.addRow(
        {
          objectType: appObjectChange.objectType,
          objectId: appObjectChange.objectId,
          objectName: appObjectChange.objectName,
          changeType: appObjectChange.changeType,
          changes: memberNames.join(', '),
        },
        ''
      );
    });

    ExcelReport.formatHeader(worksheet);
  }

  private static AddModifiedTriggers(
    workbook: Excel.Workbook,
    changes: Array<IAppObjectChange>,
    sheetName: string
  ) {
    let worksheet = workbook.addWorksheet(sheetName);
    worksheet.columns = [
      { header: 'Object Type', key: 'objectType' },
      { header: 'Object ID', key: 'objectId' },
      { header: 'Object Name', key: 'objectName' },
      { header: 'Trigger Object', key: 'triggerObject' },
      { header: 'Field ID', key: 'triggerObjectId' },
      { header: 'Field Name', key: 'triggerObjectName' },
      { header: 'Trigger Name', key: 'triggerName' },
      { header: 'Has DotNet Variables', key: 'hasDotNetVariables' },
      { header: 'Change Type', key: 'changeType' },
    ];

    worksheet.columns[0].width = 12;
    worksheet.columns[1].width = 12;
    worksheet.columns[2].width = 35;
    worksheet.columns[3].width = 12;
    worksheet.columns[4].width = 12;
    worksheet.columns[5].width = 35;
    worksheet.columns[6].width = 35;
    worksheet.columns[7].width = 12;
    worksheet.columns[8].width = 12;

    changes.forEach(appObjectChange => {
      if (appObjectChange.objectType === 'Table') {
        ExcelReport.addAppObjectTriggers(worksheet, appObjectChange);
        ExcelReport.addTableFieldTriggers(worksheet, appObjectChange);
      } else if (appObjectChange.objectType === 'Page') {
        ExcelReport.addAppObjectTriggers(worksheet, appObjectChange);
        ExcelReport.addPageControlTriggers(worksheet, appObjectChange);
        ExcelReport.addPageActionTriggers(worksheet, appObjectChange);
      }
    });

    ExcelReport.formatHeader(worksheet);
  }

  private static addPageActionTriggers(
    worksheet: Excel.Worksheet,
    appObjectChange: IAppObjectChange
  ) {
    const propertiesChange = ExcelReport.getObjectChange<
      ICollectionChange<IPropertyChange>
    >('PROPERTIES', appObjectChange.changes);

    if (propertiesChange && propertiesChange.changes) {
      const actionListChange = propertiesChange.changes.find(
        i => i.propertyName === 'ActionList' && i.propertyType === 'ACTION_LIST'
      );
      if (actionListChange && actionListChange.change) {
        const actionsChange: ICollectionChange<IPageActionChange> = actionListChange.change as any;
        if (actionsChange.changes) {
          actionsChange.changes.forEach(actionChange => {
            const actionPropertiesChange = ExcelReport.getObjectChange<
              ICollectionChange<IPropertyChange>
            >('properties', actionChange.changes);

            if (actionPropertiesChange && actionPropertiesChange.changes) {
              const triggerPropertyChanges = actionPropertiesChange.changes.filter(
                i => i.propertyType === 'TRIGGER'
              );

              triggerPropertyChanges.forEach(propertyChange => {
                const hasDotNetVariables = this.triggerChangeHasDotNetVariables(
                  propertyChange
                );
                worksheet.addRow(
                  {
                    objectType: appObjectChange.objectType,
                    objectId: appObjectChange.objectId,
                    objectName: appObjectChange.objectName,
                    triggerObject: 'Page Action',
                    triggerObjectId: actionChange.id,
                    triggerObjectName: '',
                    triggerName: propertyChange.propertyName,
                    changeType: propertyChange.changeType,
                    hasDotNetVariables: hasDotNetVariables ? 'Yes' : 'No',
                  },
                  ''
                );
              });
            }
          });
        }
      }
    }
  }

  private static addPageControlTriggers(
    worksheet: Excel.Worksheet,
    appObjectChange: IAppObjectChange
  ) {
    const controlsChange = ExcelReport.getObjectChange<
      ICollectionChange<IPageControlChange>
    >('CONTROLS', appObjectChange.changes);

    if (controlsChange && controlsChange.changes) {
      controlsChange.changes.forEach(controlChange => {
        const propertiesChange = ExcelReport.getObjectChange<
          ICollectionChange<IPropertyChange>
        >('properties', controlChange.changes);

        if (propertiesChange && propertiesChange.changes) {
          const triggerPropertyChanges = propertiesChange.changes.filter(
            i => i.propertyType === 'TRIGGER'
          );

          triggerPropertyChanges.forEach(propertyChange => {
            const hasDotNetVariables = this.triggerChangeHasDotNetVariables(
              propertyChange
            );
            worksheet.addRow(
              {
                objectType: appObjectChange.objectType,
                objectId: appObjectChange.objectId,
                objectName: appObjectChange.objectName,
                triggerObject: 'Page Control',
                triggerObjectId: controlChange.id,
                triggerObjectName: '',
                triggerName: propertyChange.propertyName,
                changeType: propertyChange.changeType,
                hasDotNetVariables: hasDotNetVariables ? 'Yes' : 'No',
              },
              ''
            );
          });
        }
      });
    }
  }

  private static addTableFieldTriggers(
    worksheet: Excel.Worksheet,
    appObjectChange: IAppObjectChange
  ) {
    const fieldsChange = ExcelReport.getObjectChange<
      ICollectionChange<ITableFieldChange>
    >('FIELDS', appObjectChange.changes);

    if (fieldsChange && fieldsChange.changes) {
      fieldsChange.changes.forEach(fieldChange => {
        const fieldPropertiesChange = ExcelReport.getObjectChange<
          ICollectionChange<IPropertyChange>
        >('properties', fieldChange.changes);

        if (fieldPropertiesChange && fieldPropertiesChange.changes) {
          const triggerPropertyChanges = fieldPropertiesChange.changes.filter(
            i => i.propertyType === 'TRIGGER'
          );

          triggerPropertyChanges.forEach(propertyChange => {
            const hasDotNetVariables = this.triggerChangeHasDotNetVariables(
              propertyChange
            );
            worksheet.addRow(
              {
                objectType: appObjectChange.objectType,
                objectId: appObjectChange.objectId,
                objectName: appObjectChange.objectName,
                triggerObject: 'Table Field',
                triggerObjectId: fieldChange.fieldId,
                triggerObjectName: fieldChange.fieldName,
                triggerName: propertyChange.propertyName,
                changeType: propertyChange.changeType,
                hasDotNetVariables: hasDotNetVariables ? 'Yes' : 'No',
              },
              ''
            );
          });
        }
      });
    }
  }

  private static addAppObjectTriggers(
    worksheet: Excel.Worksheet,
    appObjectChange: IAppObjectChange
  ) {
    const propertiesChange = ExcelReport.getObjectChange<
      ICollectionChange<IPropertyChange>
    >('PROPERTIES', appObjectChange.changes);
    if (propertiesChange && propertiesChange.changes) {
      const triggerPropertyChanges = propertiesChange.changes.filter(
        i => i.propertyType === 'TRIGGER'
      );

      triggerPropertyChanges.forEach(propertyChange => {
        const hasDotNetVariables = this.triggerChangeHasDotNetVariables(
          propertyChange
        );
        worksheet.addRow(
          {
            objectType: appObjectChange.objectType,
            objectId: appObjectChange.objectId,
            objectName: appObjectChange.objectName,
            triggerObject: appObjectChange.objectType,
            triggerObjectId: appObjectChange.objectId,
            triggerObjectName: '',
            triggerName: propertyChange.propertyName,
            changeType: propertyChange.changeType,
            hasDotNetVariables: hasDotNetVariables ? 'Yes' : 'No',
          },
          ''
        );
      });
    }
  }

  private static hasDotNetVariables(
    procedureChange: IProcedureChange
  ): boolean {
    const procedure = procedureChange.custom || procedureChange.base;
    if (procedure === null) {
      return false;
    }

    return this.procedureHasDotNetVariables(procedure);
  }

  private static triggerChangeHasDotNetVariables(
    propertyChange: IPropertyChange
  ): boolean {
    if (propertyChange.changeType === ChangeType.MODIFY) {
      const triggerChange: ITriggerChange = propertyChange.change as any;
      if (!triggerChange) throw new Error('Trigger Change should not be null');
      const trigger = triggerChange.custom || triggerChange.base;
      if (!trigger) throw new Error('Trigger should not be null');
      return this.triggerHasDotNetVariables(trigger);
    } else {
      const property = propertyChange.custom || propertyChange.base;
      if (!property) throw new Error('Property should not be null');
      return this.triggerHasDotNetVariables(property.value);
    }
  }

  private static triggerHasDotNetVariables(trigger: ITrigger) {
    if (trigger.variables) {
      const variable = trigger.variables.find(
        item =>
          item.datatype === 'DotNet' ||
          item.datatype === 'Automation' ||
          item.datatype === 'OCX'
      );
      if (variable) {
        if (this.complexVariables.indexOf(variable) === -1)
          this.complexVariables.push(variable);
        return true;
      }
    }

    return false;
  }

  private static procedureHasDotNetVariables(procedure: IProcedure) {
    if (procedure.variables) {
      const variable = procedure.variables.find(
        item =>
          item.datatype === 'DotNet' ||
          item.datatype === 'Automation' ||
          item.datatype === 'OCX'
      );

      if (variable) {
        if (this.complexVariables.indexOf(variable) === -1)
          this.complexVariables.push(variable);
        return true;
      }
    }

    if (procedure.parameters) {
      const parameter = procedure.parameters.find(
        item =>
          item.variable.datatype === 'DotNet' ||
          item.variable.datatype === 'Automation' ||
          item.variable.datatype === 'OCX'
      );
      if (parameter) {
        if (this.complexVariables.indexOf(parameter.variable) === -1)
          this.complexVariables.push(parameter.variable);
        return true;
      }
    }

    return false;
  }

  private static getObjectChange<T>(
    memberName: string,
    changes?: Array<IMemberChange>
  ): T | null {
    if (changes) {
      const member = changes.find(i => i.memberName === memberName);
      if (member && member.change) {
        const change: T = member.change as any;
        return change;
      }
    }

    return null;
  }

  private static getVersionList(appObject: IAppObject) {
    const properties: Array<IProperty> = appObject['OBJECT-PROPERTIES'];
    let versionList = '';
    const versionListProp = properties.find(
      item => item.name === 'Version List'
    );
    if (versionListProp) versionList = versionListProp.value;
    return versionList;
  }

  private static formatHeader(worksheet: Excel.Worksheet) {
    const header = worksheet.getRow(1);
    for (var i = 1; i <= worksheet.columns.length; i++) {
      const cell = header.getCell(i);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'cccccc' },
      };

      cell.font = { bold: true };
    }
  }

  private static addComplexGlobalVariables(baseObjects: IAppObject[]) {
    baseObjects.forEach(appObject => {
      const code = appObject['CODE'];
      if (code && code.variables) {
        const variables = (code.variables as Array<IVariable>).filter(
          item =>
            item.datatype === 'DotNet' ||
            item.datatype === 'Automation' ||
            item.datatype === 'OCX'
        );
        variables.forEach(variable => {
          if (this.complexVariables.indexOf(variable) === -1)
            this.complexVariables.push(variable);
        });
      }
    });
  }
}
