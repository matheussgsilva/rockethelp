import React, { useState, useEffect } from "react";
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth'
import { NavigationContainer } from "@react-navigation/native";
import { AppRoutes } from "./app.routes";
import { SignIn } from '../screens/Signin';
import { Loading } from "../components/Loading";

export function Routes() {
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<FirebaseAuthTypes.User>()

    useEffect(() => {
        const subscriber = auth()
        .onAuthStateChanged(response => {
            setUser(response)
            setLoading(false)
        })
        return subscriber
    }, [])

    if(loading) {
        <Loading />
    }

    return (
        <NavigationContainer>
            {user ? <AppRoutes/> : <SignIn />}
        </NavigationContainer>
    )
}