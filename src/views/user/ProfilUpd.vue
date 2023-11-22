<!-- untuk halaman profil -->
<template>
    <div class="flex flex-col flex-grow items-center justify-center">
        <div class="my-5">
            <img class="object-cover w-50 h-50 rounded-full" :src="photoURL" :alt="name" width="100" height="100" />
        </div>
        <div class="mb-6">
            <label for="email" class="block mb-2 text-sm font-medium text-gray-900">Your email</label>
            <input type="email" id="email"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                :value="email" required readonly>
        </div>
        <div class="mb-6">
            <label for="name" class="block mb-2 text-sm font-medium text-gray-900">Your name</label>
            <input type="name" id="name"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Enter Your name" ref="name" :value="name" required>
        </div>
        <div class="mb-6">
            <label for="bio" class="block mb-2 text-sm font-medium text-gray-900">Your bio</label>
            <input type="bio" id="bio"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Enter Your bio" ref="bio" :value="bio">
        </div>
        <div class="relative flex justify-between">
            <button class="bg-green-500 hover:bg-green-700 text-white font-bold mx-2 my-2 py-2 px-4 rounded-full"
                @click="updateProfil">Submit</button>
            <router-link to="/user/profil"
                class="bg-red-500 hover:bg-red-700 text-white font-bold mx-2 my-2 py-2 px-4 rounded-full">
                Cancel
            </router-link>
        </div>
    </div>
</template>

<script>
import {
    collection,
    doc,
    onSnapshot,
    query,
    updateDoc,
    where
} from "firebase/firestore";
import {
    auth,
    db
} from "../../firebase";
import Swal from "sweetalert2";
import {
    signInWithEmailAndPassword
} from "firebase/auth";

export default {
    name: 'Profil',
    data() {
        return {
            uid: '',
            bio: '',
            name: '',
            email: '',
            photoURL: '',
            token_notification: '',
        }
    },
    methods: {
        loadUser() {
            let user = JSON.parse(localStorage.getItem('user'));

            this.uid = user.uid;
            this.bio = user.bio;
            this.name = user.name;
            this.email = user.email;
            this.photoURL = user.photo ?? 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
            this.token_notification = user.token_notification;

        },
        async updateProfil() {
            if (confirm.value === '') {
                return;
            }

            const tblUsers = collection(db, "Users");
            const qryUsers = query(tblUsers, where("uid", "==", this.uid));

            onSnapshot(qryUsers, (snapshotUsers) => {
                snapshotUsers.docs.map(async (docUsers) => {
                    const docRef = doc(db, "Users", docUsers.id);
                    updateDoc(docRef, {
                        name: this.$refs.name.value,
                        bio: this.$refs.bio.value
                    }).then(() => {
                        Swal.fire({
                            title: 'Berhasil!',
                            text: 'Selamat, akun Anda telah diubah!',
                            icon: 'success',
                            confirmButtonText: 'Okay'
                        }).then((confirm) => {
                            if (confirm.isConfirmed) {
                                let data = {
                                    uid: this.uid,
                                    name: this.$refs.name.value,
                                    email: this.email,
                                    photo: this.photoURL,
                                    bio: this.$refs.bio.value,
                                    role: 'user',
                                    active: 'y',
                                    token_notification: this.token_notification,
                                }

                                localStorage.removeItem('user');
                                localStorage.setItem('user', JSON.stringify(data));
                            }
                        });
                    }).catch((error) => {
                        Swal.fire({
                            title: 'Gagal!',
                            text: error,
                            icon: 'error',
                            confirmButtonText: 'Okay'
                        });
                    });
                });
            });
        }
    },
    mounted() {
        this.loadUser();
    }
}
</script>