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
import { IAppObject } from 'cal-to-json/cal/object-reader';
import { IProperty } from 'cal-to-json/cal/property-map';
import ITableField from 'cal-to-json/models/table-field';
import { IProcedure } from 'cal-to-json/models/procedure';
import { ITrigger } from 'cal-to-json/cal/trigger-reader';

export class ExcelReport {
  static write(
    changes: Array<IAppObjectChange>,
    baseObjects: Array<IAppObject>,
    customObjects: Array<IAppObject>,
    filePath: string
  ) {
    let workbook = new Excel.Workbook();

    this.AddModifiedObjects(workbook, changes, 'Modified Objects');
    this.AddModifiedFunctions(workbook, changes, 'Modified Functions');
    this.AddModifiedTriggers(workbook, changes, 'Modified Triggers');
    this.AddModifiedTableFieldTriggers(
      workbook,
      changes,
      'Modified Field Triggers'
    );
    this.AddModifiedPageControlTriggers(
      workbook,
      changes,
      'Modified Page Control Triggers'
    );
    this.AddModifiedPageActionTriggers(
      workbook,
      changes,
      'Modified Page Action Triggers'
    );

    this.AddApplicationObjects(workbook, baseObjects, 'Base Objects');
    this.AddApplicationObjects(workbook, customObjects, 'Customer Objects');
    this.AddTableFields(workbook, baseObjects, 'Table Fields - Base');
    this.AddTableFields(workbook, customObjects, 'Table Fields - Custom');

    workbook.xlsx.writeFile(filePath);
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
      { header: 'Enabled', key: 'enabled' },
      { header: 'Field ID', key: 'fieldId' },
      { header: 'Field Name', key: 'fieldName' },
      { header: 'DataType', key: 'dataType' },
    ];

    worksheet.columns[0].width = 15;
    worksheet.columns[1].width = 15;
    worksheet.columns[2].width = 40;
    worksheet.columns[3].width = 15;
    worksheet.columns[4].width = 15;
    worksheet.columns[5].width = 40;
    worksheet.columns[6].width = 15;

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

    worksheet.columns[0].width = 15;
    worksheet.columns[1].width = 15;
    worksheet.columns[2].width = 40;
    worksheet.columns[3].width = 15;
    worksheet.columns[4].width = 15;
    worksheet.columns[5].width = 40;
    worksheet.columns[6].width = 15;

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

    worksheet.columns[0].width = 15;
    worksheet.columns[1].width = 15;
    worksheet.columns[2].width = 40;
    worksheet.columns[3].width = 40;
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

    worksheet.getColumn(1).numFmt = '$0.00';
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
    ];

    worksheet.columns[0].width = 15;
    worksheet.columns[1].width = 15;
    worksheet.columns[2].width = 40;
    worksheet.columns[3].width = 15;
    worksheet.columns[4].width = 40;
    worksheet.columns[5].width = 15;
    worksheet.columns[6].width = 15;

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
                changeType: ChangeType.ADD,
                hasDotNetVariables: hasDotNetVariables ? 'Yes' : 'No',
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
                  changeType: procedureChange.changeType,
                  hasDotNetVariables: hasDotNetVariables ? 'Yes' : 'No',
                },
                ''
              );
            });
          }
        }
      }
    });
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
      if (variable) return true;
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
      if (variable) return true;
    }

    if (procedure.parameters) {
      const parameter = procedure.parameters.find(
        item =>
          item.variable.datatype === 'DotNet' ||
          item.variable.datatype === 'Automation' ||
          item.variable.datatype === 'OCX'
      );
      if (parameter) return true;
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
    ];

    worksheet.columns[0].width = 15;
    worksheet.columns[1].width = 15;
    worksheet.columns[2].width = 40;
    worksheet.columns[3].width = 15;
    changes.forEach(change => {
      worksheet.addRow(
        {
          objectType: change.objectType,
          objectId: change.objectId,
          objectName: change.objectName,
          changeType: change.changeType,
        },
        ''
      );
    });
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
      { header: 'Trigger Name', key: 'triggerName' },
      { header: 'Has DotNet Variables', key: 'hasDotNetVariables' },
      { header: 'Change Type', key: 'changeType' },
    ];

    worksheet.columns[0].width = 15;
    worksheet.columns[1].width = 15;
    worksheet.columns[2].width = 40;
    worksheet.columns[3].width = 40;
    worksheet.columns[4].width = 15;
    worksheet.columns[5].width = 15;

    changes.forEach(appObjectChange => {
      if (
        appObjectChange.objectType === 'Table' ||
        appObjectChange.objectType === 'Page'
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
                triggerName: propertyChange.propertyName,
                changeType: propertyChange.changeType,
                hasDotNetVariables: hasDotNetVariables ? 'Yes' : 'No',
              },
              ''
            );
          });
        }
      }
    });
  }

  private static AddModifiedTableFieldTriggers(
    workbook: Excel.Workbook,
    changes: Array<IAppObjectChange>,
    sheetName: string
  ) {
    let worksheet = workbook.addWorksheet(sheetName);
    worksheet.columns = [
      { header: 'Object Type', key: 'objectType' },
      { header: 'Object ID', key: 'objectId' },
      { header: 'Object Name', key: 'objectName' },
      { header: 'Field ID', key: 'fieldId' },
      { header: 'Field Name', key: 'fieldName' },
      { header: 'Trigger Name', key: 'triggerName' },
      { header: 'Has DotNet Variables', key: 'hasDotNetVariables' },
      { header: 'Change Type', key: 'changeType' },
    ];

    worksheet.columns[0].width = 15;
    worksheet.columns[1].width = 15;
    worksheet.columns[2].width = 40;
    worksheet.columns[3].width = 15;
    worksheet.columns[4].width = 40;
    worksheet.columns[5].width = 40;
    worksheet.columns[6].width = 15;
    worksheet.columns[7].width = 15;

    changes.forEach(appObjectChange => {
      if (appObjectChange.objectType === 'Table') {
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
                    fieldId: fieldChange.fieldId,
                    fieldName: fieldChange.fieldName,
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
    });
  }

  private static AddModifiedPageControlTriggers(
    workbook: Excel.Workbook,
    changes: Array<IAppObjectChange>,
    sheetName: string
  ) {
    let worksheet = workbook.addWorksheet(sheetName);
    worksheet.columns = [
      { header: 'Object Type', key: 'objectType' },
      { header: 'Object ID', key: 'objectId' },
      { header: 'Object Name', key: 'objectName' },
      { header: 'Control ID', key: 'controlId' },
      { header: 'Trigger Name', key: 'triggerName' },
      { header: 'Has DotNet Variables', key: 'hasDotNetVariables' },
      { header: 'Change Type', key: 'changeType' },
    ];

    worksheet.columns[0].width = 15;
    worksheet.columns[1].width = 15;
    worksheet.columns[2].width = 40;
    worksheet.columns[3].width = 15;
    worksheet.columns[4].width = 40;
    worksheet.columns[5].width = 15;
    worksheet.columns[6].width = 15;

    changes.forEach(appObjectChange => {
      if (appObjectChange.objectType === 'Page') {
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
                    controlId: controlChange.id,
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
    });
  }

  private static AddModifiedPageActionTriggers(
    workbook: Excel.Workbook,
    changes: Array<IAppObjectChange>,
    sheetName: string
  ) {
    let worksheet = workbook.addWorksheet(sheetName);
    worksheet.columns = [
      { header: 'Object Type', key: 'objectType' },
      { header: 'Object ID', key: 'objectId' },
      { header: 'Object Name', key: 'objectName' },
      { header: 'Action ID', key: 'actionId' },
      { header: 'Trigger Name', key: 'triggerName' },
      { header: 'Has DotNet Variables', key: 'hasDotNetVariables' },
      { header: 'Change Type', key: 'changeType' },
    ];

    worksheet.columns[0].width = 15;
    worksheet.columns[1].width = 15;
    worksheet.columns[2].width = 40;
    worksheet.columns[3].width = 15;
    worksheet.columns[4].width = 40;
    worksheet.columns[5].width = 15;
    worksheet.columns[6].width = 15;

    changes.forEach(appObjectChange => {
      if (appObjectChange.objectType === 'Page') {
        const propertiesChange = ExcelReport.getObjectChange<
          ICollectionChange<IPropertyChange>
        >('PROPERTIES', appObjectChange.changes);

        if (propertiesChange && propertiesChange.changes) {
          const actionListChange = propertiesChange.changes.find(
            i =>
              i.propertyName === 'ActionList' &&
              i.propertyType === 'ACTION_LIST'
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
                        actionId: actionChange.id,
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
    });
  }
}
