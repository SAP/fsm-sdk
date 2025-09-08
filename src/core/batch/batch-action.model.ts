import { DataCloudDTOModels, DataCloudDTOName } from '../dto-name.model';

type Method = 'PATCH' | 'POST' | 'DELETE'

interface Action<T> {
  dtoName: DataCloudDTOName;
  method: Method;
  dtoData: T;
  force: boolean;
}

export type BatchAction = CreateAction<DataCloudDTOModels>
  | UpdateAction<DataCloudDTOModels>
  | DeleteAction<DataCloudDTOModels>;

export class CreateAction<T extends DataCloudDTOModels> implements Action<T> {
  public readonly method: Method = 'POST';
  constructor(
    public readonly dtoName: DataCloudDTOName,
    public readonly dtoData: T,
    public readonly force: boolean = false,
  ) { }
}

export class UpdateAction<T extends DataCloudDTOModels> implements Action<T> {
  public readonly method: Method = 'PATCH';
  constructor(
    public readonly dtoName: DataCloudDTOName,
    public readonly dtoData: T,
    public readonly force: boolean = false,
  ) { }
}

export class DeleteAction<T extends DataCloudDTOModels> implements Action<T> {
  public readonly method: Method = 'DELETE';
  constructor(
    public readonly dtoName: DataCloudDTOName,
    public readonly dtoData: T,
    public readonly force: boolean = false,
  ) { }
}