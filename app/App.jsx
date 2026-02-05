import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator } from "react-native";
import Login from "./screens/Login";
import Register from "./screens/Register";
import Home from "./screens/Home";
import Chat from "./screens/Chat";
import Vault from "./screens/Vault";
import KnowRights from "./screens/KnowRights";
import Awareness from "./screens/Awareness";
import DocumentsNeeded from "./screens/DocumentsNeeded";
import { AuthProvider, useAuth } from "./context/AuthContext";

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={isAuthenticated ? "Home" : "Login"}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Chat" component={Chat} />
        <Stack.Screen name="KnowRights" component={KnowRights} />
        <Stack.Screen name="Awareness" component={Awareness} />
        <Stack.Screen name="DocumentsNeeded" component={DocumentsNeeded} />
        <Stack.Screen name="Vault" component={Vault} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}