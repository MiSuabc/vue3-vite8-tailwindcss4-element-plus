import request from './request'

export const login = (params: LoginParams): Promise<LoginResponse> => {
    return request.post('/login', params)
}

export const refreshToken = (): Promise<LoginResponse> =>{
    return request.put('/refresh-token')
}

export interface LoginParams {
    account: string
    password: string
}

export interface LoginResponse {
    token: string
    expires_at: Date
}

export const register = (params: RegisterParams): Promise<RegisterResponse> => {
    return request.post('/register', params)
}

export interface RegisterParams {
    account: string
    password: string
}

export interface RegisterResponse {
    status: string
}

export const getInfo = () => {
    return request.get('/users/me')
}


export const updateInfo = (params: UpdateInfoParams): Promise<UpdateInfoResponse> => {
    return request.put('/users/me', params)
}

export interface UpdateInfoParams {
    nickname: string
    birthday: string
    gender: string
}

export interface UpdateInfoResponse {
    status: string
}

export const updateAvatar = (params: UpdateAvatarParams): Promise<UpdateAvatarResponse> => {
    const formData = new FormData()
    formData.append('avatar_file', params.avatar_file)

    return request.put('/users/me/avatar', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

export interface UpdateAvatarParams {
    avatar_file: File
}

export interface UpdateAvatarResponse {
    avatar_url: string
}

export const updatePassword = (params: UpdatePasswordParams): Promise<UpdatePasswordResponse> => {
    return request.put('/users/me/password', params)
}

export interface UpdatePasswordParams {
    old_password: string
    new_password: string
}

export interface UpdatePasswordResponse {
    status: string
}

export const updateEmail = (params: UpdateEmailParams): Promise<UpdateEmailResponse> => {
    return request.put('/users/me/email', params)
}

export interface UpdateEmailParams {
    email: string
}

export interface UpdateEmailResponse {
    status: string
}

export const updatePhone = (params: UpdatePhoneParams): Promise<UpdatePhoneResponse> => {
    return request.put('/users/me/phone', params)
}

export interface UpdatePhoneParams {
    phone: string
}

export interface UpdatePhoneResponse {
    status: string
}

