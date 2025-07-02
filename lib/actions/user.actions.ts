"use server";

import {  ID, Query } from "node-appwrite";
import { appwriteconfig } from "../appwrite/config";
import { createAdminClent, createSessionClient } from "../appwrite";
import { parseStringify } from "../utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
/* import { Avatars, Client } from "node-appwrite";
 */function getInitialsAvatarUrl(
  fullName: string,
  color = "FF5733",
  size = 100
): string | null {
  if (!fullName || !fullName.trim()) return null;

  const baseUrl = "https://ui-avatars.com/api/";

  const nameParam = encodeURIComponent(fullName.trim());
  const url = `${baseUrl}?name=${nameParam}&size=${size}&background=${color}&color=fff`;

  return url;
}




const getUserByEmail =async (email:string)=>{

    const {databases}= await createAdminClent();
    
    const result =await databases.listDocuments(
        appwriteconfig.DatabaseId,
        appwriteconfig.userscollectionId,
        [Query.equal('email', [email])]
    );

    return result.total >0 ? result.documents[0] :null;
}

const handelError=(error:unknown ,message:string)=>{
    console.log(error,message);
    throw error;
}

export const sendEmailOTP=async ({email}:{email:string})=>{
    const {account}= await createAdminClent();
    try{ 
        const session =await account.createEmailToken(ID.unique(),email);
        return session.userId;
    }catch(error){
        handelError(error,'Error creating email OTP');
    }
   
}


export const createAccount=async ({ fullName, email }: { fullName: string; email: string; })=>{
    const existingUser =await getUserByEmail(email);

    const accountId = await sendEmailOTP({email});
    console.log('accountId',accountId);
    if(!accountId) throw new Error('Error creating account');
    if(!existingUser){
        const {databases}= await createAdminClent();
            const avatarUrl = getInitialsAvatarUrl(fullName);
        console.log('avatarUrl',avatarUrl);

        await databases.createDocument(
            appwriteconfig.DatabaseId,
            appwriteconfig.userscollectionId,
            ID.unique(),
            {
                fullName,
                email,
                avatar:avatarUrl?.toString(),
                accountId,
            },
        );
    }

    return parseStringify({accountId});
}



export const verifySecret = async ({accountId,password}:{accountId:string,password:string}) => {
    try{
        const {account}= await createAdminClent();

        const session = await account.createSession(accountId,password);
        (await cookies()).set('appwrite-session',session.secret,{
            httpOnly:true,
            path:'/',
            secure:true,
            sameSite:'strict',
        });
        return parseStringify({sessionId:session.$id});

    }catch(error){
        handelError(error,'Error creating email OTP');
    }
}


export const getCurrentUser = async () => {
    const sessionClient = await createSessionClient();
    if (!sessionClient) return null;
    const { databases, account } = sessionClient;

    const ressult =await account.get();
    const user =await databases.listDocuments(
        appwriteconfig.DatabaseId,
        appwriteconfig.userscollectionId,
        [Query.equal('accountId', ressult.$id)]
    );
     if (user.total < 0) return null;

    return parseStringify(user.documents[0]);
        
     
    
}

export const signOutUser = async () => {
    const sessionClient = await createSessionClient();
    if (!sessionClient) return;
    const { account } = sessionClient;
    try{
        await account.deleteSession('current');
        (await cookies()).delete('appwrite-session');
    }catch(error){
        handelError(error,'Error creating email OTP');
    }finally{
        redirect('/sign-in');
    }
   
}


export const signInUser= async({email}:{email:string})=>{
    try{
        const existingUser =await getUserByEmail(email);
        if(existingUser){
            await sendEmailOTP({email});
            return parseStringify({accountId:existingUser.accountId});
        }
        return parseStringify({accountId:null , error:'User not found'});

    }catch(error){
        handelError(error,'Error creating email OTP');
    }
}