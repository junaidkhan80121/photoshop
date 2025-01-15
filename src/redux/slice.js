import { createSlice } from "@reduxjs/toolkit";

const themeSlice = createSlice({
    name: 'themeMode',
    initialState: {themeMode:false},
    reducers:{
        toggleThemeMode: (state,action)=>{state.themeMode=!(state.themeMode)},
        setThemeMode : (state,action)=>{state.themeMode=state.themeMode}
        // storeImage:(state,action)=>{state.img=action.payload},
    }
});

export const {setThemeMode, toggleThemeMode} = themeSlice.actions;
export default themeSlice.reducer;