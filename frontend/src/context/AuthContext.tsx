import { createContext } from "react";
import type { User } from "../types/User"; // Use the correct relative path

export const AuthContext = createContext<User | null>(null);

