import request from './request'
import type {CodeSsmRequestParams, User} from "@/types/user.ts";

// 通用 API 响应包裹结构
export interface ApiResponse<T> {
    code: number
    msg: string
    data: T
}

// 登录相关
export const login = (params: LoginParams): Promise<ApiResponse<LoginData>> => {
    return request.post('/login', params)
}

export const refreshToken = (refreshTokenValue: string): Promise<ApiResponse<LoginData>> => {
    return request.put('/refresh-token', null, {
        headers: {
            Authorization: `Bearer ${refreshTokenValue}`
        },
        // 标记为刷新请求，响应拦截器据此跳过重发，避免死循环
        ...({ _isRefreshRequest: true } as any)
    })
}

export interface LoginParams {
    account: string
    password: string
}

export interface LoginData {
    token: string
    refresh_token: string
    expire_at: string
}

// 注册相关
export const register = (params: RegisterParams): Promise<ApiResponse<null>> => {
    return request.post('/register', params)
}

export interface RegisterParams {
    account: string
    password: string
}

// 用户信息
export const getInfo = (): Promise<ApiResponse<{user:User}>> => {
    return request.get('/users/me')
}
}
