import React, { useContext, useState } from "react";

const TokenContext = React.createContext();
const TokenSelectionContext = React.createContext();

export function useToken() {
  return useContext(TokenContext);
}

export function useTokenSelection() {
  return useContext(TokenSelectionContext);
}

export function TokenProvider({ children }) {
  const [token, setToken] = useState(
    JSON.parse(localStorage.getItem("tokens"))
  );

  function selectToken(token) {
    //check if token is correct
    setToken(token);
  }

  return (
    <TokenContext.Provider value={token}>
      <TokenSelectionContext.Provider value={selectToken}>
        {children}
      </TokenSelectionContext.Provider>
    </TokenContext.Provider>
  );
}
