import axios from 'axios';
import {useUserStore} from "@/store/user.ts";
import { ElMessage } from 'element-plus';

export type ErrorResponseType = {
    Reason: string
    Message: string
}

axios.defaults.withCredentials = true;

const request = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor
request.interceptors.request.use(
    config => {
        const auth = localStorage.getItem('auth');
        const token = auth ? JSON.parse(auth).token : '';

        if (token && token !== '') {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
    },
    error => {
        console.error('Request error before sending:', error);  // 详细记录错误
        return Promise.reject(error);
    }
);

// Add a response interceptor
request.interceptors.response.use(
    response => {
        return response.data;
    },
    async error => {
        let errorMsg: ErrorResponseType;

        if (error.response) {
            switch (error.response.status) {
                case 400:
                    errorMsg = {
                        Reason: 'BadRequest:' + error.response.data.reason,
                        Message: error.response.data.message
                    };
                    break;
                case 401:
                    errorMsg = {
                        Reason: 'Unauthorized',
                        Message: '登录已过期，请重新登录'
                    };
                    // alert('登录已过期，请重新登录');
                    const userStore = useUserStore();
                    const refreshTokenres = await userStore.refreshUserToken();
                    if(!refreshTokenres){
                        ElMessage.error('登录已过期，请重新登录');
                        userStore.clearUser();
                        localStorage.setItem("isLogin", "false");
                    }
                    break;
                case 403:
                    errorMsg = {
                        Reason: 'Forbidden',
                        Message: '禁止访问'
                    };
                    break;
                case 404:
                    errorMsg = {
                        Reason: 'NotFound:'+error.response.data.reason,
                        Message: error.response.data.message
                    };
                    break;
                case 500:
                    errorMsg = {
                        Reason: 'ServerError',
                        Message: '服务器错误'
                    };
                    break;
                default:
                    errorMsg = {
                        Reason: `Error${error.response.status}`,
                        Message: `错误状态码: ${error.response.status}`
                    };
            }
        } else if (error.request) {
            errorMsg = {
                Reason: 'NetworkError',
                Message: '服务器无响应，请检查网络连接'
            };
        } else {
            errorMsg = {
                Reason: 'RequestError',
                Message: `请求错误: ${error.message}`
            };
        }

        return Promise.reject(errorMsg);
    }
);

export default request;
