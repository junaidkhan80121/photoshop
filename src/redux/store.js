import { configureStore } from "@reduxjs/toolkit";
import themeSlice from './slice';

const store = configureStore({
    reducer:{
        getThemeMode: themeSlice
    }
})

export default store;