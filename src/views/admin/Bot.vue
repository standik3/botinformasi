<script setup>
import Breadcrumb from "../../components/admin/Breadcrumb.vue";
</script>

<template>
    <!-- begin:: breadcrumb -->
    <Breadcrumb :crumbs="crumbs" />
    <!-- end:: breadcrumb -->

    <div class="w-full bg-white border rounded-lg p-4">
        <table class="table-auto w-full text-center">
            <thead>
                <tr>
                    <th>Id</th>
                    <th>User</th>
                    <th>Name</th>
                    <th>Info</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="row in bots" :key="row.id">
                    <td>{{ row.id }}</td>
                    <td>{{ row.user }}</td>
                    <td>{{ row.name }}</td>
                    <td>{{ row.info }}</td>
                    <td>
                        <button class="bg-green-500 btn-sm hover:bg-green-700 text-white font-medium px-3 py-2 rounded-lg" @click="detailChat(row.id)">Detail</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import { db } from "../../firebase";
import {
    collection,
    query,
    getDocs,
    onSnapshot,
    orderBy,
} from "firebase/firestore";

export default {
    name: 'Bot',
       data() {
        return {
            crumbs: [
                { 'link': '/admin/dashboard', 'name': 'Dashboard' },
                { 'link': '#', 'name': 'Bot' },
            ],
            bots: [],
            users: [],
        }
    },
    methods: {
        detailChat(id) {
            this.$router.push({
                name: 'admin-bot-detail',
                params: {
                    id: id
                }
            });
        },
        async getData() {
            // untuk ambil data users
            const tblUsers = query(collection(db, 'Users'));
            const getUsers = await getDocs(tblUsers);
            this.users = getUsers.docs.map((docUsers) => ({
                id: docUsers.id,
                ...docUsers.data()
            }));

            const tglBots = collection(db, 'Bots');
            const qryBots = query(tglBots, orderBy('created_at', 'desc'));
            const getBots = await getDocs(qryBots);

            if (!getBots.empty) {
                onSnapshot(qryBots, (snapshot) => {
                    this.bots = [];
                    snapshot.docs.forEach(doc => {
                        const user = this.users.find(user => user.uid === doc.data().uid);

                        this.bots.push({
                            id: doc.id,
                            user: user.name,
                            name: doc.data().name,
                            info: doc.data().info,
                        });
                    });
                });
            } else {
                console.log('No matching documents.');
            }
        },
    },
    mounted() {
        this.getData();
    },
}
</script>
