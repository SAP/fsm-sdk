import { DataCloudDTOModels } from '../dto-name.model';

export type DataApiResponse<T extends DataCloudDTOModels> = {
  data: { [key: string]: T }[]
}
