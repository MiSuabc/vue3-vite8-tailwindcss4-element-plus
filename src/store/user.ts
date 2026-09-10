import { defineStore } from "pinia"
import { ref } from "vue"

import { refreshToken } from "@/api/user"
import type {User} from "@/types/user.ts";

export const useUserStore = defineStore('user', () => {
        const token = ref<string | null>(null)
        const refreshTokenValue = ref<string | null>(null)
        const user = ref<User | null >( null )

        const users = ref([])

        const setToken = (t: string) => {
            token.value = t
        }

        const getToken = () => {
            return token.value
        }

        const setRefreshToken = (t: string) => {
            refreshTokenValue.value = t
        }

        const getRefreshToken = () => {
            return refreshTokenValue.value
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
            refreshTokenValue.value = null
        }

        const setUsers = (t:any) => {
            users.value = t
        }

        const refreshUserToken = async () =>{
            if(!refreshTokenValue.value){
                return false
            }
            try{
                const res = await refreshToken(refreshTokenValue.value)
                if(res && res.data?.token){
                    setToken(res.data.token)
                    // 刷新接口若返回新的长 token，一并更新
                    if(res.data?.refresh_token){
                        setRefreshToken(res.data.refresh_token)
                    }
                    return true
                }
            }catch(err){
                console.error('Token refresh error:', err);
                clearUser()
                return false
            }
        }

        return { user, setUser, getUser, token, setToken, getToken, refreshTokenValue, setRefreshToken, getRefreshToken, setUserAvatar, getUserAvatar, clearUser, users, setUsers, refreshUserToken }
    },
    {
        persist: {
            key: 'auth',
            pick: ['token', 'refreshTokenValue', 'user']
        },
    }
)
