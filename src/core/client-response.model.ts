import { DTOModels } from './api-clients/data-api/model/dto-name.model';

export type ClientResponse<T extends DTOModels> = {
  data: { [key: string]: T }[]
}
