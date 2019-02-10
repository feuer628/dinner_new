import Login from "./components/login";

export async function start() {
    console.log("login.start")
    const loginPane = new Login();
    loginPane.$mount("#app");
}