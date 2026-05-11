export enum ParamsPrefix {
  AND = '_and_',
  OR = '_or_'
}

export enum LinkWord {
  CONTAINS = '_contains_',
  EQUALS = '_equals_'
}

export enum SortTypes {
  ASC = 'ASC',
  DESC = 'DESC'
}

export interface SortInterface {
  sortBy: string;
  sortOrder: SortTypes
}

export interface SearchFilterInterface {
  key: string;
  value: string | number | boolean;
  linkWord: LinkWord;
  prefix?: ParamsPrefix;
}

export interface ApiParams {
  search?: string | null;
  filter?: string | null;
  sortBy?: string | null;
  sortOrder?: SortTypes | null;
  page: number;
  rowsPerPage: number;
}

export function getApiParams(search?: SearchFilterInterface[] | string, filter?: SearchFilterInterface[], sort?: SortInterface, page: number = 1, rowsPerPage: number = 10, setNull = true) {
  const apiParams: ApiParams = {page, rowsPerPage};

  const createFilterString = (elements: SearchFilterInterface[]) => {
    return elements.map(({key, linkWord, value, prefix = ''}) => `${key}${linkWord}${value}${prefix}`).join('');
  };

  if (typeof search === 'string') {
    if (search) {
      apiParams.search = search;
    } else if (setNull) {
      apiParams.search = null;
    }
  } else if (search?.length) {
    const searchParam = createFilterString(search);
    if (search) {
      apiParams.search = searchParam;
    } else if (setNull) {
      apiParams.search = null;
    }
  }

  if (filter?.length) {
    apiParams.filter = createFilterString(filter);
  } else if (setNull) {
    apiParams.filter = null;
  }

  if (sort?.sortBy) {
    apiParams.sortBy = sort.sortBy;
    apiParams.sortOrder = sort.sortOrder || SortTypes.ASC;
  } else if (setNull) {
    apiParams.sortBy = null;
    apiParams.sortOrder = null;
  }

  return apiParams;
}

export function getQueryFilterParams(apiParamsString: string) {
  const filterParams: any = [];

  const andParams = apiParamsString.split(ParamsPrefix.AND);
  andParams.forEach((andParam: string, andIndex: number) => {
    const orParts = andParam.split(ParamsPrefix.OR);
    orParts.forEach((orParam: string, orIndex: number) => {
      const parts = orParam.split(LinkWord.CONTAINS);

      filterParams.push({
        key: parts[0],
        linkWord: LinkWord.CONTAINS,
        prefix: (andIndex === andParams.length - 1 && orIndex === orParts.length - 1) ? '' : (orIndex === orParts.length - 1 ? ParamsPrefix.AND : ParamsPrefix.OR),
        value: parts[1]
      });
    });
  });

  return filterParams;
}

