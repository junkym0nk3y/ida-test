import projectsApi from '~/config/api/projectsApi';
import flatsApi from '~/config/api/flatsApi';

const apiConfig = {
    ...projectsApi,
    ...flatsApi,
};

export default apiConfig;
