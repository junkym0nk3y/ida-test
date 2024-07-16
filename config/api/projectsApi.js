const projectsApi = {
    projects: {
        slug: slug => `/api/projects/${slug}`,
        buildings: slug => `/api/projects/${slug}/buildings/`,
        list: '/api/projects/',
        specs: '/api/projects/specs/',
        facets: '/api/projects/facets/',
    },
};

export default projectsApi;
