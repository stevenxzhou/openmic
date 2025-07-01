"use client";

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { refresh } from '../api/user';

interface LoginUserType {
    authenticated: boolean;
    first_name: string;
    email: string;
    role: string;
}

interface GlobalContextType {
    user: LoginUserType;
    dispatch: React.Dispatch<Action>;
}

export const InitialUser = {
        authenticated: false,
        first_name: "",
        email: "",
        role: "Guest"
}

const initialGlobalContext = {
    user: InitialUser,
    dispatch: ()=>{}
};

export enum ActionType {
    "SET_USER", "RESET_USER"
}

type Action =
    | { type: ActionType.SET_USER ; payload: LoginUserType }
    | { type: ActionType.RESET_USER };

const globalContextReducer = (state: typeof initialGlobalContext, action: Action): typeof initialGlobalContext => {
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
    
    useEffect(() => {
        const tryRefresh = async () => {
            try {
                const loginData = await refresh();
                dispatch({ type: ActionType.SET_USER, payload: { first_name: loginData.first_name, authenticated: true, email: loginData.email, role: loginData.role } });
            } catch(e) {
                console.log("Please login to enjoy more features!");
            }
        };
        tryRefresh();
    }, []);

    return (
        <GlobalContext.Provider
            value={{ ...state, dispatch }}
        >
            {children}
        </GlobalContext.Provider>
    );
};