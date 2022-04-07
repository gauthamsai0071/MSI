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
    value: { text?: string, timestamp?: number };
    validValueLabels: string[] = [];
}