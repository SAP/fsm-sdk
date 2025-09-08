export type ValueTranslationDataDto = {
    id: string;
    // key: string; // wrong definition int open API sepc?
    lastChanged: string;
    locale: string;
    value: string;
    created: string;
}

export type LabelTranslationDto = {
    id: string;
    clientIds: string[];
    key: string;
    value: string;
    lastChanged: string;
    language: string;
    createDateTime: string;
}


const VALUE_TRANSLATABLE = {
    'Region': ['name'],
    'ServiceAssignmentStatusDefinition': ['name'],
    'ChecklistTemplate': ['name'],
    'PersonReservationType': ['name'],
    'WorkTimeTask': ['name'],
    'ExpenseType': ['name'],
    'ServiceCallType': ['name'],
    'ServiceCallProblemType': ['name'],
    'ServiceCallStatus': ['name'],
    'ServiceCallOrigin': ['name'],
    'Enumeration': ['name'],
    'ActivitySubType': ['name'],
    'ActivityTopic': ['name'],
    'TimeTask': ['name'],
    'BusinessPartnerGroup': ['name'],
    'EquipmentSubType': ['name'],
    'Tag': ['name', 'description'],
    'PlanningScenario': ['name'],
    'PriceList': ['name'],
    'Warehouse': ['name'],
    'UdfMeta': ['name', 'description'],
    'Equipment': ['name'],
    'Item': ['name'],
}

export type ValueTranslationDto<T> = {
    id: string;
    created: string;
    objectId: string;
    objectType: keyof typeof VALUE_TRANSLATABLE;
    fieldName: 'name' | 'description';
    lastChanged: string;
    values: T[];
}

export type PageableObject = {
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    sort: SortObject[] | SortObject;
    unpaged: boolean;
}

export type SortObject = {
    ascending: boolean;
    direction: string;
    ignoreCase: boolean;
    nullHandling: string;
    property: string;
}

export type PageDto<T extends ValueTranslationDto<ValueTranslationDataDto> | LabelTranslationDto> = {
    content: T[];
    empty: boolean;
    first: boolean;
    last: boolean;
    number: number;
    numberOfElements: number;
    pageable: PageableObject;
    size: number;
    sort: SortObject[];
    totalElements: number;
    totalPages: number;
}