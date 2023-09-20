<template>
    <div class="flex flex-col items-center justify-center w-screen min-h-screen bg-gray-100 text-gray-800">
        <div class="flex flex-col flex-grow items-center justify-center w-full max-w-xl bg-white shadow-xl rounded-lg overflow-hidden">
            <!-- begin:: body -->
            <h1 class="text-4xl font-bold text-gray-800 px-4 pb-5">Tugas Akhir</h1>
            <p class="text-gray-500">Andika Saputra 217116574</p>
            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full mt-5" @click="handleLogin">Google Sign-in</button>
            <!-- end:: body -->
        </div>
    </div>
</template>

<script>
import { db, auth, messaging } from "../firebase";
import {
    signInWithRedirect,
    signInWithPopup,
    GoogleAuthProvider
} from "firebase/auth";
import {
    collection,
    getDocs,
    addDoc,
    query,
    where,
} from "firebase/firestore";
import {
    getToken,
    onMessage
} from "firebase/messaging";
import Swal from 'sweetalert2';

const provider = new GoogleAuthProvider();

export default {
    name: 'Home',
    data() {
        return {
            tokenNotification: '',
        }
    },
    methods: {
        requestPermission() {
            console.log('Requesting permission...');

            Notification.requestPermission().then((permission) => {
                if (permission === 'granted') {
                    console.log('Notification permission granted.');

                    onMessage(messaging, (payload) => {
                        console.log('Message received. ', payload);
                    });

                    getToken(messaging, {
                        vapidKey: import.meta.env.VITE_VAPID_KEY,
                    }).then((currentToken) => {
                        if (currentToken) {
                            this.tokenNotification = currentToken;
                        } else {
                            console.log('No registration token available. Request permission to generate one.');
                        }
                    }).catch((err) => {
                        console.log('An error occurred while retrieving token. ', err);
                    });
                } else {
                    console.log('Unable to get permission to notify.');
                }
            });
        },
        handleLogin() {
            signInWithRedirect(auth, provider);
            // signInWithPopup(auth, provider).then(async (result) => {
            //     // The signed-in user info.
            //     this.uid = result.user.uid;
            //     this.user = result.user.displayName;
            //     this.email = result.user.email;
            //     this.photoURL = result.user.photoURL;
            //     this.isLogin = true

            //     let data = {
            //         uid: this.uid,
            //         name: this.user,
            //         email: this.email,
            //         photo: this.photoURL,
            //         role: 'user',
            //         active: 'y',
            //         token_notification: this.tokenNotification,
            //     }

            //     // check data collection users
            //     const tableUsers = collection(db, 'Users');
            //     const usersSnapshot = await getDocs(tableUsers);
            //     if (usersSnapshot.empty) {
            //         console.log('Collection does not exist');

            //         // untuk simpan data ke firebase
            //         const docRef = await addDoc(collection(db, "Users"), data);
            //         if (docRef) {
            //             // untuk set local storage
            //             localStorage.setItem('authenticated', true);
            //             localStorage.setItem('user', JSON.stringify(data));
            //             this.$router.push({
            //                 name: 'user'
            //             });
            //             console.log('Create data users berhasil ' + docRef.id);
            //         } else {
            //             console.log('Create data users gagal ' + docRef.id);
            //         }
            //     } else {
            //         console.log('Collection does exist');

            //         const tblUsers = collection(db, "Users");
            //         const qryUsers = query(tblUsers, where("uid", "==", this.uid));
            //         const getUsers = await getDocs(qryUsers);

            //         if (getUsers.size == 0) {
            //             // untuk simpan data ke firebase
            //             const docRef = await addDoc(collection(db, "Users"), data);
            //             if (docRef) {
            //                 // untuk set local storage
            //                 localStorage.setItem('authenticated', true);
            //                 localStorage.setItem('user', JSON.stringify(data));
            //                 this.$router.push({
            //                     name: 'user'
            //                 });
            //                 console.log('Create data users berhasil ' + docRef.id);
            //             } else {
            //                 console.log('Create data users gagal ' + docRef.id);
            //             }
            //         } else {
            //             // untuk cek active
            //             const qryUserCheck = query(tblUsers, where("uid", "==", this.uid), where("active", "==", 'y'));
            //             const getUserCheck = await getDocs(qryUserCheck);

            //             if (getUserCheck.size == 0) {
            //                 Swal.fire({
            //                     title: 'Gagal!',
            //                     text: 'Maaf, akun Anda telah diblock!',
            //                     icon: 'error',
            //                     confirmButtonText: 'Okay'
            //                 });
            //             } else {
            //                 // untuk set local storage
            //                 localStorage.setItem('authenticated', true);
            //                 localStorage.setItem('user', JSON.stringify(data));
            //                 this.$router.push({
            //                     name: 'user'
            //                 });
            //             }
            //         }
            //     }
            // }).catch((error) => {
            //     console.log(error);
            // });
        },
    },
    mounted() {
        this.requestPermission();
    }
}
</script>