<template>
    <div class="flex flex-col items-center justify-center w-screen min-h-screen bg-gray-100 text-gray-800">
        <div
            class="flex flex-col flex-grow items-center justify-center w-full max-w-xl bg-white shadow-xl rounded-lg overflow-hidden">
            <!-- begin:: body -->
            <div class="bg-white lg:w-6/12 md:7/12 w-8/12 shadow-3xl">
                <!-- <div
                    class="bg-gray-800 absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full p-4 md:p-8">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="#FFF">
                        <path
                            d="M0 3v18h24v-18h-24zm6.623 7.929l-4.623 5.712v-9.458l4.623 3.746zm-4.141-5.929h19.035l-9.517 7.713-9.518-7.713zm5.694 7.188l3.824 3.099 3.83-3.104 5.612 6.817h-18.779l5.513-6.812zm9.208-1.264l4.616-3.741v9.348l-4.616-5.607z" />
                    </svg>
                </div> -->
                <div class="md:pt-24">
                    <div class="flex items-center text-lg mb-6 md:mb-8">
                        <font-awesome-icon class="absolute ml-3" icon="fa-solid fa-user" />
                        <input type="text" id="name" ref="name" :placeholder="name" required class="bg-gray-200 pl-12 py-2 md:py-4 focus:outline-none w-full" />
                    </div>
                    <div class="flex items-center text-lg mb-6 md:mb-8">
                        <font-awesome-icon class="absolute ml-3" icon="fa-solid fa-envelope" />
                        <input type="text" id="email" ref="email" :placeholder="email" required class="bg-gray-200 pl-12 py-2 md:py-4 focus:outline-none w-full" />
                    </div>
                    <div class="flex items-center text-lg mb-6 md:mb-8">
                        <font-awesome-icon class="absolute ml-3" icon="fa-solid fa-lock" />
                        <input type="password" id="password" ref="password" :placeholder="password" required class="bg-gray-200 pl-12 py-2 md:py-4 focus:outline-none w-full" />
                    </div>
                    <div class="flex items-center text-lg mb-6 md:mb-8">
                        <font-awesome-icon class="absolute ml-3" icon="fa-solid fa-lock" />
                        <input type="password" id="re_password" ref="re_password" :placeholder="re_password" required class="bg-gray-200 pl-12 py-2 md:py-4 focus:outline-none w-full" />
                    </div>
                    <button type="button"
                        class="inline-block w-full rounded bg-blue-800 px-7 pb-2.5 pt-3 text-sm font-medium uppercase leading-normal text-white hover:bg-blue-400"
                        @click="register" @keypress.enter="register">Register</button>
                    <button type="button"
                        class="inline-block w-full rounded bg-green-800 px-7 my-2 pb-2.5 pt-3 text-sm font-medium uppercase leading-normal text-white hover:bg-green-400"
                        @click="login" @keypress.enter="login">Login</button>
                </div>
            </div>
            <!-- end:: body -->
        </div>
    </div>
</template>

<script>
import {
    addDoc,
    collection,
    getDocs
} from "firebase/firestore";
import {
    auth,
    db,
    messaging
} from "../../firebase";
import {
    createUserWithEmailAndPassword,
    sendEmailVerification
} from "firebase/auth";
import {
    getToken,
    onMessage
} from "firebase/messaging";
import Swal from "sweetalert2";
import { getMessaging, getToken } from 'firebase/messaging';
export default {
    name: 'Register',
    data() {
        return {
            name: 'Masukkan Nama',
            email: 'Masukkan Email',
            password: 'Masukkan Password',
            re_password: 'Masukkan Kembali Password',
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
        login() {
            this.$router.push({
                name: 'auth-login'
            });
        },
        register() {
            if (this.$refs.name.value === '' || this.$refs.email.value === '' || this.$refs.password.value === '' || this.$refs.re_password.value === '') {
                Swal.fire({
                    title: 'Gagal!',
                    text: 'TIDAK BOLEH KOSONG',
                    icon: 'error',
                    confirmButtonText: 'Okay'
                });;
            }

            if (this.$refs.password.value !== this.$refs.re_password.value) {
                Swal.fire({
                    title: 'Gagal!',
                    text: 'Sorry, Password not same!',
                    icon: 'error',
                    confirmButtonText: 'Okay'
                });
            } else {
                createUserWithEmailAndPassword(auth, this.$refs.email.value, this.$refs.password.value).then(
                    async (userCredential) => {
                        const user = userCredential.user;
                        const tableUsers = collection(db, 'Users');
                        const usersSnapshot = await getDocs(tableUsers);
                        const avatarUrl = this.$refs.name.value.charAt(0).toUpperCase();
                        // const photoURL = 'https://via.placeholder.com/100x100.png/007BFF/FFFFFF/?text=${avatarUrl}';
                        const messaging = getMessaging();
                        let tokenNotification="";
                        getToken(messaging)
                        .then((currentToken) => {
                            if (currentToken) {
                            // You have the user's notification token. You can proceed to store it in Firestore or elsewhere.
                            tokenNotification = currentToken
                            } else {
                            // No notification token available for the user.
                            }
                        })
                        .catch((error) => {
                            // Handle any errors related to token retrieval.
                        });
                        let data = {
                            uid: user.uid,
                            name: this.$refs.name.value,
                            email: user.email,
                            photo: avatarUrl,
                            bio: '',
                            role: 'user',
                            active: 'y',
                            token_notification: tokenNotification
                        }

                        if (usersSnapshot.empty) {
                            console.log('Collection does not exist');

                            // untuk simpan data ke firebase
                            const docRef = await addDoc(collection(db, "Users"), data);
                            if (docRef) {
                                sendEmailVerification(auth.currentUser).then(() => {
                                    Swal.fire({
                                        title: 'Berhasil!',
                                        text: 'Congrats, Email verification send!',
                                        icon: 'success',
                                        confirmButtonText: 'Okay'
                                    }).then((confirm) => {
                                        if (confirm.isConfirmed) {
                                            this.$router.push({
                                                name: 'auth-login'
                                            });
                                        }
                                    });
                                });

                                console.log('Create data users berhasil ' + docRef.id);
                            } else {
                                console.log('Create data users gagal ' + docRef.id);
                            }
                        } else {
                            console.log('Collection does exist');

                            // untuk simpan data ke firebase
                            const docRef = await addDoc(collection(db, "Users"), data);
                            if (docRef) {
                                sendEmailVerification(auth.currentUser).then(() => {
                                    Swal.fire({
                                        title: 'Berhasil!',
                                        text: 'Congrats, Email verification send!',
                                        icon: 'success',
                                        confirmButtonText: 'Okay'
                                    }).then((confirm) => {
                                        if (confirm.isConfirmed) {
                                            this.$router.push({
                                                name: 'auth-login'
                                            });
                                        }
                                    });
                                });

                                console.log('Create data users berhasil ' + docRef.id);
                            } else {
                                console.log('Create data users gagal ' + docRef.id);
                            }
                        }
                    }).catch((error) => {
                        const errorCode = error.code;
                        switch (errorCode) {
                            case 'auth/email-already-in-use':
                                Swal.fire({
                                    title: 'Gagal!',
                                    text: 'Sorry, Email sudah digunakan!',
                                    icon: 'error',
                                    confirmButtonText: 'Okay'
                                });
                                break;
                            case 'auth/invalid-email':
                            Swal.fire({
                                    title: 'Gagal!',
                                    text: 'Sorry, Email Tidak valid!',
                                    icon: 'error',
                                    confirmButtonText: 'Okay'
                                });
                                break;
                            case 'auth/weak-password':
                            Swal.fire({
                                    title: 'Gagal!',
                                    text: 'Sorry, Password Lemah!',
                                    icon: 'error',
                                    confirmButtonText: 'Okay'
                                });
                                break;
                            default:
                            Swal.fire({
                                    title: 'Gagal!',
                                    text: 'Terjadi Kesalahan!',
                                    icon: 'error',
                                    confirmButtonText: 'Okay'
                                });
                                console.log(error);
                                break;
                        }
                    });
            }
        },
    },
    mounted() {
        this.requestPermission();
    }
}
</script>