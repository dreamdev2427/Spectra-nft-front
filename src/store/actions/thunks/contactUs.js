import { Axios } from '../../../core/axios';
import api from '../../../core/api';

export const postContactForm = (form) => async () => {
    try {
        const { data } = await Axios.post(`${api.baseUrl}${api.contactUs}`, form, 
        {
            headers: {
                "Authorization": "Bearer "+localStorage.getItem("jwtToken") , // <- Don't forget Authorization header if you are using it.
            },
        });

        return Promise.resolve(data);
    } catch (err) {
        return Promise.reject(err);
    }
};