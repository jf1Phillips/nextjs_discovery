type User = {
    name: string | undefined,
    last_name: string | undefined
}

type UserAdmin = User & {
    age: number
}


let user1: User = {
    name: "Jean", last_name: "Feuille"
}

let user_admin1: UserAdmin = {
    name: "Admin", age: 13, last_name: "Power"
}


console.log(user1.last_name);
