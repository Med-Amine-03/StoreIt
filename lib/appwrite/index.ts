"use server";


import { Account, Avatars, Client, Databases, Storage } from "node-appwrite";
import { appwriteconfig } from "./config";
import { cookies } from "next/headers";

export const createSessionClient=async()=>{
    const client = new Client()
        .setEndpoint(appwriteconfig.endpoint)
        .setProject(appwriteconfig.projectId);

    const session=(await cookies()).get('appwrite-session');
    if(!session || !session.value) return null ;

    client.setSession(session.value);
    return {
        get account(){
            return new Account(client);
        },
        get databases(){
            return new Databases(client);
        }
    };
}



export const createAdminClent=async()=>{
     const client = new Client()
        .setEndpoint(appwriteconfig.endpoint)
        .setProject(appwriteconfig.projectId)
        .setKey(appwriteconfig.secretKey);


    return {
        get account(){
            return new Account(client);
        },
        get databases(){
            return new Databases(client);
        },
        get storage(){
            return new Storage(client);
        },
        get avatars(){
            return new Avatars(client);
        },
    };
}