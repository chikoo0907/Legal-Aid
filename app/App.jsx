import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator } from "react-native";
import "./../global.css"
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Splash from "./screens/Splash";
import Login from "./screens/Login";
import Register from "./screens/Register";
import Home from "./screens/Home";
import Chat from "./screens/Chat";
import Vault from "./screens/Vault";
import DocumentViewer from "./screens/DocumentViewer";
import KnowRights from "./screens/KnowRights";
import Awareness from "./screens/Awareness";
import DocumentsNeeded from "./screens/DocumentsNeeded";
import SelectLanguage from "./screens/SelectLanguage";
import StepByStep from "./screens/StepByStep";
import StepDetails from "./screens/StepDetails";

import { AuthProvider, useAuth } from "./context/AuthContext";
import Profile from "./screens/Profile";

const Stack = createNativeStackNavigator();

// const { loading } = useAuth();

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
     <NavigationContainer>
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Splash" component={Splash} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="Language" component={SelectLanguage} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="Home" component={Home} />

      <Stack.Screen name="Chat" component={Chat} />
      <Stack.Screen name="KnowRights" component={KnowRights} />
      <Stack.Screen name="Awareness" component={Awareness} />
      <Stack.Screen name="DocumentsNeeded" component={DocumentsNeeded} />
      <Stack.Screen name="Vault" component={Vault} />
      <Stack.Screen
        name="DocumentViewer"
        component={DocumentViewer}
        options={{ headerShown: true, title: "Document" }}
      />
      <Stack.Screen name="StepByStep" component={StepByStep} />
      <Stack.Screen name="StepDetails" component={StepDetails} />
    </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>   
      <AuthProvider>
        <AppContent />
      </AuthProvider>
      </SafeAreaProvider>
    
  );
}
