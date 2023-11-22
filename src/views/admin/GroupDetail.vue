<script setup>
import Breadcrumb from "../../components/admin/Breadcrumb.vue";
</script>

<template>
    <!-- begin:: breadcrumb -->
    <Breadcrumb :crumbs="crumbs" />
    <!-- end:: breadcrumb -->

    <div class="pt-5">
        <ul class="space-y-4">
            <li class="bg-white rounded-lg shadow-md p-4" v-for="row in members" :key="row.id">
                <div class="flex justify-between mb-2">
                    <div class="flex items-center">
                        <img class="h-10 w-10 rounded-full object-cover mr-2" :src="row.photo" :alt="row.name" width="100" height="100">
                        <div>
                            <h2 class="font-bold text-lg">{{ row.name }}</h2>
                            <p class="text-gray-500">{{ row.email }}</p>
                        </div>
                    </div>
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
import { collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '../../firebase';

export default {
    name: 'Group Detail',
    props: {
        id: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            crumbs: [
                { 'link': '/admin/dashboard', 'name': 'Dashboard' },
                { 'link': '/admin/group', 'name': 'Group' },
                { 'link': '#', 'name': 'Detail' },
            ],
            members: [],
            users: []
        };
    },
    methods: {
        async loadMembers() {
            try {
                // untuk ambil data users
                const tblUsers = query(collection(db, 'Users'));
                const getUsers = await getDocs(tblUsers);
                this.users = getUsers.docs.map((docUsers) => ({
                    id: docUsers.id,
                    ...docUsers.data()
                }));
                
                const tblGroups = doc(db, "Groups", this.id);
                const getGroups = await getDoc(tblGroups);
                if (getGroups.exists()) {
                    console.log('Collection does exist');

                    const tblGroupMembers = collection(db, "Groups/" + this.id + "/Members");
                    const qryGroupMembers = query(tblGroupMembers, orderBy('created_at', 'desc'));

                    onSnapshot(qryGroupMembers, (snapshotMembers) => {
                        snapshotMembers.docs.map((docMembers) => {
                            let user = null;
                            user = this.users.find((row) => row.uid == docMembers.data().uid);
                            this.members.push({
                                id: docMembers.id,
                                uid: user.uid,
                                name: user.name,
                                email: user.email,
                                photo: user.photo ?? 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
                            });
                        });
                    });

                    console.log(this.members);
                } else {
                    console.log('Collection does not exist');
                }
            }
            catch (error) {
                console.log(error);
            }
        },
    },
    mounted() {
        this.loadMembers();
    },
    components: { Breadcrumb }
}
</script>