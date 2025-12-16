
export type ServiceCall = UnifiedIdentifier & Partial<{
    activities: Activity[]
    address: Address | null;
    attachments: Attachment[]
    businessPartner: BusinessPartner | null;
    chargeableEfforts: boolean
    chargeableExpenses: boolean
    chargeableMaterials: boolean
    chargeableMileages: boolean
    code: string | null;
    contact: Contact | null;
    createPerson: CreatePerson | null;
    dueDateTime: string | null;
    durationInMinutes: number | null;
    earliestStartDateTime: string | null;
    equipments: Equipment[]
    externalId: string | null;
    id: string | null;
    lastChanged: number | null;
    orgLevelIds: string[];
    origin: string | null;
    priority: string | null;
    problemType: string | null;
    remarks: string | null;
    requirements: Requirement[]
    reservedMaterials: ReservedMaterial[]
    resolution: string | null;
    responsibles: Responsible[]
    serviceContract: ServiceContract | null;
    status: string | null;
    subject: string | null;
    type: string | null;
    udfValues: UdfValue[]
}>

export type UnifiedIdentifier = Partial<{
    code: string | null;
    externalId: string | null;
    id: string | null;
}>


export type Activity = UnifiedIdentifier & Partial<{
    activityFeedbacks: ActivityFeedback[]
    originActivity: OriginActivity | null;
    businessPartner: BusinessPartner | null;
    cancellationReason: string | null;
    changelog: string | null;
    checkedOut: boolean;
    address: Address | null;
    attachments: Attachment[]
    code: string | null;
    contact: Contact | null;
    createDateTime: string | null;
    createPerson: CreatePerson | null;
    crew: Crew | null;
    dueDateTime: string | null;
    durationInMinutes: number | null;
    earliestStartDateTime: string | null;
    endDateTime: string | null;
    equipment: Equipment | null;
    executionStage: string | null;
    hazardType: string | null;
    externalId: string | null;
    id: string | null;
    internalRemarks: string | null;
    internalRemarks2: string | null;
    lastChanged: number | null;
    location: Location | null;
    orgLevelIds: string[];
    milestone: boolean
    number: string | null;
    object: { objectId: string, objectType: string } | null;
    plannedDurationInMinutes: number | null;
    plannedDurationType: 'AUTOMATIC' | null;
    predecessorActivities: UnifiedIdentifier[];
    previousActivity: UnifiedIdentifier | null;
    plannedEndDate: string | null;
    plannedStartDate: string | null;
    project: UnifiedIdentifier | null;
    projectOrdinal: number | null;
    projectPhase: UnifiedIdentifier | null;
    region: Region | null;
    remarks: string | null;
    reminderDateTime: string | null;
    requirements: Requirement[]
    reservedMaterials: ReservedMaterial[]
    responsibles: Responsible[];
    serviceProduct: ServiceProduct | null;
    serviceAssignment: UnifiedIdentifier | null;
    serviceWorkflow: UnifiedIdentifier | null;
    startDateTime: string | null;
    sourceActivity: SourceActivity | null;
    status: string | null;
    statusChangeReason: string | null;
    subType: UnifiedIdentifier | null;
    subject: string | null;
    supportingPersons: UnifiedIdentifier[]
    team: UnifiedIdentifier | null;
    timeZoneId: string | null;
    topic: UnifiedIdentifier | null;
    travelTimeFromInMinutes: number | null;
    travelTimeToInMinutes: number | null;
    type: string | null;
    udfValues: UdfValue[]
    workflowStep: WorkflowStep | null;
    workflowSteps: WorkflowStep[];
    useAllEquipments: boolean
}>

type ActivityFeedback = Partial<{
    activityCodes: ActivityCode[]
    composedCode: string | null;
    equipment: Equipment | null;
    externalId: string | null;
    externalText: string | null;
    id: string | null;
    internal: boolean
    internalRemarks: string | null;
    orgLevelIds: string[];
}>

type ReservedMaterial = Partial<{
    arrivalDate: string | null;
    externalId: string | null;
    fromWarehouse: FromWarehouse | null;
    id: string | null;
    item: Item
    moved: number | null;
    orgLevelIds: string[];
    quantity: number | null;
    serialNumber: SerialNumber | null;
    shipped: number | null;
    trackPartEquipmentUsage: boolean
    udfValues: UdfValue[]
    used: number | null;
    warehouse: Warehouse | null;
}>

type WorkflowStep = Partial<{
    createDateTime: string | null;
    lastChanged: number | null;
    name: string | null;
    text: string | null;
}>

type Requirement = Partial<{
    inherited: boolean
    mandatory: boolean
    orgLevelIds: string[];
    skill: Skill
}>

type Equipment = UnifiedIdentifier & Partial<{
    objectCategory: string | null;
}>

type Address = Partial<{
    autoResolved: boolean
    block: string | null;
    building: string | null;
    city: string | null;
    country: string | null;
    externalAddressId: string | null;
    floor: string | null;
    location: Location | null;
    orgLevelIds: string[];
    room: string | null;
    source: string | null;
    sourceId: string | null;
    state: string | null;
    street: string | null;
    streetNumber: string | null;
    subType: string | null;
    udfValues: UdfValue[]
    zipCode: string | null;
}>

type Location = Partial<{
    latitude: number | null;
    longitude: number | null;
}>

type Attachment = Partial<{
    category: string | null;
    description: string | null;
    fileName: string | null;
    id: string | null;
    title: string | null;
    type: string | null;
}>

export type UdfValue = Partial<{
    key: string | null;
    udfMeta: UdfMeta
    value: string | null;
}>

type UdfMeta = UnifiedIdentifier;

type ActivityCode = UnifiedIdentifier

type Contact = UnifiedIdentifier;

type CreatePerson = UnifiedIdentifier;

type Region = UnifiedIdentifier;

type ServiceContract = UnifiedIdentifier;

type Skill = UnifiedIdentifier;

type FromWarehouse = UnifiedIdentifier;

type Item = UnifiedIdentifier;

type SerialNumber = UnifiedIdentifier;

type Warehouse = UnifiedIdentifier;

type Responsible = UnifiedIdentifier;

type ServiceProduct = UnifiedIdentifier;

type SourceActivity = UnifiedIdentifier;

type OriginActivity = UnifiedIdentifier;

type BusinessPartner = UnifiedIdentifier;

type Crew = UnifiedIdentifier;
