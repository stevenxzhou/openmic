"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useCallback,
} from "react";
import { apiUrl } from "@/lib/utils";
import { detectDeviceLanguage, Language, translate } from "@/lib/i18n";

interface LoginUserType {
  authenticated: boolean;
  first_name: string;
  email: string;
  role: string;
}

interface GlobalContextType {
  user: LoginUserType;
  dispatch: React.Dispatch<Action>;
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

export const InitialUser = {
  authenticated: false,
  first_name: "",
  email: "",
  role: "Guest",
};

type GlobalState = {
  user: LoginUserType;
};

const initialState: GlobalState = {
  user: InitialUser,
};

const initialGlobalContext: GlobalContextType = {
  user: InitialUser,
  dispatch: () => {},
  language: "en",
  setLanguage: () => {},
  t: (key: string, replacements?: Record<string, string | number>) =>
    translate("en", key, replacements),
};

export enum ActionType {
  "SET_USER",
  "RESET_USER",
}

type Action =
  | { type: ActionType.SET_USER; payload: LoginUserType }
  | { type: ActionType.RESET_USER };

const globalContextReducer = (
  state: GlobalState,
  action: Action,
): GlobalState => {
  switch (action.type) {
    case ActionType.SET_USER:
      return {
        ...state,
        user: action.payload,
      };
    case ActionType.RESET_USER:
      return initialState;
    default:
      throw new Error(`Unhandled action type`);
  }
};

const GlobalContext = createContext<GlobalContextType>(initialGlobalContext);

export { GlobalContext };

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);

  if (!context) {
    throw new Error(
      "useGlobalContext must be used within a GlobalContextProvider",
    );
  }
  return context;
};

export const GlobalContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(globalContextReducer, initialState);
  const [language, setLanguageState] = useState<Language>("en");

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    if (typeof window !== "undefined") {
      localStorage.setItem("openmic_language", nextLanguage);
    }
  }, []);

  const t = useCallback(
    (key: string, replacements?: Record<string, string | number>) =>
      translate(language, key, replacements),
    [language],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("openmic_language") as Language | null;
    if (saved === "en" || saved === "zh") {
      setLanguageState(saved);
      return;
    }

    const detected = detectDeviceLanguage();
    setLanguageState(detected);
    localStorage.setItem("openmic_language", detected);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  useEffect(() => {
    const tryRefresh = async () => {
      try {
        const response = await fetch(apiUrl("/api/refresh"), {
          method: "POST",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Refresh failed");
        }

        const loginData = await response.json();
        dispatch({
          type: ActionType.SET_USER,
          payload: {
            first_name: loginData.first_name,
            authenticated: true,
            email: loginData.email,
            role: loginData.role,
          },
        });
      } catch (e) {
        console.log("Please login to enjoy more features!");
      }
    };
    tryRefresh();
  }, []);

  return (
    <GlobalContext.Provider
      value={{ ...state, dispatch, language, setLanguage, t }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
