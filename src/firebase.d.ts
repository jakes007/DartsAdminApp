// firebase.d.ts
import { Firestore } from "firebase/firestore";

declare module "./firebase" {
  export const db: Firestore;
}
