
export const appwriteconfig = {
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT!,
    DatabaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,
    userscollectionId:process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION!,
    filescollectionId:process.env.NEXT_PUBLIC_APPWRITE_FILES_COLLECTION!,
    bucketId:process.env.NEXT_PUBLIC_APPWRITE_BUCKET!,
    secretKey:process.env.NEXT_APPWRITE_SECRET!,
}