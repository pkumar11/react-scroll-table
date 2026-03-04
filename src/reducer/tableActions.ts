export type TableAction =
  | {
      type: "SET_DATA";
      payload: { data: any[]; nextStart: number };
    }
  | {
      type: "APPEND_DATA";
      payload: { data: any[]; nextStart: number };
    }
  | {
      type: "DELETE_ROW";
      payload: { id: number | string };
    }
  | {
      type: "UPDATE_ROW";
      payload: any;
    };

