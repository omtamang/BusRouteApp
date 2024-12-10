import { useContext, createContext, useState } from "react"

export const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

export default function AuthProvider({children}) {
    const [isAuthenticated, setAuthenticated] = useState(false)

    function Login(email, password){
        
    }

    return (
        <AuthContext.Provider value={isAuthenticated}>
            {children}
        </AuthContext.Provider>
    )
}