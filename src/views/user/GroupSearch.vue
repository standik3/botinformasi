<!-- untuk tampilan pencarian -->
<script setup>
import NavbarMessage from '../../components/user/NavbarMessage.vue';
import Loading from '../../components/Loading.vue';
</script>

<template>
    <!-- begin:: navbar -->
    <NavbarMessage :id="id" />
    <!-- end:: navbar -->

    <!-- begin:: search -->
    <div class="p-4">
        <label for="default-search"
            class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
        <div class="relative">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <font-awesome-icon icon="fa-solid fa-search" />
            </div>
            <input type="text" ref="search" @keypress.enter="searchGroups" :placeholder="search" id="default-search"
                :class="(validasi_search ? 'border-2 border-rose-500 block w-full p-4 pl-10 text-sm rounded-lg focus:border-blue-500' : 'block w-full p-4 pl-10 text-sm border border-gray-100 rounded-lg bg-gra focus:border-blue-500 bg-gray-100 border-gray-600 placeholder-gray-400 focus:border-blue-500')"
                required>
            <button type="submit" @click="searchGroups"
                class="text-white absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button>
        </div>
    </div>
    <!-- end:: search -->

    <!-- begin:: search result -->
    <div :class="loading ? 'hidden' : 'flex items-center justify-center h-screen'">
        <Loading />
    </div>
    <div class="p-4 flex flex-col flex-grow h-0 overflow-auto">
        <div class="container mx-auto">
            <ul class="space-y-4">
                <li class="bg-white rounded-lg shadow-md p-4" v-for="row in groups" :key="row.id">
                    <div class="flex justify-between mb-2">
                        <div class="flex items-center">
                            <h2 class="font-bold text-lg">{{ row.name }}</h2>
                        </div>
                        <div v-if="row.join" class="flex items-center">
                            <button class="bg-blue-500 m-1 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg" @click="joinGroup(row.id, uid)">Join</button>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
    <!-- end:: search result -->
</template>


<script>
import { db } from "../../firebase";
import {
    serverTimestamp,
    collection,
    getDocs,
    orderBy,
    addDoc,
    query,
    where,
} from "firebase/firestore";
import Swal from 'sweetalert2'

export default {
    name: 'ChatCreate',
    data() {
        return {
            loading: true,
            search: 'Enter name or id to find groups',
            validasi_search: false,
            id: '',
            uid: '',
            nama: '',
            email: '',
            photoURL: '',
            groups: [],
        }
    },
    methods: {
        loadUser() {
            let user = JSON.parse(localStorage.getItem('user'));

            this.uid = user.uid;
            this.nama = user.name;
            this.email = user.email;
            this.photoURL = user.photo;
        },
        async joinGroup(idGroup, uid) {
          try {
                const tblGroupMember = collection(db, 'Groups/' + idGroup + '/Members');
                const getGroupMember = query(tblGroupMember, where('uid', '==', uid));
                const resGroupMember = await getDocs(getGroupMember);

                if (resGroupMember.empty) {
                    console.log('Collection does not exist');

                    const data = {
                        uid: uid,
                        seen: false,
                        status: true,
                        created_at: serverTimestamp(),
                    }

                    addDoc(tblGroupMember, data).then((res) => {
                        Swal.fire({
                            title: 'Berhasil!',
                            text: 'Anda berhasil join',
                            icon: 'success',
                            confirmButtonText: 'Cool'
                        }).then((confirm) => {
                            if (confirm.isConfirmed) {
                                this.groups = [];
                                console.log('Group Member berhasil ditambahkan => ' + res.id);
                            }
                        });
                    });
                }
            } catch (error) {
                console.log(error);
            }
        },
        async searchGroups() {
             try {
                if (this.$refs.search.value === '') {
                    this.validasi_search = true;

                    return;
                }

                this.loading = false;

                // untuk ambil data groups
                const tblGroups = collection(db, "Groups");
                const qryGroups = query(tblGroups, orderBy('created_at', 'desc'));
                const getGroups = await getDocs(qryGroups);
                
                this.groups = [];
                getGroups.forEach(async doc => {
                    if (doc.data().name === this.$refs.search.value || doc.id === this.$refs.search.value) {

                        // untuk cek data member
                        const tblMembers = collection(db, 'Groups/' + doc.id + '/Members');
                        const qryMembers = query(tblMembers, where('uid', '==', this.uid));
                        const getMembers = await getDocs(qryMembers);

                        this.groups.push({
                            id: doc.id,
                            join: (getMembers.empty ? true : false),
                            ...doc.data()
                        });
                    }
                });

                this.validasi_search = false;
                this.loading = true;
            } catch (error) {
                console.log(error);
            }
        }
    },
    mounted() {
        this.loadUser();
    }
}
</script>