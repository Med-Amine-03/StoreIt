"use server";

import { DeleteFileProps, GetFilesProps, RenameFileProps, UpdateFileUsersProps, UploadFileProps } from "@/types";
import { createAdminClent, createSessionClient } from "../appwrite";
import { InputFile } from "node-appwrite/file";
import { appwriteconfig } from "../appwrite/config";
import { ID, Models, Query } from "node-appwrite";
import { constructFileUrl, getFileType, parseStringify } from "../utils";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./user.actions";

const handleError = (error: unknown, message: string) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(error, message);
  }
  throw error;
};



const createQuerys = ( currentUser: Models.Document ,types: string[],searchText: string,sort: string,limit: number) => {
  const queries = [
    Query.or([
      Query.equal('owner', [currentUser.$id]),
      Query.contains('users', [currentUser.email]),
    ])
  ]

  if (types.length > 0) {
    queries.push(Query.equal('type', types))
  }

  if (searchText) {
    queries.push(Query.contains('name', searchText))
  }
  if(limit) queries.push(Query.limit(limit));

  const[sortBy,orderBy] = sort.split('-');
  queries.push(orderBy ? Query.orderDesc(sortBy) : Query.orderAsc(sortBy));
  console.log(queries)

  return queries
}

export const uploadFile = async ({
  file,
  ownerId,
  accountId,
  path,
}: UploadFileProps) => {
  const { storage, databases } = await createAdminClent();

  try {
    const inputFile = InputFile.fromBuffer(file, file.name);

    const bucketFile = await storage.createFile(
      appwriteconfig.bucketId,
      ID.unique(),
      inputFile,
    );

    const fileType = getFileType(bucketFile.name);

    const fileDocument = {
      type: fileType.type,
      name: bucketFile.name,  
      url: constructFileUrl(bucketFile.$id),
      extension: fileType.extension,
      size: bucketFile.sizeOriginal,
      owner: ownerId,
      accountId,
      users: [],
      bucketFileId: bucketFile.$id,
    };

    const newFile = await databases
      .createDocument(
        appwriteconfig.DatabaseId,
        appwriteconfig.filescollectionId,
        ID.unique(),
        fileDocument,
      )
      .catch(async (error: unknown) => {
        await storage.deleteFile(appwriteconfig.bucketId, bucketFile.$id);
        handleError(error, "Failed to create file document");
      });

    revalidatePath(path);
    return parseStringify(newFile);
  } catch (error) {
    handleError(error, "Failed to upload file");
  }
};

export const getFiles= async ({types = [],searchText='',sort='$createdAt-desc',limit}:GetFilesProps)=>{
  const {databases}= await createAdminClent();
  try {
    const currentUser= await getCurrentUser();
    if(!currentUser) throw new Error('User not found');
    const queries= createQuerys(currentUser ,types ,searchText,sort,limit); 
    const files = await databases.listDocuments(
      appwriteconfig.DatabaseId,
      appwriteconfig.filescollectionId,
      queries,
    );

    
    return parseStringify(files);
  } catch (error) {
    handleError(error, "Failed to get files");
  }

}

export const renameFile = async ({ fileId, name, extension ,path }:RenameFileProps) => {
  const {databases}= await createAdminClent();
  try {
    const newname =` ${name}.${extension}`;
    const updatedFile = await databases.updateDocument(
      appwriteconfig.DatabaseId,
      appwriteconfig.filescollectionId,
      fileId,
      {
        name: newname,
      }
    );
    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to rename file");
  }
};


export const updateFileUsers = async ({ fileId, emails,path }:UpdateFileUsersProps) => {
  const {databases}= await createAdminClent();
  try {
    const updatedFile = await databases.updateDocument(
      appwriteconfig.DatabaseId,
      appwriteconfig.filescollectionId,
      fileId,
      {
        users:emails,
      }
    );
    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to rename file");
  }
};
export const deleteFile = async ({ fileId, bucketFileId,path }:DeleteFileProps) => {
  const {databases,storage}= await createAdminClent();

  try {
    const deletedFile = await databases.deleteDocument(
      appwriteconfig.DatabaseId,
      appwriteconfig.filescollectionId,
      fileId,
    );
    if (deletedFile) {
      await storage.deleteFile(appwriteconfig.bucketId, bucketFileId);
      
    }
    revalidatePath(path);
    return parseStringify({status:'success'});
  } catch (error) {
    handleError(error, "Failed to rename file");
  }
};



export async function getTotalSpaceUsed() {
  try {
    const sessionClient = await createSessionClient();
    if (!sessionClient) throw new Error("Session client is not available.");
    const { databases } = sessionClient;
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User is not authenticated.");

    const files = await databases.listDocuments(
      appwriteconfig.filescollectionId ? appwriteconfig.DatabaseId : appwriteconfig.databaseId,
      appwriteconfig.filescollectionId,
      [Query.equal("owner", [currentUser.$id])],
    );

    const totalSpace = {
      image: { size: 0, latestDate: "" },
      document: { size: 0, latestDate: "" },
      video: { size: 0, latestDate: "" },
      audio: { size: 0, latestDate: "" },
      other: { size: 0, latestDate: "" },
      used: 0,
      all: 2 * 1024 * 1024 * 1024, // 2GB available bucket storage
    };

    if (files && files.documents) {
      files.documents.forEach((file) => {
        const fileType = file.type as keyof typeof totalSpace;
        if (
          totalSpace[fileType] &&
          fileType !== "used" &&
          fileType !== "all"
        ) {
          (totalSpace[fileType] as { size: number; latestDate: string }).size += file.size;
          if (
            !(totalSpace[fileType] as { size: number; latestDate: string }).latestDate ||
            new Date(file.$updatedAt) > new Date((totalSpace[fileType] as { size: number; latestDate: string }).latestDate)
          ) {
            (totalSpace[fileType] as { size: number; latestDate: string }).latestDate = file.$updatedAt;
          }
        }
        totalSpace.used += file.size;
      });
    }

    return parseStringify(totalSpace);
  } catch (error) {
    handleError(error, "Error calculating total space used:");
  }
}