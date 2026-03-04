export type Column = {
    key: string;
    title: string;
    isFixed?: boolean;
    initialWidth?: number;
};

export const columns = [
  { key: "id", title: "ID" },
  { key: "name", title: "Name" },
  { key: "email", title: "Email" },
];

export const BATCH_SIZE = 100;