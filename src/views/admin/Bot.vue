<script setup>
import Breadcrumb from "../../components/admin/Breadcrumb.vue";
</script>

<template>
    <!-- begin:: breadcrumb -->
    <Breadcrumb :crumbs="crumbs" />
    <!-- end:: breadcrumb -->

    <div class="w-full bg-white border rounded-lg p-4">
        <table class="table-auto w-full text-center border-2" >
            <thead>
                <tr>
                    <th class="border-2 p-6">User</th>
                    <th class="border-2 p-6">Email</th>
                    <th class="border-2 p-6">Id</th>
                    <th class="border-2 p-6">Aksi</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, index) in displayedItems" :key="index">
                    <td class="border-2 p-3">{{ row.user }}</td>
                    <td class="border-2 p-3">{{ row.email }}</td>
                    <td class="border-2 p-3">{{ row.id }}</td>
                    <td border-2>
                        <button class="bg-green-500 btn-sm hover:bg-green-700 text-white font-medium px-3 py-2 rounded-lg" @click="detailChat(row.id)">Detail</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <!-- Pagination controls -->
        <div>
            <button class="bg-red-500 btn-sm hover:bg-red-700 text-white font-medium px-3 py-2 rounded-lg" @click="prevPage" :disabled="currentPage === 1">Previous Page</button>
            <span>     {{ currentPage }} of {{ totalPages }}     </span>
            <button class="bg-green-500 btn-sm hover:bg-green-700 text-white font-medium px-3 py-2 rounded-lg" @click="nextPage" :disabled="currentPage === totalPages"> Next</button>
        </div>
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
            itemsPerPage: 10,
            currentPage: 1,
        }
    },
    computed: {
        totalPages() {
            return Math.ceil(this.bots.length / this.itemsPerPage);
        },
        displayedItems() {
            const startIndex = (this.currentPage - 1) * this.itemsPerPage;
            const endIndex = startIndex + this.itemsPerPage;
            return this.bots.slice(startIndex, endIndex);
        },
    },
    methods: {
        prevPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
            }
        },
        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
            }
        },
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
                            email: doc.data().email,
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
