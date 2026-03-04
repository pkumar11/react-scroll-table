import type { TableAction } from "./tableActions";

export type TableState = {
  data: any[];
  nextStart: number;
};

export const initialTableState: TableState = {
  data: [],
  nextStart: 11,
};

export function tableReducer(
  state: TableState,
  action: TableAction
): TableState {
  switch (action.type) {
    case "SET_DATA":
      return {
        ...state,
        data: action.payload.data,
        nextStart: action.payload.nextStart,
      };
    case "APPEND_DATA":
      return {
        ...state,
        data: [...state.data, ...action.payload.data],
        nextStart: action.payload.nextStart,
      };
    case "DELETE_ROW":
      return {
        ...state,
        data: state.data.filter((row) => row.id !== action.payload.id),
      };
    case "UPDATE_ROW":
      return {
        ...state,
        data: state.data.map((row) =>
          row.id === action.payload.id ? { ...row, ...action.payload } : row
        ),
      };
    default:
      return state;
  }
}
