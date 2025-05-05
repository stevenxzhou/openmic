"use client";

import React, { createContext, useContext, useReducer, useState } from 'react';

interface GlobalContextType {
    user: {
        authenticated: boolean;
        first_name: string;
        email: string;
        exp: number;
    };
    dispatch: React.Dispatch<Action>;
}

const initialGlobalContext = {
    user: {
        authenticated: false,
        first_name: "",
        email: "",
        exp: 0
    },
    dispatch: ()=>{}
};

export enum ActionType {
    "SET_USER", "RESET_USER"
}

type Action =
    | { type: ActionType.SET_USER ; payload: { authenticated: boolean; first_name: string; email: string; exp: number } }
    | { type: ActionType.RESET_USER };

const globalContextReducer = (state: typeof initialGlobalContext, action: Action): typeof initialGlobalContext => {
    debugger;
    switch (action.type) {
        case ActionType.SET_USER :
            return {
                ...state,
                user: action.payload
            };
        case ActionType.RESET_USER:
            return initialGlobalContext;
        default:
            throw new Error(`Unhandled action type`);
    }
};

const GlobalContext = createContext<GlobalContextType>(initialGlobalContext);

export const useGlobalContext = () => {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error("useGlobalContext must be used within a GlobalContextProvider");
    }
    return context;
};

export const GlobalContextProvider = ({ children }: { children: React.ReactNode }) => {

    const [state, dispatch] = useReducer(globalContextReducer, initialGlobalContext);
    
    return (
        <GlobalContext.Provider
            value={{ ...state, dispatch }}
        >
            {children}
        </GlobalContext.Provider>
    );
};