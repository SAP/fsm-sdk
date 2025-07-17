import { DTOModels } from '../dto-name.model';

export type DataApiResponse<T extends DTOModels> = {
  data: { [key: string]: T }[]
}
