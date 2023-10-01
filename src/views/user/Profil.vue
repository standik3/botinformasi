<!-- untuk halaman profil -->
<template>
    <div class="relative p-3">
        <router-link to="/user/home" class="items-center p-2">
            <font-awesome-icon icon="fa-solid fa-arrow-left" />
        </router-link>
    </div>
    <div class="flex flex-col flex-grow items-center justify-center">
        <h1 class="text-4xl font-bold text-gray-800 px-4 pb-5">Profil</h1>
        <img class="object-cover w-50 h-50 rounded-full" :src="photoURL" :alt="nama" />
        <p class="text-gray-500">{{ nama }}</p>
        <p class="text-gray-500">{{ email }}</p>
        <p class="text-gray-500">{{ bio }}</p>
        <div class="relative flex justify-between">
            <button class="bg-green-500 hover:bg-green-700 text-white font-bold mx-2 my-2 py-2 px-4 rounded-full" @click="editProfil">Edit Profil</button>
            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold mx-2 my-2 py-2 px-4 rounded-full" @click="handleLogout">Logout</button>
        </div>
    </div>
</template>

<script>
import { auth } from "../../firebase";
import {
    signOut,
} from "firebase/auth";

export default {
    name: 'Profil',
    data() {
        return {
            uid: '',
            bio: '',
            nama: '',
            email: '',
            photoURL: '',
        }
    },
    methods: {
        editProfil() {
            this.$router.push({name: 'user-profil-edit'});
        },
        loadUser() {
            let user = JSON.parse(localStorage.getItem('user'));

            this.uid = user.uid;
            this.bio = user.bio;
            this.nama = user.name;
            this.email = user.email;
            this.photoURL = user.photo;
        },
        handleLogout() {
            signOut(auth).then(() => {
                localStorage.setItem('authenticated', false);
                localStorage.removeItem('user');
                this.$router.push({
                    name: 'home'
                });
            }).catch((error) => {
                console.log(error);
            });
        },
    },
    mounted() {
        this.loadUser();
    }
}
</script>