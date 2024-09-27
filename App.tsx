import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  Pressable,
  Button,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  UserCredential,
  User,
} from "firebase/auth";
//import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import { app, auth, db, storage } from "./firebaseConfig";

const Stack = createNativeStackNavigator();

// ------------------------------Login------------------------------------ \\
function LogIn({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <TextInput
        placeholder="email"
        onChangeText={(text) => {
          //setEmail(text);
        }}
      />
      <TextInput
        placeholder="password"
        secureTextEntry={true}
        onChangeText={(text) => {
          //setPassword(text);
        }}
      />
      <Button
        title="Log in"
        onPress={() => {
          signInWithEmailAndPassword(auth, email, password)
            .then((userCredential: UserCredential) => {
              //screen a MainMenu
              navigation.navigate("MainMenu");
              console.log(
                "USER LOGGED IN CORRECTLY: " + userCredential.user.email
              );
            })
            .catch((error: any) => {
              console.log("ERROR: " + error);
            });
        }}
      />
      <Text>Don't have an account?</Text>
      <Button title="Sign up" onPress={() => navigation.navigate(SignUp)} />
    </View>
  );
}
// ------------------------------Sign Up------------------------------------ \\
function SignUp({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <TextInput
        placeholder="email"
        onChangeText={(text) => {
          setEmail(text);
        }}
      />
      <TextInput
        placeholder="password"
        secureTextEntry={true}
        onChangeText={(text) => {
          setPassword(text);
        }}
      />
      <Button
        title="sign up"
        onPress={() => {
          createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential: UserCredential) => {
              // this logic will run when the promise is solved
              console.log("USER: " + userCredential.user);
            })
            .catch((error: any) => {
              if (error.code == "auth/missing-password") {
                alert("YOUR PASSWORD IS CRAPPY");
              }

              console.log("ERROR: " + error.message + " " + error.code);
            });
        }}
      />
    </View>
  );
}
// ------------------------------Add New Animal------------------------------------ \\
function AddNewAnimal({ navigation }: any) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [imageURL, setImageURL] = useState("");
  return (
    <View>
      <TextInput
        placeholder="name"
        onChangeText={(text) => {
          setName(text);
        }}
      />
      <TextInput
        placeholder="age"
        onChangeText={(text) => {
          setAge(text);
        }}
      />
      <TextInput
        placeholder="image URL"
        onChangeText={(text) => {
          setImageURL(text);
        }}
      />
      <Button
        title="add"
        onPress={async () => {
          try {
            // get a reference to the collection
            var animalsCollection = collection(db, "animals");

            const newDoc = await addDoc(animalsCollection, {
              name: name,
              age: age,
              urlImage: imageURL,
            });

            console.log("ID of the new animal: " + newDoc.id);
          } catch (e) {
            console.log("EXCEPTION WHEN TRYING TO ADD A ANIMAL: " + e);
          }
        }}
      />
    </View>
  );
}
// ------------------------------Main Menu------------------------------------ \\
function MainMenu({ navigation }: any) {
  interface Animal {
    name: string;
    age: number;
    url: string;
  }
  const [list, setList] = useState<Animal[]>([]);
  const fetchAnimals = async () => {
    try {
      const snapshot = await getDocs(collection(db, "animals"));
      const newList: Animal[] = [];

      snapshot.forEach((currentDocument) => {
        newList.push(currentDocument.data() as Animal);
      });

      setList(newList);
      console.log("Ciclo?");
    } catch (error) {
      console.error("Error al obtener los animales: ", error);
    }
  };
  useEffect(() => {
    fetchAnimals();
  }, []);
  return (
    <View>
      <FlatList
        data={list}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={{ flexDirection: "row", margin: 10 }}>
            <Text>{item.name}</Text>
            <Image
              source={{ uri: item.url }}
              style={{ width: 50, height: 50 }}
            />
          </View>
        )}
      />

      <Button
        title="add animal"
        onPress={() => {
          navigation.navigate(AddNewAnimal);
        }}
      />
    </View>
  );
}
// ------------------------------Main Function------------------------------------ \\
export default function Navigation() {
  const [user, setUser] = useState<User | null>(null);
  onAuthStateChanged(auth, (user) => {
    if (user) {
      setUser(user);
    } else {
      setUser(null);
    }
  });

  if (user) {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="MainMenu" component={MainMenu} />
          <Stack.Screen name="AddNewAnimal" component={AddNewAnimal} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  } else {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Login" component={LogIn} />
          <Stack.Screen name="SignUp" component={SignUp} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 10,
  },
});
