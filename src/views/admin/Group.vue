<script setup>
import Breadcrumb from "../../components/admin/Breadcrumb.vue";
</script>

<template>
    <!-- begin:: breadcrumb -->
    <Breadcrumb :crumbs="crumbs" />
    <!-- end:: breadcrumb -->

    <div class="w-full bg-white border rounded-lg p-4">
        <table class="table-auto w-full text-center border-2">
            <thead>
                <tr>
                    <th class="border-2 p-6">Name</th>
                    <th class="border-2 p-6">Id</th>
                    <th class="border-2 p-6">Member</th>
                    <th class="border-2 p-6">Aksi</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="row in groups" :key="row.id">
                    <td class="border-2 p-6">{{ row.name }}</td>
                    <td class="border-2 p-6">{{ row.id }}</td>
                    <td class="border-2 p-6">{{ row.member }}</td>
                    <td class="border-2 p-6">
                        <button class="bg-green-500 btn-sm hover:bg-green-700 text-white font-medium px-3 py-2 rounded-lg" @click="detailGroup(row.id)">Detail</button>
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
    getCountFromServer,
} from "firebase/firestore";

export default {
    name: 'Group',
    data() {
        return {
            crumbs: [
                { 'link': '/admin/dashboard', 'name': 'Dashboard' },
                { 'link': '#', 'name': 'Group' },
            ],
            groups: [],
            itemsPerPage: 10,
            currentPage: 1,
        }
    },
    computed: {
        totalPages() {
            return Math.ceil(this.groups.length / this.itemsPerPage);
        },
        displayedItems() {
            const startIndex = (this.currentPage - 1) * this.itemsPerPage;
            const endIndex = startIndex + this.itemsPerPage;
            return this.groups.slice(startIndex, endIndex);
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
        detailGroup(id) {
            this.$router.push({
                name: 'admin-group-detail',
                params: {
                    id: id
                }
            });
        },
        async getData() {
            const tblGroups = collection(db, 'Groups');
            const qryGroups = query(tblGroups, orderBy('created_at', 'desc'));
            const getGroups = await getDocs(qryGroups);

            if (!getGroups.empty) {
                onSnapshot(qryGroups, (snapshot) => {
                    this.groups = [];
                    snapshot.docs.forEach(async doc => {
                        const tblGroupMembers = collection(db, "Groups/" + doc.id + "/Members");
                        const snapshot = await getCountFromServer(tblGroupMembers);

                        this.groups.push({
                            id: doc.id,
                            name: doc.data().name,
                            member: snapshot.data().count,
                            latest_message: doc.data().latest_message,
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
