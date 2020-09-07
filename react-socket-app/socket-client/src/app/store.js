import { configureStore } from "@reduxjs/toolkit";
// TODO: changer le root reducer
import rootReducer from "./rootReducer";

const store = configureStore({
  reducer: rootReducer,
});

export default store;
