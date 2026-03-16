import React, { createContext, useContext, useReducer, useEffect } from "react";
import type { ReactNode } from "react";
import { initialTableState, tableReducer } from "./reducer/tableReducer";
import type { TableState } from "./reducer/tableReducer";
import Table from "./components/table/Table";
import { columns, BATCH_SIZE } from "./lib/Constants";
import type { TableAction } from "./reducer/tableActions";
import { useFetch } from "./Helper/getData";
import { faker } from "@faker-js/faker";
import "./App.css";
// Define the context type
interface TableContextType {
  state: TableState;
  dispatch: React.Dispatch<TableAction>;
}

const TableContext = createContext<TableContextType | null>(null);

export const useTableContext = () => {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error("useTableContext must be used within a TableProvider");
  }
  return context;
};

interface TableProviderProps {
  children: ReactNode;
}

export const TableProvider: React.FC<TableProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(tableReducer, initialTableState);
  const { data, loading, error } = useFetch("https://jsonplaceholder.typicode.com/users");

  useEffect(() => {
    if (data && !loading && !error) {
      let all =[...data,...processData(11, BATCH_SIZE)];
      dispatch({ type: "SET_DATA", payload: { data:all, nextStart: all.length } });
    }
  }, [data, loading, error]);

  return (
    <TableContext.Provider value={{ state, dispatch }}>
      {children} 
    </TableContext.Provider>
  );
};

const processData = (start: number, batchSize: number) => {
  // Simulate data generation for the given range
  return Array.from({ length: batchSize }, (_, i) => ({
    id: start + i,
    name: faker.internet.username(),
    email: faker.internet.email(),
  }));
};

const App: React.FC = () => {
  const { state, dispatch } = useTableContext();
  const [loader,setLoader] = React.useState(true);

  useEffect(()=>{
   if(state.data.length > 0){
    setLoader(false);
   }
   else{
    setLoader(true);
   }
  },[state.data])

  const handleEndReached = () => {
    const generated = processData(state.nextStart, BATCH_SIZE);
    dispatch({
      type: "APPEND_DATA",
      payload: { data: generated, nextStart: state.nextStart + BATCH_SIZE },
    });
  };

  const handleRowDelete = (row: Record<string, any>) => {
    dispatch({ type: "DELETE_ROW", payload: { id: row.id } });
  };

  return (

      <>
       {loader ? <div className="loader">Loading...</div> : <Table
          columns={columns}
          rows={state.data}
          onEndReached={handleEndReached}
          onRowDelete={handleRowDelete}
        />}
      </>

  );
};

export default App;
