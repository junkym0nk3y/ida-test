const floorsApi = {
    floors: {
        id: id => `/api/floors/${id}/`,
        flats: id => `/api/floors/${id}/flats/`,
    },
};

export default floorsApi;
