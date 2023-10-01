<script setup>
import Breadcrumb from "../../components/admin/Breadcrumb.vue";
</script>

<template>
    <!-- begin:: breadcrumb -->
    <Breadcrumb :crumbs="crumbs" />
    <!-- end:: breadcrumb -->

    <div class="pt-5">
        <ul class="space-y-4">
            <li class="bg-white rounded-lg shadow-md p-4" v-for="row in question" :key="row.id">
                <div class="flex justify-between mb-2">
                    <div class="flex items-center">
                        <img class="h-10 w-10 rounded-full object-cover mr-2" :src="row.photo" :alt="row.name">
                        <div>
                            <h2 class="font-bold text-lg">{{ row.name }}</h2>
                            <p class="text-gray-500">{{ row.email }}</p>
                            <p class="text-gray-500">{{ row.message }}</p>
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
import { onUnmounted, ref } from 'vue';

export default {
    name: 'Bot Detail',
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
                { 'link': '/admin/bot', 'name': 'Bot' },
                { 'link': '#', 'name': 'Detail' },
            ],
            question: ref([]),
            users: []
        };
    },
    methods: {
        async loadQuestion() {
            try {
                // untuk ambil data users
                const tblUsers = query(collection(db, 'Users'));
                const getUsers = await getDocs(tblUsers);
                this.users = getUsers.docs.map((docUsers) => ({
                    id: docUsers.id,
                    ...docUsers.data()
                }));
                const tblBots = doc(db, "Bots", this.id);
                const getBots = await getDoc(tblBots);
                if (getBots.exists()) {
                    console.log('Collection does exist');
                    const tblMessages = collection(db, "Bots/" + this.id + "/Messages");
                    const qryMessages = query(tblMessages, where('type', "==", 'user'));
                    const unsubscribe = onSnapshot(qryMessages, (snapshotMessages) => {
                        snapshotMessages.docs.map((docMessages) => {
                            let user = null;
                            user = this.users.find((row) => row.uid == docMessages.data().uid);
                            this.question.push({
                                id: docMessages.id,
                                message: docMessages.data().message,
                                uid: user.uid,
                                name: user.name,
                                email: user.email,
                                photo: user.photo,
                            });
                        });
                    });
                    
                    onUnmounted(unsubscribe);
                }
                else {
                    console.log('Collection does not exist');
                }
            }
            catch (error) {
                console.log(error);
            }
        },
    },
    mounted() {
        this.loadQuestion();
    },
    components: { Breadcrumb }
}
</script>