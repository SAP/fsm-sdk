import { DTOModels } from './dto-name.model';

export type ClientResponse<T extends DTOModels> = {
  data: { [key: string]: T }[]
}
