"use client";

import React, { createContext, useContext, useState } from 'react';

interface GlobalContextType {
}

const GlobalContext = createContext<any>(undefined);

export const useGlobalContext = () => {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error("useGlobalContext must be used within a GlobalContextProvider");
    }
    return context;
};

export const GlobalContextProvider = ({ children }: { children: React.ReactNode }) => {

    return (
        <GlobalContext.Provider
            value={{}}
        >
            {children}
        </GlobalContext.Provider>
    );
};