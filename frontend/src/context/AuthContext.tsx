import { createContext } from "react";
import type { User } from "../types/User"; 

export const AuthContext = createContext<User | null>(null);

