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
                        <font-awesome-icon class="absolute ml-3" icon="fa-solid fa-envelope" />
                        <input type="text" id="email" ref="email" :placeholder="email"
                            class="bg-gray-200 pl-12 py-2 md:py-4 focus:outline-none w-full" />
                    </div>
                    <div class="flex items-center text-lg mb-6 md:mb-8">
                        <font-awesome-icon class="absolute ml-3" icon="fa-solid fa-lock" />
                        <input type="password" id="password" ref="password" :placeholder="password"
                            class="bg-gray-200 pl-12 py-2 md:py-4 focus:outline-none w-full" />
                    </div>
                    <button type="button"
                        class="inline-block w-full rounded bg-blue-800 px-7 my-2 pb-2.5 pt-3 text-sm font-medium uppercase leading-normal text-white hover:bg-blue-400"
                        @click="login" @keypress.enter="login">Login</button>
                    <button type="button"
                        class="inline-block w-full rounded bg-green-800 px-7 my-2 pb-2.5 pt-3 text-sm font-medium uppercase leading-normal text-white hover:bg-green-400"
                        @click="register" @keypress.enter="register">Register</button>
                </div>
            </div>
            <!-- end:: body -->
        </div>
    </div>
</template>

<script>
import {
    collection,
    getDocs,
    onSnapshot,
    query,
    where
} from "firebase/firestore";
import {
    auth, db
} from "../../firebase";
import {
    EmailAuthProvider,
    signInWithEmailAndPassword
} from "firebase/auth";
import Swal from "sweetalert2";

export default {
    name: 'Login',
    data() {
        return {
            email: 'Masukkan Email',
            password: 'Masukkan Password',
        }
    },
    methods: {
        register() {
            this.$router.push({
                name: 'auth-register'
            });  
        },
        login() {
            if (this.$refs.email.value === '' || this.$refs.password.value === '') {
                Swal.fire({
                    title: 'Gagal!',
                    text: 'TIDAK BOLEH KOSONG',
                    icon: 'error',
                    confirmButtonText: 'Okay'
                });
            }

            signInWithEmailAndPassword(auth, this.$refs.email.value, this.$refs.password.value).then(
                (userCredential) => {
                    const user = userCredential.user;

                    if (user.emailVerified) {
                        const tblUsers = collection(db, "Users");
                        const qryUsers = query(tblUsers, where("uid", "==", user.uid));
                        let tokennotif="";        
                        for (let i = 1; i <= 163; i++) {
                            // Do something with the value of 'i' in each iteration
                            let isihuruftoken = "1234567890qwertyuiopasdfghjklzxcvbnm-_:QWERTYUIOPASDFGHJKLZXCVBNM"
                            let randindex = Math.floor(Math.random() * isihuruftoken.length);
                            tokennotif = tokennotif + ''+ randindex
                        }
                        onSnapshot(qryUsers, (snapshotUsers) => {
                            snapshotUsers.docs.map(async (docUsers) => {
                                let data = {
                                    uid: docUsers.data().uid,
                                    name: docUsers.data().name,
                                    email: docUsers.data().email,
                                    photo: docUsers.data().photo,
                                    bio: docUsers.data().bio,
                                    role: 'user',
                                    active: 'y',
                                    token_notification: tokennotif,
                                }

                                // untuk cek active
                                const qryUserCheck = query(tblUsers, where("uid", "==", user.uid), where("active", "==", 'y'));
                                const getUserCheck = await getDocs(qryUserCheck);

                                if (getUserCheck.size == 0) {
                                    Swal.fire({
                                        title: 'Gagal!',
                                        text: 'Maaf, akun Anda telah diblock!',
                                        icon: 'error',
                                        confirmButtonText: 'Okay'
                                    });
                                } else {
                                    // untuk set local storage
                                    localStorage.setItem('authenticated', true);
                                    localStorage.setItem('user', JSON.stringify(data));
                                    this.$router.push({
                                        name: 'user'
                                    });
                                }
                            });
                        });
                    } else {
                        Swal.fire({
                            title: 'Gagal!',
                            text: 'Sorry, Your Account not verified!',
                            icon: 'error',
                            confirmButtonText: 'Okay'
                        });
                    }
                }).catch((error) => {
                const errorCode = error.code;
                switch (errorCode) {
                    case 'auth/invalid-email':
                        Swal.fire({
                            title: 'Gagal!',
                            text: 'Sorry, Email Tidak Valid!',
                            icon: 'error',
                            confirmButtonText: 'Okay'
                        });
                        break;
                    case 'auth/user-disabled':
                    Swal.fire({
                            title: 'Gagal!',
                            text: 'Sorry, Anda Telah diblock oleh admin!',
                            icon: 'error',
                            confirmButtonText: 'Okay'
                        });
                        break;
                    case 'auth/user-not-found':
                        Swal.fire({
                            title: 'Gagal!',
                            text: 'Sorry, User tidak ditemukan!',
                            icon: 'error',
                            confirmButtonText: 'Okay'
                        });
                        break;
                    case 'auth/wrong-password':
                    Swal.fire({
                            title: 'Gagal!',
                            text: 'Sorry, Password yang anda masukkan salah!',
                            icon: 'error',
                            confirmButtonText: 'Okay'
                        });
                        break;
                    default:
                    Swal.fire({
                            title: 'Gagal!',
                            text: 'ERROR',
                            icon: 'error',
                            confirmButtonText: 'Okay'
                        });
                        break;
                }
            });
        },
    },
    mounted() {}
}
</script>