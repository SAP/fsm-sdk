import { DTOModels, DTOName } from './dto-name.model';

type Method = 'PATCH' | 'POST' | 'DELETE'

interface Action<T> {
  dtoName: DTOName;
  method: Method;
  dtoData: T;
  force: boolean;
}

export type BatchAction = CreateAction<DTOModels>
  | UpdateAction<DTOModels>
  | DeleteAction<DTOModels>;

export class CreateAction<T extends DTOModels> implements Action<T> {
  public readonly method: Method = 'POST';
  constructor(
    public readonly dtoName: DTOName,
    public readonly dtoData: T,
    public readonly force: boolean = false,
  ) { }
}

export class UpdateAction<T extends DTOModels> implements Action<T> {
  public readonly method: Method = 'PATCH';
  constructor(
    public readonly dtoName: DTOName,
    public readonly dtoData: T,
    public readonly force: boolean = false,
  ) { }
}

export class DeleteAction<T extends DTOModels> implements Action<T> {
  public readonly method: Method = 'DELETE';
  constructor(
    public readonly dtoName: DTOName,
    public readonly dtoData: T,
    public readonly force: boolean = false,
  ) { }
}