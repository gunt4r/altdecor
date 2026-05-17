import {MetaInterface} from "./meta.interface";

export interface FileSnippet {
  id: number;
  file_name: string;
  file_url: string;
}

export interface FilesListResponse {
  data: FileSnippet[]
  meta: MetaInterface
}
