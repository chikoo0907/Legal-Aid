import { View, Text } from "react-native";


export default function Profile({ user }) {
return (
<View>
<Text>Email: {user.email}</Text>
<Text>Preferred Language: {user.language}</Text>
</View>
);
}