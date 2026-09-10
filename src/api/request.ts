import axios from 'axios';
import {useUserStore} from "@/store/user.ts";
import { ElMessage } from 'element-plus';

export type ErrorResponseType = {
    Reason: string
    Message: string
}

axios.defaults.withCredentials = true;

// 标记是否正在刷新 token，避免刷新请求本身 401 时触发死循环
let isRefreshing = false;
// 等待 token 刷新完成的重发队列（并发请求只触发一次刷新）
let requestsQueue: { resolve: (v: any) => void; reject: (r: any) => void; config: any }[] = [];

const request = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 6000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor
request.interceptors.request.use(
    config => {
        // 刷新 token 请求自带 Authorization（长 token），不覆盖
        if (!config.headers.Authorization) {
            const auth = localStorage.getItem('auth');
            const token = auth ? JSON.parse(auth).token : '';

            if (token && token !== '') {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
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
        const res = response.data;
        // 业务逻辑判断：HTTP 200 但响应体 code !== 200 时，视为业务错误
        if (res && res.code !== undefined && res.code !== 200) {
            const errorMsg: ErrorResponseType = {
                Reason: `BusinessError:${res.code}`,
                Message: res.msg || '操作失败'
            };
            return Promise.reject(errorMsg);
        }
        return res;
    },
    async error => {
        let errorMsg: ErrorResponseType;

        if (error.response) {
            switch (error.response.status) {
                case 400:
                    errorMsg = {
                        Reason: 'BadRequest:' + (error.response.data.reason || error.response.data.msg || ''),
                        Message: error.response.data.msg || error.response.data.message || '请求参数错误'
                    };
                    break;
                case 401: {
                    errorMsg = {
                        Reason: 'Unauthorized',
                        Message: '登录已过期，请重新登录'
                    };
                    const userStore = useUserStore();
                    const originalConfig = error.config;

                    // 刷新 token 请求本身 401，长 token 也失效，直接拒绝避免死循环
                    if ((originalConfig as any)._isRefreshRequest) {
                        break;
                    }

                    // 已有刷新在进行中，挂起当前请求，等刷新完成后用新 token 重发
                    if (isRefreshing) {
                        return new Promise((resolve, reject) => {
                            requestsQueue.push({ resolve, reject, config: originalConfig });
                        });
                    }

                    isRefreshing = true;
                    try {
                        const success = await userStore.refreshUserToken();
                        if (success) {
                            const newToken = userStore.getToken();
                            // 重发队列中挂起的请求
                            requestsQueue.forEach(({ resolve, config }) => {
                                config.headers.Authorization = `Bearer ${newToken}`;
                                request(config).then(resolve).catch(() => {});
                            });
                            requestsQueue = [];
                            // 用新 token 重发当前请求
                            originalConfig.headers.Authorization = `Bearer ${newToken}`;
                            return request(originalConfig);
                        } else {
                            ElMessage.error('登录已过期，请重新登录');
                            userStore.clearUser();
                            localStorage.setItem("isLogin", "false");
                            // 拒绝所有挂起的请求
                            requestsQueue.forEach(({ reject }) => reject(errorMsg));
                            requestsQueue = [];
                        }
                    } catch (e) {
                        requestsQueue.forEach(({ reject }) => reject(errorMsg));
                        requestsQueue = [];
                    } finally {
                        isRefreshing = false;
                    }
                    break;
                }
                case 403:
                    errorMsg = {
                        Reason: 'Forbidden',
                        Message: '禁止访问'
                    };
                    break;
                case 404:
                    errorMsg = {
                        Reason: 'NotFound:' + (error.response.data.reason || error.response.data.msg || ''),
                        Message: error.response.data.msg || error.response.data.message || '资源不存在'
                    };
                    break;
                case 500:
                    errorMsg = {
                        Reason: 'ServerError',
                        Message: error.response.data.msg || error.response.data.message || '服务器错误'
                    };
                    break;
                default:
                    errorMsg = {
                        Reason: `Error${error.response.status}`,
                        Message: error.response.data.msg || error.response.data.message || `错误状态码: ${error.response.status}`
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
