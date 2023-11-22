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
                    <th>Name</th>
                    <th>Id</th>
                    <th>Member</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="row in groups" :key="row.id">
                    <td>{{ row.name }}</td>
                    <td>{{ row.id }}</td>
                    <td>{{ row.member }}</td>
                    <td>
                        <button class="bg-green-500 btn-sm hover:bg-green-700 text-white font-medium px-3 py-2 rounded-lg" @click="detailGroup(row.id)">Detail</button>
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
        }
    },
    methods: {
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
