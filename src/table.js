import { db } from "./firebase.js";
import {
  collection,
  query,
  getDocs
} from "firebase/firestore";

// untuk ambil data users
const users = async () => {
    const tblUsers = collection(db, 'Users');
    const qryUsers = query(tblUsers);
    const getUsers = await getDocs(qryUsers);

    const result = [];
    getUsers.forEach(doc => {
        result.push({
            id: doc.id,
            ...doc.data()
        });
    });

    return result;
};

// untuk ambil data friends
const friends = async () => {
    const tblFriends = collection(db, 'Friends');
    const qryFriends = query(tblFriends);
    const getFriends = await getDocs(qryFriends);

    const result = [];
    getFriends.forEach(doc => {
        result.push({
            id: doc.id,
            ...doc.data()
        });
    });

    return result;
};


export { users, friends }