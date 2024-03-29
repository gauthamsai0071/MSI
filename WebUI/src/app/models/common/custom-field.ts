export class CustomField {
    id: number;
    isText: boolean;
    isDate: boolean;
    isTimestamp: boolean;
    isEnumeration: boolean;
    isBool: boolean;
    isUrl: boolean;
    isComputed: boolean;
    isComputedAutoDelete: boolean;
    isComputedExpression: boolean;
    isTagList: boolean;
    name: string;
    displayName: string;
    mandatory: boolean;
    fieldType: string;
    purpose: string;
    isDerived?: boolean;
    filterByRange: boolean;
    deleted: boolean;
    numTextLines?: number;
    validatorName?: string;
    validatorPattern?: string;
    validatorDescription?: string;
    permissionGroup: string;
    asUrl: boolean;
    orderIndexSmall?: number;
    orderIndexMedium?: number;
    orderIndexWide?: number;
    orderIndexCompanionApp?: number;
    columnWidth: string;
    genericSearchable: boolean;
    showSearchField: boolean;
    showInSummary: boolean;
    showInIncidentEditor: boolean;
    canRead: boolean;
    defaultValue: { bool?: boolean, text?: string, timestamp?: number };
    value: { bool?: boolean, text?: string, timestamp?: number };
    validValueLabels?: string[] = [];
    validValues?: string[] = [];
}