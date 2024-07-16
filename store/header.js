export const state = () => ({
    isScrolled: false, // Производится ли скролл вообще
    isVisible: true, // Отображение и скрытие меню
    isTransparent: false, // Включение прозрачности меню
});

export const actions = {
    setScrolled({ commit }, val) {
        commit('SET_SCROLLED', val);
    },

    changeVisibility({ commit }, val) {
        commit('CHANGE_VISIBILITY', val);
    },

    setTransparent({ commit }, val) {
        commit('SET_TRANSPARENT', val);
    },
};

export const mutations = {
    SET_SCROLLED(state, payload) {
        state.isScrolled = payload;
    },

    CHANGE_VISIBILITY(state, payload) {
        state.isVisible = payload;
    },

    SET_TRANSPARENT(state, payload) {
        state.isTransparent = payload;
    },
};
