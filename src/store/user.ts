import { defineStore } from "pinia"
import { ref } from "vue"

import { refreshToken } from "@/api/user"

export const useUserStore = defineStore('user', () => {
        const token = ref<string | null>(null)
        const user = ref(null)

        const users = ref([])

        const setToken = (t: string) => {
            token.value = t
        }

        const getToken = () => {
            return token.value
        }

        const setUser = (t:any) => {
            user.value = t
        }

        const getUser = () => {
            return user.value
        }

        const setUserAvatar = (avatar: string) => {
            if (user.value) {
                user.value.avatar_url = avatar
            }
        }

        const getUserAvatar = () => {
            if (user.value) {
                return user.value.avatar_url
            }
            return null
        }

        const clearUser = () => {
            user.value = null
            token.value = null
        }

        const setUsers = (t:any) => {
            users.value = t
        }

        const refreshUserToken = async () =>{
            if(!token.value){
                return false
            }
            try{
                const res = await refreshToken()
                if(res && res.token){
                    setToken(res.token)
                    return true
                }
            }catch(err){
                console.error('Token refresh error:', err);
                clearUser()
                return false
            }
        }

        return { user, setUser, getUser, token, setToken, getToken, setUserAvatar, getUserAvatar, clearUser, users, setUsers, refreshUserToken }
    },
    {
        persist: {
            key: 'auth',
            pick: ['token', 'user']
        },
    }
)
